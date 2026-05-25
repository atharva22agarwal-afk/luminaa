import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Anchor, Sparkles, BookOpen, Send, History, Zap, Info, RefreshCw } from 'lucide-react';

export default function ManifestLab({ onAnchor }) {
  const [intention, setIntention] = useState('');
  const [anchoredIntention, setAnchoredIntention] = useState('');
  const [isAnchoring, setIsAnchoring] = useState(false);
  const [generatedAffirmations, setGeneratedAffirmations] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('lumina_timeline_records');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) 
         ? parsed.filter(log => log.type === 'manifestation').slice(0, 5) 
         : [];
    } catch {
      return [];
    }
  });

  // Load state from resilient storage
  useEffect(() => {
    const savedAnchored = localStorage.getItem('lumina_primary_intention') || localStorage.getItem('lumina_anchored_intention') || "";
    setAnchoredIntention(savedAnchored);
  }, []);

  const handleAnchor = async () => {
    if (!intention.trim()) return;
    setIsAnchoring(true);
    setGeneratedAffirmations([]);
    const newIntention = intention.trim();

    try {
      setAnchoredIntention(newIntention);
      localStorage.setItem('lumina_primary_intention', newIntention);
      localStorage.setItem('lumina_anchored_intention', newIntention); // fallback compatibility
      if (onAnchor) onAnchor(newIntention);

      // Log to Sacred Records
      const newRecord = {
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        type: 'manifestation',
        content: `Anchored Intention: ${newIntention}`,
        aiInsight: "Your intention has been broadcast into the quantum field. Focus on the feeling of completion."
      };
      const currentLogs = JSON.parse(localStorage.getItem('lumina_timeline_records')) || [];
      localStorage.setItem('lumina_timeline_records', JSON.stringify([newRecord, ...currentLogs]));
      setHistory([newRecord, ...history].slice(0, 5));
      setIntention('');
      setIsAnchoring(false);

      // Trigger AI Affirmations
      setIsGenerating(true);
      const { generateAffirmations } = await import('../services/aiService');
      const prompt = `The user has just anchored this intention: "${newIntention}". Generate 3 short powerful affirmations in first person present tense that directly support this specific goal. Each under 15 words. Warm, grounded, no jargon. Return only the 3 affirmations as a numbered list, nothing else.`;
      const aiResponse = await generateAffirmations(prompt);
      
      const parsed = aiResponse.split('\n')
        .filter(line => line.trim().match(/^\d+\./))
        .map(line => line.replace(/^\d+\.\s*/, '').replace(/^["']|["']$/g, '').trim());
        
      setGeneratedAffirmations(parsed);
    } catch (e) {
      console.error("Anchoring or AI Generation failed:", e);
    } finally {
      setIsAnchoring(false);
      setIsGenerating(false);
    }
  };

  const clearAnchor = () => {
    setAnchoredIntention('');
    setGeneratedAffirmations([]);
    localStorage.removeItem('lumina_primary_intention');
    localStorage.removeItem('lumina_anchored_intention');
    if (onAnchor) onAnchor('');
  };

  const saveAffirmation = (text) => {
    try {
      const existing = JSON.parse(localStorage.getItem('lumina_affirmations') || '[]');
      if (!existing.find(a => a.text === text)) {
        existing.unshift({
          id: Date.now().toString(),
          text,
          dateCreated: new Date().toLocaleDateString(),
          isFavourite: false,
          category: 'intention'
        });
        localStorage.setItem('lumina_affirmations', JSON.stringify(existing));
        alert('Affirmation saved to library!');
      } else {
        alert('Affirmation already in library.');
      }
    } catch (e) { console.error('Error saving affirmation', e); }
  };

  const principles = [
    {
      title: "Be Specific",
      desc: "Vague desires yield vague results. Define exactly what you wish to see.",
      icon: <Zap size={18} />
    },
    {
      title: "Feel Now",
      desc: "The universe responds to frequency. Experience the joy of it already being true.",
      icon: <Sparkles size={18} />
    },
    {
      title: "Let Go",
      desc: "Clinging creates friction. Release the 'how' and trust the quantum flow.",
      icon: <Anchor size={18} />
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '40px', maxWidth: '1000px', margin: '0 auto' }}
    >
      <div className="divine-header">
        <h1>Quantum Lab</h1>
        <p>Declare your intention. Anchor your reality. Observe the shift.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px' }}>

        {/* LEFT COLUMN: DECLARATION */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

          {/* INTENTION INPUT */}
          <div style={{ background: 'var(--bg-card)', padding: '40px', borderRadius: '32px', border: '1px solid var(--glass-border)', boxShadow: 'var(--card-shadow)' }}>
            <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Declare New Intention
            </h3>
            <textarea
              value={intention}
              onChange={(e) => setIntention(e.target.value)}
              placeholder="I am a magnetic leader attracting world-class opportunities daily..."
              style={{
                width: '100%',
                minHeight: '120px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-main)',
                fontSize: '1.4rem',
                fontWeight: 600,
                fontFamily: "'Playfair Display', serif",
                outline: 'none',
                resize: 'none',
                lineHeight: '1.4'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                onClick={handleAnchor}
                disabled={isAnchoring || isGenerating || !intention.trim()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: 'var(--text-main)',
                  color: 'var(--bg-card)',
                  padding: '16px 32px',
                  borderRadius: '20px',
                  fontWeight: 800,
                  border: 'none',
                  cursor: (isAnchoring || isGenerating) ? 'wait' : 'pointer',
                  opacity: (isAnchoring || isGenerating || !intention.trim()) ? 0.6 : 1,
                  transition: '0.3s',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                }}
              >
                {(isAnchoring || isGenerating) ? <RefreshCw className="animate-spin" size={20} /> : <Anchor size={20} />}
                {isAnchoring ? 'ANCHORING...' : isGenerating ? 'GENERATING AFFIRMATIONS...' : 'ANCHOR REALITY'}
              </button>
            </div>
          </div>

          {/* GENERATED AFFIRMATIONS */}
          <AnimatePresence>
            {generatedAffirmations.length > 0 && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--sage-deep)', fontWeight: 800 }}>AI Suggested Affirmations</h3>
                {generatedAffirmations.map((aff, i) => (
                  <div key={i} style={{ padding: '20px', borderRadius: '16px', background: 'var(--bg-element)', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', color: 'var(--text-main)' }}>"{aff}"</div>
                    <button onClick={() => saveAffirmation(aff)} style={{ background: 'var(--sage-green)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>Save</button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* CURRENT ANCHOR DISPLAY */}
          <AnimatePresence>
            {anchoredIntention && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--sage-muted) 100%)',
                  padding: '50px 40px',
                  borderRadius: '32px',
                  border: '2px solid var(--sage-green)',
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ position: 'absolute', top: '20px', left: '0', right: '0', display: 'flex', justifyContent: 'center' }}>
                  <div style={{ background: 'var(--sage-green)', color: 'white', padding: '4px 12px', borderRadius: '8px', fontSize: '0.6rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px' }}>
                    Active Anchor
                  </div>
                </div>

                <motion.h2
                  animate={{ opacity: [0.8, 1, 0.8] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '2.2rem',
                    color: 'var(--sage-deep)',
                    lineHeight: '1.3',
                    marginTop: '20px'
                  }}
                >
                  "{anchoredIntention}"
                </motion.h2>

                <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center', gap: '20px', opacity: 0.5 }}>
                  <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                     <Zap size={14} />
                     <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>Focus on this feeling now</span>
                  </div>
                  <button onClick={clearAnchor} style={{ background: 'none', border: 'none', color: 'var(--text-main)', textDecoration: 'underline', fontSize: '0.7rem', cursor: 'pointer', textTransform: 'uppercase', fontWeight: 800 }}>Clear Anchor</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT COLUMN: GUIDANCE & HISTORY */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

          {/* PRINCIPLES */}
          <div style={{ background: 'var(--bg-element)', padding: '30px', borderRadius: '32px', border: '1px solid var(--glass-border)' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Info size={16} color="var(--sage-green)" />
              Quantum Principles
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              {principles.map((p, i) => (
                <div key={i} style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--sage-green)', border: '1px solid var(--glass-border)' }}>
                    {p.icon}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '4px' }}>{p.title}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RECENT HISTORY PREVIEW */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-muted)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <History size={14} />
              Recent Shifts
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {history.length > 0 ? history.map(log => (
                <div key={log.id} style={{ padding: '15px 20px', borderRadius: '18px', background: 'var(--bg-card)', border: '1px solid var(--glass-border)', fontSize: '0.85rem' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '5px' }}>{log.date}</div>
                  <p style={{ color: 'var(--text-main)', fontStyle: 'italic', opacity: 0.8 }}>"{log.content.replace('Anchored Intention: ', '')}"</p>
                </div>
              )) : (
                <div style={{ textAlign: 'center', padding: '40px', opacity: 0.3 }}>
                  <BookOpen size={40} strokeWidth={1} style={{ marginBottom: '10px' }} />
                  <p style={{ fontSize: '0.75rem' }}>Your timeline awaits its first shift.</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </motion.div>
  );
}
