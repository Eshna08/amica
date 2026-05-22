const express = require("express");
const cors = require("cors");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const groqApiKey = (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim()) || "";
const hasGroqApiKey = Boolean(groqApiKey);
const looksLikeGroqApiKey = groqApiKey.startsWith("gsk_");
const whatsappEnabled = String(process.env.WHATSAPP_ALERT_ENABLED || "").toLowerCase() === "true";
const whatsappProvider = String(process.env.WHATSAPP_PROVIDER || "callmebot").toLowerCase();
const whatsappTo = String(process.env.WHATSAPP_TO || "").trim();
const whatsappFromName = String(process.env.WHATSAPP_FROM_NAME || "Zenify Safety Bot").trim();
const whatsappCallMeBotApiKey = String(process.env.CALLMEBOT_API_KEY || "").trim();
const whatsappCooldownMs = Number(process.env.WHATSAPP_ALERT_COOLDOWN_MS || 300000);

let lastWhatsappAlertAtByUser = {};
if (!hasGroqApiKey) {
  console.warn("[CONFIG] GROQ_API_KEY is missing. Add GROQ_API_KEY to backend/.env.");
} else if (!looksLikeGroqApiKey) {
  console.warn("[CONFIG] API key is present but does not look like a Groq key (expected prefix: gsk_).");
}
if (whatsappEnabled && !whatsappTo) {
  console.warn("[CONFIG] WHATSAPP_ALERT_ENABLED=true but WHATSAPP_TO is missing.");
}

function isTransientGroqError(err) {
  const code = err?.code;
  if (["ECONNRESET", "ECONNABORTED", "ETIMEDOUT", "EPIPE", "ENOTFOUND", "ENETUNREACH"].includes(code)) {
    return true;
  }
  const msg = String(err?.message || "").toLowerCase();
  if (msg.includes("econnreset") || msg.includes("socket hang up") || msg.includes("timeout")) {
    return true;
  }
  const status = err?.response?.status;
  return status === 429 || status === 502 || status === 503;
}

/** Groq chat/completions with retries for flaky networks (ECONNRESET, etc.) */
async function groqChatCompletions(data, opts = {}) {
  const timeout = opts.timeout ?? 45000;
  const maxAttempts = opts.maxAttempts ?? 4;
  let lastErr;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await axios({
        method: "POST",
        url: "https://api.groq.com/openai/v1/chat/completions",
        headers: {
          Authorization: `Bearer ${groqApiKey}`,
          "Content-Type": "application/json"
        },
        data,
        timeout
      });
    } catch (err) {
      lastErr = err;
      const retry = isTransientGroqError(err);
      if (!retry || attempt === maxAttempts) throw err;
      const delayMs = 400 * Math.pow(2, attempt - 1);
      console.warn(
        `[Groq] transient error (${err.code || err.response?.status || err.message}), retry ${attempt}/${maxAttempts} in ${delayMs}ms`
      );
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw lastErr;
}

/* ================================================================
   IN-MEMORY STORES (session-based, persisted to localStorage by FE)
   ================================================================ */
const conversationMemory = {};
let emergencyContacts = [];   // [{ id, name, phone_number }]
let crisisLog = [];           // [{ id, timestamp, risk_level, trigger_words, message_snippet }]
let diaryInsights = {};       // { entry_id: { sentiment, emotion, summary, suggestion, themes } }

/* ================================================================
   MODULE 3 – SILENT AUTO JOURNAL + MOOD TRACKING (API)
   ================================================================ */

const AUTO_STORE_PATH = path.join(__dirname, "data", "auto_entries.json");

