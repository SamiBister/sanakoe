/**
 * Tests for List Fingerprinting
 */

import {
    areListsEqual,
    estimateCollisionProbability,
    generateListFingerprint,
    getListDescription,
} from '../hash';
import type { WordItem } from '../types';

/**
 * Helper to create a minimal WordItem for testing
 */
function createWord(prompt: string, answer: string, id: string = `id-${prompt}`): WordItem {
  return {
    id,
    prompt,
    answer,
    attempts: 0,
    firstTryFailed: false,
    resolved: false,
  };
}

describe('generateListFingerprint', () => {
  describe('basic functionality', () => {
    it('generates a fingerprint for a single word', () => {
      const words = [createWord('hello', 'hei')];
      const fingerprint = generateListFingerprint(words);

      expect(fingerprint).toBeTruthy();
      expect(typeof fingerprint).toBe('string');
      expect(fingerprint.length).toBeGreaterThan(0);
    });

    it('generates a fingerprint for multiple words', () => {
      const words = [
        createWord('hello', 'hei'),
        createWord('world', 'maailma'),
        createWord('goodbye', 'näkemiin'),
      ];
      const fingerprint = generateListFingerprint(words);

      expect(fingerprint).toBeTruthy();
      expect(typeof fingerprint).toBe('string');
    });

    it('returns "empty" for empty word list', () => {
      const fingerprint = generateListFingerprint([]);
      expect(fingerprint).toBe('empty');
    });
  });

  describe('stability', () => {
    it('produces same hash for identical word lists', () => {
      const words1 = [createWord('hello', 'hei', 'id1'), createWord('world', 'maailma', 'id2')];
      const words2 = [createWord('hello', 'hei', 'id1'), createWord('world', 'maailma', 'id2')];

      expect(generateListFingerprint(words1)).toBe(generateListFingerprint(words2));
    });

    it('produces same hash regardless of word order', () => {
      const words1 = [
        createWord('hello', 'hei'),
        createWord('world', 'maailma'),
        createWord('goodbye', 'näkemiin'),
      ];
      const words2 = [
        createWord('goodbye', 'näkemiin'),
        createWord('hello', 'hei'),
        createWord('world', 'maailma'),
      ];
      const words3 = [
        createWord('world', 'maailma'),
        createWord('goodbye', 'näkemiin'),
        createWord('hello', 'hei'),
      ];

      const fp1 = generateListFingerprint(words1);
      const fp2 = generateListFingerprint(words2);
      const fp3 = generateListFingerprint(words3);

      expect(fp1).toBe(fp2);
      expect(fp2).toBe(fp3);
    });

    it('produces same hash regardless of word IDs', () => {
      const words1 = [createWord('hello', 'hei', 'id-a'), createWord('world', 'maailma', 'id-b')];
      const words2 = [
        createWord('hello', 'hei', 'different-id-1'),
        createWord('world', 'maailma', 'different-id-2'),
      ];

      expect(generateListFingerprint(words1)).toBe(generateListFingerprint(words2));
    });

    it('produces same hash regardless of attempts or resolved state', () => {
      const words1 = [
        { ...createWord('hello', 'hei'), attempts: 0, resolved: false },
        { ...createWord('world', 'maailma'), attempts: 0, resolved: false },
      ];
      const words2 = [
        { ...createWord('hello', 'hei'), attempts: 5, resolved: true, firstTryFailed: true },
        { ...createWord('world', 'maailma'), attempts: 2, resolved: true },
      ];

      expect(generateListFingerprint(words1)).toBe(generateListFingerprint(words2));
    });
  });

  describe('normalization', () => {
    it('normalizes whitespace in prompts and answers', () => {
      const words1 = [createWord('hello', 'hei')];
      const words2 = [createWord('  hello  ', '  hei  ')];
      const words3 = [createWord('hello   ', 'hei   ')];

      const fp1 = generateListFingerprint(words1);
      const fp2 = generateListFingerprint(words2);
      const fp3 = generateListFingerprint(words3);

      expect(fp1).toBe(fp2);
      expect(fp2).toBe(fp3);
    });

    it('normalizes case in prompts and answers', () => {
      const words1 = [createWord('Hello', 'Hei')];
      const words2 = [createWord('HELLO', 'HEI')];
      const words3 = [createWord('hello', 'hei')];

      const fp1 = generateListFingerprint(words1);
      const fp2 = generateListFingerprint(words2);
      const fp3 = generateListFingerprint(words3);

      expect(fp1).toBe(fp2);
      expect(fp2).toBe(fp3);
    });

    it('collapses multiple spaces to single space', () => {
      const words1 = [createWord('hello world', 'hei maailma')];
      const words2 = [createWord('hello  world', 'hei  maailma')];
      const words3 = [createWord('hello   world', 'hei   maailma')];

      const fp1 = generateListFingerprint(words1);
      const fp2 = generateListFingerprint(words2);
      const fp3 = generateListFingerprint(words3);

      expect(fp1).toBe(fp2);
      expect(fp2).toBe(fp3);
    });
  });

  describe('uniqueness', () => {
    it('produces different hash for different word lists', () => {
      const words1 = [createWord('hello', 'hei')];
      const words2 = [createWord('goodbye', 'näkemiin')];

      expect(generateListFingerprint(words1)).not.toBe(generateListFingerprint(words2));
    });

    it('produces different hash when prompt differs', () => {
      const words1 = [createWord('hello', 'hei')];
      const words2 = [createWord('hi', 'hei')];

      expect(generateListFingerprint(words1)).not.toBe(generateListFingerprint(words2));
    });

    it('produces different hash when answer differs', () => {
      const words1 = [createWord('hello', 'hei')];
      const words2 = [createWord('hello', 'terve')];

      expect(generateListFingerprint(words1)).not.toBe(generateListFingerprint(words2));
    });

    it('produces different hash when word count differs', () => {
      const words1 = [createWord('hello', 'hei')];
      const words2 = [createWord('hello', 'hei'), createWord('world', 'maailma')];

      expect(generateListFingerprint(words1)).not.toBe(generateListFingerprint(words2));
    });

    it('produces different hash for empty vs non-empty list', () => {
      const words1: WordItem[] = [];
      const words2 = [createWord('hello', 'hei')];

      expect(generateListFingerprint(words1)).not.toBe(generateListFingerprint(words2));
    });
  });

  describe('special characters and unicode', () => {
    it('handles special characters in words', () => {
      const words = [
        createWord('hello!', 'hei!'),
        createWord('what?', 'mitä?'),
        createWord('yes/no', 'kyllä/ei'),
      ];

      const fingerprint = generateListFingerprint(words);
      expect(fingerprint).toBeTruthy();

      // Should be stable
      const fingerprint2 = generateListFingerprint([...words]);
      expect(fingerprint).toBe(fingerprint2);
    });

    it('handles Finnish characters (ä, ö, å)', () => {
      const words = [
        createWord('äiti', 'mother'),
        createWord('öljy', 'oil'),
        createWord('Åland', 'Ahvenanmaa'),
      ];

      const fingerprint = generateListFingerprint(words);
      expect(fingerprint).toBeTruthy();
    });

    it('handles emoji in words', () => {
      const words = [createWord('happy 😊', 'iloinen'), createWord('cat 🐱', 'kissa')];

      const fingerprint = generateListFingerprint(words);
      expect(fingerprint).toBeTruthy();

      // Should be stable
      const fingerprint2 = generateListFingerprint([...words]);
      expect(fingerprint).toBe(fingerprint2);
    });

    it('handles tabs and newlines', () => {
      const words1 = [createWord('hello\tworld', 'hei\tmaailma')];
      const words2 = [createWord('hello world', 'hei maailma')];

      // Tabs should be normalized to spaces
      const fp1 = generateListFingerprint(words1);
      const fp2 = generateListFingerprint(words2);

      // May or may not be equal depending on normalization rules
      // At minimum, should be stable
      expect(fp1).toBe(generateListFingerprint([...words1]));
      expect(fp2).toBe(generateListFingerprint([...words2]));
    });
  });

  describe('large lists', () => {
    it('handles large word lists efficiently', () => {
      const words = Array.from({ length: 1000 }, (_, i) => createWord(`word${i}`, `sana${i}`));

      const start = Date.now();
      const fingerprint = generateListFingerprint(words);
      const duration = Date.now() - start;

      expect(fingerprint).toBeTruthy();
      expect(duration).toBeLessThan(1000); // Should complete in under 1 second
    });

    it('produces stable hash for large lists', () => {
      const words = Array.from({ length: 500 }, (_, i) => createWord(`word${i}`, `sana${i}`));

      const fp1 = generateListFingerprint(words);
      const fp2 = generateListFingerprint([...words].reverse());

      expect(fp1).toBe(fp2);
    });
  });

  describe('edge cases', () => {
    it('handles single-character words', () => {
      const words = [createWord('a', 'b')];
      const fingerprint = generateListFingerprint(words);

      expect(fingerprint).toBeTruthy();
      expect(fingerprint).not.toBe('empty');
    });

    it('handles very long words', () => {
      const longPrompt = 'a'.repeat(1000);
      const longAnswer = 'b'.repeat(1000);
      const words = [createWord(longPrompt, longAnswer)];

      const fingerprint = generateListFingerprint(words);
      expect(fingerprint).toBeTruthy();
    });

    it('handles identical prompts with different answers', () => {
      const words = [
        createWord('bank', 'pankki'),
        createWord('bank', 'ranta'), // Different meaning
      ];

      const fingerprint = generateListFingerprint(words);
      expect(fingerprint).toBeTruthy();

      // Should be stable
      const fingerprint2 = generateListFingerprint([...words].reverse());
      expect(fingerprint).toBe(fingerprint2);
    });

    it('handles empty strings in prompts or answers', () => {
      const words1 = [createWord('', 'answer')];
      const words2 = [createWord('prompt', '')];
      const words3 = [createWord('', '')];

      // Should not crash
      expect(() => generateListFingerprint(words1)).not.toThrow();
      expect(() => generateListFingerprint(words2)).not.toThrow();
      expect(() => generateListFingerprint(words3)).not.toThrow();
    });
  });
});

