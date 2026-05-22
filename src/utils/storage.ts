import { UserProfile, JournalEntry, Conversation, Mood, MoodEntry, FlaggedContent, ChatMessage, EmergencyContact, CrisisEvent, DiaryInsight } from '../types';
import { checkContent } from './contentMonitor';

// Default user profile
const defaultProfile: UserProfile = {
  name: '',
  isAdmin: false,
  mood: {
    current: 'neutral',
    history: [],
  },
  journals: [],
  conversations: [],
  settings: {
    theme: 'light',
    notifications: false,
    fontSize: 'medium',
  },
};

// Storage keys
const STORAGE_KEYS = {
  USER_PROFILE: 'Amica_user_profile',
  JOURNALS: 'Amica_journals',
  MOOD_ENTRIES: 'Amica_mood_entries',
  CONVERSATIONS: 'Amica_conversations',
  FLAGGED_CONTENT: 'Amica_flagged_content',
  EMERGENCY_CONTACTS: 'Amica_emergency_contacts',
  CRISIS_EVENTS: 'Amica_crisis_events',
  DIARY_INSIGHTS: 'Amica_diary_insights',
};

// Initialize storage
export const initializeStorage = (): UserProfile => {
  const storedProfile = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
  
  if (!storedProfile) {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(defaultProfile));
    return defaultProfile;
  }
  
  return JSON.parse(storedProfile);
};

// User profile
export const getUserProfile = (): UserProfile => {
  const storedProfile = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
  return storedProfile ? JSON.parse(storedProfile) : initializeStorage();
};

export const updateUserProfile = (profile: Partial<UserProfile>): UserProfile => {
  const currentProfile = getUserProfile();
  const updatedProfile = { ...currentProfile, ...profile };
  localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(updatedProfile));
  return updatedProfile;
};

// Flagged content
export const getFlaggedContent = (): FlaggedContent[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.FLAGGED_CONTENT);
  return stored ? JSON.parse(stored) : [];
};

export const addFlaggedContent = (content: Omit<FlaggedContent, 'id' | 'timestamp'>): FlaggedContent => {
  const flaggedContent = getFlaggedContent();
  const newEntry: FlaggedContent = {
    id: Date.now().toString(),
    timestamp: Date.now(),
    ...content,
    riskLevel: content.riskLevel || 'low',
  };
  const updated = [...flaggedContent, newEntry];
  localStorage.setItem(STORAGE_KEYS.FLAGGED_CONTENT, JSON.stringify(updated));
  return newEntry;
};

export const updateFlaggedContent = (id: string, updates: Partial<FlaggedContent>): FlaggedContent | null => {
  const flaggedContent = getFlaggedContent();
  const index = flaggedContent.findIndex(item => item.id === id);
  
  if (index === -1) return null;
  
  const updatedItem = { ...flaggedContent[index], ...updates };
  const updated = [...flaggedContent];
  updated[index] = updatedItem;
  
  localStorage.setItem(STORAGE_KEYS.FLAGGED_CONTENT, JSON.stringify(updated));
  return updatedItem;
};

// Journal entries with content monitoring
export const getJournalEntries = (): JournalEntry[] => {
  const profile = getUserProfile();
  return profile.journals;
};