async function readAutoStore() {
  try {
    const raw = await fs.promises.readFile(AUTO_STORE_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return {
      journalEntries: Array.isArray(parsed.journalEntries) ? parsed.journalEntries : [],
      moodEntries: Array.isArray(parsed.moodEntries) ? parsed.moodEntries : []
    };
  } catch {
    return { journalEntries: [], moodEntries: [] };
  }
}

async function writeAutoStore(store) {
  await fs.promises.mkdir(path.dirname(AUTO_STORE_PATH), { recursive: true });
  await fs.promises.writeFile(AUTO_STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}

async function groqChatJSON({ system, user, temperature = 0.2, max_tokens = 250 }) {
  const resp = await groqChatCompletions({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: system },
      { role: "user", content: user }
    ],
    temperature,
    max_tokens
  });

  const text = resp.data.choices?.[0]?.message?.content?.trim() || "{}";
  // Accept either pure JSON or JSON wrapped in text
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  const slice = start !== -1 && end !== -1 ? text.slice(start, end + 1) : "{}";
  return JSON.parse(slice);
}

app.post("/api/journal/auto-entry", async (req, res) => {
  try {
    if (!hasGroqApiKey) {
      return res.status(500).json({ error: "Server is missing GROQ_API_KEY. Add it to backend/.env and restart backend." });
    }
    if (!looksLikeGroqApiKey) {
      return res.status(500).json({ error: "Configured API key is not a Groq key. Use a key that starts with gsk_." });
    }

    const { messages, userId, timestamp } = req.body || {};
    if (!userId) return res.status(400).json({ error: "userId is required" });
    if (!Array.isArray(messages) || messages.length === 0) return res.status(400).json({ error: "messages must be a non-empty array" });

    const safeMsgs = messages
      .map(m => ({
        content: String(m?.content || "").slice(0, 2000),
        timestamp: m?.timestamp
      }))
      .filter(m => m.content.trim().length > 0);

    const combined = safeMsgs.map(m => m.content).join("\n");
    const createdAt = timestamp ? new Date(timestamp) : new Date();

    const system = [
      "You are a backend service that creates a private journal entry summary and a single dominant mood label.",
      "Return ONLY valid JSON with keys: summary (string), mood (one of Happy|Sad|Anxious|Angry|Neutral).",
      "Keep summary to 1-2 sentences. Do not include any additional keys."
    ].join("\n");

    let mood = "Neutral";
    let summary = "";
    try {
      const out = await groqChatJSON({ system, user: combined });
      summary = typeof out.summary === "string" ? out.summary.trim() : "";
      mood = typeof out.mood === "string" ? out.mood.trim() : "Neutral";
    } catch (e) {
      // Fail closed to neutral; still store combined text for journaling
      mood = "Neutral";
      summary = "";
    }

    const normalizedMood = ["Happy", "Sad", "Anxious", "Angry", "Neutral"].includes(mood) ? mood : "Neutral";

    const store = await readAutoStore();
    const journalEntry = {
      id: Date.now().toString(),
      userId,
      content: combined.slice(0, 15000),
      summary: summary.slice(0, 800),
      mood: normalizedMood,
      createdAt: createdAt.toISOString()
    };
    const moodEntry = {
      id: (Date.now() + 1).toString(),
      userId,
      mood: normalizedMood,
      source: "chatbot",
      createdAt: createdAt.toISOString()
    };

    store.journalEntries.push(journalEntry);
    store.moodEntries.push(moodEntry);
    await writeAutoStore(store);

    return res.json({
      id: journalEntry.id,
      userId,
      timestamp: journalEntry.createdAt,
      content: journalEntry.content,
      summary: journalEntry.summary,
      mood: journalEntry.mood
    });
  } catch (err) {
    console.error("[AUTO JOURNAL] ERROR:", err.response?.data || err.message);
    return res.status(500).json({ error: "auto-entry failed" });
  }
});

/* ================================================================
   MODULE 1 – CRISIS DETECTION ENGINE
   ================================================================ */

