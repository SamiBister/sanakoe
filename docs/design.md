# Sanakoe - Design Document

**Project:** Language Quiz for Kids (Sanakoe)  
**Version:** 1.0  
**Date:** 2026-02-01  
**Status:** In Development

---

## 1. Overview

Sanakoe is a kid-friendly vocabulary quiz web application built with Next.js that helps children (ages 9-13) practice language vocabulary through gamified learning with positive reinforcement.

### Vision

Provide an engaging, stress-free environment where children can practice vocabulary at their own pace with immediate feedback and encouraging messages.

### Key Principles

- **Kid-First Design:** Large text, bright colors, playful elements
- **Positive Reinforcement:** Encouraging feedback, no penalties
- **Privacy-Focused:** All data stays local, no tracking
- **Accessible:** Keyboard navigation, clear visual hierarchy
- **Bilingual:** Finnish and English support from day one

---

## 2. Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser Client                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Next.js App Router (React)               │  │
│  │                                                        │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │  │
│  │  │ Start Screen │  │ Quiz Screen  │  │  Results   │  │  │
│  │  │ (File Upload │  │ (Normal +    │  │  Screen    │  │  │
│  │  │  or Manual)  │  │  Practice)   │  │            │  │  │
│  │  └──────────────┘  └──────────────┘  └────────────┘  │  │
│  │                                                        │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │         Zustand State Management                │  │  │
│  │  │  - Quiz Session State                           │  │  │
│  │  │  - Word List Management                         │  │  │
│  │  │  - Quiz Logic (Normal + Practice Modes)         │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │                                                        │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │              Utility Libraries                   │  │  │
│  │  │  - CSV Parser                                    │  │  │
│  │  │  - Answer Matcher                                │  │  │
│  │  │  - List Fingerprinting (Hash)                    │  │  │
│  │  │  - Storage (localStorage wrapper)                │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                localStorage API                         │  │
│  │  - Personal Best Records                               │  │
│  │  - Last Word List                                      │  │
│  │  - Manual Entry Draft                                  │  │
│  └────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer         | Technology            | Version | Purpose                                |
| ------------- | --------------------- | ------- | -------------------------------------- |
| **Framework** | Next.js               | 14.2+   | React framework with App Router        |
| **Language**  | TypeScript            | 5.4+    | Type safety and developer experience   |
| **Styling**   | Tailwind CSS          | 3.4+    | Utility-first CSS framework            |
| **State**     | Zustand               | 4.5+    | Lightweight state management           |
| **i18n**      | next-intl             | 3.11+   | Internationalization (Finnish/English) |
| **IDs**       | nanoid                | 5.0+    | Unique ID generation for words         |
| **Testing**   | Jest                  | Latest  | Unit testing framework                 |
| **Testing**   | React Testing Library | Latest  | Component testing                      |

### Architecture Style

**Client-Side Single Page Application (SPA)**

- **No backend server** required for MVP
- **Static hosting** (Vercel, Netlify, GitHub Pages)
- **localStorage** for data persistence
- **App Router** for navigation and i18n routing

---

## 3. Component Architecture

### Directory Structure

```
src/
├── app/
│   ├── [locale]/                    # i18n routing
│   │   ├── layout.tsx               # Root layout with providers
│   │   ├── page.tsx                 # Start screen
│   │   ├── quiz/
│   │   │   └── page.tsx             # Quiz screen
│   │   └── results/
│   │       └── page.tsx             # Results screen
│   └── globals.css                  # Global styles
├── components/
│   ├── ui/                          # Reusable UI primitives ✅
│   │   ├── Button.tsx               # ✅
│   │   ├── Card.tsx                 # ✅
│   │   ├── Input.tsx                # ✅
│   │   ├── Modal.tsx                # ✅
│   │   └── index.ts                 # Export all ✅
│   ├── icons/                       # SVG icon components ✅
│   │   ├── Star.tsx                 # ✅
│   │   ├── Trophy.tsx               # ✅
│   │   ├── Rocket.tsx               # ✅
│   │   └── index.ts                 # Export all ✅
│   ├── WordListUpload.tsx           # CSV file upload
│   ├── ManualEntryTable.tsx         # Manual word entry
│   ├── QuizCard.tsx                 # Question display (normal)
│   ├── PracticeCard.tsx             # Practice mode display
│   ├── ProgressHeader.tsx           # Progress indicators
│   ├── Timer.tsx                    # Quiz timer
│   ├── WordListOverlay.tsx          # Global word list modal
│   ├── ResultsCard.tsx              # Results summary
│   └── LanguageSelector.tsx         # Language switcher ✅
├── lib/
│   ├── types.ts                     # TypeScript type definitions ✅
│   ├── csv-parser.ts                # CSV parsing logic ✅
│   ├── answer-matcher.ts            # Answer validation ✅
│   ├── storage.ts                   # localStorage utilities ✅
│   ├── hash.ts                      # List fingerprinting ✅
│   └── utils.ts                     # General utilities
├── hooks/
│   ├── useQuizStore.ts              # Zustand quiz store ✅
│   ├── useTimer.ts                  # Timer hook ✅
│   └── useLocalStorage.ts           # localStorage hook
└── messages/
    ├── en.json                      # English translations
    └── fi.json                      # Finnish translations
```

### Component Responsibilities

#### Pages (App Router)

- **[locale]/page.tsx (Start Screen)**
  - Input method selection (CSV or manual)
  - Word list preview
  - Start quiz button
  - Language selector

- **[locale]/quiz/page.tsx (Quiz Screen)**
  - Displays current question
  - Handles answer input
  - Shows feedback (correct/incorrect)
  - Switches between normal and practice modes
  - Progress header with timer

- **[locale]/results/page.tsx (Results Screen)**
  - Performance metrics display
  - Personal records comparison
  - New record celebration
  - Restart or new list options

#### UI Components

- **Button:** Primary, secondary, danger variants with keyboard support
- **Card:** Container with shadow and rounded corners
- **Input:** Large text input with focus styles
- **Modal:** Overlay with animation and keyboard accessibility

#### Feature Components

- **WordListUpload:** File input, drag-and-drop, CSV parsing integration
- **ManualEntryTable:** Dynamic table, auto-expanding rows, keyboard navigation
- **QuizCard:** Prompt display, answer input, submit button, feedback
- **PracticeCard:** Answer display, repetition counter, validation
- **ProgressHeader:** Resolved/total count, tries counter, timer display
- **WordListOverlay:** Modal with all words, status indicators, current highlight

---

## 4. Data Model

### Core Types

```typescript
// Word item in the quiz
type WordItem = {
  id: string; // nanoid generated
  prompt: string; // Question (e.g., "cat")
  answer: string; // Correct answer (e.g., "kissa")
  attempts: number; // Times attempted in current quiz
  firstTryFailed: boolean; // True if wrong on first attempt
  resolved: boolean; // True if answered correctly at least once
};

// Quiz session state
type QuizSession = {
  words: WordItem[]; // All words in quiz
  unresolvedIds: string[]; // Queue of unresolved word IDs
  currentId: string | null; // Current word being shown
  tries: number; // Total attempts (normal mode only)
  startTimeMs: number; // Quiz start timestamp
  endTimeMs?: number; // Quiz end timestamp
  mode: "normal" | "practice"; // Current mode
  practiceTarget?: {
    id: string; // Word ID being practiced
    remaining: number; // Repetitions left (3, 2, 1)
  };
};

// Personal best records per word list
type Records = {
  [listFingerprint: string]: {
    bestTries?: number;
    bestTimeMs?: number;
    updatedAt: number;
  };
};
```

