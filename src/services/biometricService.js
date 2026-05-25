/**
 * Wearable Biometric Service — Web Bluetooth HRV / Heart Rate integration
 *
 * Connects to BLE heart rate monitors (chest straps, armbands, some watches)
 * and derives real-time HRV from RR interval data.
 *
 * Chrome/Edge only. Requires user gesture to initiate pairing.
 * Automatically suggests audio modes based on biometric state.
 */

let bleDevice = null;
let hrCharacteristic = null;
let rrCharacteristic = null;
let isListening = false;

// State
let currentHR = 0;
let rrIntervals = [];
let hrvScore = null; // RMSSD-derived HRV score (0-100)
let onHRVUpdate = null;

const MAX_RR_STORAGE = 60; // Keep last 60 RR intervals for HRV calc

/**
 * Check if Web Bluetooth is available.
 */
export function isBluetoothAvailable() {
  return !!navigator.bluetooth;
}

/**
 * Scan and connect to a heart rate monitor.
 * Returns true if successful.
 */
export async function connectHeartRateMonitor() {
  if (!isBluetoothAvailable()) {
    console.warn('[Biometric] Web Bluetooth not available. Use Chrome/Edge.');
    return { success: false, error: 'Web Bluetooth not available in this browser.' };
  }

  if (isListening) {
    await disconnectHeartRateMonitor();
  }

  try {
    bleDevice = await navigator.bluetooth.requestDevice({
      filters: [{ services: ['heart_rate'] }],
      optionalServices: ['heart_rate'],
    });

    const server = await bleDevice.gatt.connect();
    const hrService = await server.getPrimaryService('heart_rate');

    // Heart Rate Measurement characteristic (notifications)
    try {
      hrCharacteristic = await hrService.getCharacteristic('heart_rate_measurement');
      hrCharacteristic.addEventListener('characteristicvaluechanged', handleHRUpdate);
      await hrCharacteristic.startNotifications();
    } catch {
      console.warn('[Biometric] HR measurement characteristic not available.');
    }

    isListening = true;
    console.log('[Biometric] Connected to heart rate monitor.');
    return { success: true };
  } catch (error) {
    console.error('[Biometric] Connection failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Disconnect from the heart rate monitor.
 */
export async function disconnectHeartRateMonitor() {
  isListening = false;

  if (hrCharacteristic) {
    try {
      await hrCharacteristic.stopNotifications();
    } catch {}
    hrCharacteristic.removeEventListener('characteristicvaluechanged', handleHRUpdate);
    hrCharacteristic = null;
  }

  if (bleDevice && bleDevice.gatt.connected) {
    bleDevice.gatt.disconnect();
  }
  bleDevice = null;
  currentHR = 0;
  rrIntervals = [];
  hrvScore = null;
  console.log('[Biometric] Disconnected from heart rate monitor.');
}

/**
 * Handle incoming heart rate data.
 */
function handleHRUpdate(event) {
  const value = event.target.value;
  if (!value) return;

  // Parse Heart Rate Measurement flag (first byte)
  const flags = value.getUint8(0);
  const hrValue = flags & 0x01
    ? value.getUint16(1, true)  // 16-bit
    : value.getUint8(1);         // 8-bit

  currentHR = hrValue;

  // Parse RR intervals if present (Energy Expended field exists)
  if (flags & 0x10) {
    // RR-Interval data starts after HR + Energy Expended fields
    let offset = flags & 0x01 ? 4 : 3; // Skip HR (2 or 1 bytes) + Energy Expended (2 bytes)

    while (offset + 1 < value.byteLength) {
      const rrInterval = value.getUint16(offset, true) / 1024; // Convert to seconds
      rrIntervals.push(rrInterval);

      // Keep only the last N intervals
      if (rrIntervals.length > MAX_RR_STORAGE) {
        rrIntervals.shift();
      }

      offset += 2;
    }

    // Calculate HRV from RR intervals
    calculateHRV();
  }

  // Notify UI updates
  if (onHRVUpdate) {
    onHRVUpdate({
      heartRate: currentHR,
      hrvScore: hrvScore,
      suggestedMode: getSuggestedAudioMode(),
    });
  }
}

/**
 * Calculate HRV (RMSSD) from RR intervals.
 * Maps to 0-100 scale for UI display.
 */
function calculateHRV() {
  if (rrIntervals.length < 4) {
    hrvScore = null;
    return;
  }

  // Calculate successive differences
  const diffs = [];
  for (let i = 1; i < rrIntervals.length; i++) {
    diffs.push(rrIntervals[i] - rrIntervals[i - 1]);
  }

  // RMSSD
  const sumSq = diffs.reduce((sum, d) => sum + d * d, 0);
  const rmssd = Math.sqrt(sumSq / diffs.length);

  // Map RMSSD (typically 20-100ms) to 0-100 scale
  // RMSSD < 20ms = very stressed (score 0-20)
  // RMSSD 40-60ms = moderate (score 40-70)
  // RMSSD > 80ms = highly relaxed (score 80-100)
  hrvScore = Math.min(100, Math.max(0, Math.round((rmssd * 1000 - 20) / 80 * 100)));
}

/**
 * Suggest an audio mode based on biometric state.
 */
function getSuggestedAudioMode() {
  if (hrvScore === null || currentHR === 0) return null;

  // High HR + low HRV = stressed/anxious → Zen
  if (currentHR > 90 && hrvScore < 30) return 'Zen';

  // Moderate HR + moderate HRV = needs focus → Theta
  if (currentHR > 75 && hrvScore < 50) return 'Theta';

  // Normal HR + moderate HRV = good for work → Alpha
  if (currentHR >= 60 && currentHR <= 85 && hrvScore >= 40 && hrvScore <= 70) return 'Alpha';

  // Low HR + high HRV = relaxed and ready for peak → Gamma
  if (currentHR < 70 && hrvScore > 60) return 'Gamma';

  return null;
}

/**
 * Register a callback for HRV updates.
 * Callback receives: { heartRate, hrvScore, suggestedMode }
 */
export function onBiometricUpdate(callback) {
  onHRVUpdate = callback;
}

/**
 * Get the current biometric state.
 */
export function getBiometricState() {
  return {
    isConnected: isListening,
    heartRate: currentHR,
    hrvScore: hrvScore,
    suggestedMode: getSuggestedAudioMode(),
    rrIntervalCount: rrIntervals.length,
    webBluetoothAvailable: isBluetoothAvailable(),
  };
}

/**
 * Log a biometric snapshot to localStorage for history.
 */
export function logBiometricSnapshot() {
  if (currentHR === 0) return;

  try {
    const history = JSON.parse(localStorage.getItem('lumina_biometric_history') || '[]');
    history.push({
      heartRate: currentHR,
      hrvScore: hrvScore,
      suggestedMode: getSuggestedAudioMode(),
      timestamp: Date.now(),
      date: new Date().toISOString().split('T')[0],
    });

    // Keep last 200 snapshots
    if (history.length > 200) history.splice(0, history.length - 200);
    localStorage.setItem('lumina_biometric_history', JSON.stringify(history));
  } catch (e) {
    console.error('[Biometric] Failed to log snapshot:', e);
  }
}