const CRISIS_KEYWORDS = {
  direct: [
    "i want to kill myself", "kill myself", "i want to die", "i am going to kill myself",
    "i plan to end my life", "i am going to commit suicide", "i have decided to die",
    "i will take my own life", "tonight is my last night", "i have a plan to",
    "i already have the", "i know how i will do it", "end my life", "take my life",
    "end it all", "no reason to live", "don't want to live anymore"
  ],
  indirect: [
    "can't go on anymore", "there's no point in living", "everyone would be better without me",
    "i feel like giving up", "life is too hard", "i don't see a way out",
    "i feel trapped", "nothing will ever get better", "i am a burden to everyone",
    "just want the pain to stop", "hopeless", "worthless", "empty inside", "numb",
    "nobody cares about me", "completely alone", "can't do this anymore",
    "wish i was never born", "no way out", "nothing left to live for"
  ],
  method: [
    "pills", "rope", "bridge", "gun", "knife", "overdose",
    "hanging", "jumping", "drowning", "cutting myself", "poison", "razor", "blade"
  ],
  temporal: [
    "tonight is my last", "today i will end", "tomorrow i plan to",
    "by tonight", "before tomorrow", "very soon i will", "after this conversation",
    "in the morning i will end", "this weekend i will"
  ],
  moderate: [
    "depressed", "depression", "suicidal thoughts", "self-harm", "self harm",
    "hurting myself", "can't take it", "overwhelmed", "broken", "shattered",
    "lost all hope", "no future", "pointless", "miserable", "in so much pain"
  ]
};

// Positive sentiment words that reduce score
const POSITIVE_WORDS = [
  "happy", "joy", "grateful", "excited", "hopeful", "better", "improving",
  "amazing", "love", "great", "wonderful", "optimistic", "healing", "progress"
];

function detectCrisis(text) {
  const lower = text.toLowerCase();
  let score = 0;
  const triggerWords = [];

  // Direct – highest weight (10 pts each)
  for (const kw of CRISIS_KEYWORDS.direct) {
    if (lower.includes(kw)) {
      score += 10;
      triggerWords.push(kw);
    }
  }

  // Method reference (8 pts each)
  for (const kw of CRISIS_KEYWORDS.method) {
    if (lower.includes(kw)) {
      score += 8;
      triggerWords.push(kw);
    }
  }

  // Temporal (7 pts each)
  for (const kw of CRISIS_KEYWORDS.temporal) {
    if (lower.includes(kw)) {
      score += 7;
      triggerWords.push(kw);
    }
  }

  // Indirect (5 pts each)
  for (const kw of CRISIS_KEYWORDS.indirect) {
    if (lower.includes(kw)) {
      score += 5;
      triggerWords.push(kw);
    }
  }

  // Moderate signals (3 pts each)
  for (const kw of CRISIS_KEYWORDS.moderate) {
    if (lower.includes(kw)) {
      score += 3;
      triggerWords.push(kw);
    }
  }

  // Positive word dampening
  for (const pw of POSITIVE_WORDS) {
    if (lower.includes(pw)) score = Math.max(0, score - 2);
  }

  // Sentiment polarity: negative-positive ratio
  const wordCount = text.split(/\s+/).length || 1;
  const sentimentScore = parseFloat(Math.max(-1, Math.min(1, -(score / (wordCount * 2)))).toFixed(3));

  // Risk classification
  let risk_level;
  if (score >= 10) risk_level = "HIGH";
  else if (score >= 5) risk_level = "MEDIUM";
  else risk_level = "LOW";

  return {
    risk_level,
    trigger_words: [...new Set(triggerWords)],
    sentiment_score: sentimentScore,
    score
  };
}

/* ================================================================
   MODULE 2 – BEHAVIORAL INSIGHT ENGINE
   ================================================================ */

const EMOTION_KEYWORDS = {
  sad: ["sad", "cry", "crying", "tears", "grief", "loss", "lonely", "alone", "heartbroken",
        "miss", "missing", "disappointed", "hurt", "pain", "sorrow", "unhappy", "depressed",
        "melancholy", "gloomy", "down", "low"],
  anxious: ["anxious", "anxiety", "worried", "worry", "nervous", "panic", "scared", "fear",
            "afraid", "stress", "stressed", "overthinking", "restless", "uneasy", "dread",
            "tension", "tense", "on edge", "catastrophizing", "spiral"],
  angry: ["angry", "anger", "furious", "rage", "irritated", "annoyed", "frustrated",
          "mad", "upset", "resentful", "hate", "enraged", "bitter", "hostile", "betrayed"],
  happy: ["happy", "joy", "excited", "great", "amazing", "wonderful", "fantastic",
          "cheerful", "elated", "grateful", "thankful", "blessed", "content", "peaceful",
          "delighted", "thrilled", "proud", "accomplished", "energized"],
  hopeful: ["hope", "hopeful", "optimistic", "better", "improving", "healing",
            "progress", "looking forward", "positive", "believe", "can do", "motivated",
            "inspired", "determined", "recovery", "growth"],
  numb: ["numb", "empty", "hollow", "blank", "disconnected", "detached", "nothing",
         "flat", "robot", "going through motions", "autopilot", "don't feel", "can't feel"]
};

