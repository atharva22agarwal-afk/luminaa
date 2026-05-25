import { useState, useEffect, useCallback } from 'react';

const FALLBACK_AFFIRMATIONS = [
  "My mind is clear, focused, and aligned with my highest purpose.",
  "Friction dissolves in the presence of my focus.",
  "I trust the quantum flow of my reality.",
  "I execute my vision with calm precision.",
  "I attract world-class opportunities today.",
  "Every breath I take anchors me deeper into peace.",
  "I am becoming the version of myself that has already succeeded.",
  "My energy is magnetic, attracting everything I require."
];

/**
 * Custom hook for affirmation state, streak tracking, and daily rotation.
 */
export function useAffirmations() {
  const [currentAffirmation, setCurrentAffirmation] = useState(
    "I am focused, capable, and exactly where I need to be."
  );
  const [affirmationStreak, setAffirmationStreak] = useState(0);
  const [isAffirmationPanelOpen, setIsAffirmationPanelOpen] = useState(false);
  const [anchoredIntention, setAnchoredIntention] = useState('');

  useEffect(() => {
    try {
      // Load anchored intention
      const intention = localStorage.getItem('lumina_primary_intention');
      if (intention) setAnchoredIntention(intention);

      // Load daily affirmation
      const savedData = JSON.parse(localStorage.getItem('lumina_affirmations') || '[]');
      const index = parseInt(localStorage.getItem('lumina_daily_affirmation_index') || '0', 10);

      if (savedData.length > 0) {
        const favs = savedData.filter(a => a.isFavourite);
        const pool = favs.length > 0 ? favs : savedData;
        setCurrentAffirmation(pool[index % pool.length].text);
      } else {
        setCurrentAffirmation(FALLBACK_AFFIRMATIONS[index % FALLBACK_AFFIRMATIONS.length]);
      }

      // Calculate streak
      const lastVisit = localStorage.getItem('lumina_affirmation_last_visit');
      const today = new Date().toDateString();
      let currentStreak = parseInt(localStorage.getItem('lumina_affirmation_streak') || '0', 10);

      if (lastVisit !== today) {
        if (lastVisit) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          if (lastVisit === yesterday.toDateString()) {
            currentStreak += 1;
          } else {
            currentStreak = 1;
          }
        } else {
          currentStreak = 1;
        }
        localStorage.setItem('lumina_affirmation_last_visit', today);
        localStorage.setItem('lumina_affirmation_streak', currentStreak.toString());
      }
      setAffirmationStreak(currentStreak);
    } catch (e) {
      console.error('Failed to load affirmation data:', e);
    }
  }, []);

  const refreshAffirmation = useCallback(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('lumina_affirmations') || '[]');
      let idx = parseInt(localStorage.getItem('lumina_daily_affirmation_index') || '0', 10) + 1;
      localStorage.setItem('lumina_daily_affirmation_index', idx.toString());
      if (saved.length > 0) {
        setCurrentAffirmation(saved[idx % saved.length].text);
      } else {
        setCurrentAffirmation(FALLBACK_AFFIRMATIONS[idx % FALLBACK_AFFIRMATIONS.length]);
      }
    } catch (e) {
      console.error('Failed to refresh affirmation:', e);
    }
  }, []);

  const toggleAffirmationPanel = useCallback(() => {
    setIsAffirmationPanelOpen(prev => !prev);
  }, []);

  return {
    currentAffirmation,
    setCurrentAffirmation,
    affirmationStreak,
    isAffirmationPanelOpen,
    refreshAffirmation,
    toggleAffirmationPanel,
    anchoredIntention,
    setAnchoredIntention,
  };
}
