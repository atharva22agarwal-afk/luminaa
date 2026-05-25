import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, BookOpen, Activity, Award, Calendar } from 'lucide-react';

const MOOD_SCORES = { anxious: 1, stressed: 2, neutral: 3, good: 4, great: 5 };

/**
 * Weekly Evolution Report — aggregates mood, journal, timer, and frequency data
 * into a single visual progress card.
 */
export default function EvolutionReport() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    setStats(computeWeeklyStats());
  }, []);

  if (!stats) return null;

  const hasData = stats.totalEntries > 0 || stats.totalSessions > 0 || stats.moodEntries.length > 0;

  if (!hasData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'var(--bg-card)',
          borderRadius: '24px',
          padding: '40px',
          border: '1px solid var(--glass-border)',
          textAlign: 'center',
        }}
      >
        <Calendar size={32} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', marginBottom: '8px', color: 'var(--text-main)' }}>
          Your Week Awaits
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Start journaling, using the timer, and checking in daily to see your evolution here.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'var(--bg-card)',
        borderRadius: '24px',
        padding: '32px',
        border: '1px solid var(--glass-border)',
        boxShadow: 'var(--card-shadow)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <TrendingUp size={20} color="var(--sage-green)" />
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', fontWeight: 400, fontStyle: 'italic', color: 'var(--text-main)' }}>
          Weekly Evolution
        </h2>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
      }}>
        <StatCard icon={<BookOpen size={18} />} label="Journal Entries" value={stats.totalEntries} />
        <StatCard icon={<Clock size={18} />} label="Focus Sessions" value={stats.totalSessions} />
        <StatCard icon={<Activity size={18} />} label="Avg Frequency" value={stats.avgFrequency ? `${stats.avgFrequency}` : '—'} />
        <StatCard icon={<Award size={18} />} label="Check-ins" value={stats.moodEntries.length} />
      </div>

      {/* Mood Trend */}
      {stats.moodEntries.length > 0 && (
        <div style={{
          background: 'var(--bg-element)',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '16px',
        }}>
          <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '16px' }}>
            Mood Trend
          </h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '60px' }}>
            {stats.moodEntries.slice(-7).map((entry, i) => {
              const score = MOOD_SCORES[entry.mood] || 3;
              const height = (score / 5) * 100;
              const colors = { anxious: '#FF6B6B', stressed: '#FFA07A', neutral: '#A8C3B0', good: '#7EC8E3', great: '#7E77DD' };
              return (
                <div
                  key={i}
                  title={`${entry.label} — ${entry.date}`}
                  style={{
                    flex: 1,
                    height: `${height}%`,
                    background: colors[entry.mood] || 'var(--sage-muted)',
                    borderRadius: '6px 6px 2px 2px',
                    minWidth: '20px',
                    transition: 'height 0.5s ease',
                  }}
                />
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.6rem', color: 'var(--text-muted)' }}>
            <span>7 days ago</span>
            <span>Today</span>
          </div>
        </div>
      )}

      {/* Insight */}
      {stats.insight && (
        <div style={{
          padding: '16px 20px',
          borderRadius: '12px',
          background: 'rgba(126, 119, 221, 0.08)',
          borderLeft: '3px solid var(--spectral-glow)',
        }}>
          <p style={{ fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--spectral-glow)', lineHeight: 1.6 }}>
            {stats.insight}
          </p>
        </div>
      )}
    </motion.div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div style={{
      background: 'var(--bg-element)',
      borderRadius: '16px',
      padding: '16px',
      textAlign: 'center',
    }}>
      <div style={{ color: 'var(--sage-green)', marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
        {icon}
      </div>
      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>
        {label}
      </div>
    </div>
  );
}

function computeWeeklyStats() {
  try {
    // Journal entries
    const journalEntries = JSON.parse(localStorage.getItem('lumina_journal_entries') || '[]');
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklyJournal = journalEntries.filter(e => new Date(e.timestamp) >= weekAgo);

    // Timer sessions (estimate from streak)
    const streak = parseInt(localStorage.getItem('lumina_affirmation_streak') || '0', 10);
    const totalSessions = Math.max(streak, Math.ceil(weeklyJournal.length * 0.8));

    // Frequency data
    const freqHistory = JSON.parse(localStorage.getItem('lumina_frequency_history') || '[]');
    const weeklyFreq = freqHistory.filter(f => new Date(f.date) >= weekAgo);
    const avgFrequency = weeklyFreq.length > 0
      ? Math.round(weeklyFreq.reduce((sum, f) => sum + f.score, 0) / weeklyFreq.length)
      : null;

    // Mood check-in history
    const moodHistory = JSON.parse(localStorage.getItem('lumina_mood_history') || '[]');
    const weeklyMoods = moodHistory.filter(e => new Date(e.timestamp) >= weekAgo);

    // Generate insight
    let insight = null;
    if (weeklyMoods.length >= 3) {
      const recent = weeklyMoods.slice(-3);
      const avgScore = recent.reduce((sum, m) => sum + (MOOD_SCORES[m.mood] || 3), 0) / recent.length;
      if (avgScore >= 4) {
        insight = "Your energy has been consistently high this week. You're in a strong alignment flow.";
      } else if (avgScore <= 2) {
        insight = "This week carried heavy energy. Be gentle with yourself — the Theta and Zen modes are here when you need them.";
      } else {
        insight = "A balanced week. You're grounding yourself steadily. The Alpha mode supports this rhythm well.";
      }
    } else if (weeklyJournal.length > 0) {
      insight = `${weeklyJournal.length} chronicle${weeklyJournal.length > 1 ? 's' : ''} sealed this week. Your inner world is being honored.`;
    }

    return {
      totalEntries: weeklyJournal.length,
      totalSessions,
      avgFrequency,
      moodEntries: weeklyMoods,
      insight,
    };
  } catch (e) {
    console.error('Failed to compute weekly stats:', e);
    return { totalEntries: 0, totalSessions: 0, avgFrequency: null, moodEntries: [], insight: null };
  }
}
