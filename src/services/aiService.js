/**
 * AI Service for Lumina
 * Handles communication with Groq API (Llama 3) for spiritual guidance, 
 * manifesting insights, and journaling reflections.
 */

import wisdomVault from '../data/wisdomVault.json';

const API_KEY = import.meta.env.VITE_GROQ_KEY;
const API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "llama-3.1-8b-instant";

/**
 * Sends a prompt to the Groq API and returns the generated text.
 * @param {string} prompt - The prompt to send to the AI.
 * @param {Array} history - Optional conversation history (formatted as strings).
 * @returns {Promise<string>} - The AI's response text.
 */
/**
 * The Oracle AI — an empathetic companion that listens deeply.
 * 
 * PERSONALITY RULES:
 * 1. Ask at most ONE gentle question per response (never multiple).
 * 2. Always validate the user's feelings FIRST before anything else.
 * 3. After 2-3 exchanges, shift from listening to gentle guidance.
 * 4. Feel like a warm friend who genuinely cares, not a therapist.
 * 5. Full conversation history is sent for continuity.
 */
export const askOracleAI = async (prompt, conversationMessages = [], userContext = {}) => {
  if (!API_KEY) {
    throw new Error("Groq API Key is not configured in .env");
  }

  const { userName = 'Friend', intention, affirmation, longTermMemory } = userContext;

  try {
    // 🧠 retrieval-augmented generation (RAG) - Wisdom Vault Scan
    let ragContext = "";
    const lowerPrompt = prompt.toLowerCase();
    
    for (const [category, items] of Object.entries(wisdomVault)) {
      if (lowerPrompt.includes(category)) {
        ragContext += `[${category.toUpperCase()} TECHNIQUES & WISDOM]:\n` + items.map(i => `- ${i}`).join("\n") + "\n\n";
      }
    }

    const systemContent = `You are the Oracle of Lumina — a deeply empathetic, warm companion. You are NOT a therapist or a chatbot. You are a trusted friend who genuinely cares.

CORE PERSONALITY:
- You LISTEN first. Always validate what the user is feeling before saying anything else.
- You speak in 2-4 warm, natural sentences. Never write essays.
- You ask AT MOST one gentle follow-up question per message. NEVER ask multiple questions.
- After a few exchanges, you naturally shift from listening to offering gentle, practical wisdom or encouragement.
- You remember everything said in this conversation. Reference earlier things they shared to show you were listening.
- You sometimes share a calming thought, a perspective shift, or a small actionable suggestion — like a good friend would.
- You make the user feel like there IS someone who cares. You are that someone.
- **CRITICAL**: If the user explicitly asks for help with stress, anxiety, or feeling overwhelmed, gently suggest a specific, actionable stress-relieving or somatic exercise (such as the 4-7-8 breathing technique, 5-4-3-2-1 grounding method, or progressive muscle relaxation). Guide them through it warmly.

CONVERSATION FLOW:
- First 1-2 messages: Focus entirely on listening. "That sounds really heavy..." / "I hear you..."
- Messages 3-4: Start gently reflecting back what you've heard. Offer a small insight or reframe.
- Messages 5+: Become more of a guide. Offer gentle suggestions, coping ideas, or simply affirm their strength.

WHAT TO NEVER DO:
- Never ask more than one question in a single response.
- Never give a list of generic advice.
- Never sound clinical, robotic, or overly formal.
- Never dismiss or minimize their feelings.
- Never say "I'm an AI" or break character.

CONTEXT (use naturally, don't force):
- User's name: ${userName}
- Their active intention: ${intention || 'Not set'}
- Their affirmation: ${affirmation || 'Not set'}
${longTermMemory ? `- CORE MEMORY DOSSIER (You MUST know this about them): \n${longTermMemory}` : ''}
${ragContext ? `\n--- WISDOM VAULT (RETRIEVED KNOWLEDGE) ---\nThe user's prompt matched topics in your Wisdom Vault. You MUST seamlessly weave one of the following specific techniques or quotes into your response as guidance:\n${ragContext}` : ''}`;

    // Build the messages array with full conversation history
    const messages = [
      { role: 'system', content: systemContent },
      ...conversationMessages,
      { role: 'user', content: prompt }
    ];

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: messages,
        temperature: 0.85,
        max_tokens: 300
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "Quantum connection failed");
    if (!data.choices) throw new Error("The Oracle remained silent.");
    return data.choices[0].message.content;
  } catch (error) {
    console.error("aiService - askOracleAI Error:", error);
    throw error;
  }
};

export const getConversationSummary = async (conversationText) => {
  if (!API_KEY) throw new Error("Groq API Key is not configured");

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a compassionate summarizer. Summarize in one brief, warm sentence (15 words max). No questions or advice.'
        },
        { role: 'user', content: conversationText }
      ]
    })
  });
  const data = await response.json();
  if (!data.choices) throw new Error("Failed to summarize");
  return data.choices[0].message.content;
};

export const extractUserMemory = async (conversationText, currentMemory = "") => {
  if (!API_KEY) throw new Error("Groq API Key is not configured");

  const systemContent = `You are a psychological data extractor for the Lumina AI Oracle.
Your task is to review a recent conversation transcript and update the user's "Long-Term Dossier".
Focus on persistent traits: reoccurring anxieties, personal triggers, positive coping mechanisms they prefer, major life events mentioned, and their evolving state of mind.
Output an updated, highly concise bulleted list written in the third person ("User is...").
Do NOT write prose. DO NOT offer advice. Only output the exact updated bulleted text. Keep the entire list under 150 words.

Current Dossier:
${currentMemory || "Empty - this is a new relationship."}`;

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages: [
        { role: 'system', content: systemContent },
        { role: 'user', content: `Conversation Transcript:\n${conversationText}` }
      ],
      temperature: 0.3, // High precision
      max_tokens: 300
    })
  });
  
  const data = await response.json();
  if (!data.choices) throw new Error("Failed to extract memory");
  return data.choices[0].message.content.trim();
};

