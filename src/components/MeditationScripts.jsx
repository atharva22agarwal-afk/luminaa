import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, BookOpen, RefreshCw, Copy, Check } from 'lucide-react';
import { getTodaysMood } from './DailyCheckIn';

function createOfflineMeditation({ todayMood, intention }) {
  const moodLine = todayMood
    ? `I can sense that ${todayMood.label.toLowerCase()} energy is here with you today, and you do not need to push it away.`
    : 'Whatever you arrived with today is welcome here.';
  const intentionLine = intention
    ? `Let your intention, "${intention}", become a quiet light in the background of your attention.`
    : 'Let one simple intention for this moment become clear, even if it is only to breathe and begin again.';

  return `Find a comfortable position and let your shoulders soften. [pause 5 seconds]

Take a slow breath in through your nose. Hold it gently. Now let it out with no rush. [breathe]

Again, breathe in for four. [pause 4 seconds] And release for six. [pause 6 seconds]

${moodLine} Let it be seen without needing it to take over the whole room.

Bring your attention to your forehead, your jaw, your neck, and your shoulders. Let each place loosen by one small degree. [pause 8 seconds]

${intentionLine}

Imagine that every inhale gives you a little more space, and every exhale clears one unnecessary weight from your body. [pause 10 seconds]

For the next few breaths, there is nowhere else you need to be. You are here. You are breathing. You are allowed to move gently.

When you are ready, feel the surface beneath you, notice the room around you, and return with a calmer mind and a steadier heart.`;
}

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

      // getJournalInsight returns a single insight — use askGroq fallback for full script
      // Actually, let's use the raw Groq API directly for a full script
      // Actually, let's use the new backend proxy for a full script

      const fullResponse = await fetch('/api/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      if (!fullResponse.ok || !data.choices) throw new Error(data.error?.message || 'Generation failed');
      setScript(data.choices[0].message.content);
    } catch (e) {
      console.error('Meditation script generation failed:', e);
      const todayMood = getTodaysMood();
      const intention = localStorage.getItem('lumina_primary_intention') || '';
      setScript(createOfflineMeditation({ todayMood, intention }));
      setError('AI meditation is unavailable right now, so I made an offline script for you.');
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
