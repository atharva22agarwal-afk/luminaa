import React from 'react';
import { ArrowRight, Sparkles, Waves, BookOpen } from 'lucide-react';
import './LuminaLanding.css';

export default function LuminaLanding({ onEnter }) {
  return (
    <section className="landing-container" aria-labelledby="landing-title">
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
        <button className="landing-nav-btn" onClick={onEnter}>
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
          <button className="enter-btn" onClick={onEnter}>
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
    </section>
  );
}