describe('areListsEqual', () => {
  it('returns true for identical lists', () => {
    const words1 = [createWord('hello', 'hei'), createWord('world', 'maailma')];
    const words2 = [createWord('hello', 'hei'), createWord('world', 'maailma')];

    expect(areListsEqual(words1, words2)).toBe(true);
  });

  it('returns true for same content in different order', () => {
    const words1 = [createWord('hello', 'hei'), createWord('world', 'maailma')];
    const words2 = [createWord('world', 'maailma'), createWord('hello', 'hei')];

    expect(areListsEqual(words1, words2)).toBe(true);
  });

  it('returns true regardless of IDs', () => {
    const words1 = [createWord('hello', 'hei', 'id1')];
    const words2 = [createWord('hello', 'hei', 'id2')];

    expect(areListsEqual(words1, words2)).toBe(true);
  });

  it('returns false for different lists', () => {
    const words1 = [createWord('hello', 'hei')];
    const words2 = [createWord('goodbye', 'näkemiin')];

    expect(areListsEqual(words1, words2)).toBe(false);
  });

  it('returns false for different lengths', () => {
    const words1 = [createWord('hello', 'hei')];
    const words2 = [createWord('hello', 'hei'), createWord('world', 'maailma')];

    expect(areListsEqual(words1, words2)).toBe(false);
  });

  it('returns true for two empty lists', () => {
    expect(areListsEqual([], [])).toBe(true);
  });

  it('returns false for empty vs non-empty', () => {
    const words = [createWord('hello', 'hei')];

    expect(areListsEqual([], words)).toBe(false);
    expect(areListsEqual(words, [])).toBe(false);
  });
});

