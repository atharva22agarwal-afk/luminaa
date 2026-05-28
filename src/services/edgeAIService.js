/**
 * Edge AI Service — On-device LLM via WebLLM (WebGPU)
 *
 * Runs a quantized Llama model directly in the browser.
 * Zero API cost, fully private, works offline after initial model download.
 *
 * Fallback: If WebGPU is unavailable, gracefully falls back to Groq API.
 */

let edgeLLM = null;
let isModelLoading = false;
let modelLoadProgress = 0;

// Lightweight model optimized for browser use
const EDGE_MODEL = 'Llama-3.2-3B-Instruct-q4f16_1-MLC';

/**
 * Initialize the Edge AI model.
 * Returns true if successful, false if WebGPU is unavailable.
 */
export async function initEdgeLLM(onProgress) {
  if (edgeLLM) return true;
  if (isModelLoading) return false;

  // Check WebGPU support
  if (!navigator.gpu) {
    console.warn('WebGPU not supported. Edge AI unavailable. Falling back to Groq API.');
    return false;
  }

  isModelLoading = true;
  modelLoadProgress = 0;

  try {
    const { CreateMLCEngine } = await import('https://esm.run/@mlc-ai/web-llm');

    edgeLLM = await CreateMLCEngine(EDGE_MODEL, {
      initProgressCallback: (report) => {
        modelLoadProgress = report.progress;
        if (onProgress) onProgress(report);
        console.log(`[Edge AI] Loading model: ${report.text}`);
      },
    });

    isModelLoading = false;
    console.log('[Edge AI] Model loaded successfully.');
    return true;
  } catch (error) {
    console.error('[Edge AI] Failed to load model:', error);
    isModelLoading = false;
    edgeLLM = null;
    return false;
  }
}

/**
 * Get an AI response using Edge AI (with Groq fallback).
 *
 * @param {string} prompt — The user's message
 * @param {string} systemPrompt — System instructions
 * @param {Array} conversationHistory — Previous messages [{role, content}]
 * @returns {Promise<string>}
 */
export async function askEdgeAI(prompt, systemPrompt = '', conversationHistory = []) {
  // Try Edge AI first
  if (edgeLLM) {
    try {
      const messages = [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        ...conversationHistory.map(m => ({ role: m.role === 'oracle' ? 'assistant' : m.role, content: m.content || m.text })),
        { role: 'user', content: prompt },
      ];

      const response = await edgeLLM.chat.completions.create({
        messages,
        temperature: 0.85,
        max_tokens: 300,
        stream: false,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.warn('[Edge AI] Inference failed, falling back to Groq:', error);
    }
  }

  // Fallback to Groq API
  return await fallbackToGroq(prompt, systemPrompt, conversationHistory);
}

/**
 * Generate affirmations using Edge AI (with Groq fallback).
 */
export async function generateAffirmationsEdge(promptText) {
  const systemPrompt = 'You are an affirmation generator. Generate exactly 3 short, warm, first-person present-tense affirmations. Each under 15 words. Return as a numbered list.';

  if (edgeLLM) {
    try {
      const response = await edgeLLM.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: promptText },
        ],
        temperature: 0.8,
        max_tokens: 200,
        stream: false,
      });
      return response.choices[0].message.content;
    } catch {
      // Fall through to Groq
    }
  }

  return await fallbackToGroq(promptText, systemPrompt, []);
}

/**
 * Extract user memory / psychological profile using Edge AI.
 */
export async function extractUserMemoryEdge(conversationText, currentMemory = '') {
  const systemPrompt = `You are a psychological data extractor. Review the conversation transcript and update the user's Long-Term Dossier. Focus on persistent traits, anxieties, coping mechanisms, and life events. Output a concise bulleted list in third person. Under 150 words.

Current Dossier: ${currentMemory || 'Empty'}`;

  if (edgeLLM) {
    try {
      const response = await edgeLLM.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Conversation Transcript:\n${conversationText}` },
        ],
        temperature: 0.3,
        max_tokens: 300,
        stream: false,
      });
      return response.choices[0].message.content.trim();
    } catch {
      // Fall through
    }
  }

  return await fallbackToGroq(conversationText, systemPrompt, []);
}

/**
 * Generate a meditation script using Edge AI.
 */
export async function generateMeditationEdge(promptText) {
  const systemPrompt = 'You are a master meditation guide. Write warm, flowing spoken meditation scripts. Include pacing cues in brackets like [pause] or [breathe]. Under 400 words.';

  if (edgeLLM) {
    try {
      const response = await edgeLLM.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: promptText },
        ],
        temperature: 0.8,
        max_tokens: 500,
        stream: false,
      });
      return response.choices[0].message.content;
    } catch {
      // Fall through
    }
  }

  return await fallbackToGroq(promptText, systemPrompt, []);
}

/**
 * Get the current Edge AI status.
 */
export function getEdgeAIStatus() {
  return {
    available: !!edgeLLM,
    loading: isModelLoading,
    progress: modelLoadProgress,
    webgpuSupported: !!navigator.gpu,
    modelName: EDGE_MODEL,
  };
}

/**
 * Unload the Edge AI model to free memory.
 */
export function unloadEdgeLLM() {
  if (edgeLLM) {
    edgeLLM = null;
    modelLoadProgress = 0;
    console.log('[Edge AI] Model unloaded.');
  }
}

/* ----------------------------------------------------------------------- */
/*  GROQ FALLBACK                                                          */
/* ----------------------------------------------------------------------- */

async function fallbackToGroq(prompt, systemPrompt, conversationHistory) {
  const API_URL = '/api/groq';

  const messages = [
    ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
    ...conversationHistory.map(m => ({ role: m.role === 'oracle' ? 'assistant' : m.role, content: m.content || m.text })),
    { role: 'user', content: prompt },
  ];

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages,
      temperature: 0.85,
      max_tokens: 300,
    }),
  });

  const data = await response.json();
  if (!data.choices) throw new Error('Groq fallback also failed: ' + (data.error?.message || 'Unknown error'));
  return data.choices[0].message.content;
}
