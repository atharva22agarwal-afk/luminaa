import { useState, useEffect, useRef, useCallback } from 'react';

const DEFAULT_FOCUS_MINUTES = 25;
const CHIME_FREQUENCY = 880;
const CHIME_DURATION_MS = 1500;

/**
 * Custom hook encapsulating all timer logic.
 * Eliminates stale closure risks by using refs for callbacks.
 */
export function useTimer() {
  const [focusTime, setFocusTime] = useState(DEFAULT_FOCUS_MINUTES * 60);
  const [timeRemaining, setTimeRemaining] = useState(DEFAULT_FOCUS_MINUTES * 60);
  const [timerActive, setTimerActive] = useState(false);

  const timerRef = useRef(null);
  // Store playChime in a ref to avoid stale closure issues in the interval
  const playChimeRef = useRef(null);

  // Shared AudioContext for timer chime (reused, never recreated)
  const chimeAudioCtxRef = useRef(null);

  const playChime = useCallback(() => {
    try {
      if (!chimeAudioCtxRef.current) {
        chimeAudioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const audioCtx = chimeAudioCtxRef.current;
      // Resume if suspended (browser policy)
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(CHIME_FREQUENCY, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + CHIME_DURATION_MS / 1000);
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + CHIME_DURATION_MS / 1000);
    } catch (e) {
      console.log('Audio chime error:', e);
    }
  }, []);

  // Store playChime in ref so the interval always has the latest reference
  useEffect(() => {
    playChimeRef.current = playChime;
  }, [playChime]);

  // Timer interval effect
  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 0) {
            setTimerActive(false);
            playChimeRef.current?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timerActive]);

  const changeTimer = useCallback((mins) => {
    setTimerActive(false);
    const secs = mins * 60;
    setFocusTime(secs);
    setTimeRemaining(secs);
  }, []);

  const resetTimer = useCallback(() => {
    setTimerActive(false);
    setTimeRemaining((prev) => {
      // Use focusTime from state — we need a ref for this to work in callbacks
      return focusTime;
    });
  }, [focusTime]);

  // We need focusTime accessible in resetTimer without stale closure
  // Override resetTimer to use functional update via a ref
  const focusTimeRef = useRef(focusTime);
  useEffect(() => {
    focusTimeRef.current = focusTime;
  }, [focusTime]);

  const resetTimerSafe = useCallback(() => {
    setTimerActive(false);
    setTimeRemaining(focusTimeRef.current);
  }, []);

  const formatTimer = useCallback((s) => {
    const m = Math.floor(s / 60);
    const sc = s % 60;
    return `${m}:${sc < 10 ? '0' : ''}${sc}`;
  }, []);

  return {
    focusTime,
    timeRemaining,
    timerActive,
    setTimerActive,
    changeTimer,
    resetTimer: resetTimerSafe,
    formatTimer,
  };
}
