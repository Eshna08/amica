import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Brain, Heart, Lightbulb, Tag } from 'lucide-react';
import { DiaryInsight } from '../../types';

interface DiaryInsightCardProps {
  insight: DiaryInsight;
}

const EMOTION_CONFIG: Record<string, { emoji: string; color: string; bg: string }> = {
  sad:     { emoji: '😢', color: '#3b82f6', bg: '#eff6ff' },
  anxious: { emoji: '😰', color: '#8b5cf6', bg: '#f5f3ff' },
  angry:   { emoji: '😠', color: '#ef4444', bg: '#fef2f2' },
  happy:   { emoji: '😊', color: '#10b981', bg: '#ecfdf5' },
  hopeful: { emoji: '🌱', color: '#f59e0b', bg: '#fffbeb' },
  numb:    { emoji: '😶', color: '#6b7280', bg: '#f9fafb' },
};

const SENTIMENT_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  positive: { label: 'Positive', color: '#10b981', bg: '#d1fae5' },
  negative: { label: 'Negative', color: '#ef4444', bg: '#fee2e2' },
  neutral:  { label: 'Neutral',  color: '#6b7280', bg: '#f3f4f6' },
};

const DiaryInsightCard: React.FC<DiaryInsightCardProps> = ({ insight }) => {
  const emo = EMOTION_CONFIG[insight.emotion] || EMOTION_CONFIG['numb'];
  const sen = SENTIMENT_CONFIG[insight.sentiment] || SENTIMENT_CONFIG['neutral'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 24 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      style={{
        background: 'linear-gradient(135deg, #fdf4ff 0%, #f0f9ff 100%)',
        border: '1px solid #e9d5ff',
        borderRadius: '1.25rem',
        padding: '1.5rem',
        marginTop: '1.25rem',
        boxShadow: '0 4px 24px rgba(139,92,246,0.12)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <Sparkles size={18} color="#8b5cf6" />
        <span style={{ fontWeight: 700, color: '#1e1b4b', fontSize: '0.95rem' }}>
          AI Insight
        </span>
        <span style={{
          marginLeft: 'auto',
          background: sen.bg,
          color: sen.color,
          padding: '0.2rem 0.65rem',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: 600,
        }}>
          {sen.label}
        </span>
      </div>

      {/* Emotion badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
        background: emo.bg, border: `1px solid ${emo.color}30`,
        padding: '0.35rem 0.9rem', borderRadius: '9999px', marginBottom: '1rem',
      }}>
        <span style={{ fontSize: '1.1rem' }}>{emo.emoji}</span>
        <span style={{ color: emo.color, fontWeight: 600, fontSize: '0.875rem', textTransform: 'capitalize' }}>
          {insight.emotion}
        </span>
      </div>

      {/* Summary */}
      <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.9rem', alignItems: 'flex-start' }}>
        <Brain size={16} color="#8b5cf6" style={{ marginTop: '2px', flexShrink: 0 }} />
        <p style={{ color: '#374151', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
          {insight.summary}
        </p>
      </div>

      {/* Suggestion */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(236,72,153,0.06))',
        border: '1px solid rgba(139,92,246,0.2)',
        borderRadius: '0.75rem',
        padding: '0.85rem',
        display: 'flex',
        gap: '0.6rem',
        alignItems: 'flex-start',
        marginBottom: '1rem',
      }}>
        <Lightbulb size={16} color="#f59e0b" style={{ marginTop: '2px', flexShrink: 0 }} />
        <div>
          <p style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Suggestion
          </p>
          <p style={{ color: '#374151', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>
            {insight.suggestion}
          </p>
        </div>
      </div>

      {/* Themes */}
      {insight.themes && insight.themes.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem' }}>
            <Tag size={13} color="#9ca3af" />
            <span style={{ color: '#9ca3af', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Key Themes
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {insight.themes.map(theme => (
              <span
                key={theme}
                style={{
                  background: '#f3f4f6',
                  color: '#4b5563',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '9999px',
                  fontSize: '0.78rem',
                  fontWeight: 500,
                  border: '1px solid #e5e7eb',
                }}
              >
                {theme}
              </span>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '1rem' }}>
        <Heart size={12} color="#ec4899" />
        <span style={{ color: '#9ca3af', fontSize: '0.73rem' }}>
          Generated by AMICA Behavioral Insight Engine
        </span>
      </div>
    </motion.div>
  );
};

export default DiaryInsightCard;
