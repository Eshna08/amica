import axios from 'axios';
import { DiaryInsight, WeeklyInsights } from '../types';

const BASE = 'http://localhost:5000';

/**
 * Analyze a diary entry via the backend Behavioral Insight Engine.
 * Returns sentiment, emotion, summary, suggestion, themes.
 */
export const analyzeDiary = async (
  text: string,
  entry_id?: string
): Promise<DiaryInsight | null> => {
  try {
    const res = await axios.post(
      `${BASE}/analyze-diary`,
      { text, entry_id },
      { timeout: 10000 }
    );
    return res.data as DiaryInsight;
  } catch (err) {
    console.error('[diary.ts] analyzeDiary error:', err);
    // Client-side minimal fallback
    return clientSideAnalyze(text);
  }
};

/** Fetch weekly insights aggregated across all diary entries */
export const getWeeklyInsights = async (): Promise<WeeklyInsights | null> => {
  try {
    const res = await axios.get(`${BASE}/weekly-insights`, { timeout: 8000 });
    return res.data as WeeklyInsights;
  } catch (err) {
    console.error('[diary.ts] getWeeklyInsights error:', err);
    return null;
  }
};

/** Minimal client-side diary analysis fallback (no backend required) */
function clientSideAnalyze(text: string): DiaryInsight {
  const lower = text.toLowerCase();

  const emotions: Array<{ e: DiaryInsight['emotion']; words: string[] }> = [
    { e: 'sad', words: ['sad', 'cry', 'lonely', 'grief', 'heartbroken', 'depressed'] },
    { e: 'anxious', words: ['anxious', 'anxiety', 'panic', 'worried', 'stress', 'nervous'] },
    { e: 'angry', words: ['angry', 'anger', 'furious', 'frustrated', 'irritated', 'rage'] },
    { e: 'happy', words: ['happy', 'joy', 'excited', 'amazing', 'great', 'wonderful'] },
    { e: 'hopeful', words: ['hopeful', 'hope', 'optimistic', 'better', 'healing', 'progress'] },
    { e: 'numb', words: ['numb', 'empty', 'hollow', 'disconnected', 'detached'] },
  ];

  let topEmotion: DiaryInsight['emotion'] = 'numb';
  let topScore = 0;
  for (const { e, words } of emotions) {
    const score = words.filter(w => lower.includes(w)).length;
    if (score > topScore) { topScore = score; topEmotion = e; }
  }

  const positiveWords = ['happy', 'great', 'good', 'wonderful', 'joy', 'hopeful', 'better'];
  const negativeWords = ['sad', 'bad', 'terrible', 'hate', 'angry', 'hopeless', 'pain', 'panic'];
  const pos = positiveWords.filter(w => lower.includes(w)).length;
  const neg = negativeWords.filter(w => lower.includes(w)).length;
  const sentiment: DiaryInsight['sentiment'] =
    pos > neg ? 'positive' : neg > pos ? 'negative' : 'neutral';

  const suggestions: Record<DiaryInsight['emotion'], string> = {
    sad: 'Consider reaching out to someone you trust today.',
    anxious: 'Try 5-minute box breathing: inhale 4s, hold 4s, exhale 4s, hold 4s.',
    angry: 'A short walk can help release tension. You deserve peace.',
    happy: 'Note what made you happy — it helps reinforce positive habits.',
    hopeful: 'Set one small intention for tomorrow to keep this momentum.',
    numb: 'Try grounding: name 5 things you see, 4 you touch, 3 you hear.',
  };

  return {
    sentiment,
    emotion: topEmotion,
    summary:
      sentiment === 'positive'
        ? 'You expressed an uplifting outlook today.'
        : sentiment === 'negative'
        ? "Today's entry reflects some difficult feelings."
        : 'Your entry reflects a balanced, reflective mindset.',
    suggestion: suggestions[topEmotion],
    themes: text
      .split(/\W+/)
      .filter(w => w.length > 4)
      .slice(0, 5),
  };
}

export default { analyzeDiary, getWeeklyInsights };