### State Flow

```
┌─────────────┐
│ Start Screen│
│  Load Words │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Initialize  │
│ Quiz Store  │ ← loadWords(WordItem[])
└──────┬──────┘
       │
       ▼
┌─────────────┐
│Start Quiz   │ ← startQuiz()
│ (Shuffle)   │   - Shuffle unresolvedIds
└──────┬──────┘   - Set startTimeMs
       │
       ▼
┌─────────────────────────────────────┐
│         Normal Mode Loop            │
│  1. Show current word prompt        │
│  2. User submits answer             │
│  3. submitAnswer(input)             │
│     - Increment tries               │
│     - Match answer                  │
│     ┌─────────┬─────────┐          │
│     │ Correct │ Wrong   │          │
│     ▼         ▼         │          │
│  Mark        Enter      │          │
│  resolved    Practice   │          │
│     │        Mode       │          │
│     └────┬───┴─────────┘          │
│          ▼                          │
│  moveToNextWord()                  │
│     - Pop from unresolvedIds       │
│     - Set new currentId            │
└──────┬──────────────────────────────┘
       │
       ├─────────────────────────────┐
       │                             │
       ▼                             ▼
┌─────────────┐            ┌─────────────────┐
│More Words?  │            │  Practice Mode  │
│     NO      │            │  1. Show answer │
└──────┬──────┘            │  2. Type 3x     │
       │                   │  3. Exit to     │
       ▼                   │     normal      │
┌─────────────┐            └────────┬────────┘
│  End Quiz   │                     │
│ (Save Time) │◄────────────────────┘
└──────┬──────┘
       │
       ▼
┌─────────────┐
│Results      │
│Screen       │
└─────────────┘
```

---

## 5. Key Features Implementation

### 5.1 CSV Parsing ✅

**Status:** Implemented and tested (98.71% coverage)

**Features:**

- Auto-delimiter detection (comma vs semicolon)
- Header row detection (English, Finnish, common patterns)
- Whitespace trimming
- Empty row skipping
- Deduplication (case-insensitive)
- Quoted value handling (with escaped quotes)
- Line ending normalization (CRLF/LF/CR)
- Unicode and emoji support
- Error handling with descriptive messages

**Implementation:** [src/lib/csv-parser.ts](../src/lib/csv-parser.ts)

**Test Coverage:** 27 tests, 98.71% statement coverage

### 5.2 Answer Matching ✅

**Status:** Implemented and tested (100% coverage)

**Features:**

- Case-insensitive matching
- Whitespace normalization (trim + collapse)
- Special character support
- Unicode and emoji support
- Levenshtein distance similarity calculation (for future features)

**Implementation:** [src/lib/answer-matcher.ts](../src/lib/answer-matcher.ts)

**Test Coverage:** 37 tests, 100% statement coverage

### 5.3 localStorage Utilities ✅

**Status:** Implemented and tested (90.99% coverage)

**Features:**

- Records persistence (personal bests per word list)
- Word list persistence (last used list)
- Storage versioning and migration system
- Quota exceeded detection and handling
- JSON parse error recovery
- Storage availability checks
- Usage tracking and quota warnings

**Implementation:** [src/lib/storage.ts](../src/lib/storage.ts)

**Test Coverage:** 41 tests, 90.99% statement coverage

### 5.4 List Fingerprinting ✅

**Status:** Implemented and tested (100% coverage)

**Features:**

- Stable, deterministic hashing
- Order-independent (sorted before hashing)
- djb2 hash algorithm with base62 encoding
- Whitespace and case normalization
- Content-based list comparison
- Human-readable descriptions
- Collision probability estimation

**Implementation:** [src/lib/hash.ts](../src/lib/hash.ts)

**Test Coverage:** 45 tests, 100% statement coverage

### 5.5 Zustand Quiz Store ✅

**Status:** Implemented and tested (94.33% coverage)

**Features:**

- Centralized quiz state management with 11 actions and 4 selectors
- Complete quiz lifecycle: loadWords → startQuiz → submitAnswer → endQuiz → resetQuiz
- Fisher-Yates shuffle for word randomization
- FIFO queue management for unresolved words
- Normal mode: answer validation, tries tracking, auto-advance on correct
- Practice mode: 3-repetition requirement, no tries impact
- Mode transitions: normal ↔ practice
- Timer tracking (startTimeMs, endTimeMs)
- Progress calculation (resolved/total)
- Convenience hooks for actions and selectors

**Store Interface:**

```typescript
interface QuizStore {
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

  // Selectors
  getCurrentWord: () => WordItem | null;
  getProgress: () => { resolved: number; total: number };
  isQuizActive: () => boolean;
  isQuizComplete: () => boolean;
}
```

**Implementation:** [src/hooks/useQuizStore.ts](../src/hooks/useQuizStore.ts)

**Test Coverage:** 58 tests, 94.33% statement coverage

### 5.6 Timer Hook

**Purpose:** Provide timer functionality for tracking quiz elapsed time.

**Interface:**

```typescript
interface TimerState {
  elapsedSeconds: number;
  formattedTime: string; // "MM:SS" format
  isRunning: boolean;
}

interface TimerActions {
  start: () => void;
  pause: () => void;
  reset: () => void;
}

type UseTimerReturn = TimerState & TimerActions;
```

**Features:**

- **Accurate Tracking**: Increments every second using `setInterval`
- **Format Display**: Returns formatted time string (MM:SS) with zero-padding
- **Control Actions**: Start, pause, and reset timer independently
- **State Management**: Uses `useState` for seconds and running status
- **Cleanup**: Properly clears intervals on unmount or pause
- **Resumable**: Can pause and resume without losing elapsed time

**Implementation:** [src/hooks/useTimer.ts](../src/hooks/useTimer.ts)

**Test Coverage:** 30 tests, 93.1% statement coverage

### 5.7 UI Component Library ✅

**Status:** Implemented with responsive support

**Purpose:** Reusable, kid-friendly UI components for consistent design throughout the application.

**Components:**

1. **Button** (`src/components/ui/Button.tsx`)
   - Variants: primary, secondary, danger
   - Sizes: sm, md, lg (with responsive min-heights: 44px, 48px, 56px)
   - Props: fullWidth, loading
   - Features: Large text, rounded corners, focus states, keyboard accessible
   - Styling: Bright colors, shadow effects, smooth transitions
   - Touch targets: Minimum 44px height for mobile accessibility

2. **Card** (`src/components/ui/Card.tsx`)
   - Variants: default (shadow), outlined (border), elevated (large shadow)
   - Padding: none, sm, md, lg
   - Props: hoverable (adds hover effects)
   - Sub-components: CardHeader, CardBody, CardFooter
   - Features: Rounded corners, generous padding, flexible composition

