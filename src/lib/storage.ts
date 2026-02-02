/**
 * localStorage Utilities - Persist quiz data locally
 *
 * Provides safe, version-controlled access to browser localStorage
 * for saving records and word lists in the vocabulary quiz application.
 */

import type { Records, WordItem } from './types';

/**
 * Storage version for managing format changes
 * Increment this when making breaking changes to storage structure
 */
const STORAGE_VERSION = 1;

/**
 * Storage keys used in localStorage
 */
const STORAGE_KEYS = {
  VERSION: 'sanakoe_storage_version',
  RECORDS: 'sanakoe_records',
  LAST_LIST: 'sanakoe_last_list',
} as const;

/**
 * Error types for storage operations
 */
export class StorageError extends Error {
  constructor(
    message: string,
    public cause?: unknown,
  ) {
    super(message);
    this.name = 'StorageError';
  }
}

export class StorageQuotaError extends StorageError {
  constructor(message: string, cause?: unknown) {
    super(message, cause);
    this.name = 'StorageQuotaError';
  }
}

export class StorageParseError extends StorageError {
  constructor(message: string, cause?: unknown) {
    super(message, cause);
    this.name = 'StorageParseError';
  }
}

/**
 * Check if localStorage is available
 *
 * @returns true if localStorage is available and accessible
 */
export function isStorageAvailable(): boolean {
  try {
    const testKey = '__sanakoe_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the current storage version
 *
 * @returns The stored version number, or 0 if not set
 */
function getStorageVersion(): number {
  try {
    const version = localStorage.getItem(STORAGE_KEYS.VERSION);
    return version ? parseInt(version, 10) : 0;
  } catch {
    return 0;
  }
}

/**
 * Set the current storage version
 */
function setStorageVersion(): void {
  try {
    localStorage.setItem(STORAGE_KEYS.VERSION, STORAGE_VERSION.toString());
  } catch {
    // Ignore version write errors
  }
}

/**
 * Check if storage needs migration
 *
 * @returns true if stored version is older than current version
 */
export function needsMigration(): boolean {
  return getStorageVersion() < STORAGE_VERSION;
}

/**
 * Migrate storage to current version
 *
 * This function handles upgrades from older storage formats.
 * Currently no migrations are needed (v1 is first version).
 */
export function migrateStorage(): void {
  const currentVersion = getStorageVersion();

  if (currentVersion === 0) {
    // First time setup - just set version
    setStorageVersion();
    return;
  }

  // Future migrations would go here
  // Example:
  // if (currentVersion < 2) {
  //   migrateV1toV2();
  // }

  setStorageVersion();
}

/**
 * Save records to localStorage
 *
 * @param records - The records object to save
 * @throws {StorageQuotaError} When localStorage quota is exceeded
 * @throws {StorageError} When storage is unavailable or save fails
 *
 * @example
 * ```typescript
 * saveRecords({
 *   'list-123': { bestTries: 5, bestTimeMs: 30000, updatedAt: Date.now() }
 * });
 * ```
 */
export function saveRecords(records: Records): void {
  if (!isStorageAvailable()) {
    throw new StorageError('localStorage is not available');
  }

  try {
    const json = JSON.stringify(records);
    localStorage.setItem(STORAGE_KEYS.RECORDS, json);

    // Ensure version is set
    if (needsMigration()) {
      setStorageVersion();
    }
  } catch (error) {
    // Check if it's a quota exceeded error
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      throw new StorageQuotaError('localStorage quota exceeded. Unable to save records.', error);
    }

    throw new StorageError('Failed to save records to localStorage', error);
  }
}

/**
 * Load records from localStorage
 *
 * @returns The stored records object, or empty object if none found
 * @throws {StorageParseError} When stored data cannot be parsed
 * @throws {StorageError} When storage read fails
 *
 * @example
 * ```typescript
 * const records = loadRecords();
 * console.log(records['list-123']?.bestTries);
 * ```
 */
export function loadRecords(): Records {
  if (!isStorageAvailable()) {
    return {};
  }

  try {
    const json = localStorage.getItem(STORAGE_KEYS.RECORDS);

    if (!json) {
      return {};
    }

    const records = JSON.parse(json);

    // Validate structure
    if (typeof records !== 'object' || records === null || Array.isArray(records)) {
      throw new StorageParseError('Invalid records format: expected object');
    }

    return records;
  } catch (error) {
    if (error instanceof StorageParseError) {
      throw error;
    }

    if (error instanceof SyntaxError) {
      throw new StorageParseError('Failed to parse records from localStorage', error);
    }

    throw new StorageError('Failed to load records from localStorage', error);
  }
}

/**
 * Save word list to localStorage
 *
 * @param words - The word list to save
 * @throws {StorageQuotaError} When localStorage quota is exceeded
 * @throws {StorageError} When storage is unavailable or save fails
 *
 * @example
 * ```typescript
 * saveWordList([
 *   { id: '1', prompt: 'hello', answer: 'hei', attempts: 0, firstTryFailed: false, resolved: false }
 * ]);
 * ```
 */
export function saveWordList(words: WordItem[]): void {
  if (!isStorageAvailable()) {
    throw new StorageError('localStorage is not available');
  }

  try {
    const json = JSON.stringify(words);
    localStorage.setItem(STORAGE_KEYS.LAST_LIST, json);

    // Ensure version is set
    if (needsMigration()) {
      setStorageVersion();
    }
  } catch (error) {
    // Check if it's a quota exceeded error
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      throw new StorageQuotaError('localStorage quota exceeded. Unable to save word list.', error);
    }

    throw new StorageError('Failed to save word list to localStorage', error);
  }
}

