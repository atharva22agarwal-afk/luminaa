import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, Zap, Coffee, Book, Image as ImageIcon, History,
  Play, Pause, LayoutGrid, Sun, Moon,
  Volume2, Heart, BarChart3, Waves, Settings
} from 'lucide-react';
import './index.css';
import { audioEngine } from './audioEngine';

import LuminaLanding from './components/LuminaLanding';
import CelestialCanvas from './components/CelestialCanvas';
import DailyCheckIn, { recordMoodHistory } from './components/DailyCheckIn';
import { NavItem } from './components/NavItem';
import { AffirmationPanel } from './components/AffirmationPanel';
import { renderRoute } from './routeComponents.jsx';
import { useTimer } from './hooks/useTimer';
import { useAudio } from './hooks/useAudio';
import { useAffirmations } from './hooks/useAffirmations';
import Sanctuary from './components/Sanctuary';
import { LuminaButton } from './components/LuminaButton';

const SidebarItem = NavItem;

export default function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [theme, setTheme] = useState('light');
  const [activeTab, setActiveTab] = useState('Sanctuary');
  const [isCustom, setIsCustom] = useState(false);
  const [customMins, setCustomMins] = useState('25');


  const timer = useTimer();
  const audio = useAudio();
  const affirmations = useAffirmations();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleCustomSubmit = useCallback((e) => {
    if (e.key === 'Enter') {
      const mins = parseInt(customMins, 10);
      if (!isNaN(mins) && mins > 0 && mins <= 480) {
        timer.changeTimer(mins);
      }
    }
  }, [customMins, timer]);

  const handleCheckInComplete = useCallback(() => {}, []);

  const handleApplySuggestion = useCallback((suggestion) => {
    if (suggestion.audioMode && suggestion.audioMode !== audio.audioMode) {
      audio.changeAudioMode(suggestion.audioMode);
    }
    recordMoodHistory(suggestion.mood.id, suggestion.mood.label);
  }, [audio]);

  const sanctuaryProps = {
    currentTime: new Date(),
    currentAffirmation: affirmations.currentAffirmation,
    affirmationStreak: affirmations.affirmationStreak,
    anchoredIntention: affirmations.anchoredIntention,
    timerActive: timer.timerActive,
    timeRemaining: timer.timeRemaining,
    formatTimer: timer.formatTimer,
    toggleTimer: () => timer.setTimerActive(prev => !prev),
    resetTimer: timer.resetTimer,
    refreshAffirmation: affirmations.refreshAffirmation,
    toggleAffirmationPanel: affirmations.toggleAffirmationPanel,
    isAffirmationPanelOpen: affirmations.isAffirmationPanelOpen,
    AffirmationPanel,
    setActiveTab,
  };

  const deepStateProps = {
    timeRemaining: timer.timeRemaining,
    timerActive: timer.timerActive,
    setTimerActive: timer.setTimerActive,
    formatTimer: timer.formatTimer,
    audioMode: audio.audioMode,
    changeAudioMode: audio.changeAudioMode,
    isAudioPlaying: audio.isAudioPlaying,
    toggleAudio: audio.toggleAudio,
    resetTimer: timer.resetTimer,
    changeTimer: timer.changeTimer,
    isCustom,
    setIsCustom,
    customMins,
    setCustomMins,
    handleCustomSubmit,
  };


  return (
    <AnimatePresence mode="wait">
      {showLanding ? (
        <LuminaLanding key="landing" onEnter={() => setShowLanding(false)} />
      ) : (
    <motion.div
      key="app"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="resilient-layout"
    >
      {/* Daily Mood Check-in Overlay */}
      <DailyCheckIn
        onComplete={handleCheckInComplete}
        onApplySuggestion={handleApplySuggestion}
      />

      <CelestialCanvas theme={theme} />

      {/* Zen Lamp Theme Toggle */}
      <div
        className="zen-lamp-container"
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        role="button"
        tabIndex={0}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setTheme(theme === 'light' ? 'dark' : 'light');
          }
        }}
      >
        <div className="lamp-base">
          {theme === 'light' ? (
            <Sun size={18} aria-hidden="true" />
          ) : (
            <Moon size={18} fill="currentColor" className="moon-icon" aria-hidden="true" />
          )}
        </div>
        <div className="lamp-cord" aria-hidden="true" />
        <div className="lamp-pull" aria-hidden="true" />
      </div>

      {/* Sidebar Navigation */}
      <aside className="sidebar" aria-label="Main navigation">
        <div className="brand">
          <div className="logo-sq" aria-hidden="true">
            <Zap size={20} fill="currentColor" />
          </div>
          <div>
            <h2>Lumina</h2>
            <span>Resilient Hub</span>
          </div>
        </div>
        <nav className="nav-links" aria-label="App sections">
          <SidebarItem icon={LayoutGrid} label="Sanctuary"     active={activeTab === 'Sanctuary'}     onClick={() => setActiveTab('Sanctuary')} />
          <SidebarItem icon={Eye}        label="Oracle"         active={activeTab === 'Oracle'}         onClick={() => setActiveTab('Oracle')} />
          <SidebarItem icon={Zap}        label="Quantum Lab"    active={activeTab === 'Quantum Lab'}    onClick={() => setActiveTab('Quantum Lab')} />
          <SidebarItem icon={Coffee}     label="Deep State"     active={activeTab === 'Deep State'}     onClick={() => setActiveTab('Deep State')} />
          <SidebarItem icon={Book}       label="Sacred Records" active={activeTab === 'Sacred Records'} onClick={() => setActiveTab('Sacred Records')} />
          <SidebarItem icon={ImageIcon}  label="Vision Portal"  active={activeTab === 'Vision Portal'}  onClick={() => setActiveTab('Vision Portal')} />
          <SidebarItem icon={History}    label="Timeline"       active={activeTab === 'Timeline'}       onClick={() => setActiveTab('Timeline')} />
          <SidebarItem icon={Heart}      label="Affirmations"   active={activeTab === 'Affirmations'}   onClick={() => setActiveTab('Affirmations')} />
          <SidebarItem icon={BarChart3}  label="Insights"       active={activeTab === 'Insights'}       onClick={() => setActiveTab('Insights')} />
          <SidebarItem icon={Waves}      label="Focus Lab"      active={activeTab === 'Focus Lab'}      onClick={() => setActiveTab('Focus Lab')} />
          <SidebarItem icon={Settings}   label="Settings"       active={activeTab === 'Settings'}       onClick={() => setActiveTab('Settings')} />
        </nav>
      </aside>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'Sanctuary' ? (
          <SanctuaryWrapper key="Sanctuary" {...sanctuaryProps} />
        ) : (
          <motion.main
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="main-stage"
          >
            {renderRoute(activeTab, deepStateProps)}
          </motion.main>
        )}
      </AnimatePresence>

      {/* Resonance Bar – Footer Audio Controls */}
      <footer className="resonance-bar" aria-label="Audio controls">
        <div className="resonance-info">
          <LuminaButton
            variant="icon"
            onClick={audio.toggleAudio}
            aria-label={audio.isAudioPlaying ? 'Pause audio' : 'Play audio'}
            aria-pressed={audio.isAudioPlaying}
          >
            {audio.isAudioPlaying ? (
              <Pause size={20} fill="currentColor" aria-hidden="true" />
            ) : (
              <Play size={20} fill="currentColor" aria-hidden="true" />
            )}
          </LuminaButton>
          <div className="current-state">
            <span className="state-label">{audio.isAudioPlaying ? audio.audioMode : 'Silent'}</span>
            <span className="state-meta">
              {audio.audioMode === 'Alpha' ? '10Hz'
                : audio.audioMode === 'Theta' ? '6Hz'
                : audio.audioMode === 'Gamma' ? '40Hz'
                : '1.5Hz'}
            </span>
          </div>
        </div>
        <div className="freq-controls">
          {['Zen', 'Theta', 'Alpha', 'Gamma'].map((m) => (
            <LuminaButton
              key={m}
              variant={audio.audioMode === m ? 'primary' : 'secondary'}
              onClick={() => audio.changeAudioMode(m)}
              className="freq-btn"
              aria-pressed={audio.audioMode === m}
              aria-label={`Switch to ${m} frequency`}
            >
              {m}
            </LuminaButton>
          ))}
          <div className="volume-slider-container">
            <Volume2 size={16} className="volume-icon" aria-hidden="true" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              defaultValue="0.5"
              onChange={(e) => audioEngine.setVolume(e.target.value)}
              className="premium-slider"
              aria-label="Volume"
            />
          </div>
        </div>
      </footer>
    </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Sanctuary wrapper — isolated to avoid re-rendering from a live clock.
 * Sanctuary only needs the date (not the time), so we freeze it at mount.
 */
const SanctuaryWrapper = React.forwardRef((props, ref) => {
  const [currentDate] = useState(() => new Date());
  return (
    <motion.main
      ref={ref}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="main-stage sanctuary-stage"
    >
      <Sanctuary {...props} currentTime={currentDate} />
    </motion.main>
  );
});