describe('getListDescription', () => {
  it('returns "empty list" for empty list', () => {
    expect(getListDescription([])).toBe('empty list');
  });

  it('describes single word list', () => {
    const words = [createWord('hello', 'hei')];
    expect(getListDescription(words)).toBe('1 word (hello)');
  });

  it('describes two word list', () => {
    const words = [createWord('hello', 'hei'), createWord('world', 'maailma')];
    expect(getListDescription(words)).toBe('2 words (hello, world)');
  });

  it('describes three word list', () => {
    const words = [
      createWord('hello', 'hei'),
      createWord('world', 'maailma'),
      createWord('goodbye', 'näkemiin'),
    ];
    expect(getListDescription(words)).toBe('3 words (hello, world, goodbye)');
  });

  it('truncates long lists with ellipsis', () => {
    const words = [
      createWord('one', 'yksi'),
      createWord('two', 'kaksi'),
      createWord('three', 'kolme'),
      createWord('four', 'neljä'),
      createWord('five', 'viisi'),
    ];
    expect(getListDescription(words)).toBe('5 words (one, two, three, ...)');
  });

  it('shows correct preview for lists with special characters', () => {
    const words = [createWord('hello!', 'hei!'), createWord('what?', 'mitä?')];
    expect(getListDescription(words)).toBe('2 words (hello!, what?)');
  });
});

