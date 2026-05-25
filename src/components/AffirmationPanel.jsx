import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';

/**
 * Inline panel for saving custom affirmations.
 * Extracted from App.jsx to improve code organization.
 */
export const AffirmationPanel = React.memo(function AffirmationPanel({ onSave }) {
  const [text, setText] = useState('');

  const save = useCallback(() => {
    if (!text.trim()) return;
    try {
      const saved = JSON.parse(localStorage.getItem('lumina_affirmations') || '[]');
      saved.unshift({
        id: Date.now(),
        text: text.trim(),
        dateCreated: new Date().toLocaleDateString(),
      });
      localStorage.setItem('lumina_affirmations', JSON.stringify(saved));
      setText('');
      onSave();
    } catch (e) {
      console.error('Failed to save affirmation:', e);
    }
  }, [text, onSave]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        save();
      }
    },
    [save]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="affirmation-panel"
    >
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Write your truth here... (Ctrl+Enter to save)"
        autoFocus
        aria-label="New affirmation text"
      />
      <button onClick={save} className="action-btn" disabled={!text.trim()}>
        Save Affirmation
      </button>
    </motion.div>
  );
});
