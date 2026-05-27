import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Music, Square } from 'lucide-react';
import LuminaButton from './LuminaButton';
import Tooltip from '../Tooltip';
import AudioLayerMixer from './AudioLayerMixer';
import MeditationScripts from './MeditationScripts';

const MODE_QUOTES = {
  Zen:   ["\"Stillness is where creation and solutions are found.\"", "\"In the depth of winter, I finally learned there was in me an invincible summer.\"", "\"The quieter you become, the more you are able to hear.\""],
  Theta: ["\"Between sleeping and waking, dreams become blueprints.\"", "\"Your brain at 6Hz is a portal to your deepest creativity.\"", "\"Great art is born in the twilight between thought and dream.\""],
  Alpha: ["\"The quality of your focus determines the quality of your life.\"", "\"Flow state is not a destination. It is the journey itself.\"", "\"In the zone, time dissolves and only the work remains.\""],
  Gamma: ["\"Peak performance begins in the mind.\"", "\"At 40Hz, your neurons fire in perfect symphony.\"", "\"Clarity is the superpower of those who master their attention.\""],
};

export default function DeepState({ 
  timeRemaining, 
  timerActive, 
  setTimerActive, 
  formatTimer, 
  audioMode, 
  changeAudioMode, 
  isAudioPlaying, 
  toggleAudio,
  resetTimer,
  changeTimer,
  isCustom,
  setIsCustom,
  customMins,
  setCustomMins,
  handleCustomSubmit
}) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="deep-state-page"
      style={{ 
        minHeight: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'flex-start',
        paddingTop: '60px',
        gap: '40px',
        position: 'relative',
        paddingBottom: '80px'
      }}
    >
      {/* IMMERSIVE HEADER */}
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', fontWeight: 700, letterSpacing: '4px', marginBottom: '8px' }}>
          Flow Lab
        </h1>
        <p style={{ textTransform: 'uppercase', letterSpacing: '4px', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          {timerActive ? 'Focused session active' : 'Build your focus session'}
        </p>
      </div>

      <div className="flow-lab-primary">
        <section className="flow-lab-session">
      {/* GIANT TICKING CLOCK */}
      <div className="deep-state-clock-wrap" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
         <motion.div 
           className="deep-state-clock"
           animate={{ scale: timerActive ? [1, 1.02, 1] : 1 }}
           transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
           style={{ 
             fontSize: '7rem', 
             fontWeight: 200, 
             fontFamily: "'Geist', sans-serif", 
             color: 'var(--text-main)',
             letterSpacing: '-2px',
             position: 'relative',
             zIndex: 2
           }}
         >
           {formatTimer(timeRemaining)}
         </motion.div>
         
         <motion.div 
           className="deep-state-glow"
           animate={{ opacity: timerActive ? [0.1, 0.3, 0.1] : 0.05 }}
           transition={{ duration: 4, repeat: Infinity }}
           style={{ 
             position: 'absolute',
             width: '400px',
             height: '400px',
             background: 'radial-gradient(circle, var(--sage-green) 0%, transparent 70%)',
             borderRadius: '50%',
             filter: 'blur(60px)',
             zIndex: 1
           }}
         />
      </div>

      {/* TIMER PRESETS & CUSTOM */}
      <div className="deep-state-presets" style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center', zIndex: 10 }}>
        {[15, 25, 45, 60].map(p => (
          <Tooltip key={p} description={`${p} minutes`} position="top">
            <LuminaButton 
              onClick={() => { setIsCustom(false); changeTimer(p); }} 
              variant={timeRemaining / 60 === p ? 'primary' : 'secondary'}
              style={{ minWidth: '80px' }}
            >
              {p}m
            </LuminaButton>
          </Tooltip>
        ))}
        <Tooltip description="Enter your own time" position="top">
          <LuminaButton 
            onClick={() => setIsCustom(!isCustom)}
            variant={isCustom ? 'primary' : 'secondary'}
          >
            Custom Vessel
          </LuminaButton>
        </Tooltip>
      </div>

      {isCustom && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          style={{ zIndex: 10, display: 'flex', gap: '12px', alignItems: 'center' }}
        >
          <div style={{ padding: '20px', background: 'var(--bg-sidebar)', borderRadius: '24px', border: '1px solid var(--sage-green)', boxShadow: '0 20px 40px rgba(168, 195, 176, 0.2)' }}>
            <input
              type="number"
              value={customMins}
              onChange={(e) => setCustomMins(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const mins = parseInt(customMins);
                  if (!isNaN(mins) && mins > 0 && mins <= 480) {
                    changeTimer(mins);
                  }
                }
              }}
              placeholder="Minutes..."
              autoFocus
              min="1"
              max="480"
              style={{ width: '160px', padding: '15px', borderRadius: '15px', border: 'none', background: 'var(--bg-card)', color: 'var(--text-main)', textAlign: 'center', fontSize: '1.2rem', fontWeight: 700, outline: 'none' }}
            />
          </div>
          <LuminaButton
            onClick={() => {
              const mins = parseInt(customMins);
              if (!isNaN(mins) && mins > 0 && mins <= 480) {
                changeTimer(mins);
              }
            }}
            variant="primary"
          >
            Set
          </LuminaButton>
        </motion.div>
      )}

      {/* INTEGRATED CONTROLS */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '40px', zIndex: 10 }}>
        
        {/* BUTTON PORTAL */}
        <div className="deep-state-main-controls" style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          <Tooltip description={timerActive ? 'Stop your session' : 'Start your session'} position="top">
            <LuminaButton 
              onClick={() => setTimerActive(!timerActive)}
              variant="circle"
              style={{ width: '80px', height: '80px' }}
              aria-label={timerActive ? 'Stop your session' : 'Start your session'}
            >
              {timerActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" style={{ marginLeft: '6px' }} />}
            </LuminaButton>
          </Tooltip>

          <Tooltip description="Start timer over" position="top">
            <LuminaButton 
              onClick={resetTimer}
              variant="icon"
              style={{ width: '60px', height: '60px' }}
              aria-label="Start timer over"
            >
              <RotateCcw size={28} />
            </LuminaButton>
          </Tooltip>
        </div>

        {/* FREQUENCY SHIFTER */}
        <div className="deep-state-frequency" style={{ background: 'var(--bg-card)', padding: '10px 20px', borderRadius: '40px', border: '1px solid var(--glass-border)', boxShadow: 'var(--card-shadow)', display: 'flex', gap: '15px', alignItems: 'center' }}>
          <Tooltip description={isAudioPlaying ? 'Stop audio' : 'Start audio'} position="top">
            <LuminaButton 
              onClick={toggleAudio}
              variant={isAudioPlaying ? 'primary' : 'icon'}
              style={{ width: '40px', height: '40px' }}
              aria-label={isAudioPlaying ? 'Stop audio' : 'Start audio'}
            >
               {isAudioPlaying ? <Square size={16} fill="currentColor" /> : <Music size={18} />}
            </LuminaButton>
          </Tooltip>

          <div style={{ height: '24px', width: '1px', background: 'var(--glass-border)' }}></div>

          {['Zen', 'Theta', 'Alpha', 'Gamma'].map(mode => (
            <Tooltip
              key={mode}
              description={`${mode} - ${mode === 'Alpha' ? '10Hz' : mode === 'Theta' ? '6Hz' : mode === 'Gamma' ? '40Hz' : '1.5Hz'}`}
              position="top"
            >
              <LuminaButton 
                onClick={() => changeAudioMode(mode)}
                variant={audioMode === mode ? 'secondary' : 'ghost'}
                style={{ padding: '8px 16px', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px' }}
              >
                {mode}
              </LuminaButton>
            </Tooltip>
          ))}
        </div>
      </div>

      {/* QUOTE DECK - shifts with audio mode */}
      <div style={{ textAlign: 'center', width: '100%', maxWidth: '600px' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={audioMode}
            initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
            animate={{ opacity: 0.5, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          >
            <p style={{ fontSize: '0.95rem', fontStyle: 'italic', fontFamily: "'Playfair Display', serif", lineHeight: 1.6 }}>
              {MODE_QUOTES[audioMode]?.[
                Math.floor((Date.now() / 1000 / 60) % (MODE_QUOTES[audioMode]?.length || 1))
              ] || MODE_QUOTES[audioMode]?.[0]}
            </p>
            <p style={{ marginTop: '8px', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '3px', fontWeight: 700, opacity: 0.5 }}>
              {audioMode} Wave · {audioMode === 'Alpha' ? '10Hz' : audioMode === 'Theta' ? '6Hz' : audioMode === 'Gamma' ? '40Hz' : '1.5Hz'}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
        </section>

        <section className="flow-lab-soundscape" aria-label="Soundscape mixer">
          <AudioLayerMixer />
        </section>
      </div>

      <div className="flow-lab-tools">
        <MeditationScripts />
      </div>

    </motion.div>
  );
}
