import React from 'react';
import { motion } from 'framer-motion';
import { getWeeklyInsights } from '../utils/diary';
import { WeeklyInsights } from '../types';
import { TrendingUp, Brain, Tag, RefreshCw, BarChart2 } from 'lucide-react';

const EMOTION_COLORS: Record<string, string> = {
  sad: '#3b82f6',
  anxious: '#8b5cf6',
  angry: '#ef4444',
  happy: '#10b981',
  hopeful: '#f59e0b',
  numb: '#6b7280',
};

const EMOTION_EMOJIS: Record<string, string> = {
  sad: '😢', anxious: '😰', angry: '😠', happy: '😊', hopeful: '🌱', numb: '😶',
};

const SENTIMENT_COLORS: Record<string, string> = {
  positive: '#10b981',
  negative: '#ef4444',
  neutral: '#6b7280',
};

const InsightsPage: React.FC = () => {
  const [insights, setInsights] = React.useState<WeeklyInsights | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getWeeklyInsights();
      setInsights(data);
    } catch {
      setError('Could not load weekly insights. Make sure the AMICA backend is running on port 5000.');
    }
    setLoading(false);
  };

  React.useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem', flexDirection: 'column', gap: '1rem' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}>
          <Brain size={40} color="#8b5cf6" />
        </motion.div>
        <p style={{ color: '#6b7280' }}>Loading your behavioral insights...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>
        <button onClick={load} style={{ background: '#7c3aed', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '0.5rem', cursor: 'pointer' }}>
          Retry
        </button>
      </div>
    );
  }

  if (!insights || insights.entry_count === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <Brain size={56} color="#d8b4fe" style={{ margin: '0 auto 1rem' }} />
        <h2 style={{ color: '#1e1b4b', fontWeight: 700, fontSize: '1.4rem', marginBottom: '0.5rem' }}>No insights yet</h2>
        <p style={{ color: '#6b7280', maxWidth: '380px', margin: '0 auto' }}>
          Submit at least one diary entry to generate behavioral insights and emotion charts.
        </p>
      </div>
    );
  }

  const maxEmotionCount = Math.max(...insights.emotion_frequency.map(e => e.count), 1);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1rem 4rem' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e1b4b', marginBottom: '0.25rem' }}>
              Behavioral Insights
            </h1>
            <p style={{ color: '#6b7280' }}>AI-driven analysis of your diary entries</p>
          </div>
          <button
            onClick={load}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'transparent', border: '1px solid #d8b4fe', color: '#7c3aed', padding: '0.45rem 0.85rem', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </motion.div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          style={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
            borderRadius: '1rem', padding: '1.25rem', color: '#fff',
            boxShadow: '0 8px 24px rgba(124,58,237,0.3)',
          }}
        >
          <Brain size={24} style={{ marginBottom: '0.5rem', opacity: 0.8 }} />
          <p style={{ fontSize: '0.78rem', opacity: 0.7, marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Entries Analyzed</p>
          <p style={{ fontSize: '2rem', fontWeight: 800 }}>{insights.entry_count}</p>
        </motion.div>

        {insights.most_frequent_emotion && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{
              background: `linear-gradient(135deg, ${EMOTION_COLORS[insights.most_frequent_emotion] || '#6b7280'}22, ${EMOTION_COLORS[insights.most_frequent_emotion] || '#6b7280'}44)`,
              border: `1px solid ${EMOTION_COLORS[insights.most_frequent_emotion] || '#6b7280'}40`,
              borderRadius: '1rem', padding: '1.25rem',
            }}
          >
            <span style={{ fontSize: '1.5rem', marginBottom: '0.5rem', display: 'block' }}>
              {EMOTION_EMOJIS[insights.most_frequent_emotion] || '🧠'}
            </span>
            <p style={{ fontSize: '0.78rem', color: '#6b7280', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Most Frequent Emotion
            </p>
            <p style={{
              fontSize: '1.2rem', fontWeight: 700,
              color: EMOTION_COLORS[insights.most_frequent_emotion] || '#1e1b4b',
              textTransform: 'capitalize',
            }}>
              {insights.most_frequent_emotion}
            </p>
          </motion.div>
        )}
      </div>

      {/* Emotion Frequency Bar Chart */}
      {insights.emotion_frequency.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          style={{
            background: '#fff', border: '1px solid #e9d5ff', borderRadius: '1.25rem',
            padding: '1.5rem', marginBottom: '1.5rem',
            boxShadow: '0 4px 16px rgba(139,92,246,0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <BarChart2 size={18} color="#8b5cf6" />
            <h2 style={{ fontWeight: 700, color: '#1e1b4b', fontSize: '1rem' }}>Emotion Frequency</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {insights.emotion_frequency
              .sort((a, b) => b.count - a.count)
              .map((ef, i) => (
                <motion.div
                  key={ef.emotion}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.18 + i * 0.06 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151', textTransform: 'capitalize' }}>
                      {EMOTION_EMOJIS[ef.emotion]} {ef.emotion}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: 500 }}>{ef.count}</span>
                  </div>
                  <div style={{ background: '#f3f4f6', borderRadius: '9999px', height: '10px', overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(ef.count / maxEmotionCount) * 100}%` }}
                      transition={{ delay: 0.2 + i * 0.06, duration: 0.7, ease: 'easeOut' }}
                      style={{
                        height: '100%',
                        borderRadius: '9999px',
                        background: `linear-gradient(90deg, ${EMOTION_COLORS[ef.emotion] || '#8b5cf6'}, ${EMOTION_COLORS[ef.emotion] || '#8b5cf6'}aa)`,
                      }}
                    />
                  </div>
                </motion.div>
              ))}
          </div>
        </motion.div>
      )}

      {/* Mood Trend Timeline */}
      {insights.mood_trend.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{
            background: '#fff', border: '1px solid #e9d5ff', borderRadius: '1.25rem',
            padding: '1.5rem', marginBottom: '1.5rem',
            boxShadow: '0 4px 16px rgba(139,92,246,0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <TrendingUp size={18} color="#8b5cf6" />
            <h2 style={{ fontWeight: 700, color: '#1e1b4b', fontSize: '1rem' }}>Mood Trend Timeline</h2>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <div style={{ display: 'flex', gap: '0.75rem', minWidth: `${insights.mood_trend.length * 80}px`, paddingBottom: '0.5rem' }}>
              {insights.mood_trend.map((entry, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.22 + i * 0.05 }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', minWidth: '72px' }}
                >
                  <span style={{ fontSize: '1.4rem' }}>{EMOTION_EMOJIS[entry.emotion] || '🧠'}</span>
                  <span style={{
                    fontSize: '0.72rem', fontWeight: 600, textTransform: 'capitalize',
                    color: EMOTION_COLORS[entry.emotion] || '#6b7280',
                    background: `${EMOTION_COLORS[entry.emotion] || '#6b7280'}18`,
                    padding: '0.15rem 0.5rem', borderRadius: '9999px',
                  }}>
                    {entry.emotion}
                  </span>
                  <div style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: SENTIMENT_COLORS[entry.sentiment] || '#6b7280',
                  }} title={entry.sentiment} />
                  <span style={{ fontSize: '0.65rem', color: '#9ca3af', textAlign: 'center' }}>
                    {new Date(entry.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem' }}>
            {Object.entries(SENTIMENT_COLORS).map(([s, c]) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: c }} />
                <span style={{ fontSize: '0.73rem', color: '#6b7280', textTransform: 'capitalize' }}>{s}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Repeated Triggers / Themes */}
      {insights.repeated_triggers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          style={{
            background: '#fff', border: '1px solid #e9d5ff', borderRadius: '1.25rem',
            padding: '1.5rem', boxShadow: '0 4px 16px rgba(139,92,246,0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Tag size={18} color="#8b5cf6" />
            <h2 style={{ fontWeight: 700, color: '#1e1b4b', fontSize: '1rem' }}>Recurring Themes</h2>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
            {insights.repeated_triggers.map((t, i) => {
              const opacity = 0.4 + (t.count / (insights.repeated_triggers[0]?.count || 1)) * 0.6;
              return (
                <motion.span
                  key={t.theme}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.27 + i * 0.04 }}
                  style={{
                    background: `rgba(139,92,246,${opacity * 0.15})`,
                    border: `1px solid rgba(139,92,246,${opacity * 0.4})`,
                    color: '#5b21b6',
                    padding: '0.3rem 0.8rem',
                    borderRadius: '9999px',
                    fontSize: `${0.78 + opacity * 0.16}rem`,
                    fontWeight: 600,
                  }}
                >
                  {t.theme}
                  <span style={{ color: '#8b5cf6', marginLeft: '0.3rem', fontSize: '0.7rem' }}>×{t.count}</span>
                </motion.span>
              );
            })}
          </div>
          <p style={{ color: '#9ca3af', fontSize: '0.78rem', marginTop: '0.75rem' }}>
            Larger tags = more frequently recurring across entries
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default InsightsPage;
