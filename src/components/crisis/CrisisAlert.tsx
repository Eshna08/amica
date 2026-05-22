import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, X, AlertTriangle, Heart, Shield } from 'lucide-react';
import { EmergencyContact } from '../../types';

interface CrisisAlertProps {
  emergencyContact: EmergencyContact | null;
  onDismiss: () => void;
}

const INDIAN_HELPLINES = [
  { name: 'iCall', number: '9152987821', hours: 'Mon–Sat, 8am–10pm', color: '#6366f1' },
  { name: 'Vandrevala Foundation', number: '18602662345', hours: '24/7', color: '#8b5cf6' },
  { name: 'NIMHANS', number: '08046110007', hours: '24/7', color: '#ec4899' },
  { name: 'Snehi', number: '04424640050', hours: '24/7', color: '#f59e0b' },
];

const CrisisAlert: React.FC<CrisisAlertProps> = ({ emergencyContact, onDismiss }) => {
  const [leaving, setLeaving] = React.useState(false);

  const handleDismiss = () => {
    setLeaving(true);
    setTimeout(onDismiss, 400);
  };

  return (
    <AnimatePresence>
      {!leaving && (
        <motion.div
          className="crisis-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'linear-gradient(135deg, rgba(15,10,40,0.97) 0%, rgba(40,10,60,0.97) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <motion.div
            initial={{ scale: 0.85, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.85, y: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            style={{
              background: 'linear-gradient(135deg, #1e1b4b 0%, #2d1b69 50%, #1a1040 100%)',
              border: '1px solid rgba(139,92,246,0.4)',
              borderRadius: '1.5rem',
              maxWidth: '560px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 80px rgba(139,92,246,0.4)',
              padding: '2rem',
            }}
          >
            {/* Dismiss button */}
            <button
              onClick={handleDismiss}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '2rem',
                height: '2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'rgba(255,255,255,0.6)',
              }}
            >
              <X size={16} />
            </button>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2.5 }}
                style={{ marginBottom: '1rem' }}
              >
                <Heart
                  size={52}
                  style={{ color: '#ec4899', filter: 'drop-shadow(0 0 16px #ec4899)' }}
                />
              </motion.div>

              <h2 style={{
                fontSize: '1.6rem',
                fontWeight: 700,
                color: '#fff',
                marginBottom: '0.5rem',
                background: 'linear-gradient(90deg, #c084fc, #f472b6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                You are not alone.
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1rem', lineHeight: 1.6 }}>
                Help is available right now. Reaching out is a sign of strength,  
                and you deserve support.
              </p>
            </div>

            {/* Risk indicator */}
            <div style={{
              background: 'rgba(239,68,68,0.15)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '0.75rem',
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1.5rem',
            }}>
              <AlertTriangle size={18} color="#f87171" />
              <span style={{ color: '#fca5a5', fontSize: '0.875rem' }}>
                Our system detected signs of distress. Crisis support is ready for you.
              </span>
            </div>

            {/* Emergency contact (if saved) */}
            {emergencyContact && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                style={{
                  background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(236,72,153,0.2))',
                  border: '1px solid rgba(139,92,246,0.4)',
                  borderRadius: '1rem',
                  padding: '1rem',
                  marginBottom: '1.5rem',
                }}
              >
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                  <Shield size={12} style={{ display: 'inline', marginRight: '0.25rem' }} />
                  YOUR EMERGENCY CONTACT
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ color: '#fff', fontWeight: 600 }}>{emergencyContact.name}</p>
                    <p style={{ color: '#c084fc', fontSize: '0.9rem' }}>{emergencyContact.phone_number}</p>
                  </div>
                  <a
                    href={`tel:${emergencyContact.phone_number.replace(/\D/g, '')}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                      color: '#fff',
                      padding: '0.6rem 1.2rem',
                      borderRadius: '0.6rem',
                      textDecoration: 'none',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      boxShadow: '0 4px 15px rgba(139,92,246,0.5)',
                    }}
                  >
                    <Phone size={15} />
                    Call Now
                  </a>
                </div>
              </motion.div>
            )}

            {/* Indian Helplines */}
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
                CRISIS HELPLINES — INDIA (FREE, CONFIDENTIAL)
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {INDIAN_HELPLINES.map((h, i) => (
                  <motion.div
                    key={h.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.07 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'rgba(255,255,255,0.05)',
                      borderRadius: '0.75rem',
                      padding: '0.75rem 1rem',
                      border: `1px solid rgba(255,255,255,0.08)`,
                    }}
                  >
                    <div>
                      <p style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>{h.name}</p>
                      <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.75rem' }}>{h.hours}</p>
                    </div>
                    <a
                      href={`tel:${h.number}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        background: `${h.color}30`,
                        border: `1px solid ${h.color}60`,
                        color: '#e2e8f0',
                        padding: '0.45rem 0.9rem',
                        borderRadius: '0.5rem',
                        textDecoration: 'none',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <Phone size={13} />
                      {h.number.replace(/(\d{4})(\d{3})(\d{4})/, '$1-$2-$3')}
                    </a>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Dismiss */}
            <button
              onClick={handleDismiss}
              style={{
                width: '100%',
                padding: '0.85rem',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '0.75rem',
                color: 'rgba(255,255,255,0.7)',
                fontWeight: 500,
                fontSize: '0.95rem',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
            >
              I'm Safe — Continue
            </button>

            <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem', marginTop: '1rem' }}>
              This alert was shown because we care about your wellbeing.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CrisisAlert;
