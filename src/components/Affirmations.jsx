import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, Share, Trash2, Plus, Bell, Clock } from 'lucide-react';
import { generateAffirmations } from '../services/aiService';

export default function Affirmations() {
  const [affirmations, setAffirmations] = useState([]);
  const [customText, setCustomText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiCategory, setAiCategory] = useState('');
  const [generatedResults, setGeneratedResults] = useState([]);
  const [reminderTime, setReminderTime] = useState('');
  const [reminderActive, setReminderActive] = useState(false);
  const [inlineError, setInlineError] = useState(null);

  const categories = ['Confidence', 'Peace', 'Focus', 'Abundance', 'Self-Love', 'Courage'];

  useEffect(() => {
    loadAffirmations();
    const savedTime = localStorage.getItem('lumina_reminder_time');
    if (savedTime) {
      setReminderTime(savedTime);
      setReminderActive(true);
    }
  }, []);

  const loadAffirmations = () => {
    try {
      const data = JSON.parse(localStorage.getItem('lumina_affirmations') || '[]');
      // Sort favourites first
      data.sort((a, b) => {
        if (a.isFavourite && !b.isFavourite) return -1;
        if (!a.isFavourite && b.isFavourite) return 1;
        return 0;
      });
      setAffirmations(data);
    } catch (e) { console.error(e); }
  };

  const saveAffirmation = (text, category = 'personal') => {
    try {
      if (affirmations.find(a => a.text === text)) {
        setInlineError("This affirmation is already in your library.");
        setTimeout(() => setInlineError(null), 3000);
        return;
      }
      const newAff = {
        id: Date.now().toString(),
        text,
        dateCreated: new Date().toLocaleDateString(),
        isFavourite: false,
        category
      };
      const updated = [newAff, ...affirmations];
      localStorage.setItem('lumina_affirmations', JSON.stringify(updated));
      loadAffirmations();
      if (category === 'personal') setCustomText('');
    } catch (e) { console.error(e); }
  };

  const toggleFavourite = (id) => {
    try {
      const updated = affirmations.map(a => a.id === id ? { ...a, isFavourite: !a.isFavourite } : a);
      localStorage.setItem('lumina_affirmations', JSON.stringify(updated));
      loadAffirmations();
    } catch(e) { console.error(e); }
  };

  const deleteAffirmation = (id) => {
    try {
      const updated = affirmations.filter(a => a.id !== id);
      localStorage.setItem('lumina_affirmations', JSON.stringify(updated));
      loadAffirmations();
    } catch(e) { console.error(e); }
  };

  const generateWithAI = async () => {
    if (!aiInput && !aiCategory) return;
    setIsGenerating(true);
    setGeneratedResults([]);
    try {
      const prompt = `Based on this input: "${aiInput}" and category: "${aiCategory}", generate 3 short powerful personal affirmations. First person, present tense, under 15 words each, warm and grounded, no jargon. Return only 3 affirmations as a numbered list.`;
      const aiResponse = await generateAffirmations(prompt);
      
      const parsed = aiResponse.split('\n')
        .filter(line => line.trim().match(/^\d+\./))
        .map(line => line.replace(/^\d+\.\s*/, '').replace(/^["']|["']$/g, '').trim());
        
      setGeneratedResults(parsed);
      setAiInput('');
    } catch (e) {
      console.error(e);
      setInlineError("Failed to connect to the quantum field. Try again.");
      setTimeout(() => setInlineError(null), 5000);
    } finally {
      setIsGenerating(false);
    }
  };

  const shareAffirmation = (text) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d');
      
      // Background
      ctx.fillStyle = '#A8C3B0'; // sage green
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Text
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'italic 70px "Playfair Display", serif';
      
      // Wrapping text manually
      const words = text.split(' ');
      let line = '';
      let y = canvas.height / 2 - 50;
      
      for(let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + ' ';
        let metrics = ctx.measureText(testLine);
        if (metrics.width > 800 && n > 0) {
          ctx.fillText(line, canvas.width / 2, y);
          line = words[n] + ' ';
          y += 100;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, canvas.width / 2, y);
      
      // Watermark
      ctx.font = '30px sans-serif';
      ctx.fillText('Lumina', canvas.width - 100, canvas.height - 80);
      
      const link = document.createElement('a');
      link.download = 'lumina-affirmation.png';
      link.href = canvas.toDataURL();
      link.click();
    } catch(e) {
      console.error(e);
      setInlineError("Canvas drawing failed. Are you on a compatible browser?");
      setTimeout(() => setInlineError(null), 5000);
    }
  };

  const setReminder = async () => {
    if (!reminderTime) return;
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        localStorage.setItem('lumina_reminder_time', reminderTime);
        setReminderActive(true);
        alert(`Reminder confirmed for ${reminderTime} daily. Leave Lumina running to receive it.`);
        
        // Simple loop to check time in the current session
        setInterval(() => {
          const now = new Date();
          const currentH = now.getHours().toString().padStart(2, '0');
          const currentM = now.getMinutes().toString().padStart(2, '0');
          const timeString = `${currentH}:${currentM}`;
          
          if (timeString === localStorage.getItem('lumina_reminder_time') && now.getSeconds() === 0) {
            const library = JSON.parse(localStorage.getItem('lumina_affirmations') || '[]');
            const intention = localStorage.getItem('lumina_primary_intention');
            let txt = "I am aligned, focused, and exactly where I need to be.";
            if (library.length > 0) {
                const favs = library.filter(a => a.isFavourite);
                const pool = favs.length > 0 ? favs : library;
                txt = pool[Math.floor(Math.random() * pool.length)].text;
            } else if (intention) {
                txt = "Focused intention: " + intention;
            }
            new Notification("Lumina Reminder", { body: txt });
          }
        }, 1000);
      } else {
        setInlineError("Notification permission denied.");
        setTimeout(() => setInlineError(null), 5000);
      }
    } catch(e) { console.error(e); }
  };

  const clearReminder = () => {
    localStorage.removeItem('lumina_reminder_time');
    setReminderTime('');
    setReminderActive(false);
  };

  const anchoredIntention = localStorage.getItem('lumina_primary_intention') || '';
  const reminderDescription = anchoredIntention
    ? `At this time, Lumina will bring you back to your current intention: "${anchoredIntention}". The reminder uses your saved affirmations first, then your intention if your library is empty.`
    : 'Choose a time for Lumina to bring you back to your intention for the day. Add an intention in Manifest Lab or save affirmations here to personalize the reminder.';

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '30px', maxWidth: '1000px', margin: '-18px auto 0', paddingBottom: '100px' }}>

      {/* SECTION D: DAILY ENFORCEMENT */}
      <div style={{ background: 'var(--bg-card)', padding: '28px 30px', borderRadius: '32px', border: '1px solid var(--glass-border)', boxShadow: 'var(--card-shadow)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' }}>
         <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', flex: '1 1 460px', minWidth: 0 }}>
           <div style={{ width: '50px', height: '50px', borderRadius: '16px', background: 'var(--bg-element)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sage-deep)', flex: '0 0 50px' }}>
             <Bell size={24} />
           </div>
           <div style={{ minWidth: 0 }}>
             <h3 style={{ margin: '0 0 6px 0', fontSize: '1.1rem' }}>Daily Alignment Reminder</h3>
             <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Receive a notification with your affirmation of the day.</p>
             <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '620px' }}>{reminderDescription}</p>
           </div>
         </div>
         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', flex: '0 1 360px', flexWrap: 'wrap' }}>
            {reminderActive && <span style={{ fontSize: '0.8rem', color: 'var(--sage-deep)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}><Clock size={14} /> Reminder set for {reminderTime}</span>}
            <input type="time" value={reminderTime} onChange={e => setReminderTime(e.target.value)} aria-label="Daily reminder time" style={{ padding: '10px 15px', borderRadius: '12px', border: '1px solid var(--glass-border)', background: 'var(--bg-element)', color: 'var(--text-main)', outline: 'none', minWidth: '124px' }} />
            {reminderActive ? (
              <button className="hover-lift" onClick={clearReminder} style={{ background: 'var(--bg-element)', color: 'var(--text-main)', border: '1px solid var(--glass-border)', padding: '10px 20px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>Clear</button>
            ) : (
              <button className="hover-lift" onClick={setReminder} disabled={!reminderTime} style={{ background: 'var(--sage-green)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', opacity: !reminderTime ? 0.5 : 1 }}>Set</button>
            )}
         </div>
      </div>

      <div className="divine-header">
        <h1>Affirmation Library</h1>
        <p>Curate the thoughts that shape your reality.</p>
        {inlineError && (
          <p style={{ color: '#ff6b6b', marginTop: '10px', fontSize: '0.85rem', fontWeight: 600 }}>
            {inlineError}
            <button onClick={() => setInlineError(null)} style={{ marginLeft: '10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>×</button>
          </p>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        
        {/* CREATE & GENERATE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* SECTION A: MANUAL ENTRY */}
          <div style={{ background: 'var(--bg-card)', padding: '30px', borderRadius: '32px', border: '1px solid var(--glass-border)', boxShadow: 'var(--card-shadow)' }}>
             <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--sage-deep)', marginBottom: '15px' }}>Write Your Own</h3>
             <textarea 
               value={customText}
               onChange={e => setCustomText(e.target.value)}
               placeholder="I am..."
               style={{ width: '100%', minHeight: '80px', background: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: '1.2rem', fontFamily: "'Playfair Display', serif", outline: 'none', resize: 'none' }}
             />
             <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button 
                  onClick={() => saveAffirmation(customText.trim(), 'personal')}
                  disabled={!customText.trim()}
                  style={{ background: 'var(--text-main)', color: 'var(--bg-card)', padding: '10px 20px', borderRadius: '16px', border: 'none', fontWeight: 800, cursor: 'pointer', opacity: !customText.trim() ? 0.5 : 1 }}
                >
                  <Plus size={16} style={{ marginBottom: '-3px', marginRight: '5px' }} /> Anchor It
                </button>
             </div>
          </div>

          {/* SECTION B: AI GENERATION */}
          <div style={{ background: 'var(--bg-element)', padding: '30px', borderRadius: '32px', border: '1px solid var(--glass-border)' }}>
             <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--sage-deep)', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} /> Oracle Generation
             </h3>
             <input 
               type="text"
               value={aiInput}
               onChange={e => setAiInput(e.target.value)}
               placeholder="I want to feel..."
               style={{ width: '100%', background: 'var(--bg-card)', border: '1px solid var(--glass-border)', padding: '15px 20px', borderRadius: '16px', color: 'var(--text-main)', fontSize: '1rem', outline: 'none', marginBottom: '15px' }}
             />
             <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                {categories.map(c => (
                  <button 
                    key={c}
                    onClick={() => setAiCategory(c)}
                    style={{ background: aiCategory === c ? 'var(--sage-green)' : 'var(--bg-card)', color: aiCategory === c ? 'white' : 'var(--text-main)', border: '1px solid var(--glass-border)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', cursor: 'pointer', transition: '0.2s' }}
                  >
                    {c}
                  </button>
                ))}
             </div>
             <button 
                onClick={generateWithAI}
                disabled={isGenerating || (!aiInput && !aiCategory)}
                style={{ width: '100%', background: 'var(--sage-green)', color: 'white', padding: '15px', borderRadius: '16px', border: 'none', fontWeight: 800, cursor: 'pointer', opacity: (isGenerating || (!aiInput && !aiCategory)) ? 0.5 : 1 }}
             >
                {isGenerating ? 'Drawing from the Cosmos...' : 'Generate from Oracle'}
             </button>

             {generatedResults.length > 0 && (
               <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                 {generatedResults.map((res, i) => (
                   <div key={i} style={{ padding: '15px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1rem', color: 'var(--text-main)' }}>"{res}"</span>
                      <button onClick={() => saveAffirmation(res, aiCategory || 'generated')} style={{ background: 'var(--sage-muted)', color: 'var(--sage-deep)', border: 'none', padding: '5px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}>Save</button>
                   </div>
                 ))}
               </div>
             )}
          </div>

        </div>

        {/* SECTION C: SAVED LIBRARY */}
        <div style={{ background: 'var(--bg-card)', padding: '30px', borderRadius: '32px', border: '1px solid var(--glass-border)', boxShadow: 'var(--card-shadow)', display: 'flex', flexDirection: 'column', height: '600px' }}>
          <h3 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--sage-deep)', marginBottom: '20px' }}>Your Library</h3>
          
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px', paddingRight: '10px' }} className="hide-scrollbar">
            {affirmations.length === 0 ? (
              <div style={{ textAlign: 'center', opacity: 0.5, marginTop: '40px' }}>
                <p>Your sanctuary is empty.</p>
                <p style={{ fontSize: '0.8rem' }}>Create or generate your first affirmation to anchor it here.</p>
              </div>
            ) : affirmations.map(aff => (
              <motion.div 
                key={aff.id} 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ background: 'var(--bg-element)', padding: '20px', borderRadius: '20px', border: `1px solid ${aff.isFavourite ? 'var(--sage-green)' : 'var(--glass-border)'}`, borderLeft: aff.isFavourite ? '4px solid var(--sage-green)' : undefined, position: 'relative' }}
              >
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', color: 'var(--text-main)', lineHeight: '1.4', marginBottom: '15px', paddingRight: '30px' }}>
                  "{aff.text}"
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{aff.dateCreated} • {aff.category}</div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                     <button onClick={() => toggleFavourite(aff.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: aff.isFavourite ? '#ff4b8b' : 'var(--text-muted)' }}>
                        <Heart size={18} fill={aff.isFavourite ? '#ff4b8b' : 'none'} />
                     </button>
                     <button onClick={() => shareAffirmation(aff.text)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                        <Share size={18} />
                     </button>
                     <button onClick={() => deleteAffirmation(aff.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                        <Trash2 size={18} />
                     </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