const SENTIMENT_POSITIVE = [
  "happy", "good", "great", "love", "amazing", "wonderful", "grateful", "joy",
  "excited", "hope", "hopeful", "better", "improve", "positive", "smile", "laugh",
  "peaceful", "content", "blessed", "thankful", "proud", "success", "healing"
];

const SENTIMENT_NEGATIVE = [
  "sad", "bad", "terrible", "hate", "angry", "hopeless", "anxiety", "panic",
  "crying", "hurt", "pain", "lonely", "depressed", "fear", "stressed", "miserable",
  "lost", "broken", "empty", "numb", "worthless", "alone", "dark", "terrible"
];

const STOPWORDS = new Set([
  "i", "me", "my", "myself", "we", "our", "you", "your", "he", "she", "it",
  "they", "them", "what", "which", "who", "this", "that", "these", "those",
  "am", "is", "are", "was", "were", "be", "been", "being", "have", "has",
  "had", "do", "does", "did", "will", "would", "could", "should", "may",
  "might", "shall", "can", "need", "to", "of", "in", "for", "on", "with",
  "at", "by", "from", "as", "an", "a", "the", "and", "but", "or", "so",
  "if", "not", "just", "up", "out", "about", "its", "also", "like", "very",
  "really", "feel", "feeling", "felt", "get", "got", "know", "think", "want",
  "went", "come", "going", "today", "day", "time", "still", "much", "more"
]);

function analyzeDiaryEntry(text) {
  const lower = text.toLowerCase();
  const words = lower.split(/\W+/).filter(w => w.length > 2 && !STOPWORDS.has(w));

  // Sentiment scoring
  let posScore = 0, negScore = 0;
  for (const w of words) {
    if (SENTIMENT_POSITIVE.includes(w)) posScore++;
    if (SENTIMENT_NEGATIVE.includes(w)) negScore++;
  }
  const total = posScore + negScore || 1;
  let sentiment;
  if (posScore / total > 0.6) sentiment = "positive";
  else if (negScore / total > 0.6) sentiment = "negative";
  else sentiment = "neutral";

  // Emotion classification
  const emotionScores = {};
  for (const [emotion, kwList] of Object.entries(EMOTION_KEYWORDS)) {
    let s = 0;
    for (const kw of kwList) {
      if (lower.includes(kw)) s++;
    }
    emotionScores[emotion] = s;
  }
  const emotion = Object.entries(emotionScores)
    .sort((a, b) => b[1] - a[1])[0][0];

  // Theme extraction – top 5 non-stopword frequent words
  const freq = {};
  for (const w of words) {
    freq[w] = (freq[w] || 0) + 1;
  }
  const themes = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([w]) => w);

  // 1-line summary
  const summaryMap = {
    positive: "You expressed a positive and uplifting outlook today.",
    negative: "Today's entry reflects emotional distress and difficult feelings.",
    neutral: "Your entry today reflects a balanced, reflective state of mind."
  };
  const summary = summaryMap[sentiment];

  // Personalized suggestion
  const suggestionMap = {
    sad: "Consider reaching out to someone you trust, or try a short journaling gratitude exercise.",
    anxious: "Try a 5-minute box breathing exercise: inhale 4s, hold 4s, exhale 4s, hold 4s.",
    angry: "Physical movement like a short walk can help release built-up tension. You deserve peace.",
    happy: "This is a great time to note what made you feel good — it helps reinforce positive habits.",
    hopeful: "Your hopeful mindset is a strength. Set one small intention for tomorrow to keep this momentum.",
    numb: "Feeling numb is valid. Try gentle grounding: name 5 things you see, 4 you touch, 3 you hear."
  };
  const suggestion = suggestionMap[emotion] || "Take a moment to breathe and be gentle with yourself today.";

  return { sentiment, emotion, summary, suggestion, themes };
}

