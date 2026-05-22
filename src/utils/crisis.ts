import axios from 'axios';
import { CrisisData, EmergencyContact, CrisisEvent } from '../types';

const BASE = 'http://localhost:5000';

/**
 * Call the backend crisis detection engine.
 * Returns structured risk data: risk_level, trigger_words, sentiment_score
 */
export const detectCrisis = async (text: string): Promise<CrisisData | null> => {
  try {
    const response = await axios.post(`${BASE}/detect-crisis`, { text }, { timeout: 8000 });
    return response.data as CrisisData;
  } catch (err) {
    console.error('[crisis.ts] detectCrisis error:', err);
    // Fallback: client-side minimal detection so UX never silently fails
    const lower = text.toLowerCase();
    const HIGH_KEYWORDS = [
      'kill myself', 'want to die', 'end my life', 'commit suicide',
      'take my life', 'no reason to live', 'don\'t want to live'
    ];
    const isHigh = HIGH_KEYWORDS.some(kw => lower.includes(kw));
    return {
      risk_level: isHigh ? 'HIGH' : 'LOW',
      trigger_words: HIGH_KEYWORDS.filter(kw => lower.includes(kw)),
      sentiment_score: isHigh ? -0.9 : 0
    };
  }
};

/** Log a crisis event to the backend */
export const logCrisisEvent = async (
  event: Omit<CrisisEvent, 'id' | 'timestamp'>
): Promise<void> => {
  try {
    await axios.post(`${BASE}/log-crisis`, event, { timeout: 5000 });
  } catch (err) {
    console.error('[crisis.ts] logCrisisEvent error:', err);
  }
};

/** Fetch all emergency contacts from backend */
export const getEmergencyContacts = async (): Promise<EmergencyContact[]> => {
  try {
    const res = await axios.get(`${BASE}/emergency-contacts`, { timeout: 5000 });
    return res.data as EmergencyContact[];
  } catch (err) {
    console.error('[crisis.ts] getEmergencyContacts error:', err);
    return [];
  }
};

/** Save a new emergency contact */
export const saveEmergencyContact = async (
  name: string,
  phone_number: string
): Promise<EmergencyContact | null> => {
  try {
    const res = await axios.post(
      `${BASE}/emergency-contacts`,
      { name, phone_number },
      { timeout: 5000 }
    );
    return res.data as EmergencyContact;
  } catch (err) {
    console.error('[crisis.ts] saveEmergencyContact error:', err);
    return null;
  }
};

/** Update an existing emergency contact */
export const updateEmergencyContact = async (
  id: string,
  name: string,
  phone_number: string
): Promise<EmergencyContact | null> => {
  try {
    const res = await axios.put(
      `${BASE}/emergency-contacts/${id}`,
      { name, phone_number },
      { timeout: 5000 }
    );
    return res.data as EmergencyContact;
  } catch (err) {
    console.error('[crisis.ts] updateEmergencyContact error:', err);
    return null;
  }
};

/** Delete an emergency contact */
export const deleteEmergencyContact = async (id: string): Promise<boolean> => {
  try {
    await axios.delete(`${BASE}/emergency-contacts/${id}`, { timeout: 5000 });
    return true;
  } catch (err) {
    console.error('[crisis.ts] deleteEmergencyContact error:', err);
    return false;
  }
};

export default {
  detectCrisis,
  logCrisisEvent,
  getEmergencyContacts,
  saveEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact
};
