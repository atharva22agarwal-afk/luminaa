import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, BookOpen, BrainCircuit, Sparkles, Feather, Zap, Anchor } from 'lucide-react';

export default function Timeline() {
  const [entries, setEntries] = useState([]);
  const [quantumRecords, setQuantumRecords] = useState([]);
  const [frequencyData, setFrequencyData] = useState([]);
  const [oracleMemory, setOracleMemory] = useState("");

  useEffect(() => {
    try {
      setEntries(JSON.parse(localStorage.getItem('lumina_journal_entries') || '[]'));
    } catch (e) {
      console.error("Failed to load journal entries:", e);
    }
    try {
      setQuantumRecords(JSON.parse(localStorage.getItem('lumina_timeline_records') || '[]'));
    } catch (e) {
      console.error("Failed to load quantum records:", e);
    }
    try {
      setFrequencyData(JSON.parse(localStorage.getItem('lumina_frequency_history') || '[]'));
    } catch (e) {
      console.error("Failed to load frequency history:", e);
    }
    setOracleMemory(localStorage.getItem('lumina_long_term_memory') || '');
  }, []);

  // Sort and unify entries and quantum records from newest to oldest
  const sortedChronicle = useMemo(() => {
    const normalizedJournals = entries.map(entry => ({
      ...entry,
      type: 'journal',
      sortDate: entry.timestamp || entry.date || 0
    }));

    const normalizedQuantum = quantumRecords.map(record => ({
      id: record.id,
      timestamp: record.id,
      date: record.date,
      type: 'manifestation',
      mood: '✨',
      text: record.content ? record.content.replace('Anchored Intention: ', '') : '',
      insight: record.aiInsight || '',
      sortDate: record.id || record.date || 0
    }));

    const combined = [...normalizedJournals, ...normalizedQuantum];

    return combined.sort((a, b) => {
      const dateA = new Date(a.sortDate);
      const dateB = new Date(b.sortDate);
      
      if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
      if (isNaN(dateA.getTime())) return 1;
      if (isNaN(dateB.getTime())) return -1;
      
      return dateB.getTime() - dateA.getTime();
    });
  }, [entries, quantumRecords]);

  // Match the closest frequency score for the date
  const getFreqForDate = (dateStr) => {
    if (!dateStr || frequencyData.length === 0) return null;
    try {
      const target = new Date(dateStr).toLocaleDateString();
      const match = frequencyData.find(f => new Date(f.date).toLocaleDateString() === target);
      return match ? match.score : null;
    } catch (e) {
      return null;
    }
  };

  return (
    <div 
      style={{ display: 'flex', flexDirection: 'column', width: '100%' }}
    >
      <div className="divine-header" style={{ flexShrink: 0, paddingBottom: '20px' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <BrainCircuit size={32} /> The Chronicle
        </h1>
        <p>The Master Hub of Your Evolution.</p>
      </div>

      <div style={{ display: 'flex', gap: '30px', flex: 1, minHeight: 0 }}>
        
        {/* Left Column: Vertical Timeline Feed */}
        <div style={{ flex: 2, overflowY: 'auto', paddingRight: '15px' }} className="custom-scroll">
          <AnimatePresence>
            {sortedChronicle.length > 0 ? (
              sortedChronicle.map((entry, i) => {
                const isQuantum = entry.type === 'manifestation';
                const freq = !isQuantum ? getFreqForDate(entry.date) : null;
                
                return (
                  <motion.div
                    key={entry.id || i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.05, 0.5) }}
                    className="glass-mystic"
                    style={{
                      marginBottom: '24px',
                      padding: '30px',
                      borderRadius: '24px',
                      position: 'relative',
                      background: isQuantum 
                        ? 'linear-gradient(135deg, rgba(126, 119, 221, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)' 
                        : 'var(--glass-mystic)',
                      borderLeft: isQuantum 
                        ? '4px solid var(--spectral-glow)' 
                        : (freq ? `4px solid hsl(${freq * 1.2}, 70%, 50%)` : '4px solid var(--border-color)'),
                      border: isQuantum ? '1px solid rgba(126, 119, 221, 0.15)' : undefined,
                      borderLeftWidth: '4px',
                      boxShadow: isQuantum ? '0 8px 32px 0 rgba(126, 119, 221, 0.03)' : undefined
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span style={{ fontSize: '1.5rem' }}>{entry.mood}</span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontSize: '0.8rem', opacity: 0.6, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                            {new Date(entry.timestamp || entry.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                          </span>
                          {isQuantum && (
                            <span style={{ 
                              fontSize: '0.65rem', 
                              color: 'var(--spectral-glow)', 
                              fontWeight: 800, 
                              textTransform: 'uppercase', 
                              letterSpacing: '0.15em',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <Zap size={10} fill="currentColor" /> Quantum Shift
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {!isQuantum && freq && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '5px 12px', borderRadius: '20px' }}>
                          <Activity size={14} color={`hsl(${freq * 1.2}, 70%, 50%)`}/>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{freq}Hz</span>
                        </div>
                      )}

                      {isQuantum && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(126, 119, 221, 0.1)', padding: '5px 12px', borderRadius: '20px', border: '1px solid rgba(126, 119, 221, 0.2)' }}>
                          <Anchor size={12} color="var(--spectral-glow)" />
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--spectral-glow)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Anchored</span>
                        </div>
                      )}
                    </div>
                    
                    <p style={{ 
                      fontSize: isQuantum ? '1.15rem' : '1.05rem', 
                      lineHeight: '1.7', 
                      marginBottom: '20px', 
                      fontWeight: 300, 
                      color: isQuantum ? 'var(--text-main)' : 'var(--offwhite)',
                      fontFamily: isQuantum ? "'Playfair Display', serif" : 'inherit',
                      fontStyle: isQuantum ? 'italic' : 'normal'
                    }}>
                      {isQuantum ? `"${entry.text}"` : entry.text}
                    </p>

                    {entry.insight && (
                      <div style={{ 
                        background: isQuantum ? 'rgba(126, 119, 221, 0.12)' : 'rgba(126, 119, 221, 0.08)', 
                        borderLeft: '2px solid var(--spectral-glow)',
                        padding: '15px 20px',
                        borderRadius: '0 12px 12px 0',
                        display: 'flex',
                        gap: '15px',
                        alignItems: 'flex-start',
                        marginTop: '15px'
                      }}>
                        <Sparkles size={18} color="var(--spectral-glow)" style={{ flexShrink: 0, marginTop: '2px' }}/>
                        <p style={{ fontSize: '0.9rem', fontStyle: 'italic', margin: 0, opacity: 0.9, color: 'var(--spectral-glow)' }}>
                          {entry.insight}
                        </p>
                      </div>
                    )}
                  </motion.div>
                );
              })
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '60px 20px', 
                background: 'rgba(255,255,255,0.02)', 
                borderRadius: '24px',
                border: '1px dashed rgba(255,255,255,0.1)'
              }}>
                <Feather size={48} style={{ margin: '0 auto 20px', opacity: 0.3 }} />
                <h3 style={{ marginBottom: '10px' }}>Your timeline is empty.</h3>
                <p style={{ opacity: 0.6, fontSize: '0.9rem' }}>Seal a journal entry in your Sacred Records or anchor a quantum intention to begin your chronicle.</p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: AI Oracle Dossier */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', minWidth: '350px' }}>
            <div className="glass-mystic" style={{ padding: '30px', borderRadius: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', fontSize: '1.1rem', color: 'var(--spectral-glow)' }}>
                <BrainCircuit size={20} /> The Oracle Dossier
              </h3>
              <p style={{ fontSize: '0.85rem', opacity: 0.6, marginBottom: '20px', lineHeight: '1.5' }}>
                A living, psychological profile automatically continuously extracted from your conversations. The Oracle uses this to personalize its guidance.
              </p>
              
              <div style={{ flex: 1, overflowY: 'auto' }} className="custom-scroll">
                {oracleMemory ? (
                  <div style={{ 
                    background: 'rgba(0,0,0,0.2)', 
                    padding: '24px', 
                    borderRadius: '16px',
                    fontSize: '0.95rem',
                    lineHeight: '1.8',
                    color: 'var(--offwhite)',
                    whiteSpace: 'pre-wrap',
                    border: '1px solid rgba(126, 119, 221, 0.1)'
                  }}>
                    {oracleMemory}
                  </div>
                ) : (
                  <div style={{ opacity: 0.4, textAlign: 'center', padding: '40px 0' }}>
                    <p style={{ marginBottom: '10px' }}>The Oracle is still learning about you.</p>
                    <p style={{ fontSize: '0.8rem' }}>Speak with the AI to generate a psychological baseline.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="glass-mystic" style={{ padding: '24px', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
               <div>
                 <div style={{ fontSize: '0.8rem', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total Chronicle Logs</div>
                 <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>{sortedChronicle.length}</div>
               </div>
               <BookOpen size={40} opacity={0.1} />
            </div>
        </div>
        
      </div>
    </div>
  );
}
