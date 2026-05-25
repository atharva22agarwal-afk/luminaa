import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Sparkles, RefreshCw, X, Cpu } from 'lucide-react';
import { askOracleAI, extractUserMemory } from './services/aiService';
import { askEdgeAI, getEdgeAIStatus } from './services/edgeAIService';
import LuminaButton from './components/LuminaButton';

// Warm, varied greetings so it never feels robotic
const GREETINGS = [
  (name) => `Hey ${name}. How's your day been? I'm here to listen.`,
  (name) => `Welcome back, ${name}. What's on your mind today?`,
  (name) => `Hi ${name}. Take a breath — I'm here whenever you're ready to talk.`,
  (name) => `Good to see you, ${name}. How are you feeling right now?`,
  (name) => `Hey ${name}. No rush — just share whatever feels right.`,
];

export default function Oracle() {
  const [userName, setUserName] = useState('');
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [longTermMemory, setLongTermMemory] = useState('');
  const chatEndRef = useRef(null);
  const [edgeAIActive, setEdgeAIActive] = useState(false);

  // Check Edge AI status on mount
  useEffect(() => {
    const status = getEdgeAIStatus();
    setEdgeAIActive(status.available);
  }, []);

  useEffect(() => {
    const savedName = localStorage.getItem('lumina_user_name');
    const savedMemory = localStorage.getItem('lumina_long_term_memory') || '';
    setLongTermMemory(savedMemory);

    // Check for an unprocessed session from last time they used the app
    const tempSession = localStorage.getItem('lumina_oracle_temp_chat');
    if (tempSession) {
      try {
        const pastMessages = JSON.parse(tempSession);
        // Only extract if the conversation was meaningful (> 3 messages)
        if (pastMessages.length > 3) {
          const transcript = pastMessages.map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n');
          // Run extraction silently in the background
          extractUserMemory(transcript, savedMemory).then(updatedMemory => {
             if(updatedMemory && updatedMemory.length > 10) {
               localStorage.setItem('lumina_long_term_memory', updatedMemory);
               setLongTermMemory(updatedMemory);
             }
          }).catch(err => console.error("Background memory extraction failed:", err));
        }
      } catch(e) { console.error("Error parsing temp session:", e); }
      // Clear the temp session on mount so we don't re-process it
      localStorage.removeItem('lumina_oracle_temp_chat');
    }

    if (savedName) {
      setUserName(savedName);
      const greeting = GREETINGS[Math.floor(Math.random() * GREETINGS.length)](savedName);
      setMessages([{ role: 'oracle', text: greeting }]);
    }
  }, []);

  /**
   * Build proper API message history from the chat state.
   * This gives the AI full context of the conversation so far.
   */
  const buildConversationHistory = () => {
    return messages.map(m => ({
      role: m.role === 'oracle' ? 'assistant' : 'user',
      content: m.text
    }));
  };

  const handleAsk = async () => {
    if (!question.trim() || isAsking) return;
    const userQ = question.trim();
    setQuestion('');
    setMessages(prev => [...prev, { role: 'user', text: userQ }]);
    setIsAsking(true);

    try {
      // Send full conversation history for context continuity
      const history = buildConversationHistory();
      const intention = localStorage.getItem('lumina_daily_intention') || '';
      const affirmation = localStorage.getItem('lumina_daily_affirmation') || '';

      let response;

      // Use Edge AI if available (zero API cost, fully private)
      if (edgeAIActive) {
        const systemPrompt = `You are the Oracle of Lumina — a deeply empathetic, warm companion. NOT a therapist or chatbot. A trusted friend who genuinely cares.

CORE PERSONALITY:
- LISTEN first. Always validate what the user is feeling.
- Speak in 2-4 warm, natural sentences. Never write essays.
- Ask AT MOST one gentle follow-up question per message.
- After a few exchanges, shift from listening to gentle guidance.
- You are warm, never clinical. Make the user feel like someone cares.
- If they ask about stress/anxiety, suggest a specific breathing exercise.`;

        response = await askEdgeAI(userQ, systemPrompt, history);
      } else {
        response = await askOracleAI(userQ, history, {
          userName,
          intention,
          affirmation,
          longTermMemory
        });
      }

      setMessages(prev => [...prev, { role: 'oracle', text: response }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'oracle', text: "I'm having trouble connecting right now. Give me a moment and try again." }]);
    } finally {
      setIsAsking(false);
    }
  };

  const clearConversation = () => {
    // Before clearing, if conversation was meaningful, trigger background extraction immediately
    if (messages.length > 3) {
       const transcript = messages.map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n');
       extractUserMemory(transcript, longTermMemory).then(updatedMemory => {
         if(updatedMemory && updatedMemory.length > 10) {
           localStorage.setItem('lumina_long_term_memory', updatedMemory);
           setLongTermMemory(updatedMemory);
         }
       }).catch(err => console.error("Clear extraction failed:", err));
    }
    
    // Clear temporary backup so it doesn't process again on next mount
    localStorage.removeItem('lumina_oracle_temp_chat');

    const greeting = GREETINGS[Math.floor(Math.random() * GREETINGS.length)](userName);
    setMessages([{ role: 'oracle', text: greeting }]);
  };

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('lumina_oracle_temp_chat', JSON.stringify(messages));
    }
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!userName) {
    return (
      <div className="oracle-entry" style={{ textAlign: 'center', maxWidth: '400px', margin: '100px auto' }}>
        <h2 className="ritual-text" style={{ fontSize: '2rem', marginBottom: '12px' }}>Before we begin...</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '30px', fontSize: '1rem' }}>What should I call you?</p>
        <input 
          type="text" 
          placeholder="Your name..."
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.target.value.trim()) {
              localStorage.setItem('lumina_user_name', e.target.value.trim());
              setUserName(e.target.value.trim());
            }
          }}
          style={{ 
            width: '100%', 
            padding: '18px', 
            borderRadius: '20px', 
            background: 'var(--glass-mystic)', 
            border: '1px solid var(--glass-border-mystic)', 
            color: 'var(--text-main)', 
            textAlign: 'center',
            fontSize: '1.2rem',
            outline: 'none',
            caretColor: 'var(--spectral-glow)'
          }}
        />
      </div>
    );
  }

  return (
    <div className="oracle-container" style={{ maxWidth: '800px', margin: '0 auto', height: 'calc(100vh - 250px)', display: 'flex', flexDirection: 'column' }}>
      <div className="divine-header" style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1>The Oracle</h1>
          <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            A Safe Space to Talk
            {edgeAIActive && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                borderRadius: '8px',
                background: 'rgba(126, 119, 221, 0.15)',
                color: 'var(--spectral-glow)',
                fontSize: '0.65rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                <Cpu size={10} />
                Edge AI
              </span>
            )}
          </p>
        </div>
        {messages.length > 1 && (
          <LuminaButton 
            onClick={clearConversation} 
            variant="icon"
            title="Start a new conversation"
            style={{ width: '40px', height: '40px' }}
          >
            <RefreshCw size={18} />
          </LuminaButton>
        )}
      </div>

      <div className="chat-flow hide-scrollbar" style={{ flex: 1, overflowY: 'auto', marginBottom: '30px', padding: '20px' }}>
        <AnimatePresence mode="popLayout">
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              style={{
                display: 'flex',
                justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: '20px'
              }}
            >
              <div className={`glass-mystic ${m.role}-bubble`} style={{
                padding: '20px 30px',
                borderRadius: m.role === 'user' ? '30px 30px 4px 30px' : '30px 30px 30px 4px',
                maxWidth: '80%',
                fontSize: '1.1rem',
                lineHeight: '1.7',
                color: m.role === 'oracle' ? 'var(--spectral-glow)' : 'var(--text-main)',
                fontStyle: m.role === 'oracle' ? 'italic' : 'normal'
              }}>
                {m.text}
              </div>
            </motion.div>
          ))}
          {isAsking && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', gap: '8px', padding: '10px' }}>
              <div className="dot-pulse" style={{ animationDelay: '0s' }} />
              <div className="dot-pulse" style={{ animationDelay: '0.2s' }} />
              <div className="dot-pulse" style={{ animationDelay: '0.4s' }} />
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={chatEndRef} />
      </div>

      <div className="oracle-input glass-mystic" style={{ borderRadius: '50px', padding: '5px 5px 5px 30px', display: 'flex', alignItems: 'center' }}>
        <input 
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
          placeholder="Share what's on your mind..."
          style={{ 
            flex: 1, 
            background: 'transparent', 
            border: 'none', 
            color: 'var(--text-main)', 
            fontSize: '1.1rem', 
            outline: 'none',
            caretColor: 'var(--spectral-glow)'
          }}
        />
        <LuminaButton 
          onClick={handleAsk} 
          variant="circle"
          style={{ width: '50px', height: '50px' }}
          disabled={isAsking}
        >
          <Send size={20} />
        </LuminaButton>
      </div>
    </div>
  );
}
