# API & Component Reference

Developer reference for Sanakoe's internal APIs, components, and utilities.

---

## Table of Contents

- [Type Definitions](#type-definitions)
- [Utility Functions](#utility-functions)
- [Hooks](#hooks)
- [UI Components](#ui-components)
- [Feature Components](#feature-components)
- [Store (Zustand)](#store-zustand)

---

## Type Definitions

### Location: `src/lib/types.ts`

#### WordItem

Represents a single vocabulary word pair.

```typescript
type WordItem = {
  id: string; // Unique identifier (nanoid)
  prompt: string; // The question/word shown to user
  answer: string; // The correct answer
  attempts: number; // Number of times answered in normal mode
  firstTryFailed: boolean; // True if wrong on first attempt
  resolved: boolean; // True if answered correctly
};
```

#### QuizSession

Represents an active quiz session.

```typescript
type QuizSession = {
  words: WordItem[]; // All words in the quiz
  unresolvedIds: string[]; // IDs of unresolved words (queue)
  currentId: string | null; // Current word being answered
  tries: number; // Total answer attempts
  startTimeMs: number; // Quiz start timestamp
  endTimeMs?: number; // Quiz end timestamp
  mode: QuizMode; // 'normal' | 'practice'
  practiceTarget?: PracticeTarget; // Current practice word info
};
```

#### QuizMode

```typescript
type QuizMode = "normal" | "practice";
```

#### PracticeTarget

```typescript
type PracticeTarget = {
  id: string; // Word ID being practiced
  remaining: number; // Repetitions remaining (3, 2, 1)
};
```

#### ListRecords

Personal best records for a word list.

```typescript
type ListRecords = {
  bestTries?: number; // Best (lowest) number of tries
  bestTimeMs?: number; // Best (fastest) completion time
  updatedAt: number; // Last update timestamp
};
```

#### Records

All saved records, keyed by list fingerprint.

```typescript
type Records = {
  [listFingerprint: string]: ListRecords;
};
```

---

## Utility Functions

### CSV Parser

**Location:** `src/lib/csv-parser.ts`

#### parseCSV

Parses CSV content into word items.

```typescript
function parseCSV(content: string): WordItem[];
```

**Parameters:**

- `content` - Raw CSV string content

**Returns:** Array of `WordItem` objects

**Throws:** `CSVParseError` for invalid formats

**Features:**

- Auto-detects comma or semicolon delimiter
- Skips header rows (heuristic detection)
- Trims whitespace
- Deduplicates identical pairs
- Generates stable IDs

**Example:**

```typescript
import { parseCSV } from "@/lib/csv-parser";

const words = parseCSV("koira,dog\nkissa,cat");
// => [{ id: '...', prompt: 'koira', answer: 'dog', ... }, ...]
```

---

### Answer Matcher

**Location:** `src/lib/answer-matcher.ts`

#### matchAnswer

Validates user answer against correct answer.

```typescript
function matchAnswer(userInput: string, correctAnswer: string): boolean;
```

**Parameters:**

- `userInput` - User's submitted answer
- `correctAnswer` - Expected correct answer

**Returns:** `true` if answers match (case-insensitive, whitespace-normalized)

**Example:**

```typescript
import { matchAnswer } from "@/lib/answer-matcher";

matchAnswer("  Dog  ", "dog"); // => true
matchAnswer("DOG", "dog"); // => true
matchAnswer("cat", "dog"); // => false
```

---

### Storage Utilities

**Location:** `src/lib/storage.ts`

#### saveRecords / loadRecords

```typescript
function saveRecords(records: Records): void;
function loadRecords(): Records;
```

#### saveWordList / loadWordList

```typescript
function saveWordList(words: WordItem[]): void;
function loadWordList(): WordItem[] | null;
```

#### isStorageAvailable

```typescript
function isStorageAvailable(): boolean;
```

**Storage Keys:**

- `sanakoe_records` - Personal best records
- `sanakoe_last_list` - Last used word list
- `sanakoe_storage_version` - Storage format version

---

### List Fingerprinting

**Location:** `src/lib/hash.ts`

#### generateListFingerprint

Creates a unique identifier for a word list.

```typescript
function generateListFingerprint(words: WordItem[]): string;
```

**Features:**

- Order-independent (sorted before hashing)
- Deterministic (same words = same hash)
- Used for tracking separate records per list

---

## Hooks

### useQuizStore

**Location:** `src/hooks/useQuizStore.ts`

Zustand store for quiz state management. See [Store section](#store-zustand) for details.

---

### useTimer

**Location:** `src/hooks/useTimer.ts`

Timer hook for tracking elapsed time.

```typescript
function useTimer(
  isRunning: boolean,
  startTimeMs?: number,
): {
  elapsedMs: number;
  formatted: string;
};
```

**Parameters:**

- `isRunning` - Whether timer should be counting
- `startTimeMs` - Start timestamp (optional)

**Returns:**

- `elapsedMs` - Elapsed milliseconds
- `formatted` - Formatted string (MM:SS)

**Example:**

```typescript
import { useTimer } from "@/hooks/useTimer";

function QuizTimer() {
  const { formatted } = useTimer(true, Date.now() - 60000);
  return <span>{ formatted } < /span>; / / "01:00";
}
```

---

## UI Components

**Location:** `src/components/ui/`

### Button

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  loading?: boolean;
}
```

**Example:**

```tsx
<Button variant="primary" size="lg" onClick={handleClick}>
  Start Quiz
</Button>
```

---

### Card

```typescript
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}
```

**Example:**

```tsx
<Card>
  <CardHeader>Title</CardHeader>
  <CardBody>Content</CardBody>
</Card>
```

---

### Input

```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}
```

**Example:**

```tsx
<Input label="Your Answer" placeholder="Type here..." error={errorMessage} fullWidth />
```

---

### Modal

```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}
```

**Example:**

```tsx
<Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Word List">
  <WordListTable />
</Modal>
```

---

## Feature Components

### WordListUpload

**Location:** `src/components/WordListUpload.tsx`

CSV file upload with drag-and-drop support.

```typescript
interface WordListUploadProps {
  onWordsLoaded: (words: WordItem[]) => void;
  className?: string;
}
```

---

### ManualEntryTable

**Location:** `src/components/ManualEntryTable.tsx`

Manual word entry table with auto-expanding rows.

```typescript
interface ManualEntryTableProps {
  onWordsLoaded: (words: WordItem[]) => void;
  className?: string;
}
```

---

### QuizCard

**Location:** `src/components/QuizCard.tsx`

Displays current question in normal mode.

```typescript
interface QuizCardProps {
  prompt: string;
  onSubmit: (answer: string) => void;
  feedback?: "correct" | "incorrect" | "none";
  correctAnswer?: string;
  disabled?: boolean;
}
```

---

### PracticeCard

**Location:** `src/components/PracticeCard.tsx`

Practice mode card for repetition.

```typescript
interface PracticeCardProps {
  prompt: string;
  correctAnswer: string;
  remaining: number;
  onSubmit: (answer: string) => void;
}
```

---

### ProgressHeader

**Location:** `src/components/ProgressHeader.tsx`

Quiz progress display (resolved/total, tries, timer).

```typescript
interface ProgressHeaderProps {
  resolved: number;
  total: number;
  tries: number;
  elapsedMs: number;
}
```

---

### ResultsCard

**Location:** `src/components/ResultsCard.tsx`

Quiz results summary display.

```typescript
interface ResultsCardProps {
  totalWords: number;
  totalTries: number;
  totalTimeMs: number;
  wordsNotFirstTry: WordItem[];
  previousRecords: ListRecords | null;
  isNewTriesRecord: boolean;
  isNewTimeRecord: boolean;
  onRestart: () => void;
  onNewList: () => void;
}
```

---

### WordListOverlay

**Location:** `src/components/WordListOverlay.tsx`

Global word list modal accessible from any screen.

```typescript
interface WordListOverlayProps {
  words?: WordItem[];
  currentWordId?: string | null;
}
```

---

### LanguageSelector

**Location:** `src/components/LanguageSelector.tsx`

Language switcher (Finnish/English).

```typescript
// No props - uses next-intl internally
function LanguageSelector(): JSX.Element;
```

---

## Store (Zustand)

**Location:** `src/hooks/useQuizStore.ts`

### State

```typescript
interface QuizState {
  session: QuizSession | null;
}
```

### Actions

#### loadWords

Initialize quiz with word list.

```typescript
loadWords(words: WordItem[]): void
```

#### startQuiz

Start the quiz (shuffles words, starts timer).

```typescript
startQuiz(): void
```

#### submitAnswer

Submit answer in normal mode.

```typescript
submitAnswer(answer: string): AnswerResult
// Returns: { correct: boolean, correctAnswer: string }
```

#### submitPracticeAnswer

Submit answer in practice mode.

```typescript
submitPracticeAnswer(answer: string): boolean
// Returns: true if correct
```

#### enterPracticeMode

Enter practice mode for a word.

```typescript
enterPracticeMode(wordId: string): void
```

#### exitPracticeMode

Return to normal mode.

```typescript
exitPracticeMode(): void
```

#### endQuiz

End the quiz (stops timer).

```typescript
endQuiz(): void
```

#### resetQuiz

Clear all state for new quiz.

```typescript
resetQuiz(): void
```

### Selectors

#### getCurrentWord

Get current word being answered.

```typescript
getCurrentWord(): WordItem | null
```

#### getProgress

Get quiz progress.

```typescript
getProgress(): { resolved: number; total: number }
```

#### isQuizComplete

Check if all words resolved.

```typescript
isQuizComplete(): boolean
```

### Usage Example

```typescript
import { useQuizStore } from '@/hooks/useQuizStore';

function QuizComponent() {
  const session = useQuizStore((state) => state.session);
  const submitAnswer = useQuizStore((state) => state.submitAnswer);
  const getCurrentWord = useQuizStore((state) => state.getCurrentWord);

  const currentWord = getCurrentWord();

  const handleSubmit = (answer: string) => {
    const result = submitAnswer(answer);
    if (result.correct) {
      // Show success feedback
    } else {
      // Show correct answer, enter practice mode
    }
  };

  return (
    <QuizCard
      prompt={currentWord?.prompt ?? ''}
      onSubmit={handleSubmit}
    />
  );
}
```

---

## Icon Components

**Location:** `src/components/icons/`

### Available Icons

```typescript
import { Star, Trophy, Rocket, Check, X } from '@/components/icons';

// All icons accept className prop
<Star className="w-6 h-6 text-yellow-500" />
<Trophy className="w-8 h-8 text-amber-500" />
<Rocket className="w-10 h-10 text-primary-500" />
```

---

## Page Components

### Home Page

**Location:** `src/app/[locale]/page.tsx`

Start screen with word input options.

### Quiz Page

**Location:** `src/app/[locale]/quiz/page.tsx`

Main quiz flow (normal + practice modes).

### Results Page

**Location:** `src/app/[locale]/results/page.tsx`

Quiz results and records display.

---

## i18n

### Using Translations

```typescript
import { useTranslations } from 'next-intl';

function Component() {
  const t = useTranslations('quiz');

  return <h1>{t('title')}</h1>;
}
```

### Translation Files

- `src/messages/fi.json` - Finnish
- `src/messages/en.json` - English

### Available Namespaces

- `start` - Start screen
- `upload` - CSV upload
- `manual` - Manual entry
- `quiz` - Quiz screen
- `practice` - Practice mode
- `results` - Results screen
- `wordList` - Word list overlay
- `common` - Common labels

---

## Testing Utilities

### Jest Mocks

```typescript
// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, "localStorage", { value: localStorageMock });

// Mock quiz store
jest.mock("@/hooks/useQuizStore", () => ({
  useQuizStore: jest.fn((selector) => selector(mockState)),
}));
```

### Playwright Helpers

```typescript
// Navigate to quiz with words
await page.goto("/fi");
await page.getByRole("button", { name: /syötä käsin/i }).click();
// ... add words
await page.getByRole("button", { name: /aloita koe/i }).click();
```
