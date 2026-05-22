import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Plus, Trash2, Edit2, Check, X, Shield } from 'lucide-react';
import { EmergencyContact } from '../../types';
import {
  getEmergencyContacts,
  saveEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact,
} from '../../utils/crisis';
import storage from '../../utils/storage';

const EmergencyContactManager: React.FC = () => {
  const [contacts, setContacts] = React.useState<EmergencyContact[]>([]);
  const [showForm, setShowForm] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [name, setName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const loadContacts = async () => {
    try {
      const fetched = await getEmergencyContacts();
      if (fetched.length > 0) {
        setContacts(fetched);
      } else {
        // fall back to local storage
        setContacts(storage.getEmergencyContactsLocal());
      }
    } catch {
      setContacts(storage.getEmergencyContactsLocal());
    }
  };

  React.useEffect(() => { loadContacts(); }, []);

  const resetForm = () => {
    setName('');
    setPhone('');
    setEditingId(null);
    setShowForm(false);
    setError('');
  };

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim()) {
      setError('Both name and phone number are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (editingId) {
        const updated = await updateEmergencyContact(editingId, name, phone);
        if (updated) {
          storage.saveEmergencyContactLocal(updated);
          setContacts(prev => prev.map(c => c.id === editingId ? updated : c));
        }
      } else {
        const saved = await saveEmergencyContact(name, phone);
        if (saved) {
          storage.saveEmergencyContactLocal(saved);
          setContacts(prev => [...prev, saved]);
        }
      }
      resetForm();
    } catch {
      setError('Failed to save. Please try again.');
    }
    setLoading(false);
  };

  const handleEdit = (contact: EmergencyContact) => {
    setEditingId(contact.id);
    setName(contact.name);
    setPhone(contact.phone_number);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Remove this emergency contact?')) return;
    await deleteEmergencyContact(id);
    storage.deleteEmergencyContactLocal(id);
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #f8f7ff 0%, #fdf4ff 100%)',
      border: '1px solid #e9d5ff',
      borderRadius: '1rem',
      padding: '1.5rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Shield size={20} color="#7c3aed" />
          <h3 style={{ fontWeight: 700, color: '#1e1b4b', fontSize: '1rem' }}>Emergency Contact</h3>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.3rem',
              background: '#7c3aed', color: '#fff', border: 'none',
              padding: '0.4rem 0.9rem', borderRadius: '0.5rem',
              fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
            }}
          >
            <Plus size={14} /> Add
          </button>
        )}
      </div>

      <p style={{ color: '#6b7280', fontSize: '0.8rem', marginBottom: '1rem' }}>
        Your emergency contact will appear in the crisis alert with a direct call button.
      </p>

      {/* Contact list */}
      <AnimatePresence>
        {contacts.map(c => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: '#fff', border: '1px solid #e9d5ff',
              borderRadius: '0.75rem', padding: '0.75rem 1rem', marginBottom: '0.5rem',
            }}
          >
            <div>
              <p style={{ fontWeight: 600, color: '#1e1b4b' }}>{c.name}</p>
              <p style={{ color: '#7c3aed', fontSize: '0.85rem' }}>{c.phone_number}</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <a
                href={`tel:${c.phone_number.replace(/\D/g, '')}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.25rem',
                  background: '#7c3aed', color: '#fff',
                  padding: '0.35rem 0.8rem', borderRadius: '0.4rem',
                  textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600,
                }}
              >
                <Phone size={12} /> Call
              </a>
              <button
                onClick={() => handleEdit(c)}
                style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '0.25rem' }}
              >
                <Edit2 size={15} />
              </button>
              <button
                onClick={() => handleDelete(c.id)}
                style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: '0.25rem' }}
              >
                <Trash2 size={15} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {contacts.length === 0 && !showForm && (
        <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.85rem', padding: '1rem 0' }}>
          No emergency contact added yet.
        </p>
      )}

      {/* Add / Edit form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              background: '#fff', border: '1px solid #e9d5ff',
              borderRadius: '0.75rem', padding: '1rem', marginTop: '0.5rem',
            }}>
              <p style={{ fontWeight: 600, color: '#1e1b4b', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                {editingId ? 'Edit Contact' : 'New Emergency Contact'}
              </p>
              {error && (
                <p style={{ color: '#ef4444', fontSize: '0.8rem', marginBottom: '0.5rem' }}>{error}</p>
              )}
              <input
                type="text"
                placeholder="Name (e.g., Mom)"
                value={name}
                onChange={e => setName(e.target.value)}
                style={{
                  width: '100%', padding: '0.6rem 0.8rem',
                  border: '1px solid #d8b4fe', borderRadius: '0.5rem',
                  fontSize: '0.9rem', marginBottom: '0.5rem', boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
              <input
                type="tel"
                placeholder="Phone number (e.g., 9876543210)"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                style={{
                  width: '100%', padding: '0.6rem 0.8rem',
                  border: '1px solid #d8b4fe', borderRadius: '0.5rem',
                  fontSize: '0.9rem', marginBottom: '0.75rem', boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.3rem',
                    background: '#7c3aed', color: '#fff', border: 'none',
                    padding: '0.5rem 1rem', borderRadius: '0.5rem',
                    fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                    opacity: loading ? 0.7 : 1,
                  }}
                >
                  <Check size={14} /> {loading ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={resetForm}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.3rem',
                    background: 'transparent', color: '#6b7280',
                    border: '1px solid #d1d5db', padding: '0.5rem 1rem',
                    borderRadius: '0.5rem', fontSize: '0.85rem', cursor: 'pointer',
                  }}
                >
                  <X size={14} /> Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmergencyContactManager;