3. **Input & Textarea** (`src/components/ui/Input.tsx`)
   - Props: label, error, helperText, isError, inputSize, fullWidth
   - Features: Large text (lg default), clear focus styles, error indicators
   - Accessibility: Proper label association, error messages with role="alert"
   - Styling: Rounded borders, bright focus rings, visual error states

4. **Modal** (`src/components/ui/Modal.tsx`)
   - Props: isOpen, onClose, title, size, footer, closeOnOverlayClick, closeOnEsc
   - Sizes: sm, md, lg, xl (all with `w-full` for mobile)
   - Responsive: `p-2 sm:p-4` container, `rounded-2xl sm:rounded-3xl`, `max-h-[85vh] sm:max-h-[90vh]`
   - Features: Focus trap, body scroll prevention, ESC key support, overlay click
   - Accessibility: ARIA attributes, keyboard navigation, focus restoration
   - Animations: Fade-in overlay, slide-up content

**Design Philosophy:**

- Kid-friendly: Large touch targets (min 44px), bright colors, clear visual feedback
- Accessible: Full keyboard navigation, ARIA labels, focus management
- Consistent: Shared design tokens from Tailwind config
- Flexible: Props for customization while maintaining design consistency

**Implementation:** [src/components/ui/](../src/components/ui/)

**Test Coverage:** 82 tests, 87.38% statement coverage, 98.93% branch coverage

All components use the forwardRef pattern for ref passing, allowing parent components to access the underlying DOM elements.

### 5.8. Icon Components

Three kid-friendly SVG icon components for visual feedback and motivation:

#### Star Icon

**Purpose:** Correct answers, achievements, and positive feedback.

**Component Interface:**

```typescript
interface StarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number; // Size in pixels (default: 24)
  ariaLabel?: string; // Screen reader label (default: "Star")
}
```

**Features:**