/* ================================================================
   HELPER – SAFE RESPONSE TEMPLATE (HIGH RISK)
   ================================================================ */

const EMPATHETIC_TEMPLATES = [
  "I hear you, and I want you to know that you matter deeply. What you're feeling is real, and you don't have to face it alone. Please reach out to a crisis helpline right now — trained counselors are available 24/7 and genuinely want to help. iCall: 9152987821 | Vandrevala Foundation: 1860-2662-345. I'm here with you.",
  "Thank you for trusting me with something so painful. You are not alone in this moment. Please call or text a crisis helpline — they are trained to listen without judgment and help you find a way through. India helpline: iCall 9152987821 (Mon–Sat, 8am–10pm). Your life has value.",
  "I'm really glad you're talking to me. What you're going through sounds incredibly difficult. Please don't face this alone — reach out to the Vandrevala Foundation 24/7 helpline: 1860-2662-345, or iCall: 9152987821. You deserve support and care right now.",
];

function getEmpathyTemplate() {
  return EMPATHETIC_TEMPLATES[Math.floor(Math.random() * EMPATHETIC_TEMPLATES.length)];
}

function buildWhatsappAlertMessage({ userId, crisis, incomingMessage }) {
  return [
    `${whatsappFromName}: HIGH RISK ALERT`,
    `User: ${userId}`,
    `Risk: ${crisis.risk_level}`,
    `Triggers: ${(crisis.trigger_words || []).join(", ") || "none"}`,
    `Snippet: "${String(incomingMessage || "").slice(0, 180)}"`,
    "Safety response was sent in-app. Please check on this person immediately."
  ].join("\n");
}

async function sendWhatsappAlert({ userId, crisis, incomingMessage }) {
  if (!whatsappEnabled) return { skipped: true, reason: "disabled" };
  if (!whatsappTo) return { skipped: true, reason: "missing_to" };

  const now = Date.now();
  const lastSent = lastWhatsappAlertAtByUser[userId] || 0;
  if (now - lastSent < whatsappCooldownMs) {
    return { skipped: true, reason: "cooldown_active" };
  }

  const text = buildWhatsappAlertMessage({ userId, crisis, incomingMessage });

  if (whatsappProvider === "callmebot") {
    if (!whatsappCallMeBotApiKey) return { skipped: true, reason: "missing_callmebot_api_key" };

    await axios.get("https://api.callmebot.com/whatsapp.php", {
      params: {
        phone: whatsappTo,
        text,
        apikey: whatsappCallMeBotApiKey
      },
      timeout: 10000
    });
    lastWhatsappAlertAtByUser[userId] = now;
    return { sent: true, provider: "callmebot" };
  }

  return { skipped: true, reason: "unsupported_provider" };
}

/* ================================================================
   ROUTES — HEALTH
   ================================================================ */

app.get("/", (req, res) => {
  res.json({ status: "AMICA backend running", version: "2.0" });
});

/* ================================================================
   ROUTES — CRISIS DETECTION (Module 1)
   ================================================================ */

app.post("/detect-crisis", (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "text is required" });
  const result = detectCrisis(text);
  res.json(result);
});

app.post("/log-crisis", (req, res) => {
  const { risk_level, trigger_words, message_snippet, user_id, conversation_id } = req.body;
  const event = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    risk_level,
    trigger_words: trigger_words || [],
    message_snippet: message_snippet ? message_snippet.slice(0, 200) : "",
    user_id: user_id || "anonymous",
    conversation_id: conversation_id || null
  };
  crisisLog.push(event);
  console.log("[CRISIS LOG]", JSON.stringify(event));
  res.json({ success: true, event });
});

app.get("/crisis-log", (req, res) => {
  res.json(crisisLog);
});

/* ================================================================
   ROUTES — EMERGENCY CONTACTS (Module 1)
   ================================================================ */

