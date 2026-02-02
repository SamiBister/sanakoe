/**
 * Unit tests for localStorage Utilities
 *
 * Tests storage operations with mocked localStorage including:
 * - Save and load operations
 * - Error handling (quota exceeded, parse errors)
 * - Storage versioning and migration
 * - Data validation
 * - Edge cases
 */

import {
    clearAll,
    getStorageUsage,
    isStorageAvailable,
    isStorageNearLimit,
    loadRecords,
    loadWordList,
    migrateStorage,
    needsMigration,
    saveRecords,
    saveWordList,
    StorageError,
    StorageParseError,
    StorageQuotaError,
} from '../storage';
import type { Records, WordItem } from '../types';

describe('storage utilities', () => {
  // Mock localStorage
  let mockStorage: { [key: string]: string } = {};

  beforeEach(() => {
    // Clear mock storage before each test
    mockStorage = {};

    // Mock localStorage methods
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((key: string) => mockStorage[key] || null),
        setItem: jest.fn((key: string, value: string) => {
          mockStorage[key] = value;
        }),
        removeItem: jest.fn((key: string) => {
          delete mockStorage[key];
        }),
        clear: jest.fn(() => {
          mockStorage = {};
        }),
        get length() {
          return Object.keys(mockStorage).length;
        },
        key: jest.fn((index: number) => Object.keys(mockStorage)[index] || null),
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('isStorageAvailable', () => {
    it('should return true when localStorage is available', () => {
      expect(isStorageAvailable()).toBe(true);
    });

    it('should return false when localStorage is not available', () => {
      const originalLocalStorage = window.localStorage;

      // @ts-expect-error - Testing unavailable storage
      delete window.localStorage;

      expect(isStorageAvailable()).toBe(false);

      // Restore
      Object.defineProperty(window, 'localStorage', {
        value: originalLocalStorage,
        writable: true,
        configurable: true,
      });
    });

    it('should return false when localStorage throws error', () => {
      // Replace localStorage to throw errors
      Object.defineProperty(window, 'localStorage', {
        value: {
          setItem: () => {
            throw new Error('Storage disabled');
          },
          getItem: () => null,
          removeItem: () => {},
          clear: () => {},
          length: 0,
          key: () => null,
        },
        writable: true,
        configurable: true,
      });

      expect(isStorageAvailable()).toBe(false);
    });
  });

  describe('saveRecords and loadRecords', () => {
    it('should save and load records correctly', () => {
      const records: Records = {
        'list-123': {
          bestTries: 5,
          bestTimeMs: 30000,
          updatedAt: Date.now(),
        },
        'list-456': {
          bestTries: 10,
          bestTimeMs: 60000,
          updatedAt: Date.now(),
        },
      };

      saveRecords(records);
      const loaded = loadRecords();

      expect(loaded).toEqual(records);
    });

    it('should return empty object when no records stored', () => {
      const loaded = loadRecords();
      expect(loaded).toEqual({});
    });

    it('should overwrite existing records', () => {
      const records1: Records = {
        'list-123': {
          bestTries: 5,
          bestTimeMs: 30000,
          updatedAt: Date.now(),
        },
      };

      const records2: Records = {
        'list-456': {
          bestTries: 10,
          bestTimeMs: 60000,
          updatedAt: Date.now(),
        },
      };

      saveRecords(records1);
      saveRecords(records2);

      const loaded = loadRecords();
      expect(loaded).toEqual(records2);
      expect(loaded).not.toEqual(records1);
    });

    it('should handle empty records object', () => {
      const records: Records = {};

      saveRecords(records);
      const loaded = loadRecords();

      expect(loaded).toEqual({});
    });

    it('should throw StorageQuotaError when quota exceeded', () => {
      // Save original
      const originalSetItem = window.localStorage.setItem;

      // Replace only setItem after availability check would pass
      Object.defineProperty(window.localStorage, 'setItem', {
        value: jest.fn((key: string, value: string) => {
          if (key === '__sanakoe_test__') {
            // Let test key pass
            mockStorage[key] = value;
          } else {
            const error = new Error('QuotaExceededError');
            error.name = 'QuotaExceededError';
            throw error;
          }
        }),
        writable: true,
        configurable: true,
      });

      const records: Records = { 'list-123': { bestTries: 5, updatedAt: Date.now() } };

      expect(() => saveRecords(records)).toThrow(StorageQuotaError);
      expect(() => saveRecords(records)).toThrow('localStorage quota exceeded');

      // Restore
      Object.defineProperty(window.localStorage, 'setItem', {
        value: originalSetItem,
        writable: true,
        configurable: true,
      });
    });

    it('should throw StorageError when localStorage unavailable', () => {
      // Replace localStorage to throw generic error
      Object.defineProperty(window, 'localStorage', {
        value: {
          setItem: () => {
            throw new Error('Storage disabled');
          },
          getItem: (key: string) => mockStorage[key] || null,
          removeItem: () => {},
          clear: () => {},
          length: 0,
          key: () => null,
        },
        writable: true,
        configurable: true,
      });

      const records: Records = { 'list-123': { bestTries: 5, updatedAt: Date.now() } };

      expect(() => saveRecords(records)).toThrow(StorageError);
    });

    it('should throw StorageParseError when stored data is invalid JSON', () => {
      mockStorage['sanakoe_records'] = 'invalid json{';

      expect(() => loadRecords()).toThrow(StorageParseError);
      expect(() => loadRecords()).toThrow('Failed to parse records');
    });

    it('should throw StorageParseError when stored data is not an object', () => {
      mockStorage['sanakoe_records'] = JSON.stringify([1, 2, 3]);

      expect(() => loadRecords()).toThrow(StorageParseError);
      expect(() => loadRecords()).toThrow('Invalid records format');
    });

    it('should throw StorageParseError when stored data is null', () => {
      mockStorage['sanakoe_records'] = JSON.stringify(null);

      expect(() => loadRecords()).toThrow(StorageParseError);
    });
  });

  describe('saveWordList and loadWordList', () => {
    const sampleWords: WordItem[] = [
      {
        id: '1',
        prompt: 'hello',
        answer: 'hei',
        attempts: 0,
        firstTryFailed: false,
        resolved: false,
      },
      {
        id: '2',
        prompt: 'world',
        answer: 'maailma',
        attempts: 1,
        firstTryFailed: true,
        resolved: true,
      },
    ];

    it('should save and load word list correctly', () => {
      saveWordList(sampleWords);
      const loaded = loadWordList();

      expect(loaded).toEqual(sampleWords);
    });

    it('should return null when no word list stored', () => {
      const loaded = loadWordList();
      expect(loaded).toBeNull();
    });

    it('should handle empty word list', () => {
      const emptyList: WordItem[] = [];

      saveWordList(emptyList);
      const loaded = loadWordList();

      expect(loaded).toEqual([]);
    });

    it('should overwrite existing word list', () => {
      const words1: WordItem[] = [
        {
          id: '1',
          prompt: 'cat',
          answer: 'kissa',
          attempts: 0,
          firstTryFailed: false,
          resolved: false,
        },
      ];

      const words2: WordItem[] = [
        {
          id: '2',
          prompt: 'dog',
          answer: 'koira',
          attempts: 0,
          firstTryFailed: false,
          resolved: false,
        },
      ];

      saveWordList(words1);
      saveWordList(words2);

      const loaded = loadWordList();
      expect(loaded).toEqual(words2);
      expect(loaded).not.toEqual(words1);
    });

    it('should throw StorageQuotaError when quota exceeded', () => {
      // Save original
      const originalSetItem = window.localStorage.setItem;

      // Replace only setItem after availability check would pass
      Object.defineProperty(window.localStorage, 'setItem', {
        value: jest.fn((key: string, value: string) => {
          if (key === '__sanakoe_test__') {
            // Let test key pass
            mockStorage[key] = value;
          } else {
            const error = new Error('QuotaExceededError');
            error.name = 'QuotaExceededError';
            throw error;
          }
        }),
        writable: true,
        configurable: true,
      });

      expect(() => saveWordList(sampleWords)).toThrow(StorageQuotaError);
      expect(() => saveWordList(sampleWords)).toThrow('localStorage quota exceeded');

      // Restore
      Object.defineProperty(window.localStorage, 'setItem', {
        value: originalSetItem,
        writable: true,
        configurable: true,
      });
    });

    it('should throw StorageError when localStorage unavailable', () => {
      // Replace localStorage to throw generic error
      Object.defineProperty(window, 'localStorage', {
        value: {
          setItem: () => {
            throw new Error('Storage disabled');
          },
          getItem: (key: string) => mockStorage[key] || null,
          removeItem: () => {},
          clear: () => {},
          length: 0,
          key: () => null,
        },
        writable: true,
        configurable: true,
      });

      expect(() => saveWordList(sampleWords)).toThrow(StorageError);
    });

    it('should throw StorageParseError when stored data is invalid JSON', () => {
      mockStorage['sanakoe_last_list'] = 'invalid json[';

      expect(() => loadWordList()).toThrow(StorageParseError);
      expect(() => loadWordList()).toThrow('Failed to parse word list');
    });

    it('should throw StorageParseError when stored data is not an array', () => {
      mockStorage['sanakoe_last_list'] = JSON.stringify({ foo: 'bar' });

      expect(() => loadWordList()).toThrow(StorageParseError);
      expect(() => loadWordList()).toThrow('Invalid word list format');
    });

    it('should throw StorageParseError when word items are invalid', () => {
      mockStorage['sanakoe_last_list'] = JSON.stringify([
        { id: '1', prompt: 'hello' }, // Missing answer field
      ]);

      expect(() => loadWordList()).toThrow(StorageParseError);
      expect(() => loadWordList()).toThrow('missing required fields');
    });

    it('should throw StorageParseError when word item is not an object', () => {
      mockStorage['sanakoe_last_list'] = JSON.stringify(['string', 'array']);

      expect(() => loadWordList()).toThrow(StorageParseError);
    });

    it('should handle special characters in words', () => {
      const specialWords: WordItem[] = [
        {
          id: '1',
          prompt: 'café',
          answer: 'kahvila',
          attempts: 0,
          firstTryFailed: false,
          resolved: false,
        },
        {
          id: '2',
          prompt: 'hello 👋',
          answer: 'hei 🙋',
          attempts: 0,
          firstTryFailed: false,
          resolved: false,
        },
      ];

      saveWordList(specialWords);
      const loaded = loadWordList();

      expect(loaded).toEqual(specialWords);
    });
  });

  describe('versioning and migration', () => {
    it('should set version when saving data', () => {
      const records: Records = { 'list-123': { bestTries: 5, updatedAt: Date.now() } };

      saveRecords(records);

      expect(mockStorage['sanakoe_storage_version']).toBe('1');
    });

    it('should detect when migration is needed', () => {
      // No version set
      expect(needsMigration()).toBe(true);

      // Old version
      mockStorage['sanakoe_storage_version'] = '0';
      expect(needsMigration()).toBe(true);

      // Current version
      mockStorage['sanakoe_storage_version'] = '1';
      expect(needsMigration()).toBe(false);
    });

    it('should migrate storage from v0 to v1', () => {
      // No version set (v0)
      expect(needsMigration()).toBe(true);

      migrateStorage();

      expect(mockStorage['sanakoe_storage_version']).toBe('1');
      expect(needsMigration()).toBe(false);
    });

    it('should handle migration when version is already current', () => {
      mockStorage['sanakoe_storage_version'] = '1';

      migrateStorage();

      expect(mockStorage['sanakoe_storage_version']).toBe('1');
    });
  });

  describe('clearAll', () => {
    it('should remove all stored data', () => {
      // Set up some data
      const records: Records = { 'list-123': { bestTries: 5, updatedAt: Date.now() } };
      const words: WordItem[] = [
        {
          id: '1',
          prompt: 'hello',
          answer: 'hei',
          attempts: 0,
          firstTryFailed: false,
          resolved: false,
        },
      ];

      saveRecords(records);
      saveWordList(words);

      expect(mockStorage['sanakoe_records']).toBeDefined();
      expect(mockStorage['sanakoe_last_list']).toBeDefined();
      expect(mockStorage['sanakoe_storage_version']).toBeDefined();

      clearAll();

      expect(mockStorage['sanakoe_records']).toBeUndefined();
      expect(mockStorage['sanakoe_last_list']).toBeUndefined();
      expect(mockStorage['sanakoe_storage_version']).toBeUndefined();
    });

    it('should not throw when clearing empty storage', () => {
      expect(() => clearAll()).not.toThrow();
    });

    it('should not throw when localStorage is unavailable', () => {
      jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('Storage disabled');
      });

      expect(() => clearAll()).not.toThrow();
    });
  });

  describe('getStorageUsage', () => {
    it('should return 0 for empty storage', () => {
      expect(getStorageUsage()).toBe(0);
    });

    it('should estimate storage usage', () => {
      const records: Records = { 'list-123': { bestTries: 5, updatedAt: Date.now() } };

      saveRecords(records);

      const usage = getStorageUsage();
      expect(usage).toBeGreaterThan(0);
    });

    it('should include all sanakoe keys in usage calculation', () => {
      const records: Records = { 'list-123': { bestTries: 5, updatedAt: Date.now() } };
      const words: WordItem[] = [
        {
          id: '1',
          prompt: 'hello',
          answer: 'hei',
          attempts: 0,
          firstTryFailed: false,
          resolved: false,
        },
      ];

      saveRecords(records);
      const usage1 = getStorageUsage();

      saveWordList(words);
      const usage2 = getStorageUsage();

      expect(usage2).toBeGreaterThan(usage1);
    });

    it('should return 0 when localStorage is unavailable', () => {
      jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('Storage disabled');
      });

      expect(getStorageUsage()).toBe(0);
    });
  });

  describe('isStorageNearLimit', () => {
    it('should return false when usage is below threshold', () => {
      const records: Records = { 'list-123': { bestTries: 5, updatedAt: Date.now() } };

      saveRecords(records);

      // Default threshold is 4MB
      expect(isStorageNearLimit()).toBe(false);
    });

    it('should return true when usage exceeds custom threshold', () => {
      const records: Records = { 'list-123': { bestTries: 5, updatedAt: Date.now() } };

      saveRecords(records);

      // Set threshold to 1 byte
      expect(isStorageNearLimit(1)).toBe(true);
    });

    it('should return false for empty storage', () => {
      expect(isStorageNearLimit()).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle very large records object', () => {
      const largeRecords: Records = {};

      for (let i = 0; i < 1000; i++) {
        largeRecords[`list-${i}`] = {
          bestTries: i,
          bestTimeMs: i * 1000,
          updatedAt: Date.now(),
        };
      }

      saveRecords(largeRecords);
      const loaded = loadRecords();

      expect(loaded).toEqual(largeRecords);
      expect(Object.keys(loaded).length).toBe(1000);
    });

    it('should handle very large word list', () => {
      const largeList: WordItem[] = [];

      for (let i = 0; i < 1000; i++) {
        largeList.push({
          id: `${i}`,
          prompt: `word${i}`,
          answer: `sana${i}`,
          attempts: 0,
          firstTryFailed: false,
          resolved: false,
        });
      }

      saveWordList(largeList);
      const loaded = loadWordList();

      expect(loaded).toEqual(largeList);
      expect(loaded?.length).toBe(1000);
    });

    it('should handle records with optional fields missing', () => {
      const records: Records = {
        'list-123': {
          updatedAt: Date.now(),
        },
      };

      saveRecords(records);
      const loaded = loadRecords();

      expect(loaded).toEqual(records);
      expect(loaded['list-123'].bestTries).toBeUndefined();
      expect(loaded['list-123'].bestTimeMs).toBeUndefined();
    });

    it('should handle words with all optional fields', () => {
      const words: WordItem[] = [
        {
          id: '1',
          prompt: 'hello',
          answer: 'hei',
          attempts: 5,
          firstTryFailed: true,
          resolved: true,
        },
      ];

      saveWordList(words);
      const loaded = loadWordList();

      expect(loaded).toEqual(words);
    });
  });
});
