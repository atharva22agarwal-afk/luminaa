import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Cloud, Wind, Droplets, Music, Waves } from 'lucide-react';
import { audioEngine } from '../audioEngine';

const LAYERS = [
  {
    id: 'rain',
    label: 'Rain',
    icon: Droplets,
    description: 'Gentle rainfall for grounding',
    defaultVolume: 0.15,
  },
  {
    id: 'bowls',
    label: 'Tibetan Bowls',
    icon: Wind,
    description: 'Harmonic resonance for depth',
    defaultVolume: 0.08,
  },
  {
    id: 'pads',
    label: 'Ambient Pads',
    icon: Cloud,
    description: 'Warm drone for atmosphere',
    defaultVolume: 0.06,
  },
];

/**
 * Audio Layer Mixer — lets users blend procedural soundscapes
 * on top of the binaural beat engine.
 */
export default function AudioLayerMixer() {
  const [activeLayers, setActiveLayers] = useState({});

  // Sync with audio engine on mount
  useEffect(() => {
    const states = audioEngine.getLayerStates();
    setActiveLayers(states);
  }, []);

  const toggleLayer = useCallback((layerId) => {
    const layer = activeLayers[layerId];
    if (layer?.active) {
      audioEngine.stopLayer(layerId);
      setActiveLayers(prev => ({
        ...prev,
        [layerId]: { ...prev[layerId], active: false },
      }));
    } else {
      const defaultVol = LAYERS.find(l => l.id === layerId)?.defaultVolume || 0.1;
      audioEngine.startLayer(layerId, defaultVol);
      setActiveLayers(prev => ({
        ...prev,
        [layerId]: { active: true, volume: defaultVol },
      }));
    }
  }, [activeLayers]);

  const setLayerVolume = useCallback((layerId, volume) => {
    audioEngine.setLayerVolume(layerId, volume);
    setActiveLayers(prev => ({
      ...prev,
      [layerId]: { ...prev[layerId], volume: parseFloat(volume) },
    }));
  }, []);

  const anyActive = Object.values(activeLayers).some(l => l.active);

  return (
    <div style={{
      background: 'var(--bg-card)',
      borderRadius: '24px',
      padding: '24px',
      border: '1px solid var(--glass-border)',
      boxShadow: 'var(--card-shadow)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <Waves size={18} color="var(--sage-green)" />
        <h3 style={{
          fontSize: '0.8rem',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          fontWeight: 700,
          color: 'var(--text-main)',
        }}>
          Soundscape Mixer
        </h3>
        {anyActive && (
          <span style={{
            marginLeft: 'auto',
            fontSize: '0.6rem',
            padding: '3px 8px',
            borderRadius: '8px',
            background: 'var(--sage-muted)',
            color: 'var(--sage-deep)',
            fontWeight: 600,
          }}>
            {Object.values(activeLayers).filter(l => l.active).length} layers active
          </span>
        )}
      </div>

      {/* Layer Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {LAYERS.map((layer) => {
          const Icon = layer.icon;
          const isActive = activeLayers[layer.id]?.active;
          const volume = activeLayers[layer.id]?.volume || layer.defaultVolume;

          return (
            <motion.div
              key={layer.id}
              layout
              style={{
                display: 'grid',
                gridTemplateColumns: '40px 1fr 60px',
                alignItems: 'center',
                gap: '14px',
                padding: '14px 16px',
                borderRadius: '16px',
                background: isActive ? 'var(--bg-element)' : 'transparent',
                border: isActive ? '1px solid var(--glass-border)' : '1px solid transparent',
                transition: 'all 0.3s ease',
              }}
            >
              {/* Toggle Button */}
              <button
                onClick={() => toggleLayer(layer.id)}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  border: 'none',
                  background: isActive ? 'var(--sage-green)' : 'var(--bg-element)',
                  color: isActive ? 'white' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                aria-label={`Toggle ${layer.label} layer`}
                aria-pressed={isActive}
              >
                <Icon size={18} />
              </button>

              {/* Label + Volume Slider */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div>
                  <span style={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                  }}>
                    {layer.label}
                  </span>
                  <span style={{
                    fontSize: '0.65rem',
                    color: 'var(--text-muted)',
                    marginLeft: '8px',
                  }}>
                    {layer.description}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="0.5"
                  step="0.01"
                  value={volume}
                  onChange={(e) => setLayerVolume(layer.id, e.target.value)}
                  disabled={!isActive}
                  style={{
                    width: '100%',
                    height: '4px',
                    borderRadius: '2px',
                    accentColor: 'var(--sage-green)',
                    opacity: isActive ? 1 : 0.3,
                    cursor: isActive ? 'pointer' : 'default',
                  }}
                  aria-label={`${layer.label} volume`}
                />
              </div>

              {/* Volume Readout */}
              <div style={{
                textAlign: 'right',
                fontSize: '0.7rem',
                fontWeight: 700,
                color: isActive ? 'var(--sage-green)' : 'var(--text-muted)',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {Math.round(volume * 100)}%
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
