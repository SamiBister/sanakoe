/**
 * Unit tests for Answer Matcher
 *
 * Tests the answer validation logic with various edge cases including:
 * - Case sensitivity
 * - Whitespace handling
 * - Special characters
 * - Unicode and diacritics
 * - Empty inputs
 * - Similarity scoring
 */

import { getSimilarity, isEmptyAnswer, matchAnswer } from '../answer-matcher';

describe('matchAnswer', () => {
  describe('exact matches', () => {
    it('should match identical strings', () => {
      expect(matchAnswer('hello', 'hello')).toBe(true);
      expect(matchAnswer('world', 'world')).toBe(true);
      expect(matchAnswer('test', 'test')).toBe(true);
    });

    it('should match empty strings', () => {
      expect(matchAnswer('', '')).toBe(true);
    });
  });

  describe('case insensitivity', () => {
    it('should match different cases (lowercase vs uppercase)', () => {
      expect(matchAnswer('hello', 'HELLO')).toBe(true);
      expect(matchAnswer('HELLO', 'hello')).toBe(true);
      expect(matchAnswer('HeLLo', 'hElLO')).toBe(true);
    });

    it('should match mixed case variations', () => {
      expect(matchAnswer('Hello World', 'hello world')).toBe(true);
      expect(matchAnswer('GOODBYE', 'goodbye')).toBe(true);
    });
  });

  describe('whitespace normalization', () => {
    it('should match with leading whitespace', () => {
      expect(matchAnswer('  hello', 'hello')).toBe(true);
      expect(matchAnswer('hello', '  hello')).toBe(true);
      expect(matchAnswer('   hello', 'hello')).toBe(true);
    });

    it('should match with trailing whitespace', () => {
      expect(matchAnswer('hello  ', 'hello')).toBe(true);
      expect(matchAnswer('hello', 'hello  ')).toBe(true);
      expect(matchAnswer('hello   ', 'hello')).toBe(true);
    });

    it('should match with leading and trailing whitespace', () => {
      expect(matchAnswer('  hello  ', 'hello')).toBe(true);
      expect(matchAnswer('hello', '  hello  ')).toBe(true);
      expect(matchAnswer('   hello   ', 'hello')).toBe(true);
    });

    it('should collapse multiple internal spaces', () => {
      expect(matchAnswer('hello  world', 'hello world')).toBe(true);
      expect(matchAnswer('hello   world', 'hello world')).toBe(true);
      expect(matchAnswer('hello    world', 'hello world')).toBe(true);
      expect(matchAnswer('hello\t\tworld', 'hello world')).toBe(true);
    });

    it('should handle mixed whitespace (tabs, spaces, newlines)', () => {
      expect(matchAnswer('hello\tworld', 'hello world')).toBe(true);
      expect(matchAnswer('hello\nworld', 'hello world')).toBe(true);
      expect(matchAnswer('hello \t world', 'hello world')).toBe(true);
    });
  });

  describe('combined normalization', () => {
    it('should apply both case and whitespace normalization', () => {
      expect(matchAnswer('  HELLO  ', 'hello')).toBe(true);
      expect(matchAnswer('Hello  World', 'hello world')).toBe(true);
      expect(matchAnswer('  GOODBYE  ', 'goodbye')).toBe(true);
    });
  });

  describe('special characters', () => {
    it('should match strings with punctuation', () => {
      expect(matchAnswer("don't", "don't")).toBe(true);
      expect(matchAnswer('hello!', 'hello!')).toBe(true);
      expect(matchAnswer('test?', 'test?')).toBe(true);
    });

    it('should match strings with numbers', () => {
      expect(matchAnswer('test123', 'test123')).toBe(true);
      expect(matchAnswer('123', '123')).toBe(true);
      expect(matchAnswer('v2.0', 'v2.0')).toBe(true);
    });

    it('should match strings with special symbols', () => {
      expect(matchAnswer('hello@world', 'hello@world')).toBe(true);
      expect(matchAnswer('$100', '$100')).toBe(true);
      expect(matchAnswer('50%', '50%')).toBe(true);
    });

    it('should NOT match different punctuation', () => {
      expect(matchAnswer("don't", 'dont')).toBe(false);
      expect(matchAnswer('hello!', 'hello')).toBe(false);
      expect(matchAnswer('test?', 'test!')).toBe(false);
    });
  });

  describe('unicode and diacritics', () => {
    it('should match strings with diacritics (exact match)', () => {
      expect(matchAnswer('café', 'café')).toBe(true);
      expect(matchAnswer('naïve', 'naïve')).toBe(true);
      expect(matchAnswer('résumé', 'résumé')).toBe(true);
    });

    it('should NOT match diacritics vs plain (exact match for MVP)', () => {
      expect(matchAnswer('café', 'cafe')).toBe(false);
      expect(matchAnswer('naïve', 'naive')).toBe(false);
      expect(matchAnswer('résumé', 'resume')).toBe(false);
    });

    it('should match strings with emoji', () => {
      expect(matchAnswer('hello 👋', 'hello 👋')).toBe(true);
      expect(matchAnswer('test 🎉', 'test 🎉')).toBe(true);
    });

    it('should match Finnish characters', () => {
      expect(matchAnswer('äiti', 'äiti')).toBe(true);
      expect(matchAnswer('öljy', 'öljy')).toBe(true);
      expect(matchAnswer('Åland', 'åland')).toBe(true);
    });
  });

  describe('negative cases', () => {
    it('should NOT match different strings', () => {
      expect(matchAnswer('hello', 'goodbye')).toBe(false);
      expect(matchAnswer('world', 'word')).toBe(false);
      expect(matchAnswer('test', 'testing')).toBe(false);
    });

    it('should NOT match partial strings', () => {
      expect(matchAnswer('hello', 'hello world')).toBe(false);
      expect(matchAnswer('test', 'testing')).toBe(false);
      expect(matchAnswer('cat', 'cats')).toBe(false);
    });

    it('should NOT match empty vs non-empty', () => {
      expect(matchAnswer('', 'hello')).toBe(false);
      expect(matchAnswer('hello', '')).toBe(false);
      expect(matchAnswer('   ', 'hello')).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle very long strings', () => {
      const longString = 'a'.repeat(1000);
      expect(matchAnswer(longString, longString)).toBe(true);
      expect(matchAnswer(longString.toUpperCase(), longString)).toBe(true);
    });

    it('should handle strings with only whitespace', () => {
      expect(matchAnswer('   ', '   ')).toBe(true);
      expect(matchAnswer('\t\t\t', '   ')).toBe(true);
      expect(matchAnswer('\n\n', '  ')).toBe(true);
    });

    it('should handle single character strings', () => {
      expect(matchAnswer('a', 'a')).toBe(true);
      expect(matchAnswer('A', 'a')).toBe(true);
      expect(matchAnswer('a', 'b')).toBe(false);
    });
  });
});

