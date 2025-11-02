import type { StorageSchema, MigrationResult, UserSettings } from '@/types/storage';

const CURRENT_VERSION = 1;
const VERSION_KEY = 'qanc_schema_version';

/**
 * Schema migration system for localStorage
 * Handles version upgrades and data transformations
 */

export async function migrateStorage(): Promise<MigrationResult> {
  const currentVersion = getCurrentVersion();

  if (currentVersion === CURRENT_VERSION) {
    return {
      success: true,
      fromVersion: currentVersion,
      toVersion: CURRENT_VERSION,
      migratedRecords: 0,
    };
  }

  const migratedRecords: number[] = [];

  try {
    // Apply migrations sequentially
    if (currentVersion < 1) {
      const count = await migrateToV1();
      migratedRecords.push(count);
    }

    // Future migrations would be added here
    // if (currentVersion < 2) {
    //   const count = await migrateToV2();
    //   migratedRecords.push(count);
    // }

    setCurrentVersion(CURRENT_VERSION);

    return {
      success: true,
      fromVersion: currentVersion,
      toVersion: CURRENT_VERSION,
      migratedRecords: migratedRecords.reduce((a, b) => a + b, 0),
    };
  } catch (error) {
    return {
      success: false,
      fromVersion: currentVersion,
      toVersion: currentVersion, // Rollback to old version
      migratedRecords: 0,
      errors: [error instanceof Error ? error.message : 'Unknown migration error'],
    };
  }
}

/**
 * Initialize storage schema v1
 */
async function migrateToV1(): Promise<number> {
  // Initialize empty storage if not exists
  const storageKeys: Array<keyof Omit<StorageSchema, 'version' | 'lastBackup' | 'settings'>> = [
    'cards',
    'categories',
    'tags',
    'reviewSessions',
    'reviewEvents',
    'dailyStats',
  ];

  for (const key of storageKeys) {
    if (!localStorage.getItem(`qanc_${key}`)) {
      localStorage.setItem(`qanc_${key}`, JSON.stringify([]));
    }
  }

  // Initialize default user settings
  if (!localStorage.getItem('qanc_settings')) {
    const defaultSettings: UserSettings = {
      maxNewCardsPerDay: 20,
      maxReviewsPerDay: 100,
      defaultEaseFactor: 2.5,
      theme: 'auto',
      cardTransitionSpeed: 300,
      showProgress: true,
      autoAdvance: false,
      enableReminders: true,
      reminderDays: [1, 2, 3, 4, 5], // Weekdays
      backupFrequency: 'weekly',
      exportFormat: 'json',
      debugMode: false,
    };
    localStorage.setItem('qanc_settings', JSON.stringify(defaultSettings));
  }

  return 0; // No records migrated for initial setup
}

/**
 * Get current schema version from storage
 */
function getCurrentVersion(): number {
  const stored = localStorage.getItem(VERSION_KEY);
  if (!stored) return 0;

  try {
    return parseInt(stored, 10);
  } catch {
    return 0;
  }
}

/**
 * Set schema version in storage
 */
function setCurrentVersion(version: number): void {
  localStorage.setItem(VERSION_KEY, version.toString());
}

/**
 * Export all data for backup
 */
export function exportData(): Omit<StorageSchema, 'version'> {
  return {
    cards: JSON.parse(localStorage.getItem('qanc_cards') || '[]'),
    categories: JSON.parse(localStorage.getItem('qanc_categories') || '[]'),
    tags: JSON.parse(localStorage.getItem('qanc_tags') || '[]'),
    reviewSessions: JSON.parse(localStorage.getItem('qanc_reviewSessions') || '[]'),
    reviewEvents: JSON.parse(localStorage.getItem('qanc_reviewEvents') || '[]'),
    dailyStats: JSON.parse(localStorage.getItem('qanc_dailyStats') || '[]'),
    settings: JSON.parse(localStorage.getItem('qanc_settings') || '{}'),
  };
}

/**
 * Import data from backup (overwrites existing)
 */
export function importData(data: Omit<StorageSchema, 'version'>): void {
  localStorage.setItem('qanc_cards', JSON.stringify(data.cards));
  localStorage.setItem('qanc_categories', JSON.stringify(data.categories));
  localStorage.setItem('qanc_tags', JSON.stringify(data.tags));
  localStorage.setItem('qanc_reviewSessions', JSON.stringify(data.reviewSessions));
  localStorage.setItem('qanc_reviewEvents', JSON.stringify(data.reviewEvents));
  localStorage.setItem('qanc_dailyStats', JSON.stringify(data.dailyStats));
  localStorage.setItem('qanc_settings', JSON.stringify(data.settings));
}

/**
 * Clear all application data
 */
export function clearAllData(): void {
  const keys = [
    'qanc_cards',
    'qanc_categories',
    'qanc_tags',
    'qanc_reviewSessions',
    'qanc_reviewEvents',
    'qanc_dailyStats',
    'qanc_settings',
    VERSION_KEY,
  ];

  keys.forEach(key => localStorage.removeItem(key));
}
