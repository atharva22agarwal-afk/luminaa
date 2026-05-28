import React, { useEffect, useState } from 'react';
import { ArrowRight, Sparkles, Waves, BookOpen } from 'lucide-react';
import './LuminaLanding.css';

export default function LuminaLanding({ onEnter }) {
  const [isEntering, setIsEntering] = useState(false);
  const [voices, setVoices] = useState([]);

  useEffect(() => {
    if (!('speechSynthesis' in window)) return undefined;

    const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);

    return () => window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
  }, []);

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
    <section className={`landing-container ${isEntering ? 'entering' : ''}`} aria-labelledby="landing-title">
      <img
        className="landing-image"
        src="/assets/lumina-sanctuary-hero.png"
        alt=""
        aria-hidden="true"
      />
      <div className="landing-overlay" aria-hidden="true" />

      <header className="landing-nav" aria-label="Landing navigation">
        <div className="landing-mark">
          <Sparkles size={18} aria-hidden="true" />
          <span>Lumina</span>
        </div>
        <button className="landing-nav-btn" onClick={handleEnter} disabled={isEntering}>
          Open App
        </button>
      </header>

      <div className="landing-content">
        <p className="landing-kicker">Resilient focus and reflection</p>
        <h1 id="landing-title" className="brand-title">Lumina</h1>
        <p className="brand-tagline">
          A calm sanctuary for daily check-ins, focused sessions, affirmations,
          and private reflection.
        </p>

        <div className="landing-actions">
          <button className="enter-btn" onClick={handleEnter} disabled={isEntering}>
            <span>Enter Lumina</span>
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="landing-highlights" aria-label="Lumina highlights">
          <span><Waves size={16} aria-hidden="true" /> Focus audio</span>
          <span><Sparkles size={16} aria-hidden="true" /> Daily alignment</span>
          <span><BookOpen size={16} aria-hidden="true" /> Sacred records</span>
        </div>
      </div>

      <div className="heaven-flash" aria-hidden="true" />
    </section>
  );
}
