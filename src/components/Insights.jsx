import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Database, Award } from 'lucide-react';
import EvolutionReport from './EvolutionReport';
import DataBackupPanel from './DataBackupPanel';
import HabitProgress from './HabitProgress';

/**
 * Insights page — combines Evolution Report, Habit Progress, and Data Backup.
 */
export default function Insights() {
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
          <BarChart3 size={32} /> Insights
        </h1>
        <p>Your evolution data, progress tree, and backup controls.</p>
      </div>

      {/* Habit Progress */}
      <HabitProgress />

      {/* Evolution Report */}
      <EvolutionReport />

      {/* Data Backup */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: '24px',
        padding: '8px',
        border: '1px solid var(--glass-border)',
      }}>
        <DataBackupPanel />
      </div>
    </motion.div>
  );
}
