/**
 * List Fingerprinting - Generate unique identifiers for word lists
 *
 * Provides stable, deterministic hashing for word lists to track
 * separate records for different vocabulary sets.
 */

import type { WordItem } from './types';

/**
 * Generate a stable fingerprint for a word list
 *
 * Creates a unique identifier for a word list based on its content.
 * The fingerprint is stable (same words always produce same hash) and
 * order-independent (different orderings produce same hash).
 *
 * Implementation:
 * 1. Sort words by prompt+answer (case-insensitive)
 * 2. Create normalized string representation
 * 3. Hash using simple but effective djb2 algorithm
 * 4. Return base64-encoded hash
 *
 * @param words - The word list to fingerprint
 * @returns A stable, unique fingerprint string
 *
 * @example
 * ```typescript
 * const words1 = [
 *   { id: '1', prompt: 'hello', answer: 'hei', ... },
 *   { id: '2', prompt: 'world', answer: 'maailma', ... }
 * ];
 * const words2 = [
 *   { id: '2', prompt: 'world', answer: 'maailma', ... },
 *   { id: '1', prompt: 'hello', answer: 'hei', ... }
 * ];
 *
 * generateListFingerprint(words1) === generateListFingerprint(words2); // true
 * ```
 */
export function generateListFingerprint(words: WordItem[]): string {
  if (words.length === 0) {
    return 'empty';
  }

  // Sort words to ensure order-independence
  const sortedPairs = words
    .map((word) => ({
      prompt: normalizeForHash(word.prompt),
      answer: normalizeForHash(word.answer),
    }))
    .sort((a, b) => {
      // Sort by prompt first, then by answer
      const promptCompare = a.prompt.localeCompare(b.prompt);
      if (promptCompare !== 0) return promptCompare;
      return a.answer.localeCompare(b.answer);
    });

  // Create a stable string representation
  const content = sortedPairs.map((pair) => `${pair.prompt}\t${pair.answer}`).join('\n');

  // Hash the content
  const hashValue = djb2Hash(content);

  // Convert to base64-like string (URL-safe)
  return hashToBase64(hashValue);
}

/**
 * Normalize a string for hashing
 *
 * Applies same normalization as answer matching to ensure
 * consistent hashing regardless of whitespace or case variations.
 *
 * @param str - The string to normalize
 * @returns Normalized string
 *
 * @internal
 */
function normalizeForHash(str: string): string {
  return str.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * DJB2 hash algorithm
 *
 * A simple but effective non-cryptographic hash function.
 * Good distribution, fast computation, and reasonable collision resistance.
 *
 * @param str - The string to hash
 * @returns 32-bit hash value
 *
 * @internal
 */
function djb2Hash(str: string): number {
  let hash = 5381;

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    // hash * 33 + char
    hash = (hash << 5) + hash + char;
    // Keep within 32-bit range
    hash = hash & hash;
  }

  // Convert to unsigned
  return hash >>> 0;
}

/**
 * Convert hash to base64-like string
 *
 * Creates a URL-safe, readable string representation of the hash.
 * Uses base62 (alphanumeric) for better readability.
 *
 * @param hash - The hash value to encode
 * @returns Base62-encoded string
 *
 * @internal
 */
function hashToBase64(hash: number): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = '';
  let num = hash;

  // Convert to base62
  do {
    result = chars[num % 62] + result;
    num = Math.floor(num / 62);
  } while (num > 0);

  // Pad to ensure consistent length (at least 6 characters)
  return result.padStart(6, '0');
}

/**
 * Compare two word lists for equality (content-based)
 *
 * Two lists are considered equal if they contain the same word pairs,
 * regardless of order or IDs.
 *
 * @param words1 - First word list
 * @param words2 - Second word list
 * @returns true if lists contain same word pairs
 *
 * @example
 * ```typescript
 * const list1 = [{ id: '1', prompt: 'cat', answer: 'kissa', ... }];
 * const list2 = [{ id: '2', prompt: 'cat', answer: 'kissa', ... }];
 *
 * areListsEqual(list1, list2); // true (same content, different IDs)
 * ```
 */
export function areListsEqual(words1: WordItem[], words2: WordItem[]): boolean {
  return generateListFingerprint(words1) === generateListFingerprint(words2);
}

/**
 * Get a short, human-readable representation of a word list
 *
 * Useful for debugging and logging.
 *
 * @param words - The word list
 * @returns Short description string
 *
 * @example
 * ```typescript
 * const words = [
 *   { id: '1', prompt: 'hello', answer: 'hei', ... },
 *   { id: '2', prompt: 'world', answer: 'maailma', ... }
 * ];
 *
 * getListDescription(words); // "2 words (hello, world)"
 * ```
 */
export function getListDescription(words: WordItem[]): string {
  if (words.length === 0) {
    return 'empty list';
  }

  const count = words.length;
  const preview = words
    .slice(0, 3)
    .map((w) => w.prompt)
    .join(', ');

  if (words.length > 3) {
    return `${count} words (${preview}, ...)`;
  }

  return `${count} word${count === 1 ? '' : 's'} (${preview})`;
}

/**
 * Estimate collision probability for a given number of lists
 *
 * Based on the birthday paradox, calculates the approximate probability
 * of hash collisions for N word lists.
 *
 * Note: This is a theoretical estimate. In practice, collision probability
 * depends on the actual distribution of word lists.
 *
 * @param numLists - Number of word lists
 * @returns Estimated collision probability (0-1)
 *
 * @example
 * ```typescript
 * estimateCollisionProbability(100); // ~0.0023 (0.23%)
 * estimateCollisionProbability(1000); // ~0.23 (23%)
 * ```
 */
export function estimateCollisionProbability(numLists: number): number {
  // Using birthday paradox formula: 1 - e^(-n^2 / (2*m))
  // where n = number of lists, m = number of possible hashes (2^32)
  const m = 4294967296; // 2^32
  const exponent = -(numLists * numLists) / (2 * m);
  return 1 - Math.exp(exponent);
}
