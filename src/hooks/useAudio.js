import { useState, useRef, useCallback, useEffect } from 'react';
import { audioEngine } from '../audioEngine';

const AUDIO_TRANSITION_DELAY_MS = 1100;

/**
 * Custom hook for managing binaural beat audio playback.
 * Handles race conditions in mode switching via timeout cleanup.
 */
export function useAudio() {
  const [audioMode, setAudioMode] = useState('Alpha');
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const transitionTimeoutRef = useRef(null);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  const toggleAudio = useCallback(() => {
    if (isAudioPlaying) {
      audioEngine.stop();
      // Delay state update to match audio engine fade-out
      const timeout = setTimeout(() => setIsAudioPlaying(false), AUDIO_TRANSITION_DELAY_MS);
      transitionTimeoutRef.current = timeout;
    } else {
      // Clear any pending stop timeout
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
        transitionTimeoutRef.current = null;
      }
      audioEngine.play(audioMode);
      setIsAudioPlaying(true);
    }
  }, [isAudioPlaying, audioMode]);

  const changeAudioMode = useCallback((mode) => {
    setAudioMode(mode);
    if (isAudioPlaying) {
      audioEngine.stop();
      setIsAudioPlaying(false);
      // Clear any previous transition timeout to prevent race conditions
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
      const timeout = setTimeout(() => {
        audioEngine.play(mode);
        setIsAudioPlaying(true);
      }, AUDIO_TRANSITION_DELAY_MS);
      transitionTimeoutRef.current = timeout;
    }
  }, [isAudioPlaying]);

  return {
    audioMode,
    setAudioMode,
    isAudioPlaying,
    toggleAudio,
    changeAudioMode,
  };
}
