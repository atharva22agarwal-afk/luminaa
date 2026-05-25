import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, Sun, Cloud, CloudRain, Zap, ArrowRight, X } from 'lucide-react';

const MOOD_PRESETS = [
  { id: 'anxious', label: 'Anxious', emoji: '😰', color: '#FF6B6B', suggestion: 'Zen', journalPrompt: 'What is weighing on your mind right now? Let it out without filtering.' },
  { id: 'stressed', label: 'Stressed', emoji: '😫', color: '#FFA07A', suggestion: 'Theta', journalPrompt: 'What would make today feel 10% lighter? Write three small things.' },
  { id: 'neutral', label: 'Grounded', emoji: '😐', color: '#A8C3B0', suggestion: 'Alpha', journalPrompt: 'What intention would serve you best today?' },
  { id: 'good', label: 'Good', emoji: '🙂', color: '#7EC8E3', suggestion: 'Alpha', journalPrompt: 'What are you grateful for right now?' },
  { id: 'great', label: 'Aligned', emoji: '✨', color: '#7E77DD', suggestion: 'Gamma', journalPrompt: 'What is flowing effortlessly in your life today?' },
];

const DAILY_CHECKIN_KEY = 'lumina_daily_checkin';

function getTodayKey() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Daily Mood Check-in — shows once per day.
 * Auto-suggests audio mode, journal prompt, and affirmation.
 */
export default function DailyCheckIn({ onComplete, onApplySuggestion }) {
  const [selectedMood, setSelectedMood] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Delay mount for smooth entrance
    const timer = setTimeout(() => setShow(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleSelect = useCallback((mood) => {
    setSelectedMood(mood);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!selectedMood) return;
    setIsSubmitting(true);

    // Persist today's check-in
    localStorage.setItem(DAILY_CHECKIN_KEY, JSON.stringify({
      date: getTodayKey(),
      mood: selectedMood.id,
      moodLabel: selectedMood.label,
      timestamp: Date.now(),
    }));

    // Apply the suggestion
    if (onApplySuggestion) {
      onApplySuggestion({
        audioMode: selectedMood.suggestion,
        journalPrompt: selectedMood.journalPrompt,
        mood: selectedMood,
      });
    }

    // Delay dismiss for animation
    setTimeout(() => {
      setShow(false);
      setTimeout(() => onComplete(), 400);
    }, 200);
  }, [selectedMood, onApplySuggestion, onComplete]);

  const handleDismiss = useCallback(() => {
    setShow(false);
    setTimeout(() => onComplete(), 400);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(12px)',
          }}
          onClick={handleDismiss}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 30 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--bg-card)',
              borderRadius: '32px',
              padding: '48px 40px',
              maxWidth: '520px',
              width: '90%',
              border: '1px solid var(--glass-border)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.3)',
              position: 'relative',
            }}
          >
            {/* Close button */}
            <button
              onClick={handleDismiss}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                padding: '4px',
              }}
              aria-label="Dismiss check-in"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '36px' }}>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                style={{
                  fontSize: '2.5rem',
                  marginBottom: '12px',
                }}
              >
                🌅
              </motion.div>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '1.8rem',
                fontWeight: 400,
                fontStyle: 'italic',
                color: 'var(--text-main)',
                marginBottom: '8px',
              }}>
                How are you feeling today?
              </h2>
              <p style={{
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
                letterSpacing: '0.05em',
              }}>
                We'll tailor your sanctuary to match your energy.
              </p>
            </div>

            {/* Mood Options */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '12px',
              flexWrap: 'wrap',
              marginBottom: '32px',
            }}>
              {MOOD_PRESETS.map((mood, i) => (
                <motion.button
                  key={mood.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i + 0.3 }}
                  onClick={() => handleSelect(mood)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '16px 14px',
                    borderRadius: '20px',
                    border: selectedMood?.id === mood.id
                      ? `2px solid ${mood.color}`
                      : '2px solid transparent',
                    background: selectedMood?.id === mood.id
                      ? `${mood.color}15`
                      : 'var(--bg-element)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    minWidth: '76px',
                    boxShadow: selectedMood?.id === mood.id
                      ? `0 4px 20px ${mood.color}30`
                      : 'none',
                  }}
                  aria-label={mood.label}
                  aria-pressed={selectedMood?.id === mood.id}
                >
                  <span style={{ fontSize: '1.6rem' }}>{mood.emoji}</span>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    color: selectedMood?.id === mood.id ? mood.color : 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    {mood.label}
                  </span>
                </motion.button>
              ))}
            </div>

            {/* Submit Button */}
            <motion.button
              onClick={handleSubmit}
              disabled={!selectedMood || isSubmitting}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '20px',
                border: 'none',
                background: selectedMood
                  ? selectedMood.color
                  : 'var(--bg-element)',
                color: selectedMood ? 'white' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '0.9rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: selectedMood ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                transition: 'all 0.3s ease',
                opacity: selectedMood ? 1 : 0.5,
              }}
            >
              {isSubmitting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Wind size={18} />
                </motion.div>
              ) : (
                <>
                  <ArrowRight size={18} />
                  Enter Sanctuary
                </>
              )}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function getTodaysMood() {
  try {
    const data = JSON.parse(localStorage.getItem(DAILY_CHECKIN_KEY) || 'null');
    if (!data) return null;
    if (data.date !== getTodayKey()) return null;
    return MOOD_PRESETS.find(m => m.id === data.mood) || null;
  } catch {
    return null;
  }
}

export function getWeeklyMoodHistory() {
  try {
    const history = JSON.parse(localStorage.getItem('lumina_mood_history') || '[]');
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);

    return history.filter(entry => new Date(entry.timestamp) >= weekAgo);
  } catch {
    return [];
  }
}

export function recordMoodHistory(moodId, label) {
  try {
    const history = JSON.parse(localStorage.getItem('lumina_mood_history') || '[]');
    history.push({
      mood: moodId,
      label,
      timestamp: Date.now(),
      date: getTodayKey(),
    });
    // Keep last 90 days
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90);
    const filtered = history.filter(e => new Date(e.timestamp) >= cutoff);
    localStorage.setItem('lumina_mood_history', JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed to record mood history:', e);
  }
}
