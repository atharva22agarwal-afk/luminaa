import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Award, Trophy, Flame, Star, Gem, BookOpen, Clock, Heart, CheckCircle2, Zap } from 'lucide-react';

const BADGES = [
  { id: 'first_journal', name: 'First Words', description: 'Wrote your first journal entry', icon: BookOpen, threshold: 1, metric: 'journal' },
  { id: 'five_journals', name: 'Chronicler', description: 'Wrote 5 journal entries', icon: BookOpen, threshold: 5, metric: 'journal' },
  { id: 'twenty_journals', name: 'Keeper of Truths', description: 'Wrote 20 journal entries', icon: BookOpen, threshold: 20, metric: 'journal' },

  { id: 'first_session', name: 'First Breath', description: 'Completed a focus session', icon: Clock, threshold: 1, metric: 'sessions' },
  { id: 'five_sessions', name: 'Deep Diver', description: 'Completed 5 focus sessions', icon: Clock, threshold: 5, metric: 'sessions' },
  { id: 'twenty_sessions', name: 'Flow State', description: 'Completed 20 focus sessions', icon: Clock, threshold: 20, metric: 'sessions' },

  { id: 'first_checkin', name: 'Self-Aware', description: 'Checked in for the first time', icon: Heart, threshold: 1, metric: 'checkins' },
  { id: 'seven_checkins', name: 'Rhythm Finder', description: 'Checked in 7 days in a row', icon: Heart, threshold: 7, metric: 'checkins' },

  { id: 'first_affirmation', name: 'Voice of Truth', description: 'Saved your first affirmation', icon: Zap, threshold: 1, metric: 'affirmations' },
  { id: 'ten_affirmations', name: 'Affirmation Architect', description: 'Saved 10 affirmations', icon: Zap, threshold: 10, metric: 'affirmations' },

  { id: 'streak_3', name: 'Three Flames', description: '3-day affirmation streak', icon: Flame, threshold: 3, metric: 'streak' },
  { id: 'streak_7', name: 'Week Warrior', description: '7-day affirmation streak', icon: Flame, threshold: 7, metric: 'streak' },
  { id: 'streak_30', name: 'Moon Cycle', description: '30-day affirmation streak', icon: Flame, threshold: 30, metric: 'streak' },
];

const LEVELS = [
  { level: 1, name: 'Seeker', xp: 0, color: '#9AA0A6' },
  { level: 2, name: 'Practitioner', xp: 50, color: '#A8C3B0' },
  { level: 3, name: 'Adept', xp: 150, color: '#7EC8E3' },
  { level: 4, name: 'Sage', xp: 300, color: '#7E77DD' },
  { level: 5, name: 'Luminary', xp: 500, color: '#FFD700' },
];

/**
 * Habit Progress Tree — visual gamification with badges, levels, and XP.
 */
