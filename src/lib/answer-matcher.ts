/**
 * Answer Matcher - Validates user answers against correct answers
 * 
 * Provides fair, case-insensitive matching with whitespace normalization
 * for the kid-friendly vocabulary quiz application.
 */

/**
 * Matches a user's answer against the correct answer with normalization
 * 
 * Normalization steps:
 * 1. Trim leading/trailing whitespace
 * 2. Convert to lowercase for case-insensitive comparison
 * 3. Collapse multiple internal spaces to single space
 * 4. Compare exact match after normalization
 * 
 * @param userInput - The answer provided by the user
 * @param correctAnswer - The expected correct answer
 * @returns true if answers match after normalization, false otherwise
 * 
 * @example
 * ```typescript
 * matchAnswer("Hello", "hello") // true (case-insensitive)
 * matchAnswer("  hello  ", "hello") // true (whitespace trimmed)
 * matchAnswer("hello  world", "hello world") // true (spaces normalized)
 * matchAnswer("hello", "goodbye") // false (different words)
 * ```
 */
export function matchAnswer(userInput: string, correctAnswer: string): boolean {
  // Normalize both inputs
  const normalizedUser = normalizeString(userInput);
  const normalizedCorrect = normalizeString(correctAnswer);
  
  // Compare exact match after normalization
  return normalizedUser === normalizedCorrect;
}

/**
 * Normalizes a string for comparison
 * 
 * Applies the following transformations:
 * - Trims leading and trailing whitespace
 * - Converts to lowercase
 * - Collapses multiple spaces to single space
 * 
 * @param input - The string to normalize
 * @returns The normalized string
 * 
 * @internal
 */
function normalizeString(input: string): string {
  return input
    .trim()                      // Remove leading/trailing whitespace
    .toLowerCase()               // Case-insensitive comparison
    .replace(/\s+/g, ' ');      // Collapse multiple spaces to single space
}

/**
 * Type guard to check if a string is empty or only whitespace
 * 
 * @param input - The string to check
 * @returns true if string is empty or only whitespace
 * 
 * @example
 * ```typescript
 * isEmptyAnswer("") // true
 * isEmptyAnswer("   ") // true
 * isEmptyAnswer("hello") // false
 * ```
 */
export function isEmptyAnswer(input: string): boolean {
  return input.trim().length === 0;
}

/**
 * Provides a similarity score between two answers (0-1)
 * 
 * This is a simple character-based similarity metric that can be used
 * for future features like "close enough" feedback or hints.
 * 
 * Note: Not used in MVP but included for future enhancements.
 * 
 * @param userInput - The answer provided by the user
 * @param correctAnswer - The expected correct answer
 * @returns A similarity score between 0 (completely different) and 1 (exact match)
 * 
 * @example
 * ```typescript
 * getSimilarity("hello", "hello") // 1.0
 * getSimilarity("hello", "helo") // ~0.8
 * getSimilarity("hello", "goodbye") // ~0.14
 * ```
 */
export function getSimilarity(userInput: string, correctAnswer: string): number {
  const normalized1 = normalizeString(userInput);
  const normalized2 = normalizeString(correctAnswer);
  
  // Handle empty strings
  if (normalized1.length === 0 && normalized2.length === 0) return 1.0;
  if (normalized1.length === 0 || normalized2.length === 0) return 0.0;
  
  // Calculate Levenshtein distance
  const distance = levenshteinDistance(normalized1, normalized2);
  const maxLength = Math.max(normalized1.length, normalized2.length);
  
  // Convert distance to similarity score (0-1)
  return 1 - (distance / maxLength);
}

/**
 * Calculates the Levenshtein distance between two strings
 * 
 * The Levenshtein distance is the minimum number of single-character edits
 * (insertions, deletions, or substitutions) required to change one string
 * into another.
 * 
 * @param str1 - First string
 * @param str2 - Second string
 * @returns The Levenshtein distance
 * 
 * @internal
 */
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  
  // Create a 2D array for dynamic programming
  const matrix: number[][] = Array(len1 + 1)
    .fill(null)
    .map(() => Array(len2 + 1).fill(0));
  
  // Initialize first column and row
  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;
  
  // Fill the matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // Deletion
        matrix[i][j - 1] + 1,      // Insertion
        matrix[i - 1][j - 1] + cost // Substitution
      );
    }
  }
  
  return matrix[len1][len2];
}
