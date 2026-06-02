import React, { useState, useEffect } from "react";
import "./LuminaLanding.css";

export default function LuminaLanding({ onEnter }) {
  
  // States to make the panels interactive
  const [activeAnimations, setActiveAnimations] = useState({
    particles: true,
    floatingRocks: true,
    energyRings: true,
    glowPulses: true,
    smoothScroll: true,
  });

  const [isEntering, setIsEntering] = useState(false);
  const [voices, setVoices] = useState([]);

  useEffect(() => {
    if (!('speechSynthesis' in window)) return undefined;

    const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);

    return () => window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
  }, []);

  const toggleAnimation = (key) => {
    setActiveAnimations(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const playWelcomeIntro = () => {
    if (!('speechSynthesis' in window)) return;

    const intro = new SpeechSynthesisUtterance('Welcome... to Lumina.');
    const availableVoices = voices.length ? voices : window.speechSynthesis.getVoices();
    const femaleVoice = availableVoices.find((voice) =>
      /female|zira|samantha|aria|jenny|natural/i.test(`${voice.name} ${voice.voiceURI}`)
    );
    if (femaleVoice) intro.voice = femaleVoice;

    intro.rate = 0.72;
    intro.pitch = 1.06;
    intro.volume = 1;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(intro);
  };

  const handleEnter = () => {
    if (isEntering) return;
    setIsEntering(true);
    window.setTimeout(playWelcomeIntro, 220);
    window.setTimeout(onEnter, 1700);
  };

  return (
    <div className={`relative min-h-screen w-full bg-space-dark text-white overflow-hidden selection:bg-gold/30 selection:text-gold-light ${isEntering ? 'entering' : ''}`}>
      
      {/* Heaven Flash Effect */}
      <div className="heaven-flash" aria-hidden="true" />
      <div 
        className="absolute inset-0 bg-cover bg-center mix-blend-screen opacity-65"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?q=80&w=2000')` }}
      />
      
      {/* Radial Gradient Backlights */}
      <div className="absolute top-[20%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] ambient-glow-gold pointer-events-none z-0" />
      <div className="absolute top-[40%] left-[20%] w-[60vw] h-[60vw] ambient-glow-purple pointer-events-none z-0" />
      <div className="absolute inset-0 vignette-overlay pointer-events-none z-10" />

      {/* Floating Space Rocks/Islands Vectors */}
      {activeAnimations.floatingRocks && (
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
          {/* Rock 1 - Top Left */}
          <div className="absolute top-[18%] left-[12%] animate-float-slow opacity-60 hidden md:block">
            <svg width="120" height="100" viewBox="0 0 120 100" fill="none" className="text-gray-900 drop-shadow-[0_10px_15px_rgba(0,0,0,0.8)]">
              <path d="M60 10 L100 40 L90 75 L50 90 L15 65 L25 35 Z" fill="currentColor" opacity="0.95" />
              <path d="M60 10 L50 90 M100 40 L50 90 M25 35 L50 90" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            </svg>
          </div>

          {/* Rock 2 - Mid Left (Lower) */}
          <div className="absolute bottom-[25%] left-[6%] animate-float-medium opacity-50 hidden lg:block">
            <svg width="150" height="130" viewBox="0 0 150 130" fill="none" className="text-gray-950 drop-shadow-[0_15px_25px_rgba(0,0,0,0.9)]">
              <path d="M75 15 L130 45 L115 95 L65 115 L20 85 L35 45 Z" fill="currentColor" />
              <path d="M75 15 L65 115 M130 45 L65 115 M20 85 L65 115" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            </svg>
          </div>

          {/* Rock 3 - Mid Right (High) */}
          <div className="absolute top-[28%] right-[8%] animate-float-slow opacity-50 hidden md:block">
            <svg width="100" height="90" viewBox="0 0 100 90" fill="none" className="text-gray-900 drop-shadow-[0_8px_15px_rgba(0,0,0,0.8)]">
              <path d="M50 8 L85 30 L75 65 L45 80 L15 55 L20 30 Z" fill="currentColor" opacity="0.9" />
            </svg>
          </div>
        </div>
      )}

      {/* 2. Top Navigation Bar */}
      <nav className="relative flex items-center justify-between px-4 py-4 md:px-12 z-50">
        {/* Logo */}
        <div className="flex items-center space-x-2.5 cursor-pointer group">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-full border border-gold/40 group-hover:border-gold transition-colors duration-500">
            <svg className="w-5 h-5 text-gold animate-[spin_40s_linear_infinite]" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="12 6" />
              <circle cx="50" cy="50" r="20" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
          </div>
          <span className="font-serif text-xl tracking-[0.25em] text-white group-hover:text-gold-light transition-colors duration-300">LUMINA</span>
        </div>

        {/* Center Links */}
        <div className="hidden md:flex items-center space-x-10 text-xs tracking-[0.2em] uppercase font-sans text-gray-300">
          <a href="#sanctuary" className="hover:text-gold transition-colors duration-300 relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-gold hover:after:w-full after:transition-all after:duration-300">Sanctuary</a>
          <a href="#oracle" className="hover:text-gold transition-colors duration-300 relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-gold hover:after:w-full after:transition-all after:duration-300">Oracle</a>
          <a href="#quantum" className="hover:text-gold transition-colors duration-300 relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-gold hover:after:w-full after:transition-all after:duration-300">Quantum Lab</a>
          <a href="#affirmations" className="hover:text-gold transition-colors duration-300 relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-gold hover:after:w-full after:transition-all after:duration-300">Affirmations</a>
        </div>

        {/* Action Button */}
        <div>
          <button onClick={handleEnter} className="lumina-glass hover:bg-gold/10 text-white hover:text-gold-light border border-white/10 hover:border-gold/40 px-5 py-2 rounded-full text-xs tracking-[0.15em] uppercase transition-all duration-300 flex items-center space-x-2 group">
            <span>Enter Sanctuary</span>
            <svg className="w-3.5 h-3.5 transform group-hover:translate-x-1.5 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </nav>

      {/* 3. Hero Section Wrapper */}
      <div className="relative max-w-7xl mx-auto px-4 md:px-12 pt-[6vh] pb-[3vh] grid grid-cols-1 lg:grid-cols-12 gap-6 z-30 min-h-[65vh]">
        
        {/* Left Side Content */}
        <div className="lg:col-span-5 flex flex-col justify-center space-y-8 text-left">
          <div className="space-y-4">
            <h1 className="font-serif text-6xl md:text-7xl lg:text-8xl leading-[1.05] tracking-wide text-white text-glow-gold font-normal">
              Awaken the <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-light via-gold to-gold-dark font-medium">Divine Within</span>
            </h1>
            <p className="font-sans text-base md:text-lg text-gray-400 font-light max-w-md leading-relaxed tracking-wide">
              A sacred space for your mind, your energy, and your highest transformation. Connect with cosmic frequencies today.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-1">
            <button onClick={handleEnter} className="relative group overflow-hidden rounded-full py-3 px-6 bg-gradient-to-r from-gold-dark via-gold to-gold-light text-space-dark font-semibold text-sm tracking-[0.18em] uppercase shadow-[0_0_30px_rgba(223,183,108,0.35)] hover:shadow-[0_0_40px_rgba(223,183,108,0.5)] transition-all duration-500">
              <span className="relative z-10 flex items-center space-x-2">
                <span>Enter Lumina</span>
                <svg className="w-3.5 h-3.5 transform group-hover:translate-x-1.5 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
            </button>

            <button className="flex items-center space-x-3 group py-2">
              <span className="w-10 h-10 rounded-full border border-white/20 group-hover:border-gold/60 flex items-center justify-center transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.02)] group-hover:shadow-[0_0_20px_rgba(223,183,108,0.15)] bg-white/5">
                <svg className="w-3.5 h-3.5 text-white group-hover:text-gold fill-current ml-0.5 transition-colors duration-300" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
              <div className="flex flex-col text-left">
                <span className="text-xs tracking-[0.15em] uppercase text-gray-300 group-hover:text-gold transition-colors duration-300">Explore the Experience</span>
                <div className="w-20 h-[1px] bg-gray-500 border-dotted border-b group-hover:border-gold/60 mt-1 transition-colors duration-300" />
              </div>
            </button>
          </div>
        </div>

        {/* Center / Meditator and Ring Elements (Occupies columns 6 to 9 on desktop) */}
        <div className="relative lg:col-span-4 flex items-center justify-center min-h-[40vh] lg:min-h-0">
          
          {/* Cosmic Rings Group */}
          <div className="absolute w-[260px] h-[260px] md:w-[380px] md:h-[380px] flex items-center justify-center">
            
            {/* outer astro ring */}
            <div className={`absolute inset-0 rounded-full border border-gold/15 glow-ring ${activeAnimations.energyRings ? 'animate-spin-slow' : ''}`}>
              <div className="absolute top-4 left-1/2 w-2 h-2 rounded-full bg-gold shadow-[0_0_10px_#dfb76c] -translate-x-1/2" />
            </div>

            {/* middle detailed math geometry ring */}
            <div className="absolute w-[86%] h-[86%] opacity-65 pointer-events-none">
              <svg className={`w-full h-full text-gold/30 ${activeAnimations.energyRings ? 'animate-[spin_90s_linear_infinite]' : ''}`} viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="95" stroke="currentColor" strokeWidth="0.5" fill="none" strokeDasharray="3 3" />
                <circle cx="100" cy="100" r="85" stroke="currentColor" strokeWidth="0.25" fill="none" />
                <circle cx="100" cy="100" r="72" stroke="currentColor" strokeWidth="0.75" fill="none" strokeDasharray="8 4" />
                <circle cx="100" cy="100" r="45" stroke="currentColor" strokeWidth="0.5" fill="none" />
                <line x1="100" y1="5" x2="100" y2="195" stroke="currentColor" strokeWidth="0.25" opacity="0.6" />
                <line x1="5" y1="100" x2="195" y2="100" stroke="currentColor" strokeWidth="0.25" opacity="0.6" />
                <line x1="33" y1="33" x2="167" y2="167" stroke="currentColor" strokeWidth="0.2" opacity="0.4" />
                <line x1="33" y1="167" x2="167" y2="33" stroke="currentColor" strokeWidth="0.2" opacity="0.4" />
              </svg>
            </div>

            {/* inner flower patterns */}
            <div className="absolute w-[68%] h-[68%] opacity-50">
              <svg className={`w-full h-full text-gold-light/40 ${activeAnimations.energyRings ? 'animate-[spin_40s_linear_infinite_reverse]' : ''}`} viewBox="0 0 100 100">
                <circle cx="50" cy="35" r="15" stroke="currentColor" strokeWidth="0.2" fill="none" />
                <circle cx="50" cy="65" r="15" stroke="currentColor" strokeWidth="0.2" fill="none" />
                <circle cx="35" cy="50" r="15" stroke="currentColor" strokeWidth="0.2" fill="none" />
                <circle cx="65" cy="50" r="15" stroke="currentColor" strokeWidth="0.2" fill="none" />
                <circle cx="39.4" cy="39.4" r="15" stroke="currentColor" strokeWidth="0.2" fill="none" />
                <circle cx="60.6" cy="60.6" r="15" stroke="currentColor" strokeWidth="0.2" fill="none" />
                <circle cx="39.4" cy="60.6" r="15" stroke="currentColor" strokeWidth="0.2" fill="none" />
                <circle cx="60.6" cy="39.4" r="15" stroke="currentColor" strokeWidth="0.2" fill="none" />
              </svg>
            </div>

            {/* Ambient Back Glow pulse */}
            <div className={`absolute w-[45%] h-[45%] rounded-full bg-gold/5 filter blur-2xl ${activeAnimations.glowPulses ? 'animate-pulse' : ''}`} />
          </div>

          {/* Central Meditating Figure Glowing Vector Silhouette */}
          <div className="relative z-20 flex items-center justify-center select-none animate-float-medium">
            <svg 
              className="w-44 h-44 md:w-60 md:h-60 lg:w-72 lg:h-72 filter drop-shadow-[0_0_35px_rgba(223,183,108,0.4)]" 
              viewBox="0 0 100 100"
            >
              <defs>
                <linearGradient id="goldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffe8a1" />
                  <stop offset="100%" stopColor="#b38d43" />
                </linearGradient>
                <filter id="glow-crown"><feGaussianBlur stdDeviation="1.5" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                <filter id="glow-thirdeye"><feGaussianBlur stdDeviation="1.2" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                <filter id="glow-throat"><feGaussianBlur stdDeviation="1.2" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                <filter id="glow-heart"><feGaussianBlur stdDeviation="1.2" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                <filter id="glow-solar"><feGaussianBlur stdDeviation="1.2" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                <filter id="glow-sacral"><feGaussianBlur stdDeviation="1.2" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                <filter id="glow-root"><feGaussianBlur stdDeviation="1.5" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                <filter id="glow-nadi-ida"><feGaussianBlur stdDeviation="0.6" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                <filter id="glow-nadi-pingala"><feGaussianBlur stdDeviation="0.6" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                
                <style>{`
                  @keyframes energy-ripple {
                    0% { r: 1.5px; opacity: 0.8; }
                    50% { opacity: 0.45; }
                    100% { r: 15px; opacity: 0; }
                  }
                  .ripple-crown {
                    animation: energy-ripple 5.0s infinite linear;
                    transform-origin: 50px 18px;
                  }
                  .ripple-thirdeye {
                    animation: energy-ripple 4.5s infinite linear;
                    transform-origin: 50px 22.5px;
                  }
                  .ripple-heart {
                    animation: energy-ripple 4.0s infinite linear;
                    transform-origin: 50px 40px;
                  }
                `}</style>
              </defs>
              
              {/* Detailed Path mapping for glassmorphic meditation silhouette */}
              <path 
                d="M50,14 C53,14 55.5,16.5 55.5,19.5 C55.5,22.5 53,25 50,25 C47,25 44.5,22.5 44.5,19.5 C44.5,16.5 47,14 50,14 Z M50,28 C55.5,28 61,32 61,39 C61,47 58,54 58,64 C63.5,66 69,65 74.5,68.5 C79.5,71.5 81,75.5 76,78 C71,80.5 58,80 50,80 C42,80 29,80.5 24,78 C19,75.5 20.5,71.5 25.5,68.5 C31,65 36.5,66 42,64 C42,54 39,47 39,39 C39,32 44.5,28 50,28 Z" 
                fill="#05030d" 
                fillOpacity="0.78"
                stroke="url(#goldGradient)"
                strokeWidth="0.8"
              />
              
              {/* Spiraling Nadi Energy Channels (Left & Right Spirals crossing at each Chakra node along x=50) */}
              {/* Ida Nadi (Indigo/Lunar Energy - Left side origin) */}
              <path 
                d="M50,18 Q42,20.25 50,22.5 T50,31 T50,40 T50,49 T50,58.5 T50,71" 
                fill="none" 
                stroke="#818cf8" 
                strokeWidth="0.45" 
                opacity="0.65" 
                filter="url(#glow-nadi-ida)"
              />
              
              {/* Pingala Nadi (Orange/Solar Energy - Right side origin) */}
              <path 
                d="M50,18 Q58,20.25 50,22.5 T50,31 T50,40 T50,49 T50,58.5 T50,71" 
                fill="none" 
                stroke="#fb923c" 
                strokeWidth="0.45" 
                opacity="0.65" 
                filter="url(#glow-nadi-pingala)"
              />
              
              {/* Glowing Lotus Throne Platform beneath Crossed Legs */}
              <g opacity="0.8" filter="url(#glow-solar)">
                <path d="M50,79 C32,79 24,81 18,84 C28,85 41,82 50,80 C59,82 72,85 82,84 C76,81 68,79 50,79 Z" fill="none" stroke="url(#goldGradient)" strokeWidth="0.5" />
                <path d="M50,77 C40,77 34,79 28,81 C37,82 44,80 50,79 C56,80 63,82 72,81 C66,79 60,77 50,77 Z" fill="none" stroke="url(#goldGradient)" strokeWidth="0.4" />
                <path d="M50,75 C45,73 40,76 36,78 C42,79 47,77 50,76 C53,77 58,79 64,78 C60,76 55,73 50,75 Z" fill="none" stroke="url(#goldGradient)" strokeWidth="0.4" />
              </g>

              {/* Concentric Energy Radiating Ripples */}
              <circle cx="50" cy="18" r="1.5" fill="none" stroke="#c084fc" strokeWidth="0.25" className="ripple-crown" />
              <circle cx="50" cy="22.5" r="1.3" fill="none" stroke="#818cf8" strokeWidth="0.25" className="ripple-thirdeye" />
              <circle cx="50" cy="40" r="1.3" fill="none" stroke="#34d399" strokeWidth="0.25" className="ripple-heart" />

              {/* Pulsing Chakra Nodes (Colors matching spiritual tradition) */}
              {/* 1. Crown - Violet/White */}
              <circle cx="50" cy="18" r="1.5" fill="#f5f3ff" filter="url(#glow-crown)" className="animate-pulse" style={{ animationDuration: '2.0s' }} />
              
              {/* 2. Third Eye - Indigo */}
              <circle cx="50" cy="22.5" r="1.3" fill="#818cf8" filter="url(#glow-thirdeye)" className="animate-pulse" style={{ animationDuration: '2.5s' }} />
              
              {/* 3. Throat - Cyan */}
              <circle cx="50" cy="31" r="1.3" fill="#22d3ee" filter="url(#glow-throat)" className="animate-pulse" style={{ animationDuration: '2.2s' }} />
              
              {/* 4. Heart - Green */}
              <circle cx="50" cy="40" r="1.3" fill="#34d399" filter="url(#glow-heart)" className="animate-pulse" style={{ animationDuration: '2.8s' }} />
              
              {/* 5. Solar Plexus - Yellow */}
              <circle cx="50" cy="49" r="1.3" fill="#facc15" filter="url(#glow-solar)" className="animate-pulse" style={{ animationDuration: '2.4s' }} />
              
              {/* 6. Sacral - Orange */}
              <circle cx="50" cy="58.5" r="1.3" fill="#fb923c" filter="url(#glow-sacral)" className="animate-pulse" style={{ animationDuration: '2.6s' }} />
              
              {/* 7. Root - Red */}
              <circle cx="50" cy="71" r="1.5" fill="#f87171" filter="url(#glow-root)" className="animate-pulse" style={{ animationDuration: '2.1s' }} />
            </svg>
          </div>

        </div>

        {/* Right Side Overlays (Occupies columns 10 to 12) */}
        <div className="lg:col-span-3 flex flex-col justify-center space-y-6">
          
          {/* Panel 1: Animation Control (Glassmorphic) */}
          <div className="lumina-glass p-5 rounded-xl border-white/5 text-left space-y-4">
            <div>
              <span className="text-[10px] tracking-[0.25em] uppercase text-gold font-medium">Animation Summary</span>
              <div className="h-[1px] w-12 bg-gold/30 mt-1" />
            </div>
            <ul className="space-y-2.5 text-xs text-gray-300 font-sans">
              <li className="flex items-center justify-between">
                <span className="text-gray-400">• Particles</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
              </li>
              <li className="flex items-center justify-between cursor-pointer group" onClick={() => toggleAnimation('floatingRocks')}>
                <span className="group-hover:text-gold transition-colors duration-150">• Floating Rocks</span>
                <span className={`w-3.5 h-2 rounded-full p-0.5 flex items-center transition-colors duration-300 ${activeAnimations.floatingRocks ? 'bg-gold/40 justify-end' : 'bg-white/10 justify-start'}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                </span>
              </li>
              <li className="flex items-center justify-between cursor-pointer group" onClick={() => toggleAnimation('energyRings')}>
                <span className="group-hover:text-gold transition-colors duration-150">• Energy Rings</span>
                <span className={`w-3.5 h-2 rounded-full p-0.5 flex items-center transition-colors duration-300 ${activeAnimations.energyRings ? 'bg-gold/40 justify-end' : 'bg-white/10 justify-start'}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                </span>
              </li>
              <li className="flex items-center justify-between cursor-pointer group" onClick={() => toggleAnimation('glowPulses')}>
                <span className="group-hover:text-gold transition-colors duration-150">• Glow Pulses</span>
                <span className={`w-3.5 h-2 rounded-full p-0.5 flex items-center transition-colors duration-300 ${activeAnimations.glowPulses ? 'bg-gold/40 justify-end' : 'bg-white/10 justify-start'}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-gray-400">• Smooth Scroll</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
              </li>
            </ul>
          </div>

        </div>

      </div>

      {/* 4. Bottom Grid / Panels */}
      <div className="relative max-w-7xl mx-auto px-6 md:px-12 pb-10 z-40 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        {/* Bottom Quote */}
        <div className="md:col-span-12 text-center">
          <p className="font-serif italic text-xs text-gray-400 max-w-xs md:ml-auto leading-relaxed tracking-wider">
            "You are not here to become someone. You are here to remember who you are."
          </p>
          <div className="h-[1px] w-6 bg-gold/40 mt-2.5 md:ml-auto mx-auto" />
        </div>

      </div>

    </div>
  );
}
