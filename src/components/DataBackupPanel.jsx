import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Upload, Database, X, Check, AlertTriangle } from 'lucide-react';

const ALL_STORAGE_KEYS = [
  'lumina_journal_entries',
  'lumina_affirmations',
  'lumina_daily_affirmation_index',
  'lumina_affirmation_last_visit',
  'lumina_affirmation_streak',
  'lumina_primary_intention',
  'lumina_anchored_intention',
  'lumina_daily_intention',
  'lumina_timeline_records',
  'lumina_vision_board',
  'lumina_frequency_history',
  'lumina_long_term_memory',
  'lumina_oracle_temp_chat',
  'lumina_user_name',
  'lumina_mood_history',
  'lumina_reminder_time',
  'lumina_activity_log',
];

/**
 * Data Export/Backup System — one-click JSON export + import restore.
 * Solves the localStorage-only limitation by enabling full data portability.
 */
export default function DataBackupPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState(null); // 'exporting' | 'exported' | 'importing' | 'imported' | 'error'
  const [message, setMessage] = useState('');
  const fileInputRef = useRef(null);

  const handleExport = useCallback(async () => {
    setStatus('exporting');
    setMessage('');

    try {
      const backup = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        app: 'lumina-hyper',
        data: {},
      };

      ALL_STORAGE_KEYS.forEach(key => {
        try {
          const value = localStorage.getItem(key);
          if (value !== null) {
            // Try to parse JSON so the export is human-readable
            try {
              backup.data[key] = JSON.parse(value);
            } catch {
              backup.data[key] = value; // Raw string (unlikely)
            }
          }
        } catch (e) {
          console.warn(`Failed to read ${key}:`, e);
        }
      });

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const dateStr = new Date().toISOString().split('T')[0];
      link.download = `lumina-backup-${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setStatus('exported');
      setMessage(`Backup exported with ${Object.keys(backup.data).length} data keys.`);
      setTimeout(() => { setStatus(null); setMessage(''); }, 4000);
    } catch (e) {
      console.error('Export failed:', e);
      setStatus('error');
      setMessage('Export failed. Check the console for details.');
      setTimeout(() => { setStatus(null); setMessage(''); }, 5000);
    }
  }, []);

  const handleImport = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus('importing');
    setMessage('');

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const backup = JSON.parse(event.target.result);

        // Validate
        if (!backup.data || typeof backup.data !== 'object') {
          throw new Error('Invalid backup format: no data object found.');
        }

        // Confirm before overwriting
        const keyCount = Object.keys(backup.data).length;
        const confirmed = window.confirm(
          `This will restore ${keyCount} data keys from your backup.\n\nCurrent data will be overwritten. Continue?`
        );
        if (!confirmed) {
          setStatus(null);
          return;
        }

        let restoredCount = 0;
        Object.entries(backup.data).forEach(([key, value]) => {
          try {
            const serialized = typeof value === 'string' ? value : JSON.stringify(value);
            localStorage.setItem(key, serialized);
            restoredCount++;
          } catch (err) {
            console.warn(`Failed to restore ${key}:`, err);
          }
        });

        setStatus('imported');
        setMessage(`Successfully restored ${restoredCount} keys. Refresh the page to apply.`);

        // Dispatch events so live components pick up changes
        window.dispatchEvent(new Event('storage'));
        setTimeout(() => { setStatus(null); setMessage(''); }, 8000);
      } catch (e) {
        console.error('Import failed:', e);
        setStatus('error');
        setMessage(`Import failed: ${e.message}`);
        setTimeout(() => { setStatus(null); setMessage(''); }, 6000);
      }
    };
    reader.onerror = () => {
      setStatus('error');
      setMessage('Failed to read the backup file.');
      setTimeout(() => { setStatus(null); setMessage(''); }, 5000);
    };
    reader.readAsText(file);
    // Reset file input
    e.target.value = '';
  }, []);

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 20px',
          borderRadius: '16px',
          border: '1px solid var(--glass-border)',
          background: isOpen ? 'var(--sage-muted)' : 'var(--bg-element)',
          color: 'var(--text-main)',
          fontWeight: 600,
          fontSize: '0.8rem',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
        }}
      >
        <Database size={16} />
        Backup & Restore
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              background: 'var(--bg-card)',
              borderRadius: '20px',
              border: '1px solid var(--glass-border)',
              padding: '28px',
              overflow: 'hidden',
            }}
          >
            {/* Close */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontWeight: 400, fontStyle: 'italic', color: 'var(--text-main)' }}>
                Data Management
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}
                aria-label="Close backup panel"
              >
                <X size={18} />
              </button>
            </div>

            {/* Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              {/* Export */}
              <button
                onClick={handleExport}
                disabled={status === 'exporting'}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '24px 16px',
                  borderRadius: '16px',
                  border: '1px solid var(--glass-border)',
                  background: 'var(--bg-element)',
                  color: 'var(--text-main)',
                  cursor: status === 'exporting' ? 'wait' : 'pointer',
                  opacity: status === 'exporting' ? 0.6 : 1,
                  transition: 'all 0.3s ease',
                }}
              >
                {status === 'exporting' ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                    <Download size={24} />
                  </motion.div>
                ) : status === 'exported' ? (
                  <Check size={24} color="#4CAF50" />
                ) : (
                  <Download size={24} />
                )}
                <span style={{ fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Export Backup
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                  Download all data as JSON
                </span>
              </button>

              {/* Import */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={status === 'importing'}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '24px 16px',
                  borderRadius: '16px',
                  border: '1px solid var(--glass-border)',
                  background: 'var(--bg-element)',
                  color: 'var(--text-main)',
                  cursor: status === 'importing' ? 'wait' : 'pointer',
                  opacity: status === 'importing' ? 0.6 : 1,
                  transition: 'all 0.3s ease',
                }}
              >
                {status === 'importing' ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                    <Upload size={24} />
                  </motion.div>
                ) : status === 'imported' ? (
                  <Check size={24} color="#4CAF50" />
                ) : (
                  <Upload size={24} />
                )}
                <span style={{ fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Import Backup
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                  Restore from JSON file
                </span>
              </button>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                style={{ display: 'none' }}
              />
            </div>

            {/* Status Message */}
            {message && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: status === 'error'
                    ? 'rgba(255, 107, 107, 0.1)'
                    : status === 'exported' || status === 'imported'
                    ? 'rgba(76, 175, 80, 0.1)'
                    : 'var(--bg-element)',
                  border: status === 'error'
                    ? '1px solid rgba(255, 107, 107, 0.3)'
                    : '1px solid var(--glass-border)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                {status === 'error' ? (
                  <AlertTriangle size={16} color="#FF6B6B" />
                ) : status === 'exported' || status === 'imported' ? (
                  <Check size={16} color="#4CAF50" />
                ) : null}
                <span style={{ fontSize: '0.8rem', color: status === 'error' ? '#FF6B6B' : 'var(--text-main)' }}>
                  {message}
                </span>
              </motion.div>
            )}

            {/* Data Summary */}
            <DataSummary />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/**
 * Shows a summary of stored data counts.
 */
function DataSummary() {
  const [counts, setCounts] = useState({});

  React.useEffect(() => {
    const c = {};
    try {
      const journal = JSON.parse(localStorage.getItem('lumina_journal_entries') || '[]');
      c.journal = journal.length;
    } catch { c.journal = 0; }
    try {
      const affs = JSON.parse(localStorage.getItem('lumina_affirmations') || '[]');
      c.affirmations = affs.length;
    } catch { c.affirmations = 0; }
    try {
      const visions = JSON.parse(localStorage.getItem('lumina_vision_board') || '[]');
      c.visionBoard = visions.length;
    } catch { c.visionBoard = 0; }
    try {
      const freqs = JSON.parse(localStorage.getItem('lumina_frequency_history') || '[]');
      c.frequency = freqs.length;
    } catch { c.frequency = 0; }
    const intention = localStorage.getItem('lumina_primary_intention');
    c.intention = intention ? true : false;
    setCounts(c);
  }, []);

  return (
    <div style={{
      borderTop: '1px solid var(--glass-border)',
      paddingTop: '16px',
    }}>
      <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '10px' }}>
        Current Data
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {Object.entries(counts).map(([key, val]) => (
          <span
            key={key}
            style={{
              padding: '4px 10px',
              borderRadius: '8px',
              background: 'var(--bg-element)',
              fontSize: '0.7rem',
              color: 'var(--text-muted)',
            }}
          >
            {key}: {typeof val === 'boolean' ? (val ? '1' : '0') : val}
          </span>
        ))}
      </div>
    </div>
  );
}