/**
 * Load word list from localStorage
 *
 * @returns The stored word list, or null if none found
 * @throws {StorageParseError} When stored data cannot be parsed
 * @throws {StorageError} When storage read fails
 *
 * @example
 * ```typescript
 * const words = loadWordList();
 * if (words) {
 *   console.log(`Loaded ${words.length} words`);
 * }
 * ```
 */
export function loadWordList(): WordItem[] | null {
  if (!isStorageAvailable()) {
    return null;
  }

  try {
    const json = localStorage.getItem(STORAGE_KEYS.LAST_LIST);

    if (!json) {
      return null;
    }

    const words = JSON.parse(json);

    // Validate structure
    if (!Array.isArray(words)) {
      throw new StorageParseError('Invalid word list format: expected array');
    }

    // Basic validation of word items
    for (const word of words) {
      if (typeof word !== 'object' || word === null) {
        throw new StorageParseError('Invalid word item: expected object');
      }

      if (
        typeof word.id !== 'string' ||
        typeof word.prompt !== 'string' ||
        typeof word.answer !== 'string'
      ) {
        throw new StorageParseError('Invalid word item: missing required fields');
      }
    }

    return words;
  } catch (error) {
    if (error instanceof StorageParseError) {
      throw error;
    }

    if (error instanceof SyntaxError) {
      throw new StorageParseError('Failed to parse word list from localStorage', error);
    }

    throw new StorageError('Failed to load word list from localStorage', error);
  }
}

/**
 * Clear all stored data
 *
 * Removes all sanakoe-related data from localStorage.
 * Useful for testing or when user wants to reset the app.
 *
 * @example
 * ```typescript
 * clearAll(); // Removes records, word list, and version
 * ```
 */
export function clearAll(): void {
  if (!isStorageAvailable()) {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEYS.RECORDS);
    localStorage.removeItem(STORAGE_KEYS.LAST_LIST);
    localStorage.removeItem(STORAGE_KEYS.VERSION);
  } catch {
    // Ignore errors when clearing
  }
}

/**
 * Get storage usage estimate
 *
 * Provides an estimate of how much localStorage space is being used.
 * Note: This is approximate as it doesn't account for browser overhead.
 *
 * @returns Estimated bytes used by sanakoe data
 *
 * @example
 * ```typescript
 * const bytes = getStorageUsage();
 * console.log(`Using approximately ${(bytes / 1024).toFixed(2)} KB`);
 * ```
 */
export function getStorageUsage(): number {
  if (!isStorageAvailable()) {
    return 0;
  }

  try {
    let total = 0;

    for (const key of Object.values(STORAGE_KEYS)) {
      const value = localStorage.getItem(key);
      if (value) {
        // Count both key and value (UTF-16, so 2 bytes per char)
        total += (key.length + value.length) * 2;
      }
    }

    return total;
  } catch {
    return 0;
  }
}

/**
 * Check if storage is approaching quota limit
 *
 * @param thresholdBytes - The byte threshold to check against (default: 4MB)
 * @returns true if estimated usage is above threshold
 *
 * @example
 * ```typescript
 * if (isStorageNearLimit()) {
 *   console.warn('Storage is getting full');
 * }
 * ```
 */
export function isStorageNearLimit(thresholdBytes: number = 4 * 1024 * 1024): boolean {
  return getStorageUsage() >= thresholdBytes;
}
