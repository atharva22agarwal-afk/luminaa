import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Plus, X, Play, Pause, RotateCcw, ArrowUpRight, Sparkles, Activity } from 'lucide-react';
import { LuminaButton } from './LuminaButton';
import Tooltip from '../Tooltip';

export default function Sanctuary({ 
  currentTime, 
  currentAffirmation, 
  affirmationStreak, 
  anchoredIntention, 
  timerActive, 
  timeRemaining, 
  formatTimer, 
  toggleTimer, 
  resetTimer, 
  refreshAffirmation, 
  toggleAffirmationPanel, 
  isAffirmationPanelOpen, 
  AffirmationPanel,
  setActiveTab
}) {
  const [frequencyData, setFrequencyData] = useState([]);
  const [visionBoard, setVisionBoard] = useState([]);

  useEffect(() => {
    const loadFreq = () => setFrequencyData(JSON.parse(localStorage.getItem('lumina_frequency_history') || '[]'));
    loadFreq();
    window.addEventListener('lumina_frequency_updated', loadFreq);
    return () => window.removeEventListener('lumina_frequency_updated', loadFreq);
  }, []);

  useEffect(() => {
    const loadBoard = () => setVisionBoard(JSON.parse(localStorage.getItem('lumina_vision_board') || '[]'));
    loadBoard();
    window.addEventListener('storage', loadBoard);
    window.addEventListener('lumina_vision_board_updated', loadBoard);
    return () => {
      window.removeEventListener('storage', loadBoard);
      window.removeEventListener('lumina_vision_board_updated', loadBoard);
    };
  }, []);

  const generateChartPath = () => {
    if (frequencyData.length < 2) return "";
    const w = 200; 
    const h = 60;
    const maxData = 100;
    const points = frequencyData.map((d, i) => {
      const x = (i / (frequencyData.length - 1)) * w;
      const y = h - (d.score / maxData) * h;
      return `${x},${y}`;
    });
    return `M ${points.join(' L ')}`;
  };

  const latestVision = visionBoard[0];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -20 }} 
      className="main-stage sanctuary-stage"
    >
      {/* Immersive Background Glow */}
      <div className="sanctuary-aurora" />

      <header className="divine-header">
        <div className="header-ritual">
          <motion.div 
            initial={{ width: 0 }} 
            animate={{ width: '40px' }} 
            className="ritual-line" 
          />
          <span className="ritual-moment">
            {currentTime.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
          </span>
        </div>
        <h1 className="ritual-text-main">Divine State</h1>
      </header>

      <div className="sanctuary-layout">
        {/* Cinematic Hero: The Alignment */}
        <section className={`sanctuary-hero ${latestVision ? 'has-anchored-vision' : ''}`}>
          <div className="hero-status">
            <div className="streak-badge">
              <Sparkles size={14} className="sparkle-icon" />
              <span>{affirmationStreak} Day Resonance</span>
            </div>
            <span className="alignment-label">Current Alignment</span>
          </div>

          <div className="sanctuary-hero-body">
            <div className="affirmation-vessel">
              <AnimatePresence mode="wait">
                <motion.h2
                  key={currentAffirmation}
                  initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="hero-affirmation-text"
                >
                  "{currentAffirmation}"
                </motion.h2>
              </AnimatePresence>

              <div className="hero-controls">
                <Tooltip description="Get a new affirmation" position="top">
                  <LuminaButton onClick={refreshAffirmation} variant="circle" aria-label="Get a new affirmation">
                    <RefreshCw size={20} />
                  </LuminaButton>
                </Tooltip>
                <Tooltip description={isAffirmationPanelOpen ? 'Close affirmation editor' : 'Add your own affirmation'} position="top">
                  <LuminaButton
                    onClick={toggleAffirmationPanel}
                    variant="circle"
                    active={isAffirmationPanelOpen}
                    aria-label={isAffirmationPanelOpen ? 'Close affirmation editor' : 'Add your own affirmation'}
                  >
                    {isAffirmationPanelOpen ? <X size={20} /> : <Plus size={20} />}
                  </LuminaButton>
                </Tooltip>
              </div>
            </div>

            {latestVision && (
              <motion.button
                type="button"
                className="sanctuary-latest-vision"
                onClick={() => setActiveTab('Vision Portal')}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                aria-label="Open latest anchored vision"
              >
                <img src={latestVision.url} alt={latestVision.intention} />
                <span>{latestVision.intention}</span>
              </motion.button>
            )}
          </div>

          {isAffirmationPanelOpen && (
            <div className="floating-affirmation-anchor">
              <AffirmationPanel onSave={toggleAffirmationPanel} />
            </div>
          )}
        </section>

        {/* Organic Bento Grid */}
        <div className="organic-grid">
          {/* Intention Card */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            onClick={() => setActiveTab('Quantum Lab')}
            className="organic-card intention-portal"
          >
            <div className="card-ornament" />
            <div className="card-content">
              <span className="card-label">Primary Intention</span>
              <h3 className="intention-text">
                {anchoredIntention ? `"${anchoredIntention}"` : "Anchor your purpose..."}
              </h3>
            </div>
            <ArrowUpRight size={18} className="corner-icon" />
          </motion.div>

          {/* Flow Lab Sync (Timer) */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            onClick={() => setActiveTab('Flow Lab')}
            className={`organic-card timer-portal ${timerActive ? 'resonating' : ''}`}
            style={{ cursor: 'pointer' }}
          >
            <div className="timer-display">
              <div className="visual-timer-ring">
                <svg viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
                  <motion.circle 
                    cx="50" cy="50" r="45" 
                    fill="none" stroke="var(--spectral-glow)" strokeWidth="3" 
                    strokeLinecap="round"
                    strokeDasharray="283"
                    initial={{ strokeDashoffset: 283 }}
                    animate={{ strokeDashoffset: 283 - (283 * (timeRemaining / (25 * 60))) }}
                  />
                </svg>
                <span className="time-digits">{formatTimer(timeRemaining)}</span>
              </div>
            </div>
            
            <div className="timer-ritual-controls">
              <Tooltip description={timerActive ? 'Stop your session' : 'Start your session'} position="left">
                <LuminaButton onClick={(e) => { e.stopPropagation(); toggleTimer(); }} variant="icon" aria-label={timerActive ? 'Stop your session' : 'Start your session'}>
                  {timerActive ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                </LuminaButton>
              </Tooltip>
              <Tooltip description="Start timer over" position="left">
                <LuminaButton onClick={(e) => { e.stopPropagation(); resetTimer(); }} variant="icon" size="sm" aria-label="Start timer over">
                  <RotateCcw size={16} />
                </LuminaButton>
              </Tooltip>
            </div>
          </motion.div>

          {/* Frequency Chart Portal */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="organic-card oracle-shortcut"
            style={{ overflow: 'hidden', position: 'relative' }}
          >
            <div className="card-content" style={{ zIndex: 2, position: 'relative' }}>
              <span className="card-label">Emotional Frequency</span>
              <h3 className="ritual-text-small" style={{ fontSize: '1.2rem', marginTop: '5px' }}>
                {frequencyData.length > 0 ? `${frequencyData[frequencyData.length-1].score}Hz Alignment` : 'Syncing Baseline...'}
              </h3>
            </div>
            
            {frequencyData.length > 1 ? (
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '80px', opacity: 0.85 }}>
                <svg width="100%" height="100%" viewBox="0 0 200 80" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="freqGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--spectral-glow)" stopOpacity="0.8"/>
                      <stop offset="100%" stopColor="var(--spectral-glow)" stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                  <path 
                    d={`${generateChartPath()} L 200,60 L 0,60 Z`} 
                    fill="url(#freqGrad)" 
                    transform="translate(0, 20)"
                  />
                  <path 
                    d={generateChartPath()} 
                    fill="none" 
                    stroke="var(--spectral-glow)" 
                    strokeWidth="3" 
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    transform="translate(0, 20)"
                  />
                  {frequencyData.map((d, i) => (
                    <circle 
                      key={i}
                      cx={(i / (frequencyData.length - 1)) * 200} 
                      cy={60 - (d.score / 100) * 60 + 20} 
                      r="4" 
                      fill="var(--bg-card)"
                      stroke="var(--spectral-glow)"
                      strokeWidth="2"
                    />
                  ))}
                </svg>
              </div>
            ) : (
              <div className="oracle-icon-vessel"><Activity size={24} /></div>
            )}
          </motion.div>
        </div>

        {/* Cinematic Vision Board Gallery */}
        <section className="sanctuary-vision-board" style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Sparkles size={20} color="var(--spectral-glow)" />
              <h2 style={{ fontSize: '1.5rem', margin: 0, fontFamily: "'Playfair Display', serif", fontStyle: 'italic', color: 'var(--text-main)' }}>Anchored Visions</h2>
            </div>
            <LuminaButton 
              variant="text" 
              onClick={() => setActiveTab('Vision Portal')}
              style={{ fontSize: '0.85rem', opacity: 0.8 }}
            >
              Enter Vision Portal →
            </LuminaButton>
          </div>

          {visionBoard.length === 0 ? (
            <motion.div 
              whileHover={{ scale: 1.01 }}
              onClick={() => setActiveTab('Vision Portal')}
              style={{ 
                background: 'var(--glass-mystic)',
                border: '1px solid var(--glass-border-mystic)',
                padding: '40px',
                borderRadius: '32px',
                textAlign: 'center',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                backdropFilter: 'blur(20px)'
              }}
            >
              Your Vision Sanctuary is empty. Click here to anchor your first dream with pictures.
            </motion.div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '24px' }}>
              {visionBoard.slice(0, 4).map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.04, y: -4 }}
                  onClick={() => setActiveTab('Vision Portal')}
                  style={{ 
                    position: 'relative', 
                    borderRadius: '24px', 
                    overflow: 'hidden', 
                    aspectRatio: '1', 
                    cursor: 'pointer',
                    border: '1px solid var(--glass-border-mystic)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                  }}
                >
                  <img 
                    src={item.url} 
                    alt={item.intention}
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover' 
                    }}
                  />
                  <div style={{ 
                    position: 'absolute', 
                    bottom: 0, left: 0, right: 0, 
                    padding: '16px 20px',
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
                    color: 'white',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    fontFamily: "'Playfair Display', serif",
                    fontStyle: 'italic',
                    backdropFilter: 'blur(4px)'
                  }}>
                    {item.intention.length > 30 ? item.intention.substring(0, 30) + '...' : item.intention}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>
    </motion.div>
  );
}
