# Flashcard App — Requirements & Implementation Plan

**Date:** 2026-03-31
**Status:** Draft
**Reference codebase:** `sanakoe` (vocabulary quiz, Next.js 16 / Tailwind v4 / Zustand / next-intl)

---

## PART 1 — REQUIREMENTS

---

### 1.1 Overview

A browser-only flashcard application built with the same tech stack as *sanakoe*. Users create
card decks (question / answer pairs), then flip through them in a self-judged session: they see
the question, think of the answer mentally, reveal it, then mark themselves Correct or Wrong.
Wrong cards are re-queued and shown again. The session ends when every card has been marked
correct at least once. A results screen displays performance statistics.

The app has **no backend, no database, and no authentication**. All data lives in `localStorage`.

---

### 1.2 Functional Requirements

#### FR-01 Card Management — Editor

| ID | Requirement |
|----|-------------|
| FR-01-A | User can open an **Editor** screen at any time to view and modify the current deck. |
| FR-01-B | Editor displays cards in an editable two-column table (Question / Answer), following the same UX as `ManualEntryTable` in sanakoe — keyboard navigation (Tab / Shift+Tab / Enter), auto-expand last row, tab-separated paste. |
| FR-01-C | User can add new rows, edit any existing row, and delete individual rows via a delete icon. |
| FR-01-D | User can upload a CSV file (two columns: question, answer) using the same drag-and-drop/browse pattern as `WordListUpload` in sanakoe; the parsed cards are merged into the editor. |
| FR-01-E | The deck is saved to `localStorage` automatically whenever it changes; it is restored on next visit. |
| FR-01-F | User can clear the entire deck (with a confirmation dialog, like `ManualEntryTable.confirmClearAll`). |
| FR-01-G | A card may not have an empty question or an empty answer; such rows are ignored for the session but kept in the editor. |

#### FR-02 Session Flow