export default function HabitProgress() {
  const [stats, setStats] = useState({
    journal: 0,
    sessions: 0,
    checkins: 0,
    affirmations: 0,
    streak: 0,
    xp: 0,
  });
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(LEVELS[0]);
  const [xpProgress, setXpProgress] = useState(0);

  useEffect(() => {
    const computedStats = computeStats();
    setStats(computedStats);

    // Determine earned badges
    const earned = BADGES.filter(badge => {
      const value = computedStats[badge.metric] || 0;
      return value >= badge.threshold;
    });
    setEarnedBadges(earned);

    // Determine level
    const level = [...LEVELS].reverse().find(l => computedStats.xp >= l.xp) || LEVELS[0];
    setCurrentLevel(level);

    // XP progress to next level
    const nextLevel = LEVELS[LEVELS.indexOf(level) + 1];
    if (nextLevel) {
      const progress = ((computedStats.xp - level.xp) / (nextLevel.xp - level.xp)) * 100;
      setXpProgress(Math.min(100, Math.max(0, progress)));
    } else {
      setXpProgress(100);
    }
  }, []);

  const xpForNext = LEVELS[LEVELS.indexOf(currentLevel) + 1]?.xp || 'MAX';

  return (
    <div style={{
      background: 'var(--bg-card)',
      borderRadius: '24px',
      padding: '32px',
      border: '1px solid var(--glass-border)',
      boxShadow: 'var(--card-shadow)',
    }}>
      {/* Header — Level Card */}
      <div style={{
        background: `linear-gradient(135deg, ${currentLevel.color}15, ${currentLevel.color}05)`,
        borderRadius: '20px',
        padding: '24px',
        marginBottom: '28px',
        border: `1px solid ${currentLevel.color}30`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: currentLevel.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 800,
            fontSize: '1.5rem',
          }}>
            {currentLevel.level}
          </div>
          <div>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '1.4rem',
              fontWeight: 400,
              fontStyle: 'italic',
              color: 'var(--text-main)',
            }}>
              {currentLevel.name}
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {stats.xp} XP total{typeof xpForNext === 'number' ? ` · ${xpForNext - stats.xp} to next level` : ' · Maximum level!'}
            </p>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div style={{
          height: '8px',
          borderRadius: '4px',
          background: 'var(--bg-element)',
          overflow: 'hidden',
        }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${xpProgress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{
              height: '100%',
              borderRadius: '4px',
              background: `linear-gradient(90deg, ${currentLevel.color}, ${currentLevel.color}CC)`,
            }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '12px',
        marginBottom: '28px',
      }}>
        <MiniStat icon={<BookOpen size={16} />} label="Entries" value={stats.journal} />
        <MiniStat icon={<Clock size={16} />} label="Sessions" value={stats.sessions} />
        <MiniStat icon={<Heart size={16} />} label="Check-ins" value={stats.checkins} />
        <MiniStat icon={<Flame size={16} />} label="Streak" value={stats.streak} />
      </div>

      {/* Badges */}
      <div>
        <h3 style={{
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          fontWeight: 700,
          color: 'var(--text-muted)',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <Trophy size={14} />
          Badges ({earnedBadges.length}/{BADGES.length})
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
          gap: '12px',
        }}>
          {BADGES.map((badge, i) => {
            const earned = earnedBadges.some(b => b.id === badge.id);
            const Icon = badge.icon;

            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                title={earned ? badge.description : `Locked: ${badge.description}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px 8px',
                  borderRadius: '16px',
                  background: earned ? 'var(--bg-element)' : 'transparent',
                  border: earned ? '1px solid var(--glass-border)' : '1px dashed rgba(255,255,255,0.05)',
                  opacity: earned ? 1 : 0.35,
                  transition: 'all 0.3s ease',
                }}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: earned ? 'var(--sage-muted)' : 'rgba(255,255,255,0.03)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: earned ? 'var(--sage-green)' : 'var(--text-muted)',
                }}>
                  <Icon size={16} />
                </div>
                <span style={{
                  fontSize: '0.6rem',
                  fontWeight: 600,
                  color: earned ? 'var(--text-main)' : 'var(--text-muted)',
                  textAlign: 'center',
                  lineHeight: 1.3,
                }}>
                  {badge.name}
                </span>
                {earned && (
                  <CheckCircle2 size={10} color="var(--sage-green)" />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MiniStat({ icon, label, value }) {
  return (
    <div style={{
      textAlign: 'center',
      padding: '12px 8px',
      borderRadius: '12px',
      background: 'var(--bg-element)',
    }}>
      <div style={{ color: 'var(--sage-green)', marginBottom: '6px', display: 'flex', justifyContent: 'center' }}>
        {icon}
      </div>
      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>
        {label}
      </div>
    </div>
  );
}

function computeStats() {
  try {
    const journal = JSON.parse(localStorage.getItem('lumina_journal_entries') || '[]').length;
    const affirmations = JSON.parse(localStorage.getItem('lumina_affirmations') || '[]').length;
    const streak = parseInt(localStorage.getItem('lumina_affirmation_streak') || '0', 10);
    const checkins = JSON.parse(localStorage.getItem('lumina_mood_history') || '[]').length;

    // Sessions: estimate from streak + timer usage
    const sessions = Math.max(streak, Math.ceil(journal * 0.6));

    // XP calculation
    let xp = 0;
    xp += journal * 5; // 5 XP per journal entry
    xp += sessions * 10; // 10 XP per session
    xp += checkins * 3; // 3 XP per check-in
    xp += affirmations * 2; // 2 XP per affirmation
    xp += streak * 5; // 5 XP per streak day

    return { journal, sessions, checkins, affirmations, streak, xp };
  } catch {
    return { journal: 0, sessions: 0, checkins: 0, affirmations: 0, streak: 0, xp: 0 };
  }
}
