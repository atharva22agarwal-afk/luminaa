import React from 'react';
import { motion } from 'framer-motion';
import { Music, Sparkles } from 'lucide-react';
import AudioLayerMixer from './AudioLayerMixer';
import MeditationScripts from './MeditationScripts';

/**
 * Focus Lab — combines the Audio Layer Mixer and AI Meditation Scripts.
 * Users build their perfect focus session: layered soundscape + guided meditation.
 */
export default function FocusLab() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '900px', margin: '0 auto' }}
    >
      {/* Header */}
      <div className="divine-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Music size={32} /> Focus Lab
        </h1>
        <p>Build your perfect soundscape and generate guided meditations.</p>
      </div>

      {/* Audio Layer Mixer */}
      <AudioLayerMixer />

      {/* AI Meditation Scripts */}
      <MeditationScripts />
    </motion.div>
  );
}
