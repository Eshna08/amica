import axios from "axios";
import storage from "./storage";
import { Mood } from "../types";
import { analyzeDiary } from "./diary";

type DetectedMood = "Happy" | "Sad" | "Anxious" | "Angry" | "Neutral";

type SessionMessage = {
  content: string;
  timestamp: number;
};

type SessionState = {
  userId: string;
  conversationId: string;
  startedAt: number;
  messages: SessionMessage[];
  timer: number | null;
  inflight: boolean;
};

const INACTIVITY_MS = 5 * 60 * 1000; // 5 minutes

const moodToAppMood = (m: DetectedMood): Mood => {
  if (m === "Happy") return "good";
  if (m === "Neutral") return "neutral";
  return "bad";
};

const sessions = new Map<string, SessionState>();

async function processChatSession(session: SessionState): Promise<void> {
  if (session.inflight) return;
  if (session.messages.length === 0) return;
  session.inflight = true;

  try {
    const combinedUserText = session.messages.map(m => m.content).join("\n").trim();
    const payload = {
      messages: session.messages,
      userId: session.userId,
      timestamp: new Date(session.startedAt).toISOString(),
    };

    let summary = "";
    let detectedMood: DetectedMood = "Neutral";

    // Preferred: backend-only auto-entry endpoint
    try {
      const resp = await axios.post("http://localhost:5000/api/journal/auto-entry", payload, {
        timeout: 30000,
      });

      summary = resp?.data?.summary || "";
      detectedMood = resp?.data?.mood || "Neutral";
    } catch (err) {
      // Fallback: reuse existing diary analyzer pipeline (and its client-side heuristic fallback)
      const insight = await analyzeDiary(combinedUserText);
      summary = insight?.summary || "Auto journal summary unavailable.";

      const emo = insight?.emotion || "numb";
      detectedMood =
        emo === "happy" ? "Happy" :
        emo === "sad" ? "Sad" :
        emo === "anxious" ? "Anxious" :
        emo === "angry" ? "Angry" :
        "Neutral";
    }

    const appMood = moodToAppMood(detectedMood);

    storage.addJournalEntry({
      title: "Auto Journal (Chat)",
      content: combinedUserText,
      mood: appMood,
      tags: ["auto", "chatbot"],
      summary,
      emotion:
        detectedMood === "Happy" ? "happy" :
        detectedMood === "Sad" ? "sad" :
        detectedMood === "Anxious" ? "anxious" :
        detectedMood === "Angry" ? "angry" :
        "numb",
    });

    storage.addMoodEntry(appMood, "Auto-detected from chatbot session", "chatbot");
  } catch (err) {
    // Silent background feature: never break chat UX
    console.warn("[AutoJournal] Failed to auto-save session:", (err as any)?.message || err);
  } finally {
    session.inflight = false;
  }
}

function scheduleFlush(session: SessionState) {
  if (session.timer) window.clearTimeout(session.timer);
  session.timer = window.setTimeout(() => {
    // Flush and clear session (new messages will start a new session)
    processChatSession(session).finally(() => {
      sessions.delete(session.conversationId);
    });
  }, INACTIVITY_MS);
}

export function captureUserChatMessage(params: {
  userId: string;
  conversationId: string;
  content: string;
  timestamp?: number;
}) {
  const ts = params.timestamp ?? Date.now();

  const existing = sessions.get(params.conversationId);
  if (!existing) {
    const session: SessionState = {
      userId: params.userId,
      conversationId: params.conversationId,
      startedAt: ts,
      messages: [{ content: params.content, timestamp: ts }],
      timer: null,
      inflight: false,
    };
    sessions.set(params.conversationId, session);
    scheduleFlush(session);
    return;
  }

  existing.messages.push({ content: params.content, timestamp: ts });
  scheduleFlush(existing);
}

export function flushAllChatSessions() {
  for (const session of sessions.values()) {
    if (session.timer) window.clearTimeout(session.timer);
    void processChatSession(session);
  }
  sessions.clear();
}

// Best-effort "chat end" trigger without UI changes
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    flushAllChatSessions();
  });
}

