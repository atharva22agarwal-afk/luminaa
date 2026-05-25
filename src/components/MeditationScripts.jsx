import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, BookOpen, RefreshCw, Copy, Check } from 'lucide-react';
import { getTodaysMood } from './DailyCheckIn';
import { getJournalInsight } from '../services/aiService';

/**
 * AI-Generated Meditation Scripts — generates a personalized guided meditation
 * based on the user's current mood, recent journal entries, and anchored intention.
 */
export default function MeditationScripts() {
  const [script, setScript] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const generateScript = useCallback(async () => {
    setIsGenerating(true);
    setError(null);
    setScript(null);

    try {
      // Gather context
      const todayMood = getTodaysMood();
      const journalEntries = JSON.parse(localStorage.getItem('lumina_journal_entries') || '[]');
      const recentJournal = journalEntries.slice(0, 3).map(e => e.text).join('\n\n');
      const intention = localStorage.getItem('lumina_primary_intention') || '';
      const moodContext = todayMood
        ? `The user is currently feeling: ${todayMood.label} (${todayMood.emoji}).`
        : 'The user has not checked in today.';
      const journalContext = recentJournal
        ? `Recent journal entries:\n${recentJournal}`
        : 'No recent journal entries.';
      const intentionContext = intention
        ? `Their active intention is: "${intention}"`
        : 'No active intention set.';

      const prompt = `You are a master meditation guide creating a deeply personalized 5-minute guided meditation script.

${moodContext}
${journalContext}
${intentionContext}

Create a warm, gentle, spoken meditation script with these sections:

**Opening** (30s) — Welcome them, validate their current state, invite them to settle in.
**Breath Anchor** (60s) — Guide them to 3-4 conscious breaths with gentle counting.
**Body Release** (60s) — A brief body scan from head to shoulders, releasing tension.
**Core Reflection** (90s) — Speak directly to their current emotional state and intention. Offer a perspective shift or visualization.
**Return** (30s) — Gently guide them back to the present moment.

Rules:
- Write in first person addressing the user directly ("you", "your").
- Use warm, natural language — never clinical or robotic.
- Include gentle pacing cues in brackets like [pause 5 seconds] or [breathe].
- Keep the total script under 400 words.
- Do NOT add section headers or explanations — just the flowing script.
- The tone should feel like a trusted friend guiding them, not a therapist.`;

      const response = await getJournalInsight(prompt);

      // getJournalInsight returns a single insight — use askGroq fallback for full script
      // Actually, let's use the raw Groq API directly for a full script
      const API_KEY = import.meta.env.VITE_GROQ_KEY;
      if (!API_KEY) {
        throw new Error('API key not configured');
      }

      const fullResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: 'You are a master meditation guide. Write warm, flowing spoken meditation scripts. Include pacing cues in brackets. Under 400 words.' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.8,
          max_tokens: 500,
        }),
      });

      const data = await fullResponse.json();
      if (!data.choices) throw new Error('Generation failed');
      setScript(data.choices[0].message.content);
    } catch (e) {
      console.error('Meditation script generation failed:', e);
      setError('Could not connect to the Oracle. Please check your API key and try again.');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const copyToClipboard = useCallback(() => {
    if (!script) return;
    navigator.clipboard.writeText(script).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [script]);

  const mood = getTodaysMood();

  return (
    <div style={{
      background: 'var(--bg-card)',
      borderRadius: '24px',
      padding: '32px',
      border: '1px solid var(--glass-border)',
      boxShadow: 'var(--card-shadow)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <Sparkles size={20} color="var(--sage-green)" />
        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '1.3rem',
          fontWeight: 400,
          fontStyle: 'italic',
          color: 'var(--text-main)',
        }}>
          Guided Meditation
        </h2>
      </div>

      {mood && (
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
          Tailored to your current energy: {mood.emoji} {mood.label}
        </p>
      )}

      {/* Generate Button */}
      {!script && !isGenerating && (
        <button
          onClick={generateScript}
          style={{
            width: '100%',
            padding: '18px',
            borderRadius: '20px',
            border: 'none',
            background: 'var(--text-main)',
            color: 'var(--bg-card)',
            fontWeight: 700,
            fontSize: '0.85rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            transition: 'all 0.3s ease',
          }}
        >
          <BookOpen size={18} />
          Generate Personalized Script
        </button>
      )}

      {/* Loading */}
      {isGenerating && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
        }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            style={{ display: 'inline-block', marginBottom: '16px' }}
          >
            <Loader2 size={28} color="var(--sage-green)" />
          </motion.div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            Weaving your personalized meditation...
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          padding: '16px 20px',
          borderRadius: '12px',
          background: 'rgba(255, 107, 107, 0.1)',
          border: '1px solid rgba(255, 107, 107, 0.2)',
          color: '#FF6B6B',
          fontSize: '0.85rem',
          textAlign: 'center',
        }}>
          {error}
        </div>
      )}

      {/* Generated Script */}
      <AnimatePresence>
        {script && !isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginTop: '24px' }}
          >
            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <button
                onClick={generateScript}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  border: '1px solid var(--glass-border)',
                  background: 'var(--bg-element)',
                  color: 'var(--text-main)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <RefreshCw size={14} />
                Regenerate
              </button>
              <button
                onClick={copyToClipboard}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  border: '1px solid var(--glass-border)',
                  background: 'var(--bg-element)',
                  color: 'var(--text-main)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {copied ? <Check size={14} color="#4CAF50" /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            {/* Script Text */}
            <div style={{
              background: 'var(--bg-element)',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid var(--glass-border)',
            }}>
              <div style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '1.05rem',
                lineHeight: 1.8,
                color: 'var(--text-main)',
                fontStyle: 'italic',
                whiteSpace: 'pre-wrap',
              }}>
                {script}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
