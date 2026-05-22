import axios from "axios";
import { ChatMessage, Conversation, CrisisData } from '../types';
import storage from './storage';
import { enhancedCheckContent } from './enhancedSuicideDetection';
import { adminDashboard } from './adminDashboard';
import { detectCrisis } from './crisis';
import { getDiaryInsights } from './storage';
import { captureUserChatMessage } from './autoJournal';

const INITIAL_GREETING =
  "Hello! I'm Dr. Sarah. How are you feeling today?";

/* ---------------- CRISIS RESPONSE TEMPLATES ---------------- */

const getCrisisResourcesResponse = (riskLevel: string): string => {
  if (riskLevel === 'critical' || riskLevel === 'HIGH') {
    return `💙 You are not alone. Help is available right now.

**Indian Crisis Helplines:**
• iCall: 9152987821 (Mon–Sat, 8am–10pm)
• Vandrevala Foundation: 1860-2662-345 (24/7)
• NIMHANS: 080-46110007
• Snehi: 044-24640050
• iCall WhatsApp: 9152987821

Please reach out to one of these numbers now. Trained counsellors are ready to listen — no judgment, just support. You matter deeply.`;
  }

  if (riskLevel === 'high' || riskLevel === 'MEDIUM') {
    return `💙 I hear you, and I'm here for you.

If things feel overwhelming, please consider calling:
• iCall: 9152987821
• Vandrevala Foundation: 1860-2662-345

I'm listening — would you like to talk more about what you're feeling?`;
  }

  return "I'm here to support you.";
};

/* ---------------- INIT CONVERSATION ---------------- */

export const initializeConversation = (
  conversationId: string
): Conversation | null => {
  return storage.addMessageToConversation(conversationId, {
    role: 'assistant',
    content: INITIAL_GREETING,
  });
};

/* ---------------- BACKEND AI CALL ---------------- */

export const fetchGitHubModelResponse = async (
  messages: ChatMessage[]
): Promise<{ text: string; crisisData?: CrisisData }> => {
  try {
    if (!messages.length) return { text: "I'm here to listen." };

    const lastUserMessage = messages[messages.length - 1]?.content || "";

    const response = await axios.post(
      "http://localhost:5000/chat",
      { message: lastUserMessage },
      { timeout: 30000 }
    );

    return {
      text: response?.data?.generated_text || "I'm here to listen.",
      crisisData: response?.data?.crisis_data
    };

  } catch (error) {
    console.error("Backend AI error:", error);
    return { text: "AI service unavailable. Please try again." };
  }
};

/* ---------------- SEND MESSAGE ---------------- */

export const sendMessage = async (
  conversationId: string,
  content: string,
  contentType: 'chat' | 'journal' = 'chat',
  onCrisisDetected?: (crisisData: CrisisData) => void
): Promise<Conversation | null> => {

  const convo = storage.getConversation(conversationId);
  if (!convo) return null;

  /* ---- STEP 1: Crisis Detection (BEFORE anything else) ---- */
  let crisisData: CrisisData | null = null;
  try {
    crisisData = await detectCrisis(content);

    if (crisisData && (crisisData.risk_level === 'HIGH')) {
      // Notify UI to show CrisisAlert overlay
      if (onCrisisDetected) onCrisisDetected(crisisData);

      // Log with admin dashboard
      await adminDashboard.createAlert('current-user', conversationId, content, {
        riskLevel: 'critical',
        trigger_words: crisisData.trigger_words,
        recommendedAction: 'Immediate crisis intervention required'
      });

      // Store user message
      const withUser = storage.addMessageToConversation(conversationId, { role: 'user', content });
      if (!withUser) return null;

      // Background-only auto journal capture (user messages only)
      captureUserChatMessage({ userId: 'current-user', conversationId, content });

      // Return empathetic safe response
      return storage.addMessageToConversation(conversationId, {
        role: 'assistant',
        content: getCrisisResourcesResponse('critical'),
      });
    }
  } catch (err) {
    console.error("Crisis pre-check error:", err);
  }

  /* ---- STEP 2: Regular enhanced content check ---- */
  let riskAnalysis: any = null;
  try {
    const conversationContext = {
      messages: convo.messages,
      userId: 'current-user',
      conversationId,
    };

    riskAnalysis = await enhancedCheckContent(content, conversationContext);

    if (riskAnalysis?.riskLevel === 'critical' || riskAnalysis?.riskLevel === 'high') {
      await adminDashboard.createAlert('current-user', conversationId, content, riskAnalysis);
    }
  } catch (error) {
    console.error("Risk analysis error:", error);
  }

  /* ---- STEP 3: Store user message ---- */
  const updatedConvo = storage.addMessageToConversation(
    conversationId,
    { role: 'user', content }
  );
  if (!updatedConvo) return null;

  // Background-only auto journal capture (user messages only)
  captureUserChatMessage({ userId: 'current-user', conversationId, content });

  /* ---- STEP 4: Crisis override (from existing RAG system) ---- */
  if (riskAnalysis?.riskLevel === 'critical') {
    return storage.addMessageToConversation(conversationId, {
      role: 'assistant',
      content: getCrisisResourcesResponse('HIGH'),
    });
  }

  if (riskAnalysis?.riskLevel === 'high') {
    storage.addFlaggedContent({
      type: contentType,
      content,
      reason: riskAnalysis.recommendedAction || 'High suicide risk detected',
      riskLevel: 'high',
    });
  }

  /* ---- STEP 5: Diary insight personalization for Groq context ---- */
  // (handled server-side in /chat, but we also pass diary context via messages)
  const insights = getDiaryInsights();
  const recentInsights = Object.values(insights).slice(-3);
  let diaryCtxMessage = '';
  if (recentInsights.length > 0) {
    const emotions = recentInsights.map((i) => i.emotion).join(', ');
    diaryCtxMessage = `[Context: User's recent diary emotions: ${emotions}]`;
  }

  /* ---- STEP 6: Call backend AI pipeline ---- */
  try {
    const { text: aiResponse, crisisData: serverCrisis } = await fetchGitHubModelResponse(
      updatedConvo.messages
    );

    // If server also flagged as crisis, trigger overlay
    if (serverCrisis?.risk_level === 'HIGH' && onCrisisDetected) {
      onCrisisDetected(serverCrisis);
    }

    return storage.addMessageToConversation(conversationId, {
      role: 'assistant',
      content: aiResponse,
    });

  } catch (error) {
    console.error("AI response error:", error);
    return storage.addMessageToConversation(conversationId, {
      role: 'assistant',
      content: "I'm having trouble responding right now. Please try again.",
    });
  }
};

export default {
  fetchGitHubModelResponse,
  sendMessage,
  initializeConversation,
};
