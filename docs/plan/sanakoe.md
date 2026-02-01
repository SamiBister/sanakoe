
# SPEC.md — Language Quiz for Kids (9–13) (Next.js)

## 1) Goal

Build a **kid-friendly** web app to practice vocabulary for school language tests (ages **9–13**). The experience must be **gamified**, inspiring, and positive. Kids can upload a CSV word list **or** enter words manually in a table. The quiz asks words in random order until all are solved correctly.

---

## 2) Target Users

* Kids 9–13 years old
* Practicing for vocabulary tests
* Needs:

  * fast start
  * fun, encouraging feedback
  * learn from mistakes (repeat + practice)
  * motivation via **tries**, **time**, and **records**

---

## 3) Tech Constraints

* **Framework:** Next.js (latest stable), App Router preferred
* **Runs in browser** for MVP (no backend required)
* **State storage:** localStorage for personal best records + last entered list
* **i18n:** UI supports **Finnish and English**
* **UI:** kid-friendly, big buttons, clear typography, playful elements

---

## 4) Word List Input Methods

The app must support **two ways** to create a word list:

### A) File Upload (CSV)

* User uploads a CSV containing **two columns**:

  * Column 1 = prompt (asked word)
  * Column 2 = expected answer (translation)
* Separator: **comma `,`** as primary

  * (Recommended) auto-detect and support semicolon `;` too
* Header row may exist or not
* Trim whitespace; ignore empty rows

Example:

```csv
cat,kissa
dog,koira
house,talo
```

### B) Manual Entry (Table/Grid)

* User can choose “Enter words manually” instead of uploading a file.

#### Manual entry table requirements

* Two columns:

  * EN: `Word` | `Translation`
  * FI: `Sana` | `Käännös`
* Starts with several empty rows (e.g., 10)
* **Automatically adds a new empty row** when the user types in the last row
* Keyboard-first navigation:

  * Tab / Shift+Tab moves between cells
  * Tab at the last cell of the last row:

    * creates a new row
    * moves focus to next row first cell
  * Enter behaves like Tab (single-line inputs, no multi-line)

#### Validation

* Row is valid only if **both cells** have values (non-empty after trim)
* Start quiz is enabled only if at least 1 valid row exists
* Empty/incomplete rows ignored when starting quiz

#### Actions

* Start quiz
* Clear all (with confirmation)
* (Nice-to-have) Paste multi-row support from Excel/Sheets (tab-separated)

---

## 5) Core Quiz Logic (Precise)

### Definitions

* **Word pair:** `{prompt, answer}`
* **Unresolved queue:** list of word ids still not solved correctly
* **Resolved:** a word is removed from the unresolved queue **only** after a correct answer in normal mode
* **Tries:** number of submitted answers in normal mode (each submit increments tries)
* **Time:** stopwatch from first question displayed to quiz end

### Start Quiz

1. Create list of word pairs from either CSV or manual entry.
2. Deduplicate identical pairs (recommended).
3. Create `unresolvedQueue` from all word ids.
4. Shuffle the queue (random order).
5. Set `tries = 0`.
6. Start timer when first question is shown.

### Question Selection

* Use `unresolvedQueue[0]` as the current word.
* This guarantees a predictable repeat pattern and keeps logic simple.

---

## 6) Answer Flow

### Normal Mode (default)

For current word `(prompt, answer)`:

* Show prompt (Column 1)
* User types answer (Column 2)
* On submit:

  * `tries += 1`
  * Compare user answer with expected answer using matching rules (see section 10)

#### If correct

* Mark this word as resolved
* Remove it from `unresolvedQueue`
* Move to next word
* If `unresolvedQueue` is empty -> quiz ends

#### If wrong

* Show encouraging message (never shaming)
* Show the **correct answer**
* Enter Practice Mode (Write-it-3-times)
* The word remains unresolved and must come back later

---

## 7) Wrong Answer → Practice Mode (Answer Always Visible)

When the user answers incorrectly:

1. Show:

   * friendly “not quite” message
   * the **correct answer prominently**
2. Enter Practice Mode where:

   * The **correct answer remains visible on screen for all three repetitions**
   * User must type the correct answer **3 times**
   * Show counter `1/3`, `2/3`, `3/3`
   * Clear input after each successful entry
3. After 3 correct practice entries:

   * Exit Practice Mode
   * Move to next word
   * The original word remains unresolved:

     * rotate it to the back of the queue (recommended)
     * so it appears again later

### Practice Mode UI requirements

* Always visible:

  * Prompt (optional but recommended): column 1
  * Correct answer (column 2) in a highlighted card
  * Counter `Write it: 1/3 → 2/3 → 3/3`
  * Input + “Check” button

### Scoring rule for Practice Mode

* Recommended: practice repetitions do **not** count toward `tries`
* Only normal-mode answer submissions count toward `tries`

---

## 8) Queue Behavior (Repeat Until Learned)

Recommended queue operations:

