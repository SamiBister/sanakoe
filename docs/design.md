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

### 5.7 UI Component Library

**Purpose:** Reusable, kid-friendly UI components for consistent design throughout the application.

**Components:**

1. **Button** (`src/components/ui/Button.tsx`)
   - Variants: primary, secondary, danger
   - Sizes: sm, md, lg
   - Props: fullWidth, loading
   - Features: Large text, rounded corners, focus states, keyboard accessible
   - Styling: Bright colors, shadow effects, smooth transitions

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
   - Sizes: sm, md, lg, xl
   - Features: Focus trap, body scroll prevention, ESC key support, overlay click
   - Accessibility: ARIA attributes, keyboard navigation, focus restoration
   - Animations: Fade-in overlay, slide-up content

**Design Philosophy:**

- Kid-friendly: Large touch targets, bright colors, clear visual feedback
- Accessible: Full keyboard navigation, ARIA labels, focus management
- Consistent: Shared design tokens from Tailwind config
- Flexible: Props for customization while maintaining design consistency

**Implementation:** [src/components/ui/](../src/components/ui/)

**Test Coverage:** 82 tests, 87.38% statement coverage, 98.93% branch coverage

### 5.8 Practice Mode

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

### 5.5 Global Word List Overlay

**Features:**

- Accessible from any screen (persistent button)
- Shows all words with status:
  - ✅ Resolved (answered correctly)
  - 🔁 Unresolved (not yet attempted or still pending)
  - ⚠️ First-try mistake (wrong on first attempt)
- Highlights current word during quiz
- Keyboard accessible (ESC to close)
- Does not pause timer or affect quiz state

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
