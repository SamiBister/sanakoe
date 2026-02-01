import { nanoid } from "nanoid";
import type { WordItem } from "./types";

/**
 * Error thrown when CSV parsing fails.
 * Provides user-friendly error messages for common CSV format issues.
 */
export class CSVParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CSVParseError";
  }
}

/**
 * Detects the delimiter used in a CSV file by analyzing the first line.
 * Supports comma (,) and semicolon (;) delimiters.
 *
 * @param firstLine - The first line of the CSV content
 * @returns The detected delimiter character
 */
function detectDelimiter(firstLine: string): "," | ";" {
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semicolonCount = (firstLine.match(/;/g) || []).length;

  // Prefer semicolon if both are present and semicolon count is higher or equal
  // This handles European CSV formats which often use semicolon
  if (semicolonCount > 0 && semicolonCount >= commaCount) {
    return ";";
  }

  return ",";
}

/**
 * Checks if a row appears to be a header row based on common patterns.
 * Header rows typically contain descriptive text rather than actual word pairs.
 *
 * @param cells - Array of cell values from the first row
 * @returns true if the row appears to be a header
 */
function isHeaderRow(cells: string[]): boolean {
  if (cells.length !== 2) return false;

  const [first, second] = cells.map((c) => c.toLowerCase().trim());

  // Common header patterns in multiple languages
  const headerPatterns = [
    "prompt",
    "question",
    "word",
    "term",
    "english",
    "finnish",
    "kysymys",
    "sana",
    "termi",
    "englanti",
    "suomi",
    "answer",
    "translation",
    "vastaus",
    "käännös",
    "from",
    "to",
    "source",
    "target",
  ];

  // Check if either cell matches common header patterns
  const matchesPattern = headerPatterns.some(
    (pattern) => first.includes(pattern) || second.includes(pattern),
  );

  return matchesPattern;
}

/**
 * Parses a single CSV line, handling quoted values and delimiters.
 *
 * @param line - A single line from the CSV
 * @param delimiter - The delimiter character to use
 * @returns Array of cell values
 */
function parseCSVLine(line: string, delimiter: string): string[] {
  const cells: string[] = [];
  let currentCell = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped quote (two consecutive quotes)
        currentCell += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote mode
        insideQuotes = !insideQuotes;
      }
    } else if (char === delimiter && !insideQuotes) {
      // End of cell
      cells.push(currentCell.trim());
      currentCell = "";
    } else {
      currentCell += char;
    }
  }

  // Add the last cell
  cells.push(currentCell.trim());

  return cells;
}

/**
 * Parses CSV content into an array of WordItem objects.
 *
 * Features:
 * - Auto-detects comma or semicolon delimiters
 * - Automatically skips header rows
 * - Trims whitespace from all cells
 * - Skips empty rows
 * - Generates stable IDs for each word pair
 * - Deduplicates identical word pairs
 * - Handles quoted values and escaped quotes
 *
 * @param content - Raw CSV file content as a string
 * @returns Array of parsed word items
 * @throws {CSVParseError} When CSV format is invalid or contains no valid data
 *
 * @example
 * ```typescript
 * const csv = `prompt,answer
 * cat,kissa
 * dog,koira`;
 * const words = parseCSV(csv);
 * // Returns: [
 * //   { id: '...', prompt: 'cat', answer: 'kissa', attempts: 0, firstTryFailed: false, resolved: false },
 * //   { id: '...', prompt: 'dog', answer: 'koira', attempts: 0, firstTryFailed: false, resolved: false }
 * // ]
 * ```
 */
export function parseCSV(content: string): WordItem[] {
  // Validate input
  if (!content || typeof content !== "string") {
    throw new CSVParseError("CSV content is empty or invalid");
  }

  // Normalize line endings and split into lines
  const lines = content
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0); // Remove empty lines

  if (lines.length === 0) {
    throw new CSVParseError("CSV file is empty");
  }

  // Detect delimiter from first line
  const delimiter = detectDelimiter(lines[0]);

  // Parse all lines
  const parsedLines = lines.map((line) => parseCSVLine(line, delimiter));

  // Check if first row is a header and skip it
  let startIndex = 0;
  if (parsedLines.length > 0 && isHeaderRow(parsedLines[0])) {
    startIndex = 1;
  }

  // Extract and validate word pairs
  const wordPairs: Array<{prompt: string; answer: string}> = [];

  for (let i = startIndex; i < parsedLines.length; i++) {
    const cells = parsedLines[i];

    // Validate row has exactly 2 columns
    if (cells.length === 1 && cells[0] === "") {
      // Empty row, skip
      continue;
    }

    if (cells.length < 2) {
      throw new CSVParseError(
        `Invalid CSV format at line ${i + 1}: Expected 2 columns, found ${cells.length}. ` +
          `Make sure each row has both a prompt and an answer separated by "${delimiter}".`,
      );
    }

    if (cells.length > 2) {
      // More than 2 columns - use first two and ignore rest
      console.warn(
        `Line ${i + 1}: Found ${cells.length} columns, using first two only`,
      );
    }

    const [prompt, answer] = cells;

    // Skip rows where either cell is empty
    if (!prompt || !answer) {
      continue;
    }

    wordPairs.push({
      prompt: prompt.trim(),
      answer: answer.trim(),
    });
  }

  // Validate we have at least one word pair
  if (wordPairs.length === 0) {
    throw new CSVParseError(
      "No valid word pairs found in CSV. Make sure each row has both a prompt and an answer.",
    );
  }

  // Deduplicate identical pairs
  const seen = new Set<string>();
  const uniquePairs: Array<{prompt: string; answer: string}> = [];

  for (const pair of wordPairs) {
    const key = `${pair.prompt.toLowerCase()}|${pair.answer.toLowerCase()}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniquePairs.push(pair);
    }
  }

  // Log if duplicates were removed
  const duplicateCount = wordPairs.length - uniquePairs.length;
  if (duplicateCount > 0) {
    console.info(
      `Removed ${duplicateCount} duplicate word pair${duplicateCount > 1 ? "s" : ""}`,
    );
  }

  // Convert to WordItem objects with generated IDs
  const wordItems: WordItem[] = uniquePairs.map((pair) => ({
    id: nanoid(),
    prompt: pair.prompt,
    answer: pair.answer,
    attempts: 0,
    firstTryFailed: false,
    resolved: false,
  }));

  return wordItems;
}