* Current word is always `unresolvedQueue[0]`
* On correct: remove it
* On wrong:

  * keep unresolved
  * move it to end of queue (`shift` + `push`)
    This ensures mistakes return later but do not block progress.

---

## 9) Result Summary (End Screen)

When quiz ends, show:

* **Total words** (count loaded)
* **Total tries** (normal mode submissions)
* **Total time used**
* **Words not resolved on first try**

  * Definition: any word that had at least one wrong normal attempt before first correct
  * Show list: prompt and optionally correct answer

### Records (Personal Best)

Store per word list (use a list fingerprint/hash):

* Best (lowest) tries
* Best (shortest) time

If new record achieved:

* Show “🎉 New record!”
* Show motivational challenge text:

  * EN examples:

    * “Great job! Want to try even faster?”
    * “Nice! Can you solve them all on the first try?”
  * FI examples:

    * “Hienoa! Haluatko kokeilla vielä nopeammin?”
    * “Hyvä tulos! Pystytkö ratkaisemaan kaikki ensimmäisellä yrityksellä?”

### Result Page Actions

* **Restart quiz with current words**

  * reset state, reshuffle, reset timer and tries
* **Upload new list / Enter new words**

  * return to start flow

---

## 10) Matching Rules (Answers)

Default matching:

* Trim whitespace
* Case-insensitive comparison
* (Optional) collapse multiple spaces to one

Diacritics:

* MVP recommendation: exact (except case)
* (Future option) allow “lenient accents” toggle

---

## 11) Global “Word List” Button (Available Everywhere)

### Purpose

User can see the loaded words at any time (from any screen), without affecting quiz state.

### Requirements

* A persistent button visible on **all screens**:

  * Start / Upload
  * Quiz (normal)
  * Practice mode
  * Result
* Localized label:

  * EN: “Word list”
  * FI: “Sanat”
* Opens a modal/drawer overlay
* Does not reset/pause state and does not affect queue or timer

### Word List Overlay Content

Show all loaded word pairs:

* prompt → answer
* status indicator:

  * ✅ resolved
  * 🔁 unresolved
  * ⚠️ mistake made (not first try)

Optional nice-to-haves:

* highlight current word
* filter: all / unresolved / mistakes

Acceptance criteria:

* opens/closes without changing quiz progress or timer/tries

---

## 12) Screens / Pages

### A) Start Screen

* Friendly intro
* Choose language (FI/EN)
* Choose input method:

  * Upload CSV
  * Enter words manually (table)
* Start button enabled only when valid list exists

### B) Quiz Screen (Normal Mode)

* Header: progress (resolved/total), tries, timer
* Prompt large
* Answer input + submit
* Immediate feedback

### C) Practice Screen

* Correct answer always visible
* Must type correct answer 3 times
* Counter
* Encouraging microcopy

### D) Result Screen

* Summary metrics
* Record highlight
* Words not first try list
* Restart / new list options

---

## 13) Visual Style & Feedback Requirements

* Kid-friendly theme:

  * rounded cards
  * big buttons
  * playful icons (stars, trophy, rocket)
* Feedback tone:

  * encouraging, positive, never blaming
* (Optional) confetti animation on finish/new record

Graphics:

* If possible generate simple SVG assets (stars/trophy/rocket/confetti)
* Or list required assets clearly if custom art is needed

---

## 14) Data Model (Recommended)

```ts
type WordItem = {
  id: string;                // stable id (hash prompt+answer)
  prompt: string;
  answer: string;
  attempts: number;          // normal attempts only
  firstTryFailed: boolean;   // true if any wrong happened before first correct
  resolved: boolean;
};

type QuizSession = {
  words: WordItem[];
  unresolvedIds: string[];   // queue
  currentId: string | null;

  tries: number;
  startTimeMs: number;
  endTimeMs?: number;

  mode: "normal" | "practice";
  practiceTarget?: { id: string; remaining: number }; // 3..0
};

type Records = {
  [listFingerprint: string]: {
    bestTries?: number;
    bestTimeMs?: number;
    updatedAt: number;
  };
};
```

---

## 15) Persistence Rules

* Store personal best records in localStorage
* Store last-used word list:

  * manual entry table content
  * (optional) last uploaded parsed list (not the file itself)

---

## 16) Edge Cases

* Bad CSV: show friendly error and guidance
* Empty list: disable start
* Duplicate rows: deduplicate identical pairs (recommended)
* 1-word list: must still work

---

## 17) MVP Acceptance Criteria

App is complete when:

1. Supports CSV upload and manual entry table.
2. Quiz asks prompt from column 1; expects column 2.
3. Correct removes word from unresolved queue.
4. Wrong shows correct answer and enters practice mode.
5. In practice mode, correct answer is visible for all 3 entries.
6. Wrong words repeat later until solved correctly.
7. End screen shows total words, tries, time, and “not first try” list.
8. Records saved locally; new record displayed.
9. UI supports Finnish and English.
10. Global “Word list / Sanat” overlay available on all screens and shows word statuses.


