/**
 * Unit tests for CSV Parser
 * Tests all parsing scenarios including edge cases and error handling
 */

import { CSVParseError, parseCSV } from "../csv-parser";

describe("CSV Parser", () => {
  describe("Basic Parsing", () => {
    it("should parse comma-separated values correctly", () => {
      const csv = "cat,kissa\ndog,koira\nbird,lintu";
      const result = parseCSV(csv);

      expect(result).toHaveLength(3);
      expect(result[0].prompt).toBe("cat");
      expect(result[0].answer).toBe("kissa");
      expect(result[1].prompt).toBe("dog");
      expect(result[1].answer).toBe("koira");
      expect(result[2].prompt).toBe("bird");
      expect(result[2].answer).toBe("lintu");

      // Verify all items have required properties
      result.forEach((word) => {
        expect(word).toHaveProperty("id");
        expect(word.id).toBeTruthy();
        expect(word.attempts).toBe(0);
        expect(word.firstTryFailed).toBe(false);
        expect(word.resolved).toBe(false);
      });
    });

    it("should parse semicolon-separated values correctly", () => {
      const csv = "house;talo\ncar;auto\nbook;kirja";
      const result = parseCSV(csv);

      expect(result).toHaveLength(3);
      expect(result[0].prompt).toBe("house");
      expect(result[0].answer).toBe("talo");
      expect(result[1].prompt).toBe("car");
      expect(result[1].answer).toBe("auto");
    });
  });

  describe("Header Row Detection", () => {
    it("should skip header row when detected (English)", () => {
      const csv = "English,Finnish\napple,omena\norange,appelsiini";
      const result = parseCSV(csv);

      expect(result).toHaveLength(2);
      expect(result[0].prompt).toBe("apple");
      expect(result[0].answer).toBe("omena");
      expect(result[1].prompt).toBe("orange");
      expect(result[1].answer).toBe("appelsiini");
    });

    it("should skip header row when detected (Finnish)", () => {
      const csv = "sana,käännös\ncat,kissa\ndog,koira";
      const result = parseCSV(csv);

      expect(result).toHaveLength(2);
      expect(result[0].prompt).toBe("cat");
      expect(result[0].answer).toBe("kissa");
    });

    it("should skip header row with common patterns", () => {
      const csv = "prompt,answer\ntest1,test2\ntest3,test4";
      const result = parseCSV(csv);

      expect(result).toHaveLength(2);
      expect(result[0].prompt).toBe("test1");
    });
  });

  describe("Whitespace Handling", () => {
    it("should trim extra whitespace from cells", () => {
      const csv = "  cat  ,  kissa  \n  dog  ,  koira  ";
      const result = parseCSV(csv);

      expect(result).toHaveLength(2);
      expect(result[0].prompt).toBe("cat");
      expect(result[0].answer).toBe("kissa");
      expect(result[1].prompt).toBe("dog");
      expect(result[1].answer).toBe("koira");
    });

    it("should skip empty rows", () => {
      const csv = "cat,kissa\n\n\ndog,koira\n\n";
      const result = parseCSV(csv);

      expect(result).toHaveLength(2);
      expect(result[0].prompt).toBe("cat");
      expect(result[1].prompt).toBe("dog");
    });
  });

  describe("Deduplication", () => {
    it("should deduplicate identical pairs (case-insensitive)", () => {
      const csv = "cat,kissa\ndog,koira\ncat,kissa\nbird,lintu\nCAT,KISSA";
      const result = parseCSV(csv);

      expect(result).toHaveLength(3);
      expect(result.map((w) => w.prompt)).toEqual(["cat", "dog", "bird"]);
    });

    it("should keep pairs with same prompt but different answer", () => {
      const csv = "set,asettaa\nset,sarja";
      const result = parseCSV(csv);

      expect(result).toHaveLength(2);
    });
  });

  describe("Quoted Values", () => {
    it("should handle quoted values with commas inside", () => {
      const csv = '"hello, world",terve\n"goodbye, friend",näkemiin';
      const result = parseCSV(csv);

      expect(result).toHaveLength(2);
      expect(result[0].prompt).toBe("hello, world");
      expect(result[0].answer).toBe("terve");
      expect(result[1].prompt).toBe("goodbye, friend");
      expect(result[1].answer).toBe("näkemiin");
    });

    it("should handle escaped quotes correctly", () => {
      const csv = '"He said ""hello""","Hän sanoi ""terve"""';
      const result = parseCSV(csv);

      expect(result).toHaveLength(1);
      expect(result[0].prompt).toBe('He said "hello"');
      expect(result[0].answer).toBe('Hän sanoi "terve"');
    });
  });

  describe("Delimiter Detection", () => {
    it("should prefer semicolon when both delimiters present", () => {
      const csv = "cat;kissa,test\ndog;koira,test";
      const result = parseCSV(csv);

      expect(result).toHaveLength(2);
      expect(result[0].prompt).toBe("cat");
      expect(result[0].answer).toBe("kissa,test");
    });
  });

  describe("Line Ending Normalization", () => {
    it("should handle different line endings (CRLF, LF, CR)", () => {
      const csv = "cat,kissa\r\ndog,koira\rbird,lintu\nfish,kala";
      const result = parseCSV(csv);

      expect(result).toHaveLength(4);
      expect(result.map((w) => w.prompt)).toEqual([
        "cat",
        "dog",
        "bird",
        "fish",
      ]);
    });
  });

  describe("Special Characters", () => {
    it("should handle special characters and unicode", () => {
      const csv = "café,kahvila\nnaïve,naiivi\n日本,Japan";
      const result = parseCSV(csv);

      expect(result).toHaveLength(3);
      expect(result[0].prompt).toBe("café");
      expect(result[1].prompt).toBe("naïve");
      expect(result[2].prompt).toBe("日本");
      expect(result[2].answer).toBe("Japan");
    });

    it("should handle emoji characters", () => {
      const csv = "😀,smile\n🌟,star";
      const result = parseCSV(csv);

      expect(result).toHaveLength(2);
      expect(result[0].prompt).toBe("😀");
      expect(result[0].answer).toBe("smile");
    });
  });

  describe("Incomplete Data", () => {
    it("should skip rows with missing answer", () => {
      const csv = "cat,kissa\ndog,\nbird,lintu";
      const result = parseCSV(csv);

      expect(result).toHaveLength(2);
      expect(result.map((w) => w.prompt)).toEqual(["cat", "bird"]);
    });

    it("should skip rows with missing prompt", () => {
      const csv = "cat,kissa\n,koira\nbird,lintu";
      const result = parseCSV(csv);

      expect(result).toHaveLength(2);
      expect(result.map((w) => w.prompt)).toEqual(["cat", "bird"]);
    });
  });

  describe("Extra Columns", () => {
    it("should use first two columns and ignore extras", () => {
      const csv = "cat,kissa,extra,data\ndog,koira,more,stuff";
      const result = parseCSV(csv);

      expect(result).toHaveLength(2);
      expect(result[0].prompt).toBe("cat");
      expect(result[0].answer).toBe("kissa");
      expect(result[1].prompt).toBe("dog");
      expect(result[1].answer).toBe("koira");
    });
  });

  describe("Error Handling", () => {
    it("should throw error for empty CSV", () => {
      expect(() => parseCSV("")).toThrow(CSVParseError);
      expect(() => parseCSV("")).toThrow("empty");
    });

    it("should throw error for whitespace-only CSV", () => {
      expect(() => parseCSV("   \n\n  ")).toThrow(CSVParseError);
      expect(() => parseCSV("   \n\n  ")).toThrow("empty");
    });

    it("should throw error for single column", () => {
      expect(() => parseCSV("cat\ndog\nbird")).toThrow(CSVParseError);
      expect(() => parseCSV("cat\ndog\nbird")).toThrow("2 columns");
    });

    it("should throw error when no valid pairs found", () => {
      const csv = "prompt,answer\n,\n ,  ";
      expect(() => parseCSV(csv)).toThrow(CSVParseError);
      expect(() => parseCSV(csv)).toThrow("No valid word pairs");
    });

    it("should throw error for null input", () => {
      expect(() => parseCSV(null as any)).toThrow(CSVParseError);
    });

    it("should throw error for undefined input", () => {
      expect(() => parseCSV(undefined as any)).toThrow(CSVParseError);
    });
  });

  describe("ID Generation", () => {
    it("should generate unique IDs for each word", () => {
      const csv = "cat,kissa\ndog,koira\nbird,lintu";
      const result = parseCSV(csv);

      const ids = result.map((w) => w.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(result.length);
    });

    it("should generate stable IDs (different IDs for different words)", () => {
      const csv1 = "cat,kissa";
      const csv2 = "dog,koira";

      const result1 = parseCSV(csv1);
      const result2 = parseCSV(csv2);

      expect(result1[0].id).not.toBe(result2[0].id);
    });
  });

  describe("Large Files", () => {
    it("should handle large CSV files efficiently", () => {
      // Generate CSV with 1000 words
      const lines = ["prompt,answer"];
      for (let i = 0; i < 1000; i++) {
        lines.push(`word${i},käännös${i}`);
      }
      const csv = lines.join("\n");

      const startTime = Date.now();
      const result = parseCSV(csv);
      const endTime = Date.now();

      expect(result).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(1000); // Should parse in less than 1 second
    });
  });
});
