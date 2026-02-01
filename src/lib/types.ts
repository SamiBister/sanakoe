/**
 * Core type definitions for the Sanakoe vocabulary quiz application.
 *
 * These types define the data structures used throughout the application
 * for managing quiz sessions, word items, and performance records.
 */

/**
 * Represents a single vocabulary word pair in the quiz.
 *
 * @property id - Unique identifier for the word (generated via nanoid or hash)
 * @property prompt - The question/prompt text (e.g., "cat" in English)
 * @property answer - The correct answer text (e.g., "kissa" in Finnish)
 * @property attempts - Total number of times this word has been attempted in current session
 * @property firstTryFailed - Whether the user got this word wrong on their first attempt
 * @property resolved - Whether this word has been answered correctly (at least once)
 */
export type WordItem = {
  id: string;
  prompt: string;
  answer: string;
  attempts: number;
  firstTryFailed: boolean;
  resolved: boolean;
};

/**
 * Quiz mode determines the current state of the quiz flow.
 *
 * - "normal": Regular quiz mode where user answers words from the queue
 * - "practice": Practice mode triggered after wrong answer, requires 3 repetitions
 */
export type QuizMode = "normal" | "practice";

/**
 * Tracks practice repetitions for a word that was answered incorrectly.
 *
 * When a user answers incorrectly in normal mode, they enter practice mode
 * and must type the correct answer 3 times before continuing.
 *
 * @property id - The word ID being practiced
 * @property remaining - Number of remaining practice repetitions (3, 2, or 1)
 */
export type PracticeTarget = {
  id: string;
  remaining: number;
};

/**
 * Represents the complete state of an active quiz session.
 *
 * This type manages the entire quiz lifecycle including word queue,
 * progress tracking, timing, and mode transitions.
 *
 * @property words - Complete array of all words in the current quiz
 * @property unresolvedIds - Queue of word IDs that haven't been correctly answered yet
 * @property currentId - ID of the word currently being shown to the user (null if quiz not started)
 * @property tries - Total number of attempts made in normal mode (excludes practice repetitions)
 * @property startTimeMs - Unix timestamp (milliseconds) when quiz started
 * @property endTimeMs - Unix timestamp (milliseconds) when quiz completed (undefined if ongoing)
 * @property mode - Current quiz mode ("normal" or "practice")
 * @property practiceTarget - Active practice target (only present when mode is "practice")
 */
export type QuizSession = {
  words: WordItem[];
  unresolvedIds: string[];
  currentId: string | null;
  tries: number;
  startTimeMs: number;
  endTimeMs?: number;
  mode: QuizMode;
  practiceTarget?: PracticeTarget;
};

/**
 * Performance records for a specific word list.
 *
 * Tracks personal best scores for a given word list (identified by fingerprint).
 * All records are optional to handle cases where no quiz has been completed yet.
 *
 * @property bestTries - Fewest number of tries to complete this word list
 * @property bestTimeMs - Fastest time (milliseconds) to complete this word list
 * @property updatedAt - Unix timestamp (milliseconds) when these records were last updated
 */
export type ListRecords = {
  bestTries?: number;
  bestTimeMs?: number;
  updatedAt: number;
};

/**
 * Collection of performance records indexed by word list fingerprint.
 *
 * Each word list generates a unique fingerprint (hash) that identifies it.
 * This allows tracking separate records for different word lists.
 * The fingerprint is stable regardless of word order.
 *
 * @example
 * ```typescript
 * const records: Records = {
 *   "abc123hash": {
 *     bestTries: 10,
 *     bestTimeMs: 45000,
 *     updatedAt: 1706745600000
 *   },
 *   "xyz789hash": {
 *     bestTries: 15,
 *     bestTimeMs: 60000,
 *     updatedAt: 1706832000000
 *   }
 * };
 * ```
 */
export type Records = {
  [listFingerprint: string]: ListRecords;
};