export const addJournalEntry = (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>): JournalEntry => {
  const profile = getUserProfile();
  const contentCheck = checkContent(entry.content);
  
  const newEntry: JournalEntry = {
    id: Date.now().toString(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...entry,
    flagged: contentCheck.flagged,
    flagReason: contentCheck.reason,
  };
  
  const updatedJournals = [...profile.journals, newEntry];
  updateUserProfile({ journals: updatedJournals });
  
  return newEntry;
};

export const updateJournalEntry = (id: string, updates: Omit<JournalEntry, 'id' | 'createdAt'>): JournalEntry | null => {
  const profile = getUserProfile();
  const index = profile.journals.findIndex(journal => journal.id === id);
  
  if (index === -1) return null;
  
  const contentCheck = checkContent(updates.content);
  
  const updatedEntry: JournalEntry = {
    ...profile.journals[index],
    ...updates,
    id,
    createdAt: profile.journals[index].createdAt,
    updatedAt: Date.now(),
    flagged: contentCheck.flagged,
    flagReason: contentCheck.reason,
  };
  
  const updatedJournals = [...profile.journals];
  updatedJournals[index] = updatedEntry;
  updateUserProfile({ journals: updatedJournals });
  
  return updatedEntry;
};

/** Attach diary insight fields to an existing journal entry */
export const attachDiaryInsight = (id: string, insight: Partial<JournalEntry>): JournalEntry | null => {
  const profile = getUserProfile();
  const index = profile.journals.findIndex(j => j.id === id);
  if (index === -1) return null;

  const updated: JournalEntry = { ...profile.journals[index], ...insight, updatedAt: Date.now() };
  const updatedJournals = [...profile.journals];
  updatedJournals[index] = updated;
  updateUserProfile({ journals: updatedJournals });
  return updated;
};

export const deleteJournalEntry = (id: string): boolean => {
  const profile = getUserProfile();
  const updatedJournals = profile.journals.filter(journal => journal.id !== id);
  
  if (updatedJournals.length === profile.journals.length) {
    return false;
  }
  
  updateUserProfile({ journals: updatedJournals });
  return true;
};

// Mood entries
export const getMoodEntries = (): MoodEntry[] => {
  const profile = getUserProfile();
  return profile.mood.history;
};

export const addMoodEntry = (mood: Mood, note = '', source: 'chatbot' | 'manual' = 'manual'): MoodEntry => {
  const profile = getUserProfile();
  const newEntry: MoodEntry = {
    id: Date.now().toString(),
    mood,
    note,
    date: Date.now(),
    source,
  };
  
  const updatedHistory = [...profile.mood.history, newEntry];
  updateUserProfile({
    mood: {
      current: mood,
      history: updatedHistory,
    },
  });
  
  return newEntry;
};

// Conversations
export const getConversations = (): Conversation[] => {
  const profile = getUserProfile();
  return profile.conversations;
};

export const getConversation = (id: string): Conversation | null => {
  const profile = getUserProfile();
  return profile.conversations.find(convo => convo.id === id) || null;
};

export const createConversation = (title: string): Conversation => {
  const profile = getUserProfile();
  const newConversation: Conversation = {
    id: Date.now().toString(),
    title,
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    hasFlaggedContent: false,
  };
  
  const updatedConversations = [...profile.conversations, newConversation];
  updateUserProfile({ conversations: updatedConversations });
  
  return newConversation;
};

export const updateConversation = (id: string, updates: Partial<Conversation>): Conversation | null => {
  const profile = getUserProfile();
  const index = profile.conversations.findIndex(convo => convo.id === id);
  
  if (index === -1) return null;
  
  const updatedConvo = {
    ...profile.conversations[index],
    ...updates,
    updatedAt: Date.now(),
  };
  
  const updatedConversations = [...profile.conversations];
  updatedConversations[index] = updatedConvo;
  
  updateUserProfile({ conversations: updatedConversations });
  return updatedConvo;
};

export const addMessageToConversation = (
  conversationId: string,
  message: Omit<Omit<Omit<ChatMessage, 'id'>, 'timestamp'>, 'conversationId'>
): Conversation | null => {
  const profile = getUserProfile();
  const convoIndex = profile.conversations.findIndex(convo => convo.id === conversationId);
  
  if (convoIndex === -1) return null;
  
  const contentCheck = message.role === 'user' ? checkContent(message.content) : { flagged: false };
  
  const newMessage: ChatMessage = {
    id: Date.now().toString(),
    timestamp: Date.now(),
    ...message,
    flagged: contentCheck.flagged,
    flagReason: (contentCheck as any).reason,
  };
  
  const updatedMessages = [...profile.conversations[convoIndex].messages, newMessage];
  const updatedConvo = {
    ...profile.conversations[convoIndex],
    messages: updatedMessages,
    updatedAt: Date.now(),
    hasFlaggedContent: updatedMessages.some(msg => msg.flagged),
  };
  
  const updatedConversations = [...profile.conversations];
  updatedConversations[convoIndex] = updatedConvo;
  
  updateUserProfile({ conversations: updatedConversations });
  return updatedConvo;
};

export const deleteConversation = (id: string): boolean => {
  const profile = getUserProfile();
  const updatedConversations = profile.conversations.filter(convo => convo.id !== id);
  
  if (updatedConversations.length === profile.conversations.length) {
    return false;
  }
  
  updateUserProfile({ conversations: updatedConversations });
  return true;
};

/* ================================================================
   MODULE 1 – Emergency Contacts (localStorage backup)
   ================================================================ */
export const getEmergencyContactsLocal = (): import('../types').EmergencyContact[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.EMERGENCY_CONTACTS);
  return stored ? JSON.parse(stored) : [];
};

export const saveEmergencyContactLocal = (contact: import('../types').EmergencyContact): void => {
  const contacts = getEmergencyContactsLocal();
  const existing = contacts.findIndex(c => c.id === contact.id);
  if (existing !== -1) {
    contacts[existing] = contact;
  } else {
    contacts.push(contact);
  }
  localStorage.setItem(STORAGE_KEYS.EMERGENCY_CONTACTS, JSON.stringify(contacts));
};

export const deleteEmergencyContactLocal = (id: string): void => {
  const contacts = getEmergencyContactsLocal().filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEYS.EMERGENCY_CONTACTS, JSON.stringify(contacts));
};

/* ================================================================
   MODULE 1 – Crisis Events
   ================================================================ */
export const getCrisisEvents = (): CrisisEvent[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.CRISIS_EVENTS);
  return stored ? JSON.parse(stored) : [];
};

export const addCrisisEvent = (event: CrisisEvent): void => {
  const events = getCrisisEvents();
  events.push(event);
  localStorage.setItem(STORAGE_KEYS.CRISIS_EVENTS, JSON.stringify(events));
};

/* ================================================================
   MODULE 2 – Diary Insights
   ================================================================ */
export const getDiaryInsights = (): Record<string, DiaryInsight> => {
  const stored = localStorage.getItem(STORAGE_KEYS.DIARY_INSIGHTS);
  return stored ? JSON.parse(stored) : {};
};

export const saveDiaryInsight = (entry_id: string, insight: DiaryInsight): void => {
  const insights = getDiaryInsights();
  insights[entry_id] = { ...insight, entry_id };
  localStorage.setItem(STORAGE_KEYS.DIARY_INSIGHTS, JSON.stringify(insights));
};

// Export all storage functions
export const storage = {
  initializeStorage,
  getUserProfile,
  updateUserProfile,
  getJournalEntries,
  addJournalEntry,
  updateJournalEntry,
  attachDiaryInsight,
  deleteJournalEntry,
  getMoodEntries,
  addMoodEntry,
  getConversations,
  getConversation,
  createConversation,
  updateConversation,
  addMessageToConversation,
  deleteConversation,
  getFlaggedContent,
  addFlaggedContent,
  updateFlaggedContent,
  getEmergencyContactsLocal,
  saveEmergencyContactLocal,
  deleteEmergencyContactLocal,
  getCrisisEvents,
  addCrisisEvent,
  getDiaryInsights,
  saveDiaryInsight,
};

export default storage;