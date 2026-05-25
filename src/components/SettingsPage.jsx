import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Cpu, Cloud, Heart, Activity, Check, X, RefreshCw, Zap, AlertTriangle, Download } from 'lucide-react';
import { initEdgeLLM, getEdgeAIStatus, unloadEdgeLLM } from '../services/edgeAIService';
import { initCloudSync, isSyncEnabled, setSyncEnabled, pushToCloud, pullFromCloud, getLastSyncTime, getSyncStatus } from '../services/cloudSyncService';
import { connectHeartRateMonitor, disconnectHeartRateMonitor, getBiometricState, isBluetoothAvailable, onBiometricUpdate, logBiometricSnapshot } from '../services/biometricService';
import { LuminaButton } from './LuminaButton';

/**
 * Settings page — Edge AI, Cloud Sync, and Wearable Biometric configuration.
 */
export default function SettingsPage() {
  // Edge AI state
  const [edgeAI, setEdgeAI] = useState(getEdgeAIStatus());
  const [edgeAIProgress, setEdgeAIProgress] = useState(0);
  const [edgeAIMessage, setEdgeAIMessage] = useState('');

  // Cloud Sync state
  const [syncStatus, setSyncStatus] = useState(getSyncStatus());
  const [syncAction, setSyncAction] = useState(null); // 'pushing' | 'pulling' | null
  const [syncResult, setSyncResult] = useState(null);

  // Biometric state
  const [bioState, setBioState] = useState(getBiometricState());
  const [bioConnecting, setBioConnecting] = useState(false);

  useEffect(() => {
    // Listen for biometric updates
    onBiometricUpdate((data) => {
      setBioState(prev => ({
        ...prev,
        ...data,
        isConnected: true,
      }));

      // Log periodic snapshots
      if (data.heartRate > 0 && Math.random() < 0.1) {
        logBiometricSnapshot();
      }
    });

    // Poll biometric state for UI updates
    const interval = setInterval(() => {
      setBioState(getBiometricState());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  /* ---- Edge AI Handlers ---- */
  const handleEnableEdgeAI = async () => {
    setEdgeAIMessage('Initializing Edge AI...');
    const success = await initEdgeLLM((report) => {
      setEdgeAIProgress(report.progress);
      setEdgeAIMessage(report.text);
    });
    setEdgeAI(getEdgeAIStatus());
    if (success) {
      setEdgeAIMessage('Edge AI ready. All Oracle responses now run locally.');
    } else {
      setEdgeAIMessage('Edge AI unavailable. Falling back to Groq API.');
    }
  };

  const handleUnloadEdgeAI = () => {
    unloadEdgeLLM();
    setEdgeAI(getEdgeAIStatus());
    setEdgeAIMessage('Edge AI model unloaded to free memory.');
    setEdgeAIProgress(0);
  };

  /* ---- Cloud Sync Handlers ---- */
  const handleToggleSync = (enabled) => {
    setSyncEnabled(enabled);
    setSyncStatus(getSyncStatus());
  };

  const handlePush = async () => {
    setSyncAction('pushing');
    const result = await pushToCloud();
    setSyncResult(result);
    setSyncAction(null);
    setSyncStatus(getSyncStatus());
    setTimeout(() => setSyncResult(null), 5000);
  };

  const handlePull = async () => {
    setSyncAction('pulling');
    const result = await pullFromCloud();
    setSyncResult(result);
    setSyncAction(null);
    setSyncStatus(getSyncStatus());
    setTimeout(() => setSyncResult(null), 5000);
  };

  /* ---- Biometric Handlers ---- */
  const handleConnectBio = async () => {
    setBioConnecting(true);
    const result = await connectHeartRateMonitor();
    setBioConnecting(false);
    if (!result.success) {
      setBioState(prev => ({ ...prev, connectError: result.error }));
    }
  };

  const handleDisconnectBio = async () => {
    await disconnectHeartRateMonitor();
    setBioState(getBiometricState());
  };

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
          <Settings size={32} /> Settings
        </h1>
        <p>Advanced configuration for Edge AI, cloud sync, and biometrics.</p>
      </div>

      {/* ==================== EDGE AI ==================== */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: '24px',
        padding: '32px',
        border: '1px solid var(--glass-border)',
        boxShadow: 'var(--card-shadow)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <Cpu size={20} color="var(--spectral-glow)" />
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', fontWeight: 400, fontStyle: 'italic', color: 'var(--text-main)' }}>
            Edge AI (On-Device LLM)
          </h2>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.6 }}>
          Run an AI model directly in your browser. Zero API cost, fully private, works offline after the initial download.
          {edgeAI.webgpuSupported
            ? ' WebGPU is supported in your browser.'
            : ' WebGPU is NOT supported — using Chrome/Edge required.'}
        </p>

        {/* Status */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 16px',
          borderRadius: '12px',
          background: edgeAI.available ? 'rgba(76, 175, 80, 0.1)' : edgeAI.loading ? 'rgba(255, 193, 7, 0.1)' : 'var(--bg-element)',
          marginBottom: '16px',
        }}>
          {edgeAI.available ? (
            <Check size={16} color="#4CAF50" />
          ) : edgeAI.loading ? (
            <RefreshCw size={16} className="animate-spin" />
          ) : (
            <AlertTriangle size={16} color="var(--text-muted)" />
          )}
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>
            {edgeAI.available
              ? `Edge AI Active — ${edgeAI.modelName}`
              : edgeAI.loading
              ? `Loading... ${Math.round(edgeAIProgress * 100)}%`
              : 'Edge AI inactive'}
          </span>
        </div>

        {/* Progress bar */}
        {edgeAI.loading && (
          <div style={{
            height: '6px',
            borderRadius: '3px',
            background: 'var(--bg-element)',
            marginBottom: '16px',
            overflow: 'hidden',
          }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${edgeAIProgress * 100}%` }}
              style={{ height: '100%', background: 'var(--spectral-glow)', borderRadius: '3px' }}
            />
          </div>
        )}

        {edgeAIMessage && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px', fontStyle: 'italic' }}>
            {edgeAIMessage}
          </p>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px' }}>
          {!edgeAI.available && !edgeAI.loading && (
            <LuminaButton
              onClick={handleEnableEdgeAI}
              disabled={!edgeAI.webgpuSupported}
              variant="primary"
              icon={Zap}
            >
              Enable Edge AI
            </LuminaButton>
          )}
          {edgeAI.available && (
            <LuminaButton
              onClick={handleUnloadEdgeAI}
              variant="secondary"
              icon={X}
            >
              Unload Model
            </LuminaButton>
          )}
        </div>
      </div>

      {/* ==================== CLOUD SYNC ==================== */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: '24px',
        padding: '32px',
        border: '1px solid var(--glass-border)',
        boxShadow: 'var(--card-shadow)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <Cloud size={20} color="var(--sage-green)" />
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', fontWeight: 400, fontStyle: 'italic', color: 'var(--text-main)' }}>
            Cloud Sync
          </h2>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.6 }}>
          Sync your data across devices via Supabase. Requires a Supabase project and API keys configured in .env.
        </p>

        {/* Status */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 16px',
          borderRadius: '12px',
          background: syncStatus.enabled && syncStatus.configured ? 'rgba(76, 175, 80, 0.1)' : 'var(--bg-element)',
          marginBottom: '16px',
        }}>
          {syncStatus.configured ? (
            syncStatus.enabled ? (
              <Check size={16} color="#4CAF50" />
            ) : (
              <X size={16} color="var(--text-muted)" />
            )
          ) : (
            <AlertTriangle size={16} color="var(--text-muted)" />
          )}
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>
            {syncStatus.configured
              ? syncStatus.enabled
                ? 'Sync Enabled'
                : 'Sync Disabled'
              : 'Supabase not configured'}
          </span>
          {syncStatus.lastSync && (
            <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Last sync: {syncStatus.lastSync.toLocaleString()}
            </span>
          )}
        </div>

        {/* Sync Result */}
        <AnimatePresence>
          {syncResult && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: '10px 14px',
                borderRadius: '10px',
                background: syncResult.success ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 107, 107, 0.1)',
                marginBottom: '16px',
                fontSize: '0.8rem',
                color: syncResult.success ? '#4CAF50' : '#FF6B6B',
              }}
            >
              {syncResult.success
                ? `✓ ${syncResult.synced ? `Pushed ${syncResult.synced} keys` : `Restored ${syncResult.restored} keys`}`
                : `✗ ${syncResult.error}`}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <LuminaButton
            onClick={() => handleToggleSync(!syncStatus.enabled)}
            disabled={!syncStatus.configured}
            variant={syncStatus.enabled ? 'primary' : 'secondary'}
            icon={Cloud}
          >
            {syncStatus.enabled ? 'Disable Sync' : 'Enable Sync'}
          </LuminaButton>

          {syncStatus.enabled && syncStatus.configured && (
            <>
              <LuminaButton
                onClick={handlePush}
                disabled={syncAction === 'pushing'}
                variant="secondary"
                icon={Download}
              >
                {syncAction === 'pushing' ? 'Pushing...' : 'Push to Cloud'}
              </LuminaButton>

              <LuminaButton
                onClick={handlePull}
                disabled={syncAction === 'pulling'}
                variant="secondary"
                icon={RefreshCw}
              >
                {syncAction === 'pulling' ? 'Pulling...' : 'Pull from Cloud'}
              </LuminaButton>
            </>
          )}
        </div>
      </div>

      {/* ==================== BIOMETRICS ==================== */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: '24px',
        padding: '32px',
        border: '1px solid var(--glass-border)',
        boxShadow: 'var(--card-shadow)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <Heart size={20} color="#FF6B6B" />
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', fontWeight: 400, fontStyle: 'italic', color: 'var(--text-main)' }}>
            Wearable Biometric
          </h2>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.6 }}>
          Connect a BLE heart rate monitor to get real-time HRV feedback.
          Lumina will auto-suggest the optimal audio frequency for your current state.
          Chrome/Edge only.
        </p>

        {/* Status */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '12px',
          marginBottom: '16px',
        }}>
          <div style={{
            padding: '16px',
            borderRadius: '16px',
            background: 'var(--bg-element)',
            textAlign: 'center',
          }}>
            <Activity size={18} style={{ marginBottom: '8px', color: bioState.isConnected ? '#4CAF50' : 'var(--text-muted)' }} />
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {bioState.heartRate || '—'}
            </div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>BPM</div>
          </div>

          <div style={{
            padding: '16px',
            borderRadius: '16px',
            background: 'var(--bg-element)',
            textAlign: 'center',
          }}>
            <Zap size={18} style={{ marginBottom: '8px', color: bioState.hrvScore !== null ? 'var(--spectral-glow)' : 'var(--text-muted)' }} />
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {bioState.hrvScore !== null ? bioState.hrvScore : '—'}
            </div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>HRV</div>
          </div>

          <div style={{
            padding: '16px',
            borderRadius: '16px',
            background: 'var(--bg-element)',
            textAlign: 'center',
          }}>
            <Cpu size={18} style={{ marginBottom: '8px', color: bioState.suggestedMode ? 'var(--sage-green)' : 'var(--text-muted)' }} />
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: bioState.suggestedMode ? 'var(--sage-green)' : 'var(--text-muted)' }}>
              {bioState.suggestedMode || '—'}
            </div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Suggest</div>
          </div>
        </div>

        {!bioState.webBluetoothAvailable && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '12px',
            background: 'rgba(255, 193, 7, 0.1)',
            border: '1px solid rgba(255, 193, 7, 0.3)',
            marginBottom: '16px',
            fontSize: '0.8rem',
            color: '#FFC107',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <AlertTriangle size={16} />
            Web Bluetooth unavailable. Use Chrome or Edge on desktop/Android.
          </div>
        )}

        {bioState.connectError && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '12px',
            background: 'rgba(255, 107, 107, 0.1)',
            border: '1px solid rgba(255, 107, 107, 0.3)',
            marginBottom: '16px',
            fontSize: '0.8rem',
            color: '#FF6B6B',
          }}>
            {bioState.connectError}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px' }}>
          {!bioState.isConnected ? (
            <LuminaButton
              onClick={handleConnectBio}
              disabled={bioConnecting || !bioState.webBluetoothAvailable}
              variant="primary"
            >
              <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                {bioConnecting ? <RefreshCw size={16} className="animate-spin" /> : <Heart size={16} />}
                {bioConnecting ? 'Connecting...' : 'Connect HR Monitor'}
              </div>
            </LuminaButton>
          ) : (
            <LuminaButton
              onClick={handleDisconnectBio}
              variant="secondary"
              icon={X}
            >
              Disconnect
            </LuminaButton>
          )}
        </div>
      </div>
    </motion.div>
  );
}