export const generateAffirmations = async (promptText) => {
  if (!API_KEY) throw new Error("Groq API Key is not configured");
  
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages: [
        { role: 'system', content: 'You are an affirmation generator.' },
        { role: 'user', content: promptText }
      ]
    })
  });
  const data = await response.json();
  if (!data.choices) throw new Error("Failed to generate affirmations");
  return data.choices[0].message.content;
};

export const getJournalInsight = async (entry) => {
  if (!API_KEY) throw new Error("Groq API Key is not configured");

  // Spin off the mood scorer silently in the background
  scoreUserFrequency(entry).catch(err => console.log("Silent frequency score err", err));

  try {
    // STEP 1: The Generator Model
    const generatorPrompt = `You are a visionary insight generator. The user will provide a spiritual or emotional journal entry. You must generate exactly 3 distinct, radically empathetic and profound 1-sentence insights about this entry. Do NOT write anything else. Format exactly like this:
1. [First insight]
2. [Second insight]
3. [Third insight]`;

    const genRes = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          { role: 'system', content: generatorPrompt },
          { role: 'user', content: `Journal Entry: "${entry}"` }
        ],
        temperature: 0.8,
        max_tokens: 200
      })
    });
    
    const genData = await genRes.json();
    if (!genData.choices) throw new Error("Generator failed");
    const rawOptions = genData.choices[0].message.content;
    
    // STEP 2: The Critic Engine
    const criticPrompt = `You are an elite Quality Control Critic for a mental wellness app.
Review the following 3 AI-generated insights for the user's journal entry.
Evaluate them and select the absolute BEST one based on:
- Empathy (Does it feel incredibly human and warm?)
- Profoundness (Does it provoke deep realization?)
- Lack of Cliches (Is it unique, avoiding generic toxic positivity?)

User's Journal Entry: "${entry}"

Generated Options:
${rawOptions}

OUTPUT ONLY the exact text of the winning insight. Do NOT output numbers, bullet points, explanations, or quotes. Just the raw, perfect sentence.`;

    const criticRes = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
      body: JSON.stringify({
        model: DEFAULT_MODEL, 
        messages: [
          { role: 'system', content: 'You are a strict validation critic. You only output exactly what is requested, nothing more.' },
          { role: 'user', content: criticPrompt }
        ],
        temperature: 0.2, // Low temperature for strict grading
        max_tokens: 100
      })
    });

    const criticData = await criticRes.json();
    if (!criticData.choices) throw new Error("Critic failed");
    return criticData.choices[0].message.content.trim();
    
  } catch (error) {
    console.error("Critic Engine Failed, falling back to basic insight:", error);
    // Safe fallback if the complex dual-call fails perfectly
    return await askOracleAI(`Analyze this journal entry and provide a single, profound, encouraging sentence: "${entry}"`);
  }
};

/**
 * Sends a simple prompt to the Groq API and returns the generated text.
 * @param {string} prompt - The prompt to send to the AI.
 * @returns {Promise<string>} - The AI's response text.
 */
export const askGroq = async (prompt) => {
  if (!API_KEY) {
    throw new Error("Groq API Key is not configured in .env");
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          { role: 'system', content: 'You are a compassionate, warm AI companion. Keep responses brief: 1-3 sentences maximum. Acknowledge emotions gently. No jargon or unsolicited advice.' },
          { role: 'user', content: prompt }
        ]
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "API request failed");
    if (!data.choices) throw new Error("No response received from AI");
    return data.choices[0].message.content;
  } catch (error) {
    console.error("aiService - askGroq Error:", error);
    throw error;
  }
};

export const scoreUserFrequency = async (text) => {
  if (!API_KEY) return;
  try {
    const prompt = `You are an elite clinical sentiment analyzer for a mental wellness app.
Read the user's text and evaluate their fundamental emotional frequency (vibration/alignment) on a scale strictly from 1 to 100.
1 = Deep despair, severe anxiety, extreme negativity.
50 = Normal, neutral, grounded.
100 = Absolute joy, extreme gratitude, peak alignment/enlightenment.
OUTPUT ONLY a single integer from 1 to 100. Do not output any words or punctuation.

User text: "${text}"`;

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
      body: JSON.stringify({
        model: DEFAULT_MODEL, 
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 5
      })
    });
    
    if(!res.ok) return;
    const data = await res.json();
    const rawMatch = data.choices[0].message.content.match(/\d+/);
    
    if (rawMatch) {
      const score = Math.min(100, Math.max(1, parseInt(rawMatch[0], 10)));
      const history = JSON.parse(localStorage.getItem('lumina_frequency_history') || '[]');
      
      const today = new Date().toLocaleDateString();
      const existingIdx = history.findIndex(h => new Date(h.date).toLocaleDateString() === today);
      
      if (existingIdx !== -1) {
        // Average it with today's existing score if they write multiple entries
        history[existingIdx].score = Math.floor((history[existingIdx].score + score) / 2);
      } else {
        history.push({ date: new Date().toISOString(), score });
        if (history.length > 30) history.shift();
      }
      
      localStorage.setItem('lumina_frequency_history', JSON.stringify(history));
      window.dispatchEvent(new Event('lumina_frequency_updated'));
    }
  } catch (err) {
    console.error("Frequency analysis silently failed:", err);
  }
};