describe('isEmptyAnswer', () => {
  it('should return true for empty strings', () => {
    expect(isEmptyAnswer('')).toBe(true);
  });

  it('should return true for whitespace-only strings', () => {
    expect(isEmptyAnswer('   ')).toBe(true);
    expect(isEmptyAnswer('\t')).toBe(true);
    expect(isEmptyAnswer('\n')).toBe(true);
    expect(isEmptyAnswer('  \t  \n  ')).toBe(true);
  });

  it('should return false for non-empty strings', () => {
    expect(isEmptyAnswer('hello')).toBe(false);
    expect(isEmptyAnswer('  hello  ')).toBe(false);
    expect(isEmptyAnswer('a')).toBe(false);
  });

  it('should return false for strings with only special characters', () => {
    expect(isEmptyAnswer('!')).toBe(false);
    expect(isEmptyAnswer('.')).toBe(false);
    expect(isEmptyAnswer('?')).toBe(false);
  });
});

describe('getSimilarity', () => {
  describe('exact matches', () => {
    it('should return 1.0 for identical strings', () => {
      expect(getSimilarity('hello', 'hello')).toBe(1.0);
      expect(getSimilarity('world', 'world')).toBe(1.0);
      expect(getSimilarity('', '')).toBe(1.0);
    });

    it('should return 1.0 for case-insensitive matches', () => {
      expect(getSimilarity('Hello', 'hello')).toBe(1.0);
      expect(getSimilarity('WORLD', 'world')).toBe(1.0);
    });

    it('should return 1.0 for whitespace-normalized matches', () => {
      expect(getSimilarity('  hello  ', 'hello')).toBe(1.0);
      expect(getSimilarity('hello  world', 'hello world')).toBe(1.0);
    });
  });

  describe('no similarity', () => {
    it('should return 0.0 when one string is empty', () => {
      expect(getSimilarity('', 'hello')).toBe(0.0);
      expect(getSimilarity('hello', '')).toBe(0.0);
    });
  });

  describe('partial similarity', () => {
    it('should return high similarity for close matches', () => {
      // "helo" vs "hello" (1 char difference)
      const similarity1 = getSimilarity('helo', 'hello');
      expect(similarity1).toBeGreaterThan(0.7);
      expect(similarity1).toBeLessThan(1.0);

      // "wrld" vs "world" (1 char difference)
      const similarity2 = getSimilarity('wrld', 'world');
      expect(similarity2).toBeGreaterThan(0.7);
      expect(similarity2).toBeLessThan(1.0);
    });

    it('should return medium similarity for moderate matches', () => {
      // "hello" vs "hallo" (1 substitution)
      const similarity1 = getSimilarity('hello', 'hallo');
      expect(similarity1).toBeGreaterThan(0.5);
      expect(similarity1).toBeLessThan(0.9);

      // "test" vs "toast" (2 substitutions)
      const similarity2 = getSimilarity('test', 'toast');
      expect(similarity2).toBeGreaterThan(0.3);
      expect(similarity2).toBeLessThan(0.7);
    });

    it('should return low similarity for very different strings', () => {
      const similarity1 = getSimilarity('hello', 'goodbye');
      expect(similarity1).toBeLessThan(0.5);

      const similarity2 = getSimilarity('cat', 'dog');
      expect(similarity2).toBeLessThan(0.5);
    });
  });

  describe('edge cases', () => {
    it('should handle single character strings', () => {
      expect(getSimilarity('a', 'a')).toBe(1.0);
      expect(getSimilarity('a', 'b')).toBe(0.0);
    });

    it('should handle different length strings', () => {
      const similarity1 = getSimilarity('hi', 'hello');
      expect(similarity1).toBeGreaterThan(0);
      expect(similarity1).toBeLessThan(1);

      const similarity2 = getSimilarity('test', 'testing');
      expect(similarity2).toBeGreaterThan(0.5);
      expect(similarity2).toBeLessThan(1);
    });
  });
});