- Bright gold color (#FFD700) with orange stroke
- Scalable to any size via `size` prop
- Uses Next.js Image component for optimization
- Accessible with role="img" and aria-label
- Supports all HTML div attributes
- forwardRef support for ref passing

**SVG Details:**

- File: `/public/icons/star.svg`
- ViewBox: 24x24
- Fill: Gold (#FFD700)
- Stroke: Orange (#FFA500)

#### Trophy Icon

**Purpose:** Personal records, achievements, and milestones.

**Component Interface:**

```typescript
interface TrophyProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number; // Size in pixels (default: 24)
  ariaLabel?: string; // Screen reader label (default: "Trophy")
}
```

**Features:**

- Primary color matches theme orange (#F5AA14)
- Classic trophy shape with handles and base
- Scalable and accessible
- Optimized with Next.js Image
- forwardRef support

**SVG Details:**

- File: `/public/icons/trophy.svg`
- ViewBox: 24x24
- Fill and Stroke: Primary orange (#F5AA14)

#### Rocket Icon

**Purpose:** Motivation, encouragement, and "launch" actions.

**Component Interface:**

```typescript
interface RocketProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number; // Size in pixels (default: 24)
  ariaLabel?: string; // Screen reader label (default: "Rocket")
}
```

**Features:**

- Multi-color design: red body, teal flames
- Playful and energetic appearance
- Scalable and accessible
- Optimized with Next.js Image
- forwardRef support

**SVG Details:**

- File: `/public/icons/rocket.svg`
- ViewBox: 24x24
- Colors: Red (#FF6B6B, #FF3333), Teal (#27C4A1)

#### Design Philosophy

**Kid-Friendly:**

- Bright, cheerful colors that appeal to ages 9-13
- Simple, recognizable shapes
- High contrast for visibility

**Accessible:**

- All icons have role="img"
- Customizable aria-label for context
- Empty alt text on img element (decorative)
- Keyboard interaction support via HTML attributes

**Flexible:**

- Size prop for any dimension
- Accepts all HTML div attributes
- Can be wrapped in buttons or links
- className support for custom styling

#### Usage Examples

```tsx
import { Star, Trophy, Rocket } from '@/components/icons';

// Basic usage
<Star />
<Trophy />
<Rocket />

// Custom size
<Star size={48} />

// Custom aria-label
<Trophy ariaLabel="First place trophy" />

// With click handler
<Rocket onClick={() => console.log('Launched!')} />

// With className
<Star className="hover:scale-110 transition-transform" size={32} />
```

#### Test Coverage

- Statement: 71.42%
- Branch: 100%
- Function: 100%
- Lines: 73.68%
- Total Tests: 39 (13 per icon)

---

### 5.9. WordListUpload Component

A CSV file upload component that allows users to load vocabulary word lists from `.csv` or `.txt` files.

#### Purpose

Provides the first of two input methods for loading vocabulary words into the quiz. Allows users to quickly import large word lists from spreadsheet files.

#### Component Interface

```typescript
interface WordListUploadProps {
  /**
   * Callback when words are successfully parsed
   */
  onWordsLoaded: (words: WordItem[]) => void;

  /**
   * Additional CSS classes
   */
  className?: string;
}
```

#### Features

**File Input:**

- Hidden file input triggered by visible button
- Accepts `.csv` and `.txt` file extensions
- File type validation before processing

**Drag-and-Drop:**

- Full drag-and-drop support
- Visual feedback when dragging over drop zone
- Highlights border to indicate drop target

**File Processing:**

- Uses FileReader API for client-side reading
- Integrates with existing CSV parser (`parseCSV`)
- Validates file content and format
- Checks for empty results

**State Management:**

- Four states: idle, loading, success, error
- Loading state shows spinner with filename
- Error state shows user-friendly messages
- Success state shows word count and preview

**Word Preview:**

- Displays first 5 words in prompt → answer format
- Shows total word count
- Indicates if more words exist (...and N more words)

**Error Handling:**

- Catches CSVParseError with specific messages
- Handles generic errors with fallback message
- Detects empty word lists
- Reset functionality to try again

**User Experience:**

- Large, kid-friendly button and drop zone
- Clear instructions and supported format info
- Encouraging success feedback
- Non-blocking error messages with retry option

#### States

```typescript
interface UploadState {
  status: "idle" | "loading" | "success" | "error";
  words: WordItem[];
  error: string | null;
  fileName: string | null;
}
```

**Idle State:**

- Shows upload area with drag-and-drop zone
- "Drag and drop your CSV file here"
- "Choose File" button
- Format information

**Loading State:**

- Upload area visible but button disabled
- Shows "Loading..." text on button
- Separate loading card with spinner
- "Parsing {filename}..." message

**Success State:**

- Hides upload area
- Shows success card with checkmark icon
- Displays word count: "Loaded N words"
- Preview section with first 5 words
- "Upload Different File" button to reset

**Error State:**

- Hides upload area
- Shows error card with warning icon
- "Upload Failed" header
- Error message from parser or validation
- "Try Again" button to reset

#### Integration

**CSV Parser Integration:**

```typescript
import { parseCSV, CSVParseError } from "@/lib/csv-parser";

try {
  const words = parseCSV(content);
  // Success
} catch (error) {
  if (error instanceof CSVParseError) {
    // Show parser-specific error message
  }
}
```

**Quiz Store Integration:**

```typescript
import { useQuizStore } from '@/store/useQuizStore';
import { WordListUpload } from '@/components/WordListUpload';

function StartScreen() {
  const loadWords = useQuizStore((state) => state.loadWords);

  return (
    <WordListUpload onWordsLoaded={(words) => loadWords(words)} />
  );
}
```

#### Validation

**File Type Validation:**

```typescript
const validateFileType = (file: File): boolean => {
  const validExtensions = [".csv", ".txt"];
  const fileName = file.name.toLowerCase();
  return validExtensions.some((ext) => fileName.endsWith(ext));
};
```

- Checks file extension (case-insensitive)
- Rejects non-CSV/TXT files immediately
- Shows error: "Please upload a CSV or TXT file"

**Content Validation:**

- Parses CSV content with `parseCSV`
- Validates 2-column format
- Checks for empty results
- Shows parser error messages

#### Accessibility

- Hidden file input has `aria-label="Upload CSV file"`
- Button is `disabled` during loading
- Success/error cards have semantic HTML
- Icons have `role="img"` and `aria-hidden`
- Keyboard accessible (button and file input)
- Supports `forwardRef` for ref passing

#### User Flow

1. **Initial State:** User sees upload area with drag-and-drop zone and "Choose File" button
2. **File Selection:** User clicks button or drags file over zone
3. **Validation:** Component checks file extension
4. **Loading:** Shows loading spinner while reading and parsing
5. **Success:** Shows word count and preview with first 5 words
6. **Callback:** Calls `onWordsLoaded` with parsed words
7. **Reset:** User can upload different file

#### Error Scenarios

| Error             | Message                                          | Recovery         |
| ----------------- | ------------------------------------------------ | ---------------- |
| Invalid file type | "Please upload a CSV or TXT file"                | Try Again button |
| CSV parse error   | Parser-specific message                          | Try Again button |
| File read error   | "Failed to read file"                            | Try Again button |
| Empty results     | "No valid word pairs found in the file"          | Try Again button |
| Generic error     | "Failed to parse file. Please check the format." | Try Again button |

#### UI Components Used

- `Button` from `@/components/ui/Button`
  - Primary variant for "Choose File"
  - Secondary variant for reset buttons
- `Card`, `CardHeader`, `CardBody` from `@/components/ui/Card`
  - Loading state card
  - Success state card
  - Error state card with outlined variant
- Inline SVG icons:
  - Upload icon (cloud with arrow)
  - Success checkmark
  - Error warning icon

#### Styling

- Drop zone: `border-4 border-dashed rounded-2xl p-8`
- Drag highlight: `border-primary-500 bg-primary-50`
- Default border: `border-gray-300 bg-gray-50`
- Large text: `text-lg` for instructions
- Icon size: `w-16 h-16` for upload icon
- Loading spinner: `animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500`

#### Test Coverage

- Statement: 85.89%
- Branch: 75%
- Function: 81.25%
- Lines: 85.52%
- Total Tests: 21 (16 passing, 5 timing-related edge cases)

**Test Categories:**

- Rendering (3 tests)
- File selection via button (3 tests)
- File validation (4 tests)
- Error handling (4 tests)
- Success state (3 tests)
- Drag and drop (2 tests)
- Accessibility (3 tests)

#### Usage Example

```tsx
import { WordListUpload } from "@/components/WordListUpload";
import { useQuizStore } from "@/store/useQuizStore";

export default function StartScreen() {
  const loadWords = useQuizStore((state) => state.loadWords);

  const handleWordsLoaded = (words: WordItem[]) => {
    loadWords(words);
    // Navigate to quiz screen or show success message
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Load Vocabulary Words</h1>

      <WordListUpload onWordsLoaded={handleWordsLoaded} className="max-w-2xl mx-auto" />

      <div className="mt-8 text-center text-gray-600">
        <p>Or enter words manually below...</p>
      </div>
    </div>
  );
}
```

#### Implementation Details

**FileReader API:**

```typescript
const readFileContent = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === "string") {
        resolve(content);
      } else {
        reject(new Error("Failed to read file as text"));
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsText(file);
  });
};
```

**Drag-and-Drop Implementation:**

- `onDragEnter`: Sets `isDragging` to true
- `onDragLeave`: Sets `isDragging` to false
- `onDragOver`: Prevents default to enable drop
- `onDrop`: Extracts file from `dataTransfer.files`

**State Reset:**

```typescript
const handleReset = () => {
  setUploadState({
    status: "idle",
    words: [],
    error: null,
    fileName: null,
  });
  if (fileInputRef.current) {
    fileInputRef.current.value = "";
  }
};
```

#### Design Philosophy

**Kid-Friendly:**

- Large, easy-to-click button
- Clear drag-and-drop visual feedback
- Encouraging success messages
- Non-threatening error messages

**User-Friendly:**

- No need to understand technical error messages
- Shows preview before committing
- Easy retry on errors
- Clear format information

**Developer-Friendly:**

- Simple callback API
- Integrates with existing CSV parser
- TypeScript types for safety
- forwardRef support
- Customizable via className

---

### 5.10. ManualEntryTable Component

**Purpose:** Provides a manual word entry interface with an auto-expanding table where users can type vocabulary words directly instead of uploading a CSV file.

**Location:** `src/components/ManualEntryTable.tsx`

#### Component Interface

```typescript
export interface ManualEntryTableProps {
  onWordsLoaded: (words: WordItem[]) => void; // Callback with valid words
  className?: string; // Optional CSS classes
}
```

#### Features

1. **Initial 10 Rows:** Table starts with 10 empty rows
2. **Auto-Expand:** New row automatically added when typing in the last row
3. **Keyboard Navigation:**
   - Tab: Move to next cell
   - Shift+Tab: Move to previous cell
   - Enter: Behaves like Tab
   - Tab on last cell: Adds new row and moves focus
4. **Real-Time Validation:** Only rows with both prompt and answer filled count as valid
5. **Valid Word Counter:** Shows count of complete word pairs
6. **Clear All:** Button with confirmation dialog to reset table
7. **localStorage Persistence:** Table content automatically saved and restored
8. **Paste Support:** Tab-separated values (TSV) paste fills multiple rows
9. **Trim Whitespace:** All values trimmed before validation
10. **Focus Management:** Proper focus handling for keyboard accessibility
11. **forwardRef Support:** Can be ref forwarded for external control
12. **Responsive Design:** Scrollable table for smaller screens

#### Table Structure

**TableRow Internal Type:**

```typescript
interface TableRow {
  id: string; // Unique identifier (nanoid)
  prompt: string; // Question/word in native language
  answer: string; // Translation/answer
}
```

#### States

**Component State:**

- `rows: TableRow[]` - Array of table rows (10+ rows)
- `showConfirmation: boolean` - Controls Clear All dialog visibility

**Refs:**

- `inputRefs: Map<string, HTMLInputElement>` - All input elements for navigation
- `isInitialMount: Ref<boolean>` - Skip localStorage save on mount
- `isClearing: Ref<boolean>` - Skip localStorage save during clear operation

#### Valid Word Computation

```typescript
const getValidWords = (): WordItem[] => {
  return rows
    .filter((row) => row.prompt.trim() !== "" && row.answer.trim() !== "")
    .map((row) => ({
      id: row.id,
      prompt: row.prompt.trim(),
      answer: row.answer.trim(),
      attempts: 0,
      firstTryFailed: false,
      resolved: false,
    }));
};
```

**Validation Rules:**

- Both prompt AND answer must have non-empty content (after trim)
- Rows with only one cell filled are not counted
- Empty rows are ignored

#### Keyboard Navigation Logic

**Tab Behavior:**

```typescript
// Current: Row 1 Prompt
// Tab → Row 1 Answer
// Tab → Row 2 Prompt
// Tab → Row 2 Answer
// ... continues
// Tab on last Answer → Adds new row, focuses new Row Prompt
```

**Shift+Tab Behavior:**

- Moves backward through cells
- Stops at first cell (doesn't wrap)

**Enter Key:**

- Behaves exactly like Tab
- Moves forward through table

**Implementation:**

```typescript
const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, rowIndex: number, field: "prompt" | "answer") => {
  if (e.key === "Tab" || e.key === "Enter") {
    e.preventDefault();

    if (e.shiftKey && e.key === "Tab") {
      // Move backward
      // Logic to find previous cell
    } else {
      // Move forward
      // Logic to find next cell or add row
    }
  }
};
```

#### Auto-Expand Logic

**Trigger:** Typing in any cell of the last row (either prompt or answer)

**Implementation:**

```typescript
const updateCell = (rowId: string, field: "prompt" | "answer", value: string) => {
  setRows((prevRows) => {
    const updatedRows = prevRows.map((row) => (row.id === rowId ? { ...row, [field]: value } : row));

    // Check if last row has any content
    const lastRow = updatedRows[updatedRows.length - 1];
    const isLastRowFilled = lastRow.prompt.trim() !== "" || lastRow.answer.trim() !== "";

    if (isLastRowFilled) {
      return [...updatedRows, ...createEmptyRows(1)];
    }

    return updatedRows;
  });
};
```

**Why This Approach:**

- Ensures there's always an empty row available
- Smooth UX - user never needs to manually add rows
- No "Add Row" button needed

#### Paste Support

**Supported Formats:**

1. **Tab-Separated Values (TSV):**

   ```
   hello	hei
   goodbye	näkemiin
   ```

2. **Tab-Separated with Newlines:**
   ```
   word1	translation1
   word2	translation2
   word3	translation3
   ```

**Implementation:**

```typescript
const handlePaste = (e: ClipboardEvent<HTMLInputElement>, rowIndex: number, field: "prompt" | "answer") => {
  const pastedText = e.clipboardData.getData("text");

  if (pastedText.includes("\t") || pastedText.includes("\n")) {
    e.preventDefault();

    // Parse lines
    const lines = pastedText.split("\n").filter((line) => line.trim() !== "");
    const parsedRows = [];

    lines.forEach((line) => {
      const parts = line.split("\t");
      if (parts.length >= 2) {
        parsedRows.push({
          prompt: parts[0].trim(),
          answer: parts[1].trim(),
        });
      }
    });

    // Fill rows starting from current position
    // Add new rows if needed
  }
};
```

**Use Cases:**

- Copy-paste from Excel/Google Sheets
- Import from text files
- Quick bulk entry

#### Clear All Feature

**Flow:**

1. User clicks "Clear All" button
2. Confirmation dialog appears
3. User can:
   - Click "Cancel" → Dialog closes, data preserved
   - Click "Clear All" → All data erased, 10 empty rows restored

**Dialog:**

- Modal overlay (blocks clicks outside)
- Warning message with valid word count
- "This action cannot be undone" notice
- Cancel and Clear All buttons

**Implementation:**

```typescript
const confirmClearAll = () => {
  setShowConfirmation(false);

  // Remove from localStorage
  localStorage.removeItem(STORAGE_KEY);

  // Set flag to prevent useEffect from saving empty rows
  isClearing.current = true;

  // Clear rows
  setRows(createEmptyRows(INITIAL_ROW_COUNT));

  // Focus first cell after clearing
  setTimeout(() => {
    const firstInput = inputRefs.current.values().next().value;
    firstInput?.focus();
  }, 0);
};
```

**Design Rationale:**

- Confirmation prevents accidental data loss
- Dangerous action clearly marked (red button)
- Focus management ensures smooth UX after clear

#### localStorage Persistence

**Storage Key:** `sanakoe_manual_entry`

**Data Format:**

```json
[
  { "id": "abc123", "prompt": "hello", "answer": "hei" },
  { "id": "def456", "prompt": "goodbye", "answer": "näkemiin" },
  ...empty rows...
]
```

**Save Logic:**

```typescript
// Save to localStorage whenever rows change (except initial mount and clearing)
useEffect(() => {
  if (isInitialMount.current) {
    isInitialMount.current = false;
    return;
  }

  if (isClearing.current) {
    isClearing.current = false;
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}, [rows]);
```

**Load Logic:**

```typescript
useEffect(() => {
  const savedData = localStorage.getItem(STORAGE_KEY);

  if (savedData) {
    try {
      const parsed = JSON.parse(savedData);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setRows(parsed);
        return;
      }
    } catch (error) {
      console.error("Failed to parse saved table data:", error);
    }
  }

  // Create initial empty rows
  setRows(createEmptyRows(INITIAL_ROW_COUNT));
}, []);
```

**Benefits:**

- Work survives page refreshes
- User can close browser and resume later
- No data loss during editing

**Limitations:**

- Data tied to browser and domain
- No cross-device sync
- Cleared if browser cache cleared

#### UI Components Used

**From UI Library:**

- `Button` (danger variant for Clear All)
- `Card`, `CardHeader`, `CardBody` (for confirmation dialog)

**Table Styling:**

- `border-collapse` for clean borders
- `hover:bg-gray-50` for row hover effect
- `focus:ring-2 focus:ring-primary-500` for input focus
- Responsive: `overflow-x-auto` for small screens

#### Visual Design

**Header Section:**

- Valid word counter: Bold number in primary color
- "valid word(s) entered" text
- Clear All button: Danger variant (red), right-aligned

**Table:**

- Gray header background: `bg-gray-50`
- Column headers: "Prompt" and "Answer"
- Alternating row hover: `hover:bg-gray-50`
- Input padding: `px-3 py-2`
- Rounded inputs: `rounded-lg`

**Keyboard Hints:**

- Small text: `text-xs`
- Gray color: `text-gray-500`
- Italic style
- Two tips:
  - Tab navigation instructions
  - Paste support hint

#### User Flow

```
1. User lands on manual entry table (10 empty rows)
   ↓
2. User types in first prompt cell
   ↓
3. User presses Tab → Focus moves to answer cell
   ↓
4. User types answer, presses Tab → Focus moves to next row
   ↓
5. Valid word counter updates (1 valid word entered)
   ↓
6. User continues filling rows...
   ↓
7. User types in last row → New empty row appears automatically
   ↓
8. (Optional) User pastes tab-separated data → Multiple rows filled
   ↓
9. User leaves page → Data saved to localStorage
   ↓
10. User returns → Data restored, continues editing
    ↓
11. User finishes → Parent receives valid words via onWordsLoaded
    ↓
12. (Optional) User clicks Clear All → Confirmation → Reset to 10 empty rows
```

#### Integration with Quiz Store

```tsx
import { ManualEntryTable } from "@/components/ManualEntryTable";
import { useQuizStore } from "@/store/useQuizStore";

export default function StartScreen() {
  const loadWords = useQuizStore((state) => state.loadWords);

  const handleWordsLoaded = (words: WordItem[]) => {
    // Receives valid words automatically when table changes
    loadWords(words);
    // Can enable "Start Quiz" button when words.length > 0
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Enter Vocabulary Words</h1>

      <ManualEntryTable onWordsLoaded={handleWordsLoaded} className="max-w-4xl mx-auto" />

      {/* Start Quiz button enabled when words available */}
    </div>
  );
}
```

**Integration Points:**

- `onWordsLoaded` called automatically on any table change
- Parent doesn't need to track table state
- Can combine with CSV upload in same screen
- Easy to add validation or word count requirements

#### Error Scenarios

| Scenario                   | Handling                   | User Experience                                                      |
| -------------------------- | -------------------------- | -------------------------------------------------------------------- |
| **No words entered**       | `onWordsLoaded([])` called | Valid word counter shows "0 valid words", Start Quiz button disabled |
| **Incomplete rows**        | Only complete rows counted | Counter updates dynamically, incomplete rows ignored                 |
| **localStorage full**      | Error logged to console    | Table continues to work, just loses persistence                      |
| **Corrupted localStorage** | JSON parse error caught    | Falls back to 10 empty rows                                          |
| **Many rows (100+)**       | No performance issues      | Table renders smoothly, scroll appears                               |

#### Accessibility Features

**Keyboard Accessible:**

- Full keyboard navigation (Tab, Shift+Tab, Enter)
- No mouse required
- Focus visible on all inputs

**ARIA Labels:**

- Each input: `aria-label="Prompt for row {n}"` or `"Answer for row {n}"`
- Clear All button: `aria-label="Clear all entries"`
- Confirmation dialog: `role="dialog"` with `aria-modal="true"`

**Screen Reader Friendly:**

- Valid word counter read by screen readers
- Button states (enabled/disabled) announced
- Dialog title properly associated with `aria-labelledby`

#### Test Coverage

**Stats:**

- Total tests: 37
- Statement coverage: 95.71%
- Branch coverage: 81.42%
- Function coverage: 97.22%
- Line coverage: 95.58%
- **All tests passing** ✅

**Test Categories:**

1. **Rendering** (6 tests):
   - Table headers present
   - 10 initial empty rows
   - Valid word counter
   - Clear All button
   - Custom className
   - Keyboard hints

2. **Data Entry** (5 tests):
   - Entering text in prompt cell
   - Entering text in answer cell
   - Valid word count updates
   - Incomplete rows not counted
   - onWordsLoaded callback
   - Whitespace trimming

3. **Auto-Expand** (3 tests):
   - Adding row when typing in last prompt
   - Adding row when typing in last answer
   - Not adding rows in middle

4. **Keyboard Navigation** (6 tests):
   - Tab moves to next cell
   - Shift+Tab moves to previous cell
   - Tab from answer moves to next row
   - Enter behaves like Tab
   - Tab on last cell adds row
   - Shift+Tab stops at first cell

5. **Paste Support** (3 tests):
   - Tab-separated values paste
   - Valid word count after paste
   - Newlines in paste data

6. **Clear All Functionality** (5 tests):
   - Button enabled when data present
   - Confirmation dialog shown
   - Clearing on confirm
   - Canceling preserves data
   - Reset to 10 rows after clear

7. **localStorage Persistence** (4 tests):
   - Saves data to localStorage
   - Loads data on mount
   - Clears localStorage on Clear All
   - Handles corrupted data gracefully

8. **Accessibility** (4 tests):
   - Input labels present
   - Button accessibility
   - Dialog ARIA attributes
   - Ref forwarding

#### Usage Examples

**Basic Usage:**

```tsx
<ManualEntryTable onWordsLoaded={handleWordsLoaded} />
```

**With Custom Styling:**

```tsx
<ManualEntryTable onWordsLoaded={handleWordsLoaded} className="max-w-5xl shadow-lg" />
```

**With Ref:**

```tsx
const tableRef = useRef<HTMLDivElement>(null);

<ManualEntryTable ref={tableRef} onWordsLoaded={handleWordsLoaded} />;
```

#### Implementation Details

**Row ID Generation:**

```typescript
import { nanoid } from "nanoid";

const createEmptyRows = (count: number): TableRow[] => {
  return Array.from({ length: count }, () => ({
    id: nanoid(),
    prompt: "",
    answer: "",
  }));
};
```

**Input Ref Management:**

```typescript
// Store refs in Map for O(1) lookup
const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

// Set ref callback
ref={(el) => {
  if (el) {
    inputRefs.current.set(`${row.id}-prompt`, el);
  } else {
    inputRefs.current.delete(`${row.id}-prompt`);
  }
}}
```

**Focus Management:**

```typescript
const nextKey = `${nextRowId}-${nextField}`;
const nextInput = inputRefs.current.get(nextKey);
nextInput?.focus();
```

#### Design Philosophy

**Kid-Friendly:**

- No complex UI - just type in the table
- Clear counter shows progress
- Auto-expanding removes need to think about rows
- Can't break anything - confirmation for destructive action

**User-Friendly:**

- Works exactly like spreadsheet (familiar)
- Paste support for bulk entry
- Data never lost (localStorage)
- Keyboard-first for fast entry
- No "Save" button needed - auto-saves

**Developer-Friendly:**

- Simple callback API - just receive words
- No complex state management exposed
- TypeScript types ensure safety
- forwardRef for external control
- Well-tested and documented

---

#### Test Coverage

**Test Stats:**

- Total tests: 39 (13 per icon)
- Statement coverage: 71.42%
- Branch coverage: 100%
- Function coverage: 100%
- Line coverage: 80%

**Test Categories:**

1. **Rendering** (7 tests per icon):
   - Default rendering
   - Default size (24px)
   - Custom size
   - Default aria-label
   - Custom aria-label
   - Custom className
   - Correct SVG file loaded

2. **Accessibility** (4 tests per icon):
   - role="img" attribute
   - aria-label for screen readers
   - Empty alt text (decorative image)
   - Ref forwarding

3. **Interaction** (2 tests per icon):
   - onClick handler support
   - Additional HTML attributes

#### Usage Examples

```tsx
import { Star, Trophy, Rocket } from '@/components/icons';

// Correct answer feedback
<Star size={48} ariaLabel="Correct answer!" />

// New record celebration
<Trophy size={64} ariaLabel="New record trophy" className="animate-bounce" />

// Start quiz button
<button>
  <Rocket size={32} ariaLabel="Launch quiz" />
  Start Quiz!
</button>
```

**Implementation:** [src/components/icons/](../src/components/icons/)

### 5.9. Practice Mode

**Logic:**

1. User answers incorrectly in normal mode
2. `enterPracticeMode(wordId)` called
3. Mode switches to "practice"
4. Correct answer displayed prominently
5. User must type correct answer 3 times
6. Each correct entry: `submitPracticeAnswer(input)`
   - Validates match
   - Decrements remaining counter
7. After 3rd repetition: `exitPracticeMode()`
8. Returns to normal mode (stays on same word)
9. User answers again in normal mode to resolve the word

**Design Rationale:**

- Spaced repetition for better retention
- Immediate practice reinforces correct answer
- Must answer correctly in normal mode after practice to mark as resolved

### 5.9 Record Tracking

**Fingerprinting:**

```typescript
function generateListFingerprint(words: WordItem[]): string {
  // Sort by prompt+answer for stability
  const sorted = [...words].sort((a, b) => (a.prompt + a.answer).localeCompare(b.prompt + b.answer));

  // Simple hash (or JSON + base64)
  const json = JSON.stringify(sorted.map((w) => [w.prompt, w.answer]));
  return btoa(json).substring(0, 32); // Truncate for readability
}
```

**Storage:**

```typescript
localStorage.setItem(
  "sanakoe_records",
  JSON.stringify({
    [fingerprint]: {
      bestTries: 15,
      bestTimeMs: 120000,
      updatedAt: Date.now(),
    },
  }),
);
```

### 5.10. Global Word List Overlay ✅

**Status:** Implemented

**Features:**

- Accessible from any screen (persistent floating button, top-right)
- Shows all words with status:
  - ✅ Resolved (answered correctly)
  - 🔁 Unresolved (not yet attempted or still pending)
  - ⚠️ First-try mistake (wrong on first attempt)
- Filter buttons: All, Remaining, Done
- Word count display per filter
- Highlights current word during quiz
- Keyboard accessible (ESC to close)
- Does not pause timer or affect quiz state

**Responsive Design:**

- Button position: `top-2 right-2` on mobile, `top-4 right-4` on desktop
- Touch-friendly filter buttons with `min-h-[44px]`

**Implementation:** [src/components/WordListOverlay.tsx](../src/components/WordListOverlay.tsx)

---

### 5.11. Responsive Layout & Mobile Support ✅

**Status:** Implemented

**Design Philosophy:**

- Mobile-first with tablet (768px+) as primary target
- Touch targets meet accessibility guidelines (minimum 44px)
- Responsive typography scales with viewport

**Breakpoints (Tailwind):**

- `sm`: 640px
- `md`: 768px (primary tablet breakpoint)
- `lg`: 1024px

**Component Responsive Features:**

| Component                  | Mobile                               | Desktop                        |
| -------------------------- | ------------------------------------ | ------------------------------ |
| **Button**                 | min-h-[44px] (sm), min-h-[48px] (md) | min-h-[56px] (lg)              |
| **Modal**                  | p-2, rounded-2xl, max-h-[85vh]       | p-4, rounded-3xl, max-h-[90vh] |
| **Modal text**             | text-sm                              | text-base                      |
| **WordListOverlay button** | top-2 right-2                        | top-4 right-4                  |
| **ManualEntryTable**       | -mx-4 px-4 (full-bleed scroll)       | normal padding                 |
| **Table inputs**           | min-h-[44px], text-sm                | text-base                      |

**Global Responsive Styles (globals.css):**

```css
html {
  font-size: 16px; /* Mobile base */
}

@media (min-width: 768px) {
  html {
    font-size: 18px; /* Tablet/desktop base */
  }
}
```

**Touch Target Guidelines:**

- Minimum 44×44px for all interactive elements (iOS/Android accessibility)
- Adequate spacing between touch targets to prevent mis-taps
- Visual feedback on touch (hover states, focus rings)

---

## 6. Internationalization (i18n)

### Locale Routing

- URLs: `/en/`, `/fi/`, `/en/quiz`, `/fi/quiz`
- Middleware detects locale from URL or browser settings
- Default locale: Finnish (`fi`)

### Translation Structure

**en.json:**

```json
{
  "start": {
    "title": "Vocabulary Quiz",
    "uploadButton": "Upload CSV File",
    "manualButton": "Enter Words Manually",
    "startQuiz": "Start Quiz",
    "wordCount": "{count} words loaded"
  },
  "quiz": {
    "progress": "{resolved} of {total} words",
    "tries": "Attempts: {count}",
    "submit": "Check Answer",
    "correct": ["Great!", "Well done!", "Perfect!", "Excellent!"],
    "incorrect": ["Not quite!", "Let's practice!", "Almost there!"]
  },
  "practice": {
    "title": "Practice Mode",
    "instruction": "Type the correct answer 3 times:",
    "counter": "{current} of 3",
    "encouragement": ["Good!", "Keep going!", "One more!"]
  },
  "results": {
    "title": "Quiz Complete!",
    "totalWords": "Words practiced: {count}",
    "totalTries": "Total attempts: {count}",
    "totalTime": "Time: {time}",
    "newRecord": "🎉 New Personal Best!",
    "restart": "Restart Quiz",
    "newList": "New Word List"
  }
}
```

**fi.json:** (Finnish translations of above)

---

## 7. Storage Strategy

### localStorage Keys

| Key                       | Purpose                | Format             |
| ------------------------- | ---------------------- | ------------------ |
| `sanakoe_records`         | Personal best records  | JSON: `Records`    |
| `sanakoe_last_list`       | Last used word list    | JSON: `WordItem[]` |
| `sanakoe_manual_draft`    | Manual entry draft     | JSON: `string[][]` |
| `sanakoe_storage_version` | Storage schema version | String: `"1.0"`    |

### Error Handling

```typescript
function saveToLocalStorage(key: string, data: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    if (e.name === "QuotaExceededError") {
      // Show user-friendly error
      alert("Storage full. Please clear some data.");
    } else {
      console.error("Storage error:", e);
    }
  }
}

function loadFromLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error("Failed to load data:", e);
    return defaultValue;
  }
}
```

### Migration Strategy

```typescript
const STORAGE_VERSION = "1.0";

function migrateStorage(): void {
  const version = localStorage.getItem("sanakoe_storage_version");

  if (!version || version !== STORAGE_VERSION) {
    // Future: migration logic here
    localStorage.setItem("sanakoe_storage_version", STORAGE_VERSION);
  }
}
```

---

## 8. Testing Strategy

### Unit Tests

**Tools:** Jest + React Testing Library

**Coverage Goals:**

- Utilities (csv-parser, answer-matcher, hash, storage): **80%+**
- Hooks (useQuizStore, useTimer): **70%+**
- Components: Snapshot tests + key interactions

**CSV Parser:** ✅ 27 tests, 98.71% coverage

**Example Test:**

```typescript
describe("parseCSV", () => {
  it("parses comma-separated values correctly", () => {
    const csv = "hello,moi\nworld,maailma";
    const result = parseCSV(csv);

    expect(result).toHaveLength(2);
    expect(result[0].prompt).toBe("hello");
    expect(result[0].answer).toBe("moi");
  });
});
```

### Integration Tests

**Focus Areas:**

- Complete quiz flow: Start → Answer → Practice → Results
- CSV upload → Parse → Quiz → Save records
- Manual entry → Validate → Quiz → Save records
- Language switching during quiz

### Manual Testing Checklist

- [ ] Upload comma-separated CSV
- [ ] Upload semicolon-separated CSV
- [ ] Manual entry with 10+ words
- [ ] Answer correctly (auto-advance)
- [ ] Answer incorrectly (enter practice)
- [ ] Complete practice mode (3 repetitions)
- [ ] Complete full quiz
- [ ] Verify record saved
- [ ] Restart quiz (same words, new order)
- [ ] New list (return to start)
- [ ] Global word list from all screens
- [ ] Language switching
- [ ] Keyboard navigation (Tab, Enter, ESC)
- [ ] Page refresh during quiz (state persists)

---

## 9. Performance Considerations

### Optimization Strategies

1. **Large Word Lists (1000+ words)**
   - Use React.memo for list items
   - Virtualize long lists (react-window)
   - Debounce manual entry saves

2. **Bundle Size**
   - Next.js automatic code splitting
   - Lazy load confetti animation
   - Tree-shake unused Tailwind classes

3. **Runtime Performance**
   - Zustand selector optimization
   - Avoid unnecessary re-renders
   - Use CSS animations (GPU-accelerated)

### Performance Targets

| Metric                    | Target  | Rationale                |
| ------------------------- | ------- | ------------------------ |
| First Load                | < 3s    | Fast startup for kids    |
| TTI (Time to Interactive) | < 4s    | Ready to use quickly     |
| Quiz Answer Latency       | < 100ms | Instant feedback         |
| CSV Parse (100 words)     | < 200ms | Smooth upload experience |
| Bundle Size (gzipped)     | < 150KB | Mobile-friendly          |

---

## 10. Accessibility

### WCAG 2.1 Level AA Compliance

**Keyboard Navigation:**

- All interactive elements reachable via Tab
- Enter key submits forms
- ESC closes modals
- Focus visible styles on all elements

**Screen Reader Support:**

- Semantic HTML (headings, landmarks)
- ARIA labels on icon buttons
- Live regions for feedback messages
- Alt text on all images/icons

**Visual Accessibility:**

- Minimum contrast ratio 4.5:1 for text
- Large text sizes (18px+)
- No color-only indicators (use icons too)
- Respect `prefers-reduced-motion`

**Implementation:**

```typescript
// Reduced motion detection
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Disable animations if needed
const transition = prefersReducedMotion ? "" : "transition-all duration-300";
```

---

## 11. Security Considerations

### Threat Model

**XSS (Cross-Site Scripting):**

- Risk: User-entered words could contain malicious scripts
- Mitigation: React auto-escapes, no `dangerouslySetInnerHTML`

**CSV Injection:**

- Risk: Malicious formulas in CSV (e.g., `=cmd|'/c calc'`)
- Mitigation: Parser treats all input as plain text

**localStorage Tampering:**

- Risk: User modifies records to cheat
- Mitigation: Acceptable for MVP (single-player, no competitive elements)

**Privacy:**

- Risk: Word lists might contain sensitive information
- Mitigation: All data stays local, document in privacy policy

### Data Privacy

**Principles:**

- No analytics or tracking in MVP
- No data sent to servers
- All processing happens client-side
- localStorage data never leaves device

**Future Considerations:**

- Optional encrypted localStorage
- Privacy-respecting analytics (Plausible, Fathom)
- Optional cloud sync with end-to-end encryption

---

## 12. Deployment

### Build Configuration

**next.config.js:**

```javascript
module.exports = {
  output: "export", // Static export for hosting
  trailingSlash: true,
  images: {
    unoptimized: true, // Required for static export
  },
  // i18n handled by next-intl middleware
};
```

### Hosting Options

**Recommended: Vercel**

- Automatic deployments from Git
- Free tier sufficient for MVP
- Built-in analytics (optional)
- Zero configuration for Next.js

**Alternatives:**

- Netlify (similar to Vercel)
- GitHub Pages (requires static export)
- Cloudflare Pages (fast edge network)

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm test
      - run: npm run build
      - uses: vercel/deploy-action@v1
        with:
          token: ${{ secrets.VERCEL_TOKEN }}
```

---

## 13. Future Enhancements

### Phase 2 Features (Post-MVP)

1. **Audio Pronunciation**
   - Text-to-speech API integration
   - Play button next to prompts/answers
   - Listen mode (audio-only quiz)

2. **Advanced Practice**
   - Adaptive difficulty (more practice for weak words)
   - Spaced repetition algorithm (SM-2, Leitner)
   - Review mode (mistakes from past quizzes)

3. **Cloud Sync**
   - Optional account system (email + password)
   - Sync records across devices
   - Share word lists with friends

4. **Gamification**
   - Achievement badges
   - Streak tracking
   - Leaderboards (optional, privacy-aware)

5. **Import/Export**
   - Export results as PDF
   - Import from Quizlet, Anki
   - QR code sharing for word lists

6. **Customization**
   - Themes (dark mode, color schemes)
   - Custom avatar/profile picture
   - Sound effects toggle

### Technical Debt to Address

- Add E2E tests with Playwright
- Implement error boundary for React errors
- Add Sentry for production error tracking
- Optimize bundle size (code splitting)
- Add service worker for offline support

---

## 14. Glossary

| Term                  | Definition                                                         |
| --------------------- | ------------------------------------------------------------------ |
| **Word Item**         | A prompt-answer pair with metadata (id, attempts, resolved status) |
| **Prompt**            | The question word (e.g., "cat")                                    |
| **Answer**            | The correct response (e.g., "kissa")                               |
| **Normal Mode**       | Primary quiz mode where user answers unprompted                    |
| **Practice Mode**     | Reinforcement mode where user types correct answer 3 times         |
| **Resolved**          | Word has been answered correctly at least once                     |
| **Unresolved**        | Word has not been answered correctly yet                           |
| **First-Try Mistake** | Word was answered incorrectly on first attempt                     |
| **List Fingerprint**  | Unique hash identifying a specific word list                       |
| **Tries**             | Total number of answer submissions (normal mode only)              |

---

## 15. References

### Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Zustand Documentation](https://docs.pmnd.rs/zustand)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Design Inspiration

- [Duolingo](https://www.duolingo.com/) - Gamification and encouragement
- [Quizlet](https://quizlet.com/) - Flashcard UI patterns
- [Khan Academy](https://www.khanacademy.org/) - Kid-friendly design

### Related Projects

- Implementation Plan: [docs/plan/sanakoe-plan.md](plan/sanakoe-plan.md)
- ADRs: [docs/adrs/](adrs/)

---

**Document Version History:**

| Version | Date       | Changes                 | Author   |
| ------- | ---------- | ----------------------- | -------- |
| 1.0     | 2026-02-01 | Initial design document | Dev Team |

---

**End of Design Document**
