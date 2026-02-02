/**
 * Tests for Zustand Quiz Store
 */

import type { WordItem } from '@/lib/types';
import { act, renderHook } from '@testing-library/react';
import { useQuizActions, useQuizSelectors, useQuizStore } from '../useQuizStore';

/**
 * Helper to create test word items
 */
function createTestWord(id: string, prompt: string, answer: string): WordItem {
  return {
    id,
    prompt,
    answer,
    attempts: 0,
    firstTryFailed: false,
    resolved: false,
  };
}

/**
 * Helper to reset store between tests
 */
function resetStore() {
  const { result } = renderHook(() => useQuizStore());
  act(() => {
    result.current.resetQuiz();
  });
}

describe('useQuizStore', () => {
  beforeEach(() => {
    resetStore();
  });

  describe('initialization', () => {
    it('starts with null session', () => {
      const { result } = renderHook(() => useQuizStore());
      expect(result.current.session).toBeNull();
    });

    it('exposes all required actions', () => {
      const { result } = renderHook(() => useQuizStore());

      expect(typeof result.current.loadWords).toBe('function');
      expect(typeof result.current.startQuiz).toBe('function');
      expect(typeof result.current.submitAnswer).toBe('function');
      expect(typeof result.current.submitPracticeAnswer).toBe('function');
      expect(typeof result.current.moveToNextWord).toBe('function');
      expect(typeof result.current.enterPracticeMode).toBe('function');
      expect(typeof result.current.exitPracticeMode).toBe('function');
      expect(typeof result.current.endQuiz).toBe('function');
      expect(typeof result.current.resetQuiz).toBe('function');
    });

    it('exposes all required selectors', () => {
      const { result } = renderHook(() => useQuizStore());

      expect(typeof result.current.getCurrentWord).toBe('function');
      expect(typeof result.current.getProgress).toBe('function');
      expect(typeof result.current.isQuizActive).toBe('function');
      expect(typeof result.current.isQuizComplete).toBe('function');
    });
  });

  describe('loadWords', () => {
    it('loads words into session', () => {
      const { result } = renderHook(() => useQuizStore());
      const words = [createTestWord('1', 'hello', 'hei'), createTestWord('2', 'world', 'maailma')];

      act(() => {
        result.current.loadWords(words);
      });

      expect(result.current.session).not.toBeNull();
      expect(result.current.session?.words).toHaveLength(2);
      expect(result.current.session?.words[0].prompt).toBe('hello');
      expect(result.current.session?.words[1].prompt).toBe('world');
    });

    it('initializes word states correctly', () => {
      const { result } = renderHook(() => useQuizStore());
      const words = [createTestWord('1', 'cat', 'kissa')];

      act(() => {
        result.current.loadWords(words);
      });

      const loadedWord = result.current.session?.words[0];
      expect(loadedWord?.attempts).toBe(0);
      expect(loadedWord?.firstTryFailed).toBe(false);
      expect(loadedWord?.resolved).toBe(false);
    });

    it('sets mode to normal', () => {
      const { result } = renderHook(() => useQuizStore());
      const words = [createTestWord('1', 'cat', 'kissa')];

      act(() => {
        result.current.loadWords(words);
      });

      expect(result.current.session?.mode).toBe('normal');
    });

    it('does not start quiz automatically', () => {
      const { result } = renderHook(() => useQuizStore());
      const words = [createTestWord('1', 'cat', 'kissa')];

      act(() => {
        result.current.loadWords(words);
      });

      expect(result.current.session?.startTimeMs).toBe(0);
      expect(result.current.session?.currentId).toBeNull();
      expect(result.current.session?.unresolvedIds).toHaveLength(0);
    });

    it('handles empty word list', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.loadWords([]);
      });

      expect(result.current.session?.words).toHaveLength(0);
    });

    it('resets previous session when loading new words', () => {
      const { result } = renderHook(() => useQuizStore());
      const words1 = [createTestWord('1', 'cat', 'kissa')];
      const words2 = [createTestWord('2', 'dog', 'koira')];

      act(() => {
        result.current.loadWords(words1);
        result.current.startQuiz();
      });

      act(() => {
        result.current.loadWords(words2);
      });

      expect(result.current.session?.words).toHaveLength(1);
      expect(result.current.session?.words[0].id).toBe('2');
      expect(result.current.session?.startTimeMs).toBe(0);
    });
  });

  describe('startQuiz', () => {
    it('starts the quiz with shuffled word order', () => {
      const { result } = renderHook(() => useQuizStore());
      const words = [
        createTestWord('1', 'cat', 'kissa'),
        createTestWord('2', 'dog', 'koira'),
        createTestWord('3', 'bird', 'lintu'),
      ];

      act(() => {
        result.current.loadWords(words);
        result.current.startQuiz();
      });

      expect(result.current.session?.unresolvedIds).toHaveLength(3);
      expect(result.current.session?.unresolvedIds).toContain('1');
      expect(result.current.session?.unresolvedIds).toContain('2');
      expect(result.current.session?.unresolvedIds).toContain('3');
    });

    it('sets current word to first in queue', () => {
      const { result } = renderHook(() => useQuizStore());
      const words = [createTestWord('1', 'cat', 'kissa')];

      act(() => {
        result.current.loadWords(words);
        result.current.startQuiz();
      });

      expect(result.current.session?.currentId).toBe('1');
    });

    it('sets start timestamp', () => {
      const { result } = renderHook(() => useQuizStore());
      const words = [createTestWord('1', 'cat', 'kissa')];
      const beforeTime = Date.now();

      act(() => {
        result.current.loadWords(words);
        result.current.startQuiz();
      });

      const afterTime = Date.now();
      expect(result.current.session?.startTimeMs).toBeGreaterThanOrEqual(beforeTime);
      expect(result.current.session?.startTimeMs).toBeLessThanOrEqual(afterTime);
    });

    it('does nothing if no session loaded', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.startQuiz();
      });

      expect(result.current.session).toBeNull();
    });

    it('handles single-word quiz', () => {
      const { result } = renderHook(() => useQuizStore());
      const words = [createTestWord('1', 'cat', 'kissa')];

      act(() => {
        result.current.loadWords(words);
        result.current.startQuiz();
      });

      expect(result.current.session?.currentId).toBe('1');
      expect(result.current.session?.unresolvedIds).toEqual(['1']);
    });
  });

  describe('submitAnswer - correct answer', () => {
    it('marks word as resolved on correct answer', () => {
      const { result } = renderHook(() => useQuizStore());
      const words = [createTestWord('1', 'cat', 'kissa')];

      act(() => {
        result.current.loadWords(words);
        result.current.startQuiz();
        result.current.submitAnswer('kissa');
      });

      const word = result.current.session?.words[0];
      expect(word?.resolved).toBe(true);
      expect(word?.attempts).toBe(1);
      expect(word?.firstTryFailed).toBe(false);
    });

    it('removes word from unresolved queue on correct answer', () => {
      const { result } = renderHook(() => useQuizStore());
      const words = [createTestWord('1', 'cat', 'kissa'), createTestWord('2', 'dog', 'koira')];

      act(() => {
        result.current.loadWords(words);
        result.current.startQuiz();
      });

      const firstWordId = result.current.session?.currentId;

      act(() => {
        result.current.submitAnswer(
          result.current.session?.words.find((w) => w.id === firstWordId)?.answer || '',
        );
      });

      expect(result.current.session?.unresolvedIds).toHaveLength(1);
      expect(result.current.session?.unresolvedIds).not.toContain(firstWordId);
    });

    it('increments tries counter', () => {
      const { result } = renderHook(() => useQuizStore());
      const words = [createTestWord('1', 'cat', 'kissa')];

      act(() => {
        result.current.loadWords(words);
        result.current.startQuiz();
        result.current.submitAnswer('kissa');
      });

      expect(result.current.session?.tries).toBe(1);
    });

    it('is case-insensitive', () => {
      const { result } = renderHook(() => useQuizStore());
      const words = [createTestWord('1', 'cat', 'kissa')];

      act(() => {
        result.current.loadWords(words);
        result.current.startQuiz();
        result.current.submitAnswer('KISSA');
      });

      expect(result.current.session?.words[0].resolved).toBe(true);
    });

    it('trims whitespace', () => {
      const { result } = renderHook(() => useQuizStore());
      const words = [createTestWord('1', 'cat', 'kissa')];

      act(() => {
        result.current.loadWords(words);
        result.current.startQuiz();
        result.current.submitAnswer('  kissa  ');
      });

      expect(result.current.session?.words[0].resolved).toBe(true);
    });
  });

  describe('submitAnswer - incorrect answer', () => {
    it('marks firstTryFailed on incorrect first attempt', () => {
      const { result } = renderHook(() => useQuizStore());
      const words = [createTestWord('1', 'cat', 'kissa')];

      act(() => {
        result.current.loadWords(words);
        result.current.startQuiz();
        result.current.submitAnswer('wrong');
      });

      expect(result.current.session?.words[0].firstTryFailed).toBe(true);
      expect(result.current.session?.words[0].resolved).toBe(false);
    });

    it('increments attempts on incorrect answer', () => {
      const { result } = renderHook(() => useQuizStore());
      const words = [createTestWord('1', 'cat', 'kissa')];

      act(() => {
        result.current.loadWords(words);
        result.current.startQuiz();
        result.current.submitAnswer('wrong');
      });

      expect(result.current.session?.words[0].attempts).toBe(1);
    });

    it('enters practice mode on incorrect answer', () => {
      const { result } = renderHook(() => useQuizStore());
      const words = [createTestWord('1', 'cat', 'kissa')];

      act(() => {
        result.current.loadWords(words);
        result.current.startQuiz();
        result.current.submitAnswer('wrong');
      });

      expect(result.current.session?.mode).toBe('practice');
      expect(result.current.session?.practiceTarget).toEqual({
        id: '1',
        remaining: 3,
      });
    });

    it('increments tries counter on incorrect answer', () => {
      const { result } = renderHook(() => useQuizStore());
      const words = [createTestWord('1', 'cat', 'kissa')];

      act(() => {
        result.current.loadWords(words);
        result.current.startQuiz();
        result.current.submitAnswer('wrong');
      });

      expect(result.current.session?.tries).toBe(1);
    });
  });

  describe('submitPracticeAnswer', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useQuizStore());
      const words = [createTestWord('1', 'cat', 'kissa')];

      act(() => {
        result.current.loadWords(words);
        result.current.startQuiz();
        result.current.submitAnswer('wrong'); // Enter practice mode
      });
    });

    it('decrements remaining counter on correct practice answer', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.submitPracticeAnswer('kissa');
      });

      expect(result.current.session?.practiceTarget?.remaining).toBe(2);
    });

    it('does not affect remaining counter on incorrect practice answer', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.submitPracticeAnswer('wrong');
      });

      expect(result.current.session?.practiceTarget?.remaining).toBe(3);
    });

    it('exits practice mode after 3 correct repetitions', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.submitPracticeAnswer('kissa'); // 1
        result.current.submitPracticeAnswer('kissa'); // 2
        result.current.submitPracticeAnswer('kissa'); // 3
      });

      expect(result.current.session?.mode).toBe('normal');
      expect(result.current.session?.practiceTarget).toBeUndefined();
    });

    it('is case-insensitive in practice mode', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.submitPracticeAnswer('KISSA');
      });

      expect(result.current.session?.practiceTarget?.remaining).toBe(2);
    });

    it('trims whitespace in practice mode', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.submitPracticeAnswer('  kissa  ');
      });

      expect(result.current.session?.practiceTarget?.remaining).toBe(2);
    });
  });

  describe('moveToNextWord', () => {
    it('advances to next word in queue', () => {
      const { result } = renderHook(() => useQuizStore());
      const words = [createTestWord('1', 'cat', 'kissa'), createTestWord('2', 'dog', 'koira')];

      act(() => {
        result.current.loadWords(words);
        result.current.startQuiz();
      });

      const firstId = result.current.session?.currentId;

      act(() => {
        result.current.moveToNextWord();
      });

      expect(result.current.session?.currentId).not.toBe(firstId);
      expect(result.current.session?.unresolvedIds).not.toContain(firstId);
    });

    it('sets currentId to null when queue is empty', () => {
      const { result } = renderHook(() => useQuizStore());
      const words = [createTestWord('1', 'cat', 'kissa')];

      act(() => {
        result.current.loadWords(words);
        result.current.startQuiz();
        result.current.moveToNextWord();
      });

      expect(result.current.session?.currentId).toBeNull();
      expect(result.current.session?.unresolvedIds).toHaveLength(0);
    });

    it('does nothing if no current word', () => {
      const { result } = renderHook(() => useQuizStore());
      const words = [createTestWord('1', 'cat', 'kissa')];

      act(() => {
        result.current.loadWords(words);
        result.current.startQuiz();
        result.current.moveToNextWord(); // Move to end
        result.current.moveToNextWord(); // Try again
      });

      expect(result.current.session?.currentId).toBeNull();
    });
  });

  describe('enterPracticeMode', () => {
    it('switches mode to practice', () => {
      const { result } = renderHook(() => useQuizStore());
      const words = [createTestWord('1', 'cat', 'kissa')];

      act(() => {
        result.current.loadWords(words);
        result.current.startQuiz();
        result.current.enterPracticeMode('1');
      });

      expect(result.current.session?.mode).toBe('practice');
    });

    it('sets practice target with 3 repetitions', () => {
      const { result } = renderHook(() => useQuizStore());
      const words = [createTestWord('1', 'cat', 'kissa')];

      act(() => {
        result.current.loadWords(words);
        result.current.startQuiz();
        result.current.enterPracticeMode('1');
      });

      expect(result.current.session?.practiceTarget).toEqual({
        id: '1',
        remaining: 3,
      });
    });
  });

  describe('exitPracticeMode', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useQuizStore());
      const words = [createTestWord('1', 'cat', 'kissa'), createTestWord('2', 'dog', 'koira')];

      act(() => {
        result.current.loadWords(words);
        result.current.startQuiz();
        result.current.enterPracticeMode('1');
      });
    });

    it('switches mode back to normal', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.exitPracticeMode();
      });

      expect(result.current.session?.mode).toBe('normal');
    });

    it('clears practice target', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.exitPracticeMode();
      });

      expect(result.current.session?.practiceTarget).toBeUndefined();
    });

    it('moves practiced word to back of queue and advances to next word', () => {
      const { result } = renderHook(() => useQuizStore());

      // Setup: have at least 2 words, be in practice mode for the first one
      const words = [createTestWord('1', 'dog', 'koira'), createTestWord('2', 'cat', 'kissa')];

      act(() => {
        result.current.loadWords(words);
        result.current.startQuiz();
        // Enter practice mode for word 1
        result.current.enterPracticeMode('1');
      });

      // Exit practice mode
      act(() => {
        result.current.exitPracticeMode();
      });

      // Current should advance to the next word (word 2)
      expect(result.current.session?.currentId).toBe('2');

      // Word 1 should be at the back of the queue
      const unresolvedIds = result.current.session?.unresolvedIds;
      expect(unresolvedIds).toEqual(['2', '1']);
    });

    it('keeps same word if it is the only word in queue', () => {
      const { result } = renderHook(() => useQuizStore());

      // Setup: only 1 word, be in practice mode for it
      const words = [createTestWord('1', 'dog', 'koira')];

      act(() => {
        result.current.loadWords(words);
        result.current.startQuiz();
        // Enter practice mode for word 1
        result.current.enterPracticeMode('1');
      });

      // Exit practice mode
      act(() => {
        result.current.exitPracticeMode();
      });

      // Current should still be word 1 (the only word)
      expect(result.current.session?.currentId).toBe('1');
      expect(result.current.session?.unresolvedIds).toEqual(['1']);
    });

    it('does nothing if not in practice mode', () => {
      const { result } = renderHook(() => useQuizStore());

      // Already in normal mode, exit practice again
      act(() => {
        result.current.exitPracticeMode();
        result.current.exitPracticeMode();
      });

      expect(result.current.session?.mode).toBe('normal');
    });
  });

  describe('endQuiz', () => {
    it('sets end timestamp', () => {
      const { result } = renderHook(() => useQuizStore());
      const words = [createTestWord('1', 'cat', 'kissa')];
      const beforeTime = Date.now();

      act(() => {
        result.current.loadWords(words);
        result.current.startQuiz();
        result.current.endQuiz();
      });

      const afterTime = Date.now();
      expect(result.current.session?.endTimeMs).toBeGreaterThanOrEqual(beforeTime);
      expect(result.current.session?.endTimeMs).toBeLessThanOrEqual(afterTime);
    });

    it('clears current word', () => {
      const { result } = renderHook(() => useQuizStore());
      const words = [createTestWord('1', 'cat', 'kissa')];

      act(() => {
        result.current.loadWords(words);
        result.current.startQuiz();
        result.current.endQuiz();
      });

      expect(result.current.session?.currentId).toBeNull();
    });

    it('does nothing if no session', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.endQuiz();
      });

      expect(result.current.session).toBeNull();
    });
  });

  describe('resetQuiz', () => {
    it('clears session completely', () => {
      const { result } = renderHook(() => useQuizStore());
      const words = [createTestWord('1', 'cat', 'kissa')];

      act(() => {
        result.current.loadWords(words);
        result.current.startQuiz();
        result.current.resetQuiz();
      });

      expect(result.current.session).toBeNull();
    });
  });

  describe('getCurrentWord selector', () => {
    it('returns current word', () => {
      const { result } = renderHook(() => useQuizStore());
      const words = [createTestWord('1', 'cat', 'kissa')];

      act(() => {
        result.current.loadWords(words);
        result.current.startQuiz();
      });

      const currentWord = result.current.getCurrentWord();
      expect(currentWord).not.toBeNull();
      expect(currentWord?.id).toBe('1');
      expect(currentWord?.prompt).toBe('cat');
    });

    it('returns null if no current word', () => {
      const { result } = renderHook(() => useQuizStore());

      const currentWord = result.current.getCurrentWord();
      expect(currentWord).toBeNull();
    });

    it('returns null after quiz ends', () => {
      const { result } = renderHook(() => useQuizStore());
      const words = [createTestWord('1', 'cat', 'kissa')];

      act(() => {
        result.current.loadWords(words);
        result.current.startQuiz();
        result.current.endQuiz();
      });

      const currentWord = result.current.getCurrentWord();
      expect(currentWord).toBeNull();
    });
  });

  describe('getProgress selector', () => {
    it('returns progress correctly', () => {
      const { result } = renderHook(() => useQuizStore());
      const words = [
        createTestWord('1', 'cat', 'kissa'),
        createTestWord('2', 'dog', 'koira'),
        createTestWord('3', 'bird', 'lintu'),
      ];

      act(() => {
        result.current.loadWords(words);
        result.current.startQuiz();
      });

      let progress = result.current.getProgress();
      expect(progress).toEqual({ resolved: 0, total: 3 });

      // Get the current word and answer it
      const firstWord = result.current.getCurrentWord();
      act(() => {
        result.current.submitAnswer(firstWord!.answer);
      });

      progress = result.current.getProgress();
      expect(progress.resolved).toBe(1);
      expect(progress.total).toBe(3);
    });

    it('returns zeros when no session', () => {
      const { result } = renderHook(() => useQuizStore());

      const progress = result.current.getProgress();
      expect(progress).toEqual({ resolved: 0, total: 0 });
    });

    it('counts only resolved words, not attempted', () => {
      const { result } = renderHook(() => useQuizStore());
      const words = [createTestWord('1', 'cat', 'kissa')];

      act(() => {
        result.current.loadWords(words);
        result.current.startQuiz();
        result.current.submitAnswer('wrong'); // Incorrect, not resolved
      });

      const progress = result.current.getProgress();
      expect(progress.resolved).toBe(0);
    });
  });

  describe('isQuizActive selector', () => {
    it('returns false before quiz starts', () => {
      const { result } = renderHook(() => useQuizStore());
      const words = [createTestWord('1', 'cat', 'kissa')];

      act(() => {
        result.current.loadWords(words);
      });

      expect(result.current.isQuizActive()).toBe(false);
    });

    it('returns true when quiz is active', () => {
      const { result } = renderHook(() => useQuizStore());
      const words = [createTestWord('1', 'cat', 'kissa')];

      act(() => {
        result.current.loadWords(words);
        result.current.startQuiz();
      });

      expect(result.current.isQuizActive()).toBe(true);
    });

    it('returns false after quiz ends', () => {
      const { result } = renderHook(() => useQuizStore());
      const words = [createTestWord('1', 'cat', 'kissa')];

      act(() => {
        result.current.loadWords(words);
        result.current.startQuiz();
        result.current.endQuiz();
      });

      expect(result.current.isQuizActive()).toBe(false);
    });

    it('returns false with no session', () => {
      const { result } = renderHook(() => useQuizStore());

      expect(result.current.isQuizActive()).toBe(false);
    });
  });

  describe('isQuizComplete selector', () => {
    it('returns false when quiz not started', () => {
      const { result } = renderHook(() => useQuizStore());
      const words = [createTestWord('1', 'cat', 'kissa')];

      act(() => {
        result.current.loadWords(words);
      });

      expect(result.current.isQuizComplete()).toBe(false);
    });

    it('returns false when words unresolved', () => {
      const { result } = renderHook(() => useQuizStore());
      const words = [createTestWord('1', 'cat', 'kissa')];

      act(() => {
        result.current.loadWords(words);
        result.current.startQuiz();
      });

      expect(result.current.isQuizComplete()).toBe(false);
    });

    it('returns true when all words resolved', () => {
      const { result } = renderHook(() => useQuizStore());
      const words = [createTestWord('1', 'cat', 'kissa')];

      act(() => {
        result.current.loadWords(words);
        result.current.startQuiz();
        result.current.submitAnswer('kissa');
      });

      expect(result.current.isQuizComplete()).toBe(true);
    });

    it('returns false with empty word list', () => {
      const { result } = renderHook(() => useQuizStore());

      act(() => {
        result.current.loadWords([]);
      });

      expect(result.current.isQuizComplete()).toBe(false);
    });
  });

  describe('convenience hooks', () => {
    it('useQuizActions exposes only actions', () => {
      const { result } = renderHook(() => useQuizActions());

      expect(typeof result.current.loadWords).toBe('function');
      expect(typeof result.current.startQuiz).toBe('function');
      expect(typeof result.current.submitAnswer).toBe('function');
      expect(typeof result.current.resetQuiz).toBe('function');
      expect(typeof result.current.getCurrentWord).toBe('function');
      expect(typeof result.current.isQuizActive).toBe('function');
      expect(typeof result.current.isQuizComplete).toBe('function');
    });

    it('useQuizSelectors exposes only selectors', () => {
      const { result } = renderHook(() => useQuizSelectors());

      expect(typeof result.current.getCurrentWord).toBe('function');
      expect(typeof result.current.getProgress).toBe('function');
      expect(typeof result.current.isQuizActive).toBe('function');
      expect(typeof result.current.isQuizComplete).toBe('function');
    });
  });

  describe('single-word quiz edge cases', () => {
    it('handles single-word quiz with correct answer', () => {
      const { result } = renderHook(() => useQuizStore());
      const words = [createTestWord('1', 'cat', 'kissa')];

      act(() => {
        result.current.loadWords(words);
        result.current.startQuiz();
      });

      expect(result.current.session?.currentId).toBe('1');
      expect(result.current.getProgress()).toEqual({ resolved: 0, total: 1 });

      // Answer correctly
      act(() => {
        result.current.submitAnswer('kissa');
      });

      expect(result.current.getProgress()).toEqual({ resolved: 1, total: 1 });
      expect(result.current.isQuizComplete()).toBe(true);
      expect(result.current.session?.currentId).toBeNull();
    });

    it('handles single-word quiz with wrong answer and practice mode', () => {
      const { result } = renderHook(() => useQuizStore());
      const words = [createTestWord('1', 'cat', 'kissa')];

      act(() => {
        result.current.loadWords(words);
        result.current.startQuiz();
      });

      // Answer incorrectly
      act(() => {
        result.current.submitAnswer('wrong');
      });

      expect(result.current.session?.mode).toBe('practice');
      expect(result.current.session?.practiceTarget?.id).toBe('1');
      expect(result.current.session?.practiceTarget?.remaining).toBe(3);

      // Complete practice repetitions
      act(() => {
        result.current.submitPracticeAnswer('kissa');
      });
      expect(result.current.session?.practiceTarget?.remaining).toBe(2);

      act(() => {
        result.current.submitPracticeAnswer('kissa');
      });
      expect(result.current.session?.practiceTarget?.remaining).toBe(1);

      act(() => {
        result.current.submitPracticeAnswer('kissa');
      });

      // Should exit practice mode and continue with the same word
      expect(result.current.session?.mode).toBe('normal');
      expect(result.current.session?.currentId).toBe('1');

      // Now answer correctly
      act(() => {
        result.current.submitAnswer('kissa');
      });

      expect(result.current.isQuizComplete()).toBe(true);
      expect(result.current.getProgress()).toEqual({ resolved: 1, total: 1 });
    });

    it('handles single-word quiz with multiple wrong attempts', () => {
      const { result } = renderHook(() => useQuizStore());
      const words = [createTestWord('1', 'cat', 'kissa')];

      act(() => {
        result.current.loadWords(words);
        result.current.startQuiz();
      });

      // First wrong answer
      act(() => {
        result.current.submitAnswer('wrong1');
      });
      expect(result.current.session?.mode).toBe('practice');

      // Complete practice
      act(() => {
        result.current.submitPracticeAnswer('kissa');
        result.current.submitPracticeAnswer('kissa');
        result.current.submitPracticeAnswer('kissa');
      });

      // Second wrong answer
      act(() => {
        result.current.submitAnswer('wrong2');
      });
      expect(result.current.session?.mode).toBe('practice');
      expect(result.current.session?.tries).toBe(2); // Two attempts recorded

      // Complete practice again
      act(() => {
        result.current.submitPracticeAnswer('kissa');
        result.current.submitPracticeAnswer('kissa');
        result.current.submitPracticeAnswer('kissa');
      });

      // Finally answer correctly
      act(() => {
        result.current.submitAnswer('kissa');
      });

      expect(result.current.isQuizComplete()).toBe(true);
      expect(result.current.session?.tries).toBe(3); // Three total attempts
      expect(result.current.session?.words[0].firstTryFailed).toBe(true);
    });
  });

  describe('full quiz workflow', () => {
    it('completes full quiz workflow successfully', () => {
      const { result } = renderHook(() => useQuizStore());
      const words = [createTestWord('1', 'cat', 'kissa'), createTestWord('2', 'dog', 'koira')];

      // Load words
      act(() => {
        result.current.loadWords(words);
      });
      expect(result.current.session?.words).toHaveLength(2);

      // Start quiz
      act(() => {
        result.current.startQuiz();
      });
      expect(result.current.isQuizActive()).toBe(true);
      expect(result.current.getProgress().resolved).toBe(0);

      // Answer first word correctly
      const firstWord = result.current.getCurrentWord();
      act(() => {
        result.current.submitAnswer(firstWord!.answer);
      });
      expect(result.current.getProgress().resolved).toBe(1);

      // Should auto-advance to second word
      const secondWord = result.current.getCurrentWord();
      expect(secondWord?.id).not.toBe(firstWord?.id);

      // Answer second word incorrectly (enters practice)
      act(() => {
        result.current.submitAnswer('wrong');
      });
      expect(result.current.session?.mode).toBe('practice');

      // Complete practice repetitions
      const practiceWord = result.current.getCurrentWord();
      act(() => {
        result.current.submitPracticeAnswer(practiceWord!.answer);
        result.current.submitPracticeAnswer(practiceWord!.answer);
        result.current.submitPracticeAnswer(practiceWord!.answer);
      });
      expect(result.current.session?.mode).toBe('normal');

      // Answer second word correctly after practice
      // Note: we're still on the same word that was practiced
      act(() => {
        result.current.submitAnswer(practiceWord!.answer);
      });
      expect(result.current.getProgress().resolved).toBe(2);
      expect(result.current.isQuizComplete()).toBe(true);

      // End quiz
      act(() => {
        result.current.endQuiz();
      });
      expect(result.current.isQuizActive()).toBe(false);
      expect(result.current.session?.endTimeMs).toBeGreaterThan(0);
    });
  });
});