| ID | Requirement |
|----|-------------|
| FR-02-A | A **Start** screen (home) shows the deck summary (card count) and a "Start Session" button. If a previously saved deck exists it is shown with a "Start with saved deck" shortcut (mirror of sanakoe's `savedWords` banner). |
| FR-02-B | Before starting, cards are shuffled (Fisher-Yates, same as `shuffleArray` in sanakoe). |
| FR-02-C | The session shows one card at a time. Only the **Question** side is shown initially. |
| FR-02-D | A "Show Answer" button reveals the **Answer** below the question. |
| FR-02-E | After the answer is revealed, two action buttons appear: **Correct** and **Wrong**. |
| FR-02-F | On **Correct**: the card is removed from the queue. Progress counter increments. |
| FR-02-G | On **Wrong**: the card is moved to the **back** of the queue (same FIFO rotation as `exitPracticeMode` in sanakoe). |
| FR-02-H | The session ends when the queue is empty (all cards marked correct at least once). |
| FR-02-I | A live timer counts elapsed seconds during the session (same timer pattern as sanakoe's `startTimeMs` / `endTimeMs`). |
| FR-02-J | A progress indicator shows `resolved / total` (same as sanakoe's `ProgressHeader`). |

#### FR-03 Scoring & Statistics

| ID | Requirement |
|----|-------------|
| FR-03-A | **Total cards** — number of cards in the deck. |
| FR-03-B | **First-try correct** — cards marked Correct on their very first showing (i.e. `attempts === 0` when correct is pressed). |
| FR-03-C | **Wrong at least once** — cards that were marked Wrong at any point (`markedWrong === true`). |
| FR-03-D | **Total rounds** — sum of all showings across all cards (i.e. total number of card flips). |
| FR-03-E | **Total time** — formatted as MM:SS (same `formatTime` helper as sanakoe's `ResultsCard`). |

#### FR-04 Results Screen

| ID | Requirement |
|----|-------------|
| FR-04-A | After the session, navigate to a **Results** screen. |
| FR-04-B | Show the five statistics from FR-03. |
| FR-04-C | List the cards that were marked wrong at least once (question to answer). |
| FR-04-D | Show a "Play Again" button (restart with same deck, re-shuffle). |
| FR-04-E | Show an "Edit Deck" button (navigate to editor). |
| FR-04-F | Show a "New Deck" button (clear session, navigate to home/editor). |

#### FR-05 Navigation & Routing

| ID | Requirement |
|----|-------------|
| FR-05-A | Routes: `/[locale]` (home/start), `/[locale]/session` (active flashcard), `/[locale]/results` (results), `/[locale]/editor` (deck editor). |
| FR-05-B | If user navigates to `/[locale]/session` with no active session, redirect to `/[locale]`. |
| FR-05-C | If user navigates to `/[locale]/results` with no completed session, redirect to `/[locale]`. |
| FR-05-D | Language selector available on all screens (same `LanguageSelector` component pattern). |

#### FR-06 Internationalisation

| ID | Requirement |
|----|-------------|
| FR-06-A | Supported locales: `fi` (default) and `en`, identical to sanakoe's `src/i18n.ts`. |
| FR-06-B | All UI strings are stored in `src/messages/fi.json` and `src/messages/en.json`. |
| FR-06-C | ICU plural rules used for card count strings (same pattern as sanakoe's `{count, plural, ...}`). |

---

### 1.3 Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR-01 | **No server-side data** — the app must function as a fully static Next.js export; no API routes, no database, no auth. |
| NFR-02 | **Persistence** — deck survives browser refresh via `localStorage`; graceful fallback if storage is unavailable (private browsing). |
| NFR-03 | **Performance** — initial page load under 3 s on a mid-range device on 4G; deck operations (load, save) under 50 ms for up to 500 cards. |
| NFR-04 | **Accessibility** — WCAG 2.1 AA; all interactive elements keyboard-reachable; ARIA labels on icon-only buttons; adequate colour contrast. |
| NFR-05 | **Responsive design** — fully usable on mobile (320 px) through desktop (1440 px) using Tailwind v4 responsive utilities. |
| NFR-06 | **Type safety** — strict TypeScript (`"strict": true`); no `any` except where unavoidable and explicitly suppressed with a comment. |
| NFR-07 | **Test coverage** — unit tests for all pure functions (types, store, CSV parser, storage); component tests for all interactive components; >= 80% line coverage. |
| NFR-08 | **Consistent tech stack** — Next.js 16 App Router, TypeScript, Tailwind CSS v4, Zustand v5, next-intl v4, nanoid v5 — exact versions matching sanakoe's `package.json`. |

---

### 1.4 TypeScript Data Types

```typescript
// src/lib/types.ts

/**
 * A single flashcard in the deck.
 *
 * Mirrors sanakoe's WordItem but removes quiz-specific fields
 * (firstTryFailed) and replaces them with flashcard semantics.
 *
 * @property id          - Stable nanoid; preserved across editor edits
 * @property question    - The prompt side of the card (shown first)
 * @property answer      - The answer side (revealed on demand)
 * @property attempts    - Total times this card has been SHOWN in current session
 * @property markedWrong - True if the user pressed Wrong at least once this session
 * @property resolved    - True once the user presses Correct (card leaves the queue)
 */
export type FlashCard = {
  id: string;
  question: string;
  answer: string;
  // Session-local tracking fields (reset on each new session)
  attempts: number;
  markedWrong: boolean;
  resolved: boolean;
};

/**
 * The full state of an active flashcard session.
 *
 * Closely mirrors sanakoe's QuizSession; differences:
 *   - 'mode' and 'practiceTarget' are absent (no practice mode)
 *   - 'answerVisible' replaces input-based answer submission
 *
 * @property cards         - All cards in the deck (immutable during session)
 * @property unresolvedIds - FIFO queue of card IDs not yet resolved
 * @property currentId     - Card currently displayed (null = session over)
 * @property answerVisible - Whether the answer side is currently shown
 * @property startTimeMs   - Unix ms when session started
 * @property endTimeMs     - Unix ms when session ended (undefined if ongoing)
 */
export type FlashSession = {
  cards: FlashCard[];
  unresolvedIds: string[];
  currentId: string | null;
  answerVisible: boolean;
  startTimeMs: number;
  endTimeMs?: number;
};

/**
 * Derived statistics computed at session end.
 * Passed directly to the FlashResultsCard component.
 */
export type SessionStats = {
  totalCards: number;
  firstTryCorrect: number;  // cards where attempts === 1 when resolved
  wrongAtLeastOnce: number; // cards where markedWrong === true
  totalRounds: number;      // sum of card.attempts across all cards
  totalTimeMs: number;
};
```

**Design note:** `FlashCard.question` / `.answer` are preferred over sanakoe's `.prompt` /
`.answer` because "prompt" is ambiguous in a flashcard context. The CSV parser maps
column 1 to `question`, column 2 to `answer`.

---

### 1.5 i18n Keys

The following message keys are needed in both `fi.json` and `en.json`. Keys follow the same
namespace pattern as sanakoe (flat object per screen).

```
start
  title
  subtitle
  description
  deckCount      -- "{count, plural, =0 {No cards} =1 {1 card} other {# cards}}"
  savedDeck      -- "{count, plural, =1 {1 card saved} other {# cards saved}} from last time"
  startWithSaved
  editDeck
  clearSaved
  back

editor
  title
  headerQuestion
  headerAnswer
  addRow
  deleteRow
  clearAll
  clearConfirm
  validCount     -- "{count, plural, =0 {No valid pairs} =1 {1 valid pair} other {# valid pairs}}"
  instructions
  uploadButton
  uploadDifferent
  importSuccess  -- "{count, plural, =1 {Imported 1 card} other {Imported # cards}}"

upload           -- reuse sanakoe's keys verbatim; CSV format is identical

session
  progress       -- "{resolved} / {total}"
  showAnswer
  correct
  wrong
  time
  cardCount      -- "Card {current} of {total}"

results
  title
  congratulations
  summary
  totalCards
  firstTryCorrect
  wrongAtLeastOnce
  totalRounds
  totalTime
  wrongCardsList
  noMistakes
  playAgain
  editDeck
  newDeck

language         -- reuse sanakoe's keys verbatim
errors           -- reuse sanakoe's keys verbatim; same error types apply
common           -- reuse sanakoe's keys verbatim
```

---

## PART 2 — IMPLEMENTATION PLAN

Tasks follow TDD order: **types → store logic → lib helpers → components → pages → i18n →
tests → deployment config**. Each task's acceptance criteria are testable (unit or integration).

---

### Task 1 — Project Bootstrap

**Goal:** Create a runnable Next.js 16 project with the exact same toolchain as sanakoe.

#### 1.1 — Scaffold Next.js project

- Run `npx create-next-app@latest flashkoe --typescript --tailwind --app --no-src-dir`
  (or scaffold manually to match sanakoe's layout).
- Set up `src/` directory structure mirroring sanakoe:
  ```
  src/
    app/[locale]/
    components/ui/
    hooks/
    lib/
    messages/
  ```

#### 1.2 — Install dependencies

Install exact versions from sanakoe's `package.json`:

Production:
```
next@^16.2.1  react@^19.2.4  react-dom@^19.2.4
next-intl@^4.8.3  zustand@^5.0.12  nanoid@^5.1.7  canvas-confetti@^1.9.4
```

Dev:
```
tailwindcss@^4.2.2  @tailwindcss/postcss@^4.2.2  typescript@^5.9.3
jest@^30.3.0  jest-environment-jsdom@^30.3.0  ts-jest@^29.4.6
@testing-library/react@^16.3.2  @testing-library/jest-dom@^6.9.1
@testing-library/user-event@^14.6.1  @playwright/test@^1.58.2
husky@^9.1.7  eslint@^9.39.4  eslint-config-next@^16.2.1
```

#### 1.3 — Copy tooling config from sanakoe

- `tsconfig.json` — strict mode, path aliases `@/*` to `./src/*`
- `tailwind.config.ts` / `postcss.config.mjs` — Tailwind v4 setup with `@tailwindcss/postcss`
- `jest.config.ts` — jsdom environment, `ts-jest`, path alias mapping
- `jest.setup.ts` — `@testing-library/jest-dom`
- `eslint.config.mjs`
- `.husky/pre-commit`
- `playwright.config.ts`

#### 1.4 — npm scripts

```json
"dev": "next dev",
"build": "next build",
"start": "next start",
"lint": "next lint",
"type-check": "tsc --noEmit",
"test": "jest",
"test:watch": "jest --watch",
"test:coverage": "jest --coverage",
"test:e2e": "playwright test"
```

**Acceptance criteria:**
- `npm run dev` starts without errors.
- `npm run type-check` passes.
- `npm test` finds 0 test files and exits 0.

---

### Task 2 — Core Type Definitions

**Goal:** Define all TypeScript types before writing any logic.

**File to create:** `src/lib/types.ts`

#### 2.1 — Define `FlashCard`

Fields: `id`, `question`, `answer`, `attempts`, `markedWrong`, `resolved` (see section 1.4).

#### 2.2 — Define `FlashSession`

Fields: `cards`, `unresolvedIds`, `currentId`, `answerVisible`, `startTimeMs`, `endTimeMs?`
(see section 1.4).

#### 2.3 — Define `SessionStats`

Fields: `totalCards`, `firstTryCorrect`, `wrongAtLeastOnce`, `totalRounds`, `totalTimeMs`
(see section 1.4).

**Acceptance criteria:**
- `tsc --noEmit` passes.
- `FlashCard`, `FlashSession`, `SessionStats` are exported.
- No `any` types.

---

### Task 3 — Utility Libraries

**Goal:** Pure helper functions (no React, no Zustand), each fully unit-tested.

#### 3.1 — CSV Parser — `src/lib/csv-parser.ts`

**Reuse sanakoe's `parseCSV` verbatim** but map output to `FlashCard` instead of `WordItem`:
- Column 1 maps to `question`
- Column 2 maps to `answer`
- `attempts: 0`, `markedWrong: false`, `resolved: false`
- Retain: delimiter auto-detection (`,` / `;`), header-row skipping, quote handling,
  deduplication, `CSVParseError`.

*Why reuse:* The CSV format is identical; only the output field names differ.

#### 3.2 — localStorage — `src/lib/storage.ts`

Follow sanakoe's `storage.ts` pattern exactly. Storage keys:

```typescript
const STORAGE_KEYS = {
  VERSION: 'flashkoe_storage_version',
  DECK:    'flashkoe_deck',   // replaces sanakoe's LAST_LIST
} as const;
```

Functions to implement (same signatures and error types as sanakoe):
- `isStorageAvailable(): boolean`
- `saveDeck(cards: FlashCard[]): void` — throws `StorageQuotaError` / `StorageError`
- `loadDeck(): FlashCard[] | null` — throws `StorageParseError` / `StorageError`
- `clearDeck(): void`
- `needsMigration(): boolean`
- `migrateStorage(): void`
- Error classes: `StorageError`, `StorageQuotaError`, `StorageParseError` (same hierarchy)

**Note:** No `Records` / `saveRecords` needed — this app does not track personal bests.

#### 3.3 — Stats Calculator — `src/lib/stats.ts`

New helper not present in sanakoe:

```typescript
export function computeStats(
  cards: FlashCard[],
  startTimeMs: number,
  endTimeMs: number
): SessionStats
```

Logic:
- `totalCards` = `cards.length`
- `firstTryCorrect` = count of cards where `resolved && attempts === 1`
  (attempts is incremented inside `markCorrect` before setting `resolved`, so first-try
  correct means `attempts` was 0 at the time of the correct press, making it 1 after)
- `wrongAtLeastOnce` = count of cards where `markedWrong === true`
- `totalRounds` = `cards.reduce((sum, c) => sum + c.attempts, 0)`
- `totalTimeMs` = `endTimeMs - startTimeMs`

#### 3.4 — Time Formatter — `src/lib/format-time.ts`

Extract sanakoe's `formatTime(ms: number): string` from `ResultsCard.tsx` into a shared util:

```typescript
export function formatTime(ms: number): string // returns "MM:SS"
```

Reusable by both the live session timer and the results screen.

**Acceptance criteria (Task 3):**
- `parseCSV` unit tests: valid CSV, semicolon delimiter, header skipping, deduplication,
  `CSVParseError` cases — all pass.
- `saveDeck` / `loadDeck` unit tests: round-trip, unavailable storage, malformed JSON,
  quota exceeded — all pass.
- `computeStats` unit tests: all-correct, all-wrong, mixed, empty deck — all pass.
- `formatTime` unit tests: 0 ms, 59999 ms, 60000 ms, 3661000 ms — all pass.

---

### Task 4 — Flashcard Store

**Goal:** Zustand store managing the full session lifecycle.

**File to create:** `src/hooks/useFlashStore.ts`

Follow the architecture of sanakoe's `useQuizStore.ts` exactly:
`create<FlashStore>((set, get) => ({...}))` with inline action definitions, plus exported
`useFlashActions()` and `useFlashSelectors()` convenience hooks.

#### 4.1 — Store interface

```typescript
interface FlashStore {
  // State
  session: FlashSession | null;
  deck: FlashCard[];            // persisted deck (editor-facing)

  // Deck management (editor)
  setDeck: (cards: FlashCard[]) => void;  // replaces entire deck + persists to localStorage
  loadDeckFromStorage: () => void;        // hydrate deck from localStorage on mount

  // Session lifecycle (mirrors useQuizStore actions)
  startSession: () => void;    // shuffle deck, build unresolvedIds, set startTimeMs
  showAnswer: () => void;      // set answerVisible = true
  markCorrect: () => void;     // remove currentId from queue; advance
  markWrong: () => void;       // move currentId to back of queue; advance; set markedWrong
  endSession: () => void;      // set endTimeMs
  resetSession: () => void;    // clear session (return to start)
  restartSession: () => void;  // atomic reset + start (same deck, re-shuffle)

  // Selectors (same pattern as useQuizStore)
  getCurrentCard: () => FlashCard | null;
  getProgress: () => { resolved: number; total: number };
  isSessionActive: () => boolean;
  isSessionComplete: () => boolean;
  getStats: () => SessionStats | null;
}
```

#### 4.2 — `setDeck`

```typescript
setDeck: (cards) => {
  set({ deck: cards });
  try { saveDeck(cards); } catch { /* non-fatal */ }
}
```

#### 4.3 — `loadDeckFromStorage`

```typescript
loadDeckFromStorage: () => {
  try {
    const stored = loadDeck();
    if (stored && stored.length > 0) set({ deck: stored });
  } catch { /* ignore */ }
}
```

#### 4.4 — `startSession`

```typescript
startSession: () => {
  const { deck } = get();
  if (deck.length === 0) return;
  const initialCards = deck.map(c => ({
    ...c, attempts: 0, markedWrong: false, resolved: false
  }));
  const shuffledIds = shuffleArray(initialCards.map(c => c.id));
  set({
    session: {
      cards: initialCards,
      unresolvedIds: shuffledIds,
      currentId: shuffledIds[0],
      answerVisible: false,
      startTimeMs: Date.now(),
    }
  });
}
```

#### 4.5 — `showAnswer`

Set `session.answerVisible = true`. Guard: only if session is active and answer is not already
visible.

#### 4.6 — `markCorrect`

Logic (mirrors sanakoe's `submitAnswer` correct branch):

1. Find current card. Increment `attempts` by 1. Set `resolved = true`.
2. Remove `currentId` from `unresolvedIds`.
3. If `unresolvedIds` is now empty: call `endSession()`.
4. Else: set `currentId = unresolvedIds[0]`.
5. Reset `answerVisible = false` atomically in the same `set()` call.

**First-try correct logic:** `attempts` starts at 0. It is incremented inside `markCorrect`
*before* marking `resolved`. Therefore first-try correct means `card.attempts` was 0 at the
moment of the correct press — after incrementing it becomes 1. `computeStats` checks
`attempts === 1 && resolved` to identify these cards.

#### 4.7 — `markWrong`

Logic (mirrors `exitPracticeMode`'s queue manipulation in sanakoe):

1. Find current card. Increment `attempts` by 1. Set `markedWrong = true`.
2. Remove `currentId` from the front of `unresolvedIds`.
3. Append `currentId` to the back of `unresolvedIds` (FIFO rotation).
4. Set `currentId = updatedUnresolvedIds[0]`
   (if only 1 card in deck, this is the same card — no infinite loop because it is always
   the correct behaviour to show it again).
5. Reset `answerVisible = false` atomically.

#### 4.8 — `endSession`

Set `session.endTimeMs = Date.now()` and `session.currentId = null`.

#### 4.9 — `resetSession`

Set `session = null`. (Deck is untouched.)

#### 4.10 — `restartSession`

Atomic: reset all card tracking fields + shuffle + set new `startTimeMs` in a single `set()`
call. Mirrors sanakoe's `restartQuiz` — the session never passes through `null`, so navigation
guards do not fire during restart.

#### 4.11 — `getStats`

Delegate to `computeStats(session.cards, session.startTimeMs, session.endTimeMs)`.
Returns `null` if session is `null` or `endTimeMs` is `undefined`.

#### 4.12 — `shuffleArray` (private helper)

Copy verbatim from sanakoe's `useQuizStore.ts` (Fisher-Yates algorithm).

**Acceptance criteria (Task 4):**
- `startSession` shuffles cards and sets `answerVisible = false`.
- `showAnswer` flips `answerVisible` to `true`; does nothing if already `true`.
- `markCorrect` on first showing: card removed from queue, `attempts = 1`, `resolved = true`,
  `answerVisible = false`.
- `markWrong`: card moves to back of queue, `markedWrong = true`, `attempts` incremented,
  next card shown, `answerVisible = false`.
- Single-card deck: after `markWrong`, card stays at front of queue (not lost).
- After last card marked correct, `isSessionComplete()` returns `true`.
- `restartSession` is atomic (session never passes through `null`).
- `getStats` returns `null` before session ends; returns correct values after.
- All store actions have Jest unit tests; `Date.now` is mocked for timer assertions.

---

### Task 5 — Shared UI Primitives

**Goal:** Port the reusable UI components from sanakoe with zero functional changes.

**Files to create under `src/components/ui/`:**
- `Button.tsx` — copy from sanakoe verbatim
- `Card.tsx` (`Card`, `CardHeader`, `CardBody`) — copy verbatim
- `Input.tsx` — copy verbatim
- `Modal.tsx` — copy verbatim
- `index.ts` — barrel export

Also copy:
- `src/components/PageTransition.tsx` — verbatim
- `src/components/ErrorBoundary.tsx` — verbatim
- `src/components/ClientProviders.tsx` — verbatim
- `src/components/LanguageSelector.tsx` — verbatim
- `src/components/icons/` — copy the full icon set; ensure it includes `Check`, `X`, `Eye`,
  `Trash`, `Edit`, `Upload`, `Rocket`, `Trophy`

**Acceptance criteria:**
- All UI components render without TypeScript errors.
- `npm run type-check` passes.

---

### Task 6 — Card-Specific Components

**Goal:** Build the three flashcard-specific visual components. All are pure presentational
components (no store access) — they receive props and fire callbacks.

#### 6.1 — `FlashCardFace` — `src/components/FlashCardFace.tsx`

Displays a single card face. Props:

```typescript
interface FlashCardFaceProps {
  question: string;
  answer: string | null;  // null = answer hidden
  onShowAnswer: () => void;
  onCorrect: () => void;
  onWrong: () => void;
  className?: string;
}
```

Layout:
1. Question text (large, centred, same styling as sanakoe's `QuizCard` prompt area).
2. If `answer === null`: single "Show Answer" button (`variant="primary"`).
3. If `answer !== null`: answer text revealed below the question, then two buttons side by
   side — "Correct" (`variant="primary"`) and "Wrong" (`variant="danger"`).

The Correct / Wrong buttons must only be rendered when `answer !== null`; the "Show Answer"
button must only be rendered when `answer === null`. This prevents double-press bugs.

#### 6.2 — `SessionProgressBar` — `src/components/SessionProgressBar.tsx`

Thin sticky header with progress and live timer. Props:

```typescript
interface SessionProgressBarProps {
  resolved: number;
  total: number;
  elapsedMs: number;  // live elapsed ms from useElapsedTime hook
}
```

Displays: `resolved / total` counter + filled progress bar + `MM:SS` elapsed time.
Mirrors sanakoe's `ProgressHeader` in structure and styling.

#### 6.3 — `FlashResultsCard` — `src/components/FlashResultsCard.tsx`

Displays post-session statistics. Props:

```typescript
interface FlashResultsCardProps {
  stats: SessionStats;
  wrongCards: FlashCard[];  // cards where markedWrong === true
  onPlayAgain: () => void;
  onEditDeck: () => void;
  onNewDeck: () => void;
  className?: string;
}
```

Layout mirrors sanakoe's `ResultsCard`:
1. Title + congratulations message.
2. Stats grid (4 metric tiles: `totalCards`, `firstTryCorrect`, `wrongAtLeastOnce`,
   `totalRounds`).
3. Total time using `formatTime`.
4. Wrong cards list (question → answer), or a "no mistakes" celebration banner.
5. Three action buttons: Play Again, Edit Deck, New Deck.

**Acceptance criteria (Task 6):**
- `FlashCardFace`: question rendered; answer hidden initially; "Show Answer" button present;
  clicking it calls `onShowAnswer`; Correct/Wrong buttons absent when answer hidden; present
  when answer shown — React Testing Library unit tests.
- `SessionProgressBar`: correct fraction displayed; timer formatted — RTL unit tests.
- `FlashResultsCard`: all five stats rendered; wrong cards list rendered; buttons fire
  callbacks — RTL unit tests.

---

### Task 7 — Card Editor Component

**Goal:** Build the deck editor (analogous to sanakoe's `ManualEntryTable` + `WordListUpload`).

#### 7.1 — `DeckEditorTable` — `src/components/DeckEditorTable.tsx`

```typescript
interface DeckEditorTableProps {
  cards: FlashCard[];
  onChange: (cards: FlashCard[]) => void;
  className?: string;
}
```

Reuse the entire implementation pattern from sanakoe's `ManualEntryTable`:
- Two-column table with `Question` / `Answer` headers.
- Auto-expand last row when typing in the last row's cells.
- Tab / Shift+Tab / Enter keyboard navigation (same `handleKeyDown` logic).
- Tab-separated paste from spreadsheets (same `handlePaste` logic).
- `localStorage` persistence of draft rows under key `'flashkoe_editor_draft'`
  (separate from the main deck key `'flashkoe_deck'`).
- "Clear All" button with confirmation dialog using `Modal` component.
- Mobile: stacked card layout; desktop: table layout (same responsive breakpoint as
  `ManualEntryTable`).

**Key differences from `ManualEntryTable`:**
- Each row has an explicit **delete** icon button on the right (not present in sanakoe's table).
  Icon: `Trash` component; `aria-label` = `t('editor.deleteRow')`.
- `onChange` is called with **all** rows (including partially empty ones). The parent page
  (`EditorPage`) is responsible for filtering valid cards before saving to the store.
  This gives the editor full control over draft state without losing partial edits.
- Column header labels use `t('editor.headerQuestion')` and `t('editor.headerAnswer')`.

#### 7.2 — `CsvUploadButton` — `src/components/CsvUploadButton.tsx`

Simplified wrapper around sanakoe's `WordListUpload` upload logic.

```typescript
interface CsvUploadButtonProps {
  onCardsLoaded: (cards: FlashCard[]) => void;
  className?: string;
}
```

Reuses sanakoe's drag-and-drop + file-browse UI exactly. On successful parse (using `parseCSV`
from Task 3.1) calls `onCardsLoaded` with the new cards to *merge* into the existing deck.

**Merge strategy:** append only cards whose `question` value is not already present in the
deck (case-insensitive trimmed comparison). Duplicate questions are silently skipped. After
merging, a dismissible inline banner shows how many cards were imported
(`t('editor.importSuccess', { count })`).

**Acceptance criteria (Task 7):**
- `DeckEditorTable`: add row, update row, delete row, keyboard nav, paste — RTL unit tests.
- `CsvUploadButton`: valid upload calls `onCardsLoaded`; empty file surfaces error message;
  duplicate questions do not produce duplicate cards — RTL unit tests.

---

### Task 8 — i18n Setup

**Goal:** Configure next-intl identically to sanakoe.

#### 8.1 — `src/i18n.ts`

Copy sanakoe's `src/i18n.ts` verbatim:

```typescript
export const locales = ['fi', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'fi';
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(locales, requested) ? requested : defaultLocale;
  return { locale, messages: (await import(`./messages/${locale}.json`)).default };
});
```

#### 8.2 — `src/messages/fi.json`

Implement all keys from section 1.5 in Finnish. Where keys are identical to sanakoe (e.g.
`upload.*`, `language.*`, `errors.*`, `common.*`) copy sanakoe's translations verbatim.

Selected Finnish values:
- `session.showAnswer` = "Näytä Vastaus"
- `session.correct` = "Oikein"
- `session.wrong` = "Väärin"
- `results.firstTryCorrect` = "Oikein ensimmäisellä kerralla"
- `results.wrongAtLeastOnce` = "Väärässä ainakin kerran"
- `results.totalRounds` = "Kierroksia yhteensä"
- `results.playAgain` = "Pelaa Uudelleen"
- `results.editDeck` = "Muokkaa Pakkaa"
- `results.newDeck` = "Uusi Pakka"

#### 8.3 — `src/messages/en.json`

Same structure, English translations.

#### 8.4 — `src/proxy.ts`

Copy sanakoe's `proxy.ts` verbatim (next-intl navigation helpers: `Link`, `redirect`,
`useRouter`, `usePathname`).

**Acceptance criteria:**
- `useTranslations('session')` resolves `showAnswer` in both locales without runtime error.
- TypeScript type inference: `t('session.showAnswer')` does not produce a type error.

---

### Task 9 — App Layout & Routing

**Goal:** Set up Next.js App Router with locale layout, middleware, and four routes.

#### 9.1 — Middleware — `src/middleware.ts`

Copy sanakoe's middleware verbatim (next-intl `createMiddleware` with `locales` and
`defaultLocale`).

#### 9.2 — Root layout — `src/app/[locale]/layout.tsx`

Copy sanakoe's layout verbatim:
- `generateStaticParams` returns `locales.map(locale => ({ locale }))`.
- `setRequestLocale(locale)`.
- `NextIntlClientProvider` wrapping `ClientProviders`.
- Update `metadata.title` to `"Flashkoe — Flashcard App"`.

#### 9.3 — Home / Start page — `src/app/[locale]/page.tsx`

This is the entry point, mirroring sanakoe's `src/app/[locale]/page.tsx`.

Responsibilities:
- Mark as `'use client'`.
- On mount (`useEffect`): call `loadDeckFromStorage()` from the store.
- Read `deck` from store; derive `cardCount = deck.length`.
- If `cardCount > 0`: show saved-deck banner (mirrors sanakoe's `savedWords` banner) with
  "Start Session" (primary) and "Edit Deck" (secondary) buttons.
- If `cardCount === 0`: show "Create Deck" button (navigates to `/[locale]/editor`).
- On "Start Session": call `startSession()` then `router.push('/[locale]/session')`.
- On "Edit Deck": `router.push('/[locale]/editor')`.
- "Start Session" disabled if `cardCount === 0`.
- `LanguageSelector` in top-right corner (same placement as sanakoe).

#### 9.4 — Session page — `src/app/[locale]/session/page.tsx`

Responsibilities:
- Mark as `'use client'`.
- On mount: if `!isSessionActive()`, redirect to `/[locale]`.
- Watch `isSessionComplete()`: when it becomes `true`, call `endSession()` then navigate
  to `/[locale]/results`.
- Compute `elapsedMs` via `useElapsedTime(session?.startTimeMs ?? null)`.
- Render `SessionProgressBar` with `resolved`, `total`, `elapsedMs`.
- Render `FlashCardFace` with:
  - `question = currentCard.question`
  - `answer = session.answerVisible ? currentCard.answer : null`
  - `onShowAnswer = showAnswer`
  - `onCorrect = markCorrect`
  - `onWrong = markWrong`
- Show `LanguageSelector`.

#### 9.5 — Results page — `src/app/[locale]/results/page.tsx`

Responsibilities:
- Mark as `'use client'`.
- On mount: if `getStats()` returns `null`, redirect to `/[locale]`.
- Derive `wrongCards = session.cards.filter(c => c.markedWrong)`.
- Render `FlashResultsCard` with:
  - `stats = getStats()`
  - `wrongCards`
  - `onPlayAgain` = `restartSession()` then navigate to `/[locale]/session`
  - `onEditDeck` = `resetSession()` then navigate to `/[locale]/editor`
  - `onNewDeck` = `resetSession()` then navigate to `/[locale]`
- Show `LanguageSelector`.

#### 9.6 — Editor page — `src/app/[locale]/editor/page.tsx`

Responsibilities:
- Mark as `'use client'`.
- On mount: call `loadDeckFromStorage()` defensively (in case user navigated here directly
  without passing through the home page).
- Read `deck` from store.
- Render `CsvUploadButton` with `onCardsLoaded` that merges uploaded cards into the current
  deck via `setDeck`.
- Render `DeckEditorTable` with `cards={deck}` and `onChange` handler:
  - Filter valid cards (both `question` and `answer` non-empty after trim).
  - Call `setDeck(validCards)`.
- Show valid card count.
- "Start Session" button (enabled when valid card count > 0): call `startSession()` then
  navigate to `/[locale]/session`.
- "Back" button: navigate to `/[locale]`.
- `LanguageSelector`.

**Acceptance criteria (Task 9):**
- Visiting `/fi/session` with no session redirects to `/fi`.
- Visiting `/fi/results` with no completed session redirects to `/fi`.
- Home page shows "Create Deck" when deck is empty and saved-deck banner when non-empty.
- Editor persists changes across a page reload (localStorage round-trip confirmed).

---

### Task 10 — Custom Hooks

**Goal:** Encapsulate side-effectful logic away from page components.

#### 10.1 — `useElapsedTime` — `src/hooks/useElapsedTime.ts`

```typescript
export function useElapsedTime(startTimeMs: number | null): number
```

- Returns elapsed milliseconds.
- Uses `setInterval` at 1000 ms resolution while `startTimeMs` is not `null`.
- Cleans up the interval on unmount or when `startTimeMs` becomes `null`.
- Initial return value is `0` if `startTimeMs` is `null`.
- Used by `SessionProgressBar` to display the live MM:SS timer.

#### 10.2 — `useFlashActions` and `useFlashSelectors`

Follow the exact same pattern as sanakoe's `useQuizActions` / `useQuizSelectors`:

```typescript
// Convenience hook: actions accessed without subscribing to state
export function useFlashActions() {
  return useFlashStore.getState();
}

// Convenience hook: selector functions for computed values
export function useFlashSelectors() {
  const getCurrentCard    = useFlashStore(state => state.getCurrentCard);
  const getProgress       = useFlashStore(state => state.getProgress);
  const isSessionActive   = useFlashStore(state => state.isSessionActive);
  const isSessionComplete = useFlashStore(state => state.isSessionComplete);
  const getStats          = useFlashStore(state => state.getStats);
  return { getCurrentCard, getProgress, isSessionActive, isSessionComplete, getStats };
}
```

**Acceptance criteria:**
- `useElapsedTime`: returns 0 at t=0, ~1000 at t=1s, ~2000 at t=2s using Jest fake timers.
- Interval is cleared on unmount (no memory leak — confirmed via `clearInterval` spy).
- `useFlashActions()` returns `useFlashStore.getState()` without creating a subscription.

---

### Task 11 — End-to-End Tests

**Goal:** Playwright tests covering the critical user journeys.

**File:** `e2e/flashcard-flow.spec.ts`
**Fixture:** `e2e/fixtures/sample.csv` — 2 valid card pairs, comma-separated, no header.

#### 11.1 — Happy path (all correct on first try)

1. Navigate to `/fi`.
2. Click "Create Deck" — lands on `/fi/editor`.
3. Enter 3 card pairs in the editor table.
4. Click "Start Session" — lands on `/fi/session`.
5. For each card: click "Show Answer", click "Correct".
6. Assert redirect to `/fi/results`.
7. Assert results show `firstTryCorrect = 3` and `wrongAtLeastOnce = 0`.

#### 11.2 — Wrong card re-queue

1. Enter 2 cards; start session.
2. On card 1: "Show Answer" → "Wrong".
3. On card 2: "Show Answer" → "Correct".
4. Card 1 reappears; "Show Answer" → "Correct".
5. Assert results: `wrongAtLeastOnce = 1`, `totalRounds = 3`.

#### 11.3 — CSV upload flow

1. Navigate to editor.
2. Upload `e2e/fixtures/sample.csv` (2 cards).
3. Assert editor table shows 2 populated rows.
4. Start session; complete all cards.
5. Assert results show `totalCards = 2`.

#### 11.4 — Deck persistence across reload

1. Navigate to editor; enter 3 cards; navigate back to home.
2. Hard-reload the page (`page.reload()`).
3. Assert home page shows saved-deck banner with "3 cards saved from last time".

#### 11.5 — Language switch

1. Start from `/fi`; switch language to English.
2. Navigate to session (if deck exists) or to editor.
3. Assert "Show Answer" button text equals "Show Answer" (English).

**Acceptance criteria:**
- All 5 e2e scenarios pass with `playwright test`.
- Tests run in CI against `npm run build && npm start`.

---

### Task 12 — Deployment Config

**Goal:** Ensure the app builds cleanly and can be deployed to Vercel.

#### 12.1 — `next.config.ts`

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
```

(Standalone output can be added for containerised deployments if needed.)

#### 12.2 — `public/` assets

- `favicon.ico`
- `og-image.png` (optional open-graph image)

#### 12.3 — `README.md`

Document:
- Getting started: `npm install && npm run dev`
- Running unit tests: `npm test`
- Running e2e tests: `npm run test:e2e`
- Deploying: connect repo to Vercel; set `NEXT_PUBLIC_` env vars if any

**Acceptance criteria:**
- `npm run build` completes without errors or warnings.
- `npm run type-check` passes.
- `npm run lint` passes.

---

## Summary: File Manifest

| File | Status | Notes |
|------|--------|-------|
| `src/lib/types.ts` | **New** | `FlashCard`, `FlashSession`, `SessionStats` |
| `src/lib/csv-parser.ts` | **Adapted from sanakoe** | Map `prompt` to `question` in output |
| `src/lib/storage.ts` | **Adapted from sanakoe** | `saveDeck`/`loadDeck`; new `flashkoe_` key prefix |
| `src/lib/stats.ts` | **New** | `computeStats` pure function |
| `src/lib/format-time.ts` | **Extracted from sanakoe** | `formatTime` shared util |
| `src/hooks/useFlashStore.ts` | **New** | Zustand store; mirrors `useQuizStore.ts` |
| `src/hooks/useElapsedTime.ts` | **New** | Live timer hook |
| `src/i18n.ts` | **Copy from sanakoe** | Same locale config |
| `src/proxy.ts` | **Copy from sanakoe** | next-intl navigation helpers |
| `src/middleware.ts` | **Copy from sanakoe** | Locale routing middleware |
| `src/messages/fi.json` | **New** | Finnish translations (upload/language/errors/common copied) |
| `src/messages/en.json` | **New** | English translations |
| `src/components/ui/Button.tsx` | **Copy from sanakoe** | |
| `src/components/ui/Card.tsx` | **Copy from sanakoe** | |
| `src/components/ui/Input.tsx` | **Copy from sanakoe** | |
| `src/components/ui/Modal.tsx` | **Copy from sanakoe** | |
| `src/components/ui/index.ts` | **Copy from sanakoe** | |
| `src/components/PageTransition.tsx` | **Copy from sanakoe** | |
| `src/components/ErrorBoundary.tsx` | **Copy from sanakoe** | |
| `src/components/ClientProviders.tsx` | **Copy from sanakoe** | |
| `src/components/LanguageSelector.tsx` | **Copy from sanakoe** | |
| `src/components/icons/` | **Copy from sanakoe** | Ensure `Eye`, `Check`, `X`, `Trash` exist |
| `src/components/FlashCardFace.tsx` | **New** | Question/answer reveal + judge buttons |
| `src/components/SessionProgressBar.tsx` | **New** | Progress bar + live timer |
| `src/components/FlashResultsCard.tsx` | **New** | Post-session stats |
| `src/components/DeckEditorTable.tsx` | **New (based on ManualEntryTable)** | + per-row delete button |
| `src/components/CsvUploadButton.tsx` | **New (based on WordListUpload)** | merge strategy |
| `src/app/[locale]/layout.tsx` | **Adapted from sanakoe** | Updated metadata title |
| `src/app/[locale]/page.tsx` | **New** | Home / start screen |
| `src/app/[locale]/session/page.tsx` | **New** | Flashcard session |
| `src/app/[locale]/results/page.tsx` | **New** | Session results |
| `src/app/[locale]/editor/page.tsx` | **New** | Deck editor |
| `src/app/globals.css` | **Adapted from sanakoe** | Tailwind v4 directives |
| `e2e/flashcard-flow.spec.ts` | **New** | Playwright end-to-end tests |
| `e2e/fixtures/sample.csv` | **New** | 2-card fixture for e2e upload test |

---

## Risks & Edge Cases

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Single-card deck: user marks Wrong creates infinite loop | Medium | `markWrong` with 1 card in queue re-queues the card to itself; this is correct behaviour — the card stays as `currentId`. Explicitly tested in unit tests. |
| `answerVisible` stays `true` when advancing to next card | High (off-by-one risk) | `markCorrect` and `markWrong` both reset `answerVisible = false` atomically inside the same Zustand `set()` call as the card advance. Explicitly tested. |
| CSV with 500 cards causes `localStorage` quota exceeded | Low | `saveDeck` catches `QuotaExceededError` and re-throws `StorageQuotaError`; editor page catches this and shows a dismissible banner (reusing sanakoe's `errors.storageQuota` i18n key). |
| Hydration mismatch: Zustand store reads localStorage during SSR | Medium | All pages using the store are marked `'use client'`; `loadDeckFromStorage` is called inside `useEffect` (never on the server). Mirrors sanakoe's pattern exactly. |
| User presses browser Back from session page mid-session | Medium | `session/page.tsx` navigation guard: if `!isSessionActive()` on mount, redirect to home. Session state in Zustand is not affected by navigation — no data loss. |
| Stale deck in store when returning to editor after session | Low | `editor/page.tsx` calls `loadDeckFromStorage()` defensively on mount; store `deck` is always the source of truth and is not modified during a session. |
| `restartSession` triggers navigation guard briefly | Low | Mirrors sanakoe's `restartQuiz` fix: `restartSession` is fully atomic — session is never set to `null` and then re-set; it goes directly from old state to new state in one `set()` call. |

---

## Definition of Ready

- [ ] Team agrees on `FlashCard.question` / `.answer` naming (vs sanakoe's `.prompt` / `.answer`).
- [ ] Decision confirmed: separate `FlashCard` type rather than reusing sanakoe's `WordItem`.
- [ ] New repository created; CI pipeline configured (GitHub Actions or similar).
- [ ] Node.js >= 20 available in the development and CI environments.
- [ ] Deployment target confirmed (Vercel recommended; same setup as sanakoe).

## Definition of Done

- [ ] All functional requirements FR-01 through FR-06 verified manually on Chrome, Firefox, Safari.
- [ ] `npm test -- --coverage` reports >= 80% line coverage.
- [ ] `npm run test:e2e` — all 5 Playwright scenarios pass.
- [ ] `npm run type-check` — zero TypeScript errors.
- [ ] `npm run lint` — zero ESLint errors.
- [ ] `npm run build` — completes without errors.
- [ ] App is fully usable on a 320 px mobile viewport.
- [ ] All four pages pass axe-core accessibility checks.
- [ ] Finnish and English translations complete and reviewed by a native Finnish speaker.
- [ ] `README.md` up to date.
- [ ] Code reviewed and approved by at least one other developer.