app.get("/emergency-contacts", (req, res) => {
  res.json(emergencyContacts);
});

app.post("/emergency-contacts", (req, res) => {
  const { name, phone_number } = req.body;
  if (!name || !phone_number) {
    return res.status(400).json({ error: "name and phone_number are required" });
  }
  const contact = { id: Date.now().toString(), name, phone_number };
  emergencyContacts.push(contact);
  res.json(contact);
});

app.put("/emergency-contacts/:id", (req, res) => {
  const { id } = req.params;
  const { name, phone_number } = req.body;
  const idx = emergencyContacts.findIndex(c => c.id === id);
  if (idx === -1) return res.status(404).json({ error: "Contact not found" });
  emergencyContacts[idx] = { ...emergencyContacts[idx], name, phone_number };
  res.json(emergencyContacts[idx]);
});

app.delete("/emergency-contacts/:id", (req, res) => {
  const { id } = req.params;
  const prev = emergencyContacts.length;
  emergencyContacts = emergencyContacts.filter(c => c.id !== id);
  if (emergencyContacts.length === prev) return res.status(404).json({ error: "Not found" });
  res.json({ success: true });
});

/* ================================================================
   ROUTES — DIARY ANALYSIS (Module 2)
   ================================================================ */

app.post("/analyze-diary", (req, res) => {
  const { text, entry_id } = req.body;
  if (!text) return res.status(400).json({ error: "text is required" });
  const insight = analyzeDiaryEntry(text);
  if (entry_id) {
    diaryInsights[entry_id] = { ...insight, entry_id, analyzed_at: new Date().toISOString() };
  }
  res.json(insight);
});

app.get("/weekly-insights", (req, res) => {
  const insights = Object.values(diaryInsights);
  if (insights.length === 0) {
    return res.json({
      most_frequent_emotion: null,
      mood_trend: [],
      repeated_triggers: [],
      entry_count: 0
    });
  }

  // Most frequent emotion
  const emotionCount = {};
  for (const ins of insights) {
    emotionCount[ins.emotion] = (emotionCount[ins.emotion] || 0) + 1;
  }
  const most_frequent_emotion = Object.entries(emotionCount)
    .sort((a, b) => b[1] - a[1])[0][0];

  // Mood trend (sentiment over entries, sorted by time)
  const mood_trend = insights
    .filter(i => i.analyzed_at)
    .sort((a, b) => new Date(a.analyzed_at) - new Date(b.analyzed_at))
    .map(i => ({ date: i.analyzed_at, sentiment: i.sentiment, emotion: i.emotion }));

  // Repeated triggers – aggregate themes
  const themeCount = {};
  for (const ins of insights) {
    for (const theme of (ins.themes || [])) {
      themeCount[theme] = (themeCount[theme] || 0) + 1;
    }
  }
  const repeated_triggers = Object.entries(themeCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([theme, count]) => ({ theme, count }));

  // Emotion frequency breakdown
  const emotion_frequency = Object.entries(emotionCount).map(([emotion, count]) => ({
    emotion,
    count
  }));

  res.json({
    most_frequent_emotion,
    mood_trend,
    repeated_triggers,
    emotion_frequency,
    entry_count: insights.length
  });
});

/* ================================================================
   ROUTES — CHAT (integrates both modules)
   ================================================================ */

