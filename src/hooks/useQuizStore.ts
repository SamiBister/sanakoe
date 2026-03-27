/**
 * Zustand Quiz Store - Centralized state management for quiz flow
 *
 * Manages the entire quiz lifecycle including:
 * - Word loading and initialization
 * - Quiz start/stop
 * - Answer submission (normal and practice modes)
 * - Queue management (FIFO with rotation for unresolved words)
 * - Practice mode transitions
 * - Timer tracking
 * - Tries counting
 */

import { matchAnswer } from '@/lib/answer-matcher';
import type { QuizSession, WordItem } from '@/lib/types';
import { create } from 'zustand';

/**
 * Quiz Store State and Actions
 */
interface QuizStore {
  // State
  session: QuizSession | null;

  // Actions
  loadWords: (words: WordItem[]) => void;
  startQuiz: () => void;
  submitAnswer: (answer: string) => void;
  submitPracticeAnswer: (answer: string) => void;
  moveToNextWord: () => void;
  enterPracticeMode: (wordId: string) => void;
  exitPracticeMode: () => void;
  endQuiz: () => void;
  resetQuiz: () => void;
  restartQuiz: () => void;

  // Selectors
  getCurrentWord: () => WordItem | null;
  getProgress: () => { resolved: number; total: number };
  isQuizActive: () => boolean;
  isQuizComplete: () => boolean;
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Create Zustand Quiz Store
 */
export const useQuizStore = create<QuizStore>((set, get) => ({
  // Initial state
  session: null,

  /**
   * Load words into the store (pre-quiz state)
   *
   * Initializes a new session with provided words but doesn't start the quiz.
   * Words are prepared for the quiz but not yet shuffled.
   *
   * @param words - Array of word items to quiz on
   */
  loadWords: (words: WordItem[]) => {
    // Reset all word states
    const initializedWords = words.map((word) => ({
      ...word,
      attempts: 0,
      firstTryFailed: false,
      resolved: false,
    }));

    set({
      session: {
        words: initializedWords,
        unresolvedIds: [], // Will be populated on startQuiz
        currentId: null,
        tries: 0,
        startTimeMs: 0, // Will be set on startQuiz
        mode: 'normal',
      },
    });
  },

  /**
   * Start the quiz
   *
   * Shuffles the word queue, sets the first word as current,
   * starts the timer, and enters normal mode.
   */
  startQuiz: () => {
    const { session } = get();
    if (!session) return;

    // Shuffle all word IDs for random order
    const shuffledIds = shuffleArray(session.words.map((w) => w.id));

    set({
      session: {
        ...session,
        unresolvedIds: shuffledIds,
        currentId: shuffledIds[0] || null,
        startTimeMs: Date.now(),
        mode: 'normal',
      },
    });
  },

  /**
   * Submit answer in normal mode
   *
   * Validates the answer, updates word state, and handles
   * correct/incorrect logic. Incorrect answers trigger practice mode.
   *
   * @param answer - User's answer input
   */
  submitAnswer: (answer: string) => {
    const { session } = get();
    if (!session || session.mode !== 'normal' || !session.currentId) return;

    const currentWord = session.words.find((w) => w.id === session.currentId);
    if (!currentWord) return;

    // Validate answer
    const isCorrect = matchAnswer(answer, currentWord.answer);

    // Update word state
    const updatedWords = session.words.map((word) => {
      if (word.id === currentWord.id) {
        return {
          ...word,
          attempts: word.attempts + 1,
          firstTryFailed: word.attempts === 0 ? !isCorrect : word.firstTryFailed,
          resolved: isCorrect ? true : word.resolved,
        };
      }
      return word;
    });

    // Increment tries counter (only in normal mode)
    const updatedTries = session.tries + 1;

    if (isCorrect) {
      // Remove word from unresolved queue
      const updatedUnresolvedIds = session.unresolvedIds.filter((id) => id !== currentWord.id);

      // Check if quiz is complete
      if (updatedUnresolvedIds.length === 0) {
        // Quiz complete - no more words
        set({
          session: {
            ...session,
            words: updatedWords,
            unresolvedIds: updatedUnresolvedIds,
            currentId: null,
            tries: updatedTries,
          },
        });
      } else {
        // Continue to next word
        const nextId = updatedUnresolvedIds[0];
        set({
          session: {
            ...session,
            words: updatedWords,
            unresolvedIds: updatedUnresolvedIds,
            currentId: nextId,
            tries: updatedTries,
          },
        });
      }
    } else {
      // Incorrect - enter practice mode
      set({
        session: {
          ...session,
          words: updatedWords,
          tries: updatedTries,
        },
      });

      // Trigger practice mode (will be picked up by component)
      get().enterPracticeMode(currentWord.id);
    }
  },

  /**
   * Submit answer in practice mode
   *
   * Validates the practice answer, decrements remaining counter.
   * After 3 correct repetitions, exits practice mode and continues quiz.
   *
   * @param answer - User's practice answer input
   */
  submitPracticeAnswer: (answer: string) => {
    const { session } = get();
    if (!session || session.mode !== 'practice' || !session.practiceTarget) return;

    const practiceWord = session.words.find((w) => w.id === session.practiceTarget?.id);
    if (!practiceWord) return;

    // Validate practice answer
    const isCorrect = matchAnswer(answer, practiceWord.answer);

    if (isCorrect) {
      const newRemaining = session.practiceTarget.remaining - 1;

      if (newRemaining === 0) {
        // Completed practice - exit practice mode
        get().exitPracticeMode();
      } else {
        // Update remaining count
        set({
          session: {
            ...session,
            practiceTarget: {
              ...session.practiceTarget,
              remaining: newRemaining,
            },
          },
        });
      }
    }
    // Note: Incorrect practice answers don't affect counter
    // User must type correctly to progress
  },

  /**
   * Move to next word in queue
   *
   * Advances to the next unresolved word. If no more words,
   * currentId becomes null (quiz complete).
   */
  moveToNextWord: () => {
    const { session } = get();
    if (!session || !session.currentId) return;

    // Remove current word from front of queue
    const updatedUnresolvedIds = session.unresolvedIds.filter((id) => id !== session.currentId);

    // Set next word as current (or null if queue empty)
    const nextId = updatedUnresolvedIds[0] || null;

    set({
      session: {
        ...session,
        unresolvedIds: updatedUnresolvedIds,
        currentId: nextId,
      },
    });
  },

  /**
   * Enter practice mode for a specific word
   *
   * Switches mode to practice and sets up practice target
   * with 3 required repetitions.
   *
   * @param wordId - ID of word to practice
   */
  enterPracticeMode: (wordId: string) => {
    const { session } = get();
    if (!session) return;

    set({
      session: {
        ...session,
        mode: 'practice',
        practiceTarget: {
          id: wordId,
          remaining: 3, // Requires 3 correct repetitions
        },
      },
    });
  },

  /**
   * Exit practice mode and return to normal mode
   *
   * Clears practice target and returns to normal quiz flow.
   * Moves the practiced word to the back of the queue so user
   * sees other words before encountering it again.
   */
  exitPracticeMode: () => {
    const { session } = get();
    if (!session || session.mode !== 'practice' || !session.practiceTarget) return;

    const practicedWordId = session.practiceTarget.id;

    // Move the practiced word to the back of the queue
    const filteredIds = session.unresolvedIds.filter((id) => id !== practicedWordId);
    const newUnresolvedIds = [...filteredIds, practicedWordId];

    // Set next word as current (the first one after removing practiced word)
    const nextId = filteredIds[0] || practicedWordId; // If only one word left, show it again

    set({
      session: {
        ...session,
        mode: 'normal',
        practiceTarget: undefined,
        unresolvedIds: newUnresolvedIds,
        currentId: nextId,
      },
    });
  },

  /**
   * End the quiz
   *
   * Sets end timestamp. Called when all words are resolved
   * or user manually ends quiz.
   */
  endQuiz: () => {
    const { session } = get();
    if (!session) return;

    set({
      session: {
        ...session,
        endTimeMs: Date.now(),
        currentId: null, // Clear current word
      },
    });
  },

  /**
   * Reset quiz state
   *
   * Clears all session data. Used when starting a completely new quiz
   * with different words or returning to start screen.
   */
  resetQuiz: () => {
    set({ session: null });
  },

  /**
   * Restart quiz with the same words
   *
   * Resets all word progress and immediately starts a new quiz session
   * in a single atomic update, so the session never passes through an
   * intermediate state that could trigger navigation guards.
   */
  restartQuiz: () => {
    const { session } = get();
    if (!session) return;

    const resetWords = session.words.map((word) => ({
      ...word,
      attempts: 0,
      firstTryFailed: false,
      resolved: false,
    }));

    const shuffledIds = shuffleArray(resetWords.map((w) => w.id));

    set({
      session: {
        words: resetWords,
        unresolvedIds: shuffledIds,
        currentId: shuffledIds[0] || null,
        tries: 0,
        startTimeMs: Date.now(),
        mode: 'normal',
      },
    });
  },

  /**
   * Get current word being quizzed
   *
   * @returns Current WordItem or null if no active quiz
   */
  getCurrentWord: () => {
    const { session } = get();
    if (!session || !session.currentId) return null;

    return session.words.find((w) => w.id === session.currentId) || null;
  },

  /**
   * Get quiz progress
   *
   * @returns Object with resolved and total word counts
   */
  getProgress: () => {
    const { session } = get();
    if (!session) return { resolved: 0, total: 0 };

    const resolved = session.words.filter((w) => w.resolved).length;
    const total = session.words.length;

    return { resolved, total };
  },

  /**
   * Check if quiz is currently active
   *
   * @returns true if quiz is started and not ended
   */
  isQuizActive: () => {
    const { session } = get();
    return !!(session && session.startTimeMs > 0 && !session.endTimeMs);
  },

  /**
   * Check if quiz is complete
   *
   * @returns true if all words are resolved
   */
  isQuizComplete: () => {
    const { session } = get();
    if (!session) return false;

    return session.words.length > 0 && session.words.every((w) => w.resolved);
  },
}));

/**
 * Convenience hook for accessing quiz store actions
 *
 * Separates actions from state for cleaner component code.
 * Uses getState() to avoid creating new object on every render.
 */
export function useQuizActions() {
  return useQuizStore.getState();
}

/**
 * Convenience hook for accessing quiz store selectors
 *
 * Provides computed values without subscribing to entire state.
 */
export function useQuizSelectors() {
  const getCurrentWord = useQuizStore((state) => state.getCurrentWord);
  const getProgress = useQuizStore((state) => state.getProgress);
  const isQuizActive = useQuizStore((state) => state.isQuizActive);
  const isQuizComplete = useQuizStore((state) => state.isQuizComplete);

  return {
    getCurrentWord,
    getProgress,
    isQuizActive,
    isQuizComplete,
  };
}