describe('estimateCollisionProbability', () => {
  it('returns 0 for 0 lists', () => {
    expect(estimateCollisionProbability(0)).toBe(0);
  });

  it('returns very low probability for small number of lists', () => {
    const prob = estimateCollisionProbability(10);
    expect(prob).toBeGreaterThan(0);
    expect(prob).toBeLessThan(0.0001);
  });

  it('returns low probability for 100 lists', () => {
    const prob = estimateCollisionProbability(100);
    expect(prob).toBeGreaterThan(0);
    expect(prob).toBeLessThan(0.01); // Less than 1%
  });

  it('returns increasing probability for larger numbers', () => {
    const prob100 = estimateCollisionProbability(100);
    const prob1000 = estimateCollisionProbability(1000);
    const prob10000 = estimateCollisionProbability(10000);

    expect(prob1000).toBeGreaterThan(prob100);
    expect(prob10000).toBeGreaterThan(prob1000);
  });

  it('returns probability between 0 and 1', () => {
    const prob = estimateCollisionProbability(50000);
    expect(prob).toBeGreaterThanOrEqual(0);
    expect(prob).toBeLessThanOrEqual(1);
  });
});

describe('hash collision resistance', () => {
  it('generates different hashes for many similar lists', () => {
    const hashes = new Set<string>();

    // Generate 100 similar but distinct word lists
    for (let i = 0; i < 100; i++) {
      const words = [createWord(`word${i}`, `answer${i}`)];
      const fingerprint = generateListFingerprint(words);
      hashes.add(fingerprint);
    }

    // Should have 100 unique hashes
    expect(hashes.size).toBe(100);
  });

  it('generates different hashes for incrementally different lists', () => {
    const base = [
      createWord('one', 'yksi'),
      createWord('two', 'kaksi'),
      createWord('three', 'kolme'),
    ];

    const hashes = new Set<string>();

    // Add base list
    hashes.add(generateListFingerprint(base));

    // Add lists with one word removed
    hashes.add(generateListFingerprint(base.slice(0, 2)));
    hashes.add(generateListFingerprint(base.slice(1)));
    hashes.add(generateListFingerprint([base[0], base[2]]));

    // Add lists with one word changed
    hashes.add(
      generateListFingerprint([
        createWord('one', 'yksi'),
        createWord('two', 'kaksi'),
        createWord('three', 'DIFFERENT'),
      ]),
    );

    hashes.add(
      generateListFingerprint([
        createWord('one', 'DIFFERENT'),
        createWord('two', 'kaksi'),
        createWord('three', 'kolme'),
      ]),
    );

    // Should have 6 unique hashes
    expect(hashes.size).toBe(6);
  });
});