app.post("/chat", async (req, res) => {
  const incomingMessage = req.body.message || "";
  const userId = req.body.user_id || "demo-user";
  const conversationId = req.body.conversation_id || null;

  try {
    console.log("Incoming chat:", incomingMessage);

    if (!conversationMemory[userId]) conversationMemory[userId] = [];
    conversationMemory[userId].push({ role: "user", content: incomingMessage });

    /* ---- STEP 1: Crisis Detection (runs BEFORE RAG/Groq) ---- */
    const crisis = detectCrisis(incomingMessage);

    if (crisis.risk_level === "HIGH") {
      // Log the event
      const event = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        risk_level: crisis.risk_level,
        trigger_words: crisis.trigger_words,
        message_snippet: incomingMessage.slice(0, 200),
        user_id: userId,
        conversation_id: conversationId
      };
      crisisLog.push(event);
      console.log("[CRISIS - HIGH RISK]", JSON.stringify(event));

      const safeReply = getEmpathyTemplate();
      conversationMemory[userId].push({ role: "assistant", content: safeReply });

      // Fire WhatsApp alert in background (do not block user safety reply)
      sendWhatsappAlert({ userId, crisis, incomingMessage })
        .then((result) => {
          if (result?.sent) {
            console.log(`[WHATSAPP ALERT] sent via ${result.provider} for user ${userId}`);
          } else {
            console.log(`[WHATSAPP ALERT] skipped: ${result?.reason || "unknown_reason"} for user ${userId}`);
          }
        })
        .catch((error) => {
          console.error("[WHATSAPP ALERT] failed:", error.response?.data || error.message);
        });

      return res.json({
        generated_text: safeReply,
        crisis_detected: true,
        crisis_data: {
          risk_level: crisis.risk_level,
          trigger_words: crisis.trigger_words,
          sentiment_score: crisis.sentiment_score
        }
      });
    }

    /* ---- STEP 2: Build user context with diary personalization ---- */
    const history = conversationMemory[userId].slice(-6);

    // Gather diary emotion context for personalization
    const recentInsights = Object.values(diaryInsights).slice(-3);
    let diaryContext = "";
    if (recentInsights.length > 0) {
      const emotions = recentInsights.map(i => i.emotion).join(", ");
      diaryContext = ` The user's recent diary entries show they have been feeling: ${emotions}. Gently acknowledge this if relevant.`;
    }

    /* ---- STEP 3: Call Groq (RAG response generation) ---- */
    if (!hasGroqApiKey) {
      return res.status(500).json({
        error: "Server is missing GROQ_API_KEY. Add it to your .env and restart backend."
      });
    }
    if (!looksLikeGroqApiKey) {
      return res.status(500).json({
        error: "Configured API key is not a Groq key. Use a key that starts with gsk_."
      });
    }

    const hfResponse = await groqChatCompletions({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are Dr. Sarah, an empathetic mental health support companion. Always acknowledge the user's emotion first, then respond warmly and helpfully in 4-6 sentences. Never be dismissive.${diaryContext}`
        },
        ...history
      ],
      max_tokens: 220,
      temperature: 0.7
    });

    /* ---- STEP 4: Extract and return reply ---- */
    const cleanReply =
      hfResponse.data.choices?.[0]?.message?.content?.trim() ||
      "I'm here to listen. Can you tell me more?";

    conversationMemory[userId].push({ role: "assistant", content: cleanReply });

    res.json({
      generated_text: cleanReply,
      crisis_detected: false,
      crisis_data: {
        risk_level: crisis.risk_level,
        trigger_words: crisis.trigger_words,
        sentiment_score: crisis.sentiment_score
      }
    });

  } catch (err) {
    console.error("CHAT ERROR:", err.response?.data || err.message);

    const lowMsg = incomingMessage.toLowerCase();
    let fallback = "I'm here and I'm listening. Could you tell me a bit more about what you're feeling?";
    if (lowMsg.includes("happy")) fallback = "I'm so glad to hear you're feeling happy! What's bringing you this joy today?";
    if (lowMsg.includes("anxious") || lowMsg.includes("worried")) fallback = "I hear that you're feeling anxious. Take a slow breath with me. What's one thing we can focus on together?";
    if (lowMsg.includes("sad")) fallback = "I'm sorry you're feeling sad. I'm here for you. Would you like to talk about what's on your mind?";
    if (lowMsg.includes("angry")) fallback = "It's okay to feel angry. It often means something feels unfair. Want to talk about what happened?";

    res.json({ generated_text: fallback, crisis_detected: false });
  }
});

/* ================================================================
   START
   ================================================================ */
app.listen(5000, () => {
  console.log("AMICA backend running on port 5000");
  console.log("Module 1: Crisis Detection – ACTIVE");
  console.log("Module 2: Behavioral Insight Engine – ACTIVE");
});