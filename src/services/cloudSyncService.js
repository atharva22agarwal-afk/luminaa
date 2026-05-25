/**
 * Cloud Sync Service — Supabase-based multi-device persistence
 *
 * Syncs all localStorage data to Supabase for cross-device access.
 * Supports automatic sync, manual pull/push, and conflict resolution.
 *
 * Setup required:
 * 1. Create a Supabase project at https://supabase.com
 * 2. Create a table: lumina_data (id text primary key, value jsonb, user_id text, updated_at timestamptz)
 * 3. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase = null;
const SYNC_KEY = 'lumina_sync_enabled';
const LAST_SYNC_KEY = 'lumina_last_sync_time';

// All localStorage keys to sync
const SYNCED_KEYS = [
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
 * Initialize the Supabase client.
 * Returns true if configured, false if not.
 */
export function initCloudSync() {
  if (supabase) return true;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('[Cloud Sync] Supabase not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env');
    return false;
  }

  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return true;
  } catch (error) {
    console.error('[Cloud Sync] Failed to initialize:', error);
    return false;
  }
}

/**
 * Check if cloud sync is enabled by the user.
 */
export function isSyncEnabled() {
  return localStorage.getItem(SYNC_KEY) === 'true';
}

/**
 * Enable or disable cloud sync.
 */
export function setSyncEnabled(enabled) {
  localStorage.setItem(SYNC_KEY, enabled ? 'true' : 'false');
}

/**
 * Push all local data to Supabase.
 * Uses last-write-wins conflict resolution.
 */
export async function pushToCloud() {
  if (!initCloudSync()) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const userId = getUserId();
    const records = [];

    SYNCED_KEYS.forEach(key => {
      try {
        const value = localStorage.getItem(key);
        if (value !== null) {
          records.push({
            id: key,
            user_id: userId,
            value: JSON.parse(value),
            updated_at: new Date().toISOString(),
          });
        }
      } catch (e) {
        console.warn(`[Cloud Sync] Failed to read ${key}:`, e);
      }
    });

    if (records.length === 0) {
      return { success: true, message: 'No data to sync' };
    }

    // Upsert — on conflict do update
    const { error } = await supabase
      .from('lumina_data')
      .upsert(records, { onConflict: 'id,user_id' });

    if (error) throw error;

    localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
    return { success: true, synced: records.length };
  } catch (error) {
    console.error('[Cloud Sync] Push failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Pull all data from Supabase and merge with local storage.
 * Remote data always wins (last-write-wins from server).
 */
export async function pullFromCloud() {
  if (!initCloudSync()) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const userId = getUserId();
    const { data, error } = await supabase
      .from('lumina_data')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    let restoredCount = 0;
    if (data && data.length > 0) {
      data.forEach(record => {
        try {
          const serialized = typeof record.value === 'string'
            ? record.value
            : JSON.stringify(record.value);
          localStorage.setItem(record.id, serialized);
          restoredCount++;
        } catch (e) {
          console.warn(`[Cloud Sync] Failed to restore ${record.id}:`, e);
        }
      });
    }

    localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
    return { success: true, restored: restoredCount };
  } catch (error) {
    console.error('[Cloud Sync] Pull failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Full sync: push local changes, then pull remote updates.
 */
export async function fullSync() {
  if (!initCloudSync()) {
    return { success: false, error: 'Supabase not configured' };
  }

  const pushResult = await pushToCloud();
  if (!pushResult.success) return pushResult;

  const pullResult = await pullFromCloud();
  return pullResult;
}

/**
 * Get the last sync time.
 */
export function getLastSyncTime() {
  const time = localStorage.getItem(LAST_SYNC_KEY);
  return time ? new Date(time) : null;
}

/**
 * Get a stable user ID for sync scoping.
 */
function getUserId() {
  let userId = localStorage.getItem('lumina_sync_user_id');
  if (!userId) {
    userId = 'user_' + crypto.randomUUID?.() || 'user_' + Date.now().toString(36);
    localStorage.setItem('lumina_sync_user_id', userId);
  }
  return userId;
}

/**
 * Get sync status for UI display.
 */
export function getSyncStatus() {
  return {
    configured: !!SUPABASE_URL && !!SUPABASE_ANON_KEY,
    enabled: isSyncEnabled(),
    lastSync: getLastSyncTime(),
    initialized: !!supabase,
  };
}
