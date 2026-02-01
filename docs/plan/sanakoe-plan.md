
# Implementation Plan — Language Quiz for Kids (Sanakoe)

**Date:** 2026-02-01  
**Version:** 1.0  
**Status:** Ready for Implementation

---

## 1. Overview

Build a kid-friendly vocabulary quiz web application using Next.js that helps children (ages 9-13) practice language vocabulary through gamified, positive reinforcement. The application will support both CSV file uploads and manual word entry, track personal records, and provide an encouraging learning experience with practice mode for incorrect answers.

### Key Features

- Dual input methods (CSV upload + manual table entry)
- Gamified quiz with normal and practice modes
- Personal best tracking (tries and time)
- Bilingual UI (Finnish/English)
- Global word list viewer
- Kid-friendly, encouraging feedback

---

## 2. Requirements

### Functional Requirements

- **FR1:** Support CSV upload with auto-detection of comma/semicolon delimiters
- **FR2:** Provide manual word entry with dynamic table (auto-expanding rows)
- **FR3:** Implement quiz logic with randomized word order
- **FR4:** Track attempts and time for each quiz session
- **FR5:** Enter practice mode (3 repetitions) when answer is incorrect
- **FR6:** Display result summary with personal best records
- **FR7:** Support Finnish and English UI languages
- **FR8:** Provide global word list overlay accessible from any screen
- **FR9:** Persist records and last word list in localStorage
- **FR10:** Deduplicate identical word pairs

### Non-Functional Requirements

- **NFR1:** Fast startup time (no backend required for MVP)
- **NFR2:** Responsive design suitable for desktop and tablet
- **NFR3:** Keyboard-first navigation for accessibility
- **NFR4:** Case-insensitive answer matching with whitespace trimming
- **NFR5:** Kid-friendly visual design with playful elements
- **NFR6:** Browser compatibility (modern browsers with localStorage support)

---

## 3. Design Approach

### Architecture Pattern

**Client-Side SPA with App Router**

- Next.js 14+ with App Router
- Client-side state management using React Context or Zustand
- No backend API (localStorage only)
- Route-based navigation between screens

### Key Design Decisions

#### ADR-001: Client-Side Only Architecture

**Context:** MVP needs to launch quickly with minimal infrastructure.  
**Decision:** Use purely client-side implementation with localStorage for persistence.  
**Consequences:**

- ✅ Simple deployment (static hosting)
- ✅ No server costs or scaling concerns
- ❌ No cross-device sync
- ❌ Data lost if localStorage cleared

#### ADR-002: State Management with Zustand

**Context:** Need global state for quiz session, word list, and UI state.  
**Decision:** Use Zustand for lightweight, type-safe state management.  
**Consequences:**

- ✅ Minimal boilerplate vs Context API
- ✅ DevTools support for debugging
- ✅ Easy to test and mock
- ❌ Additional dependency (but tiny: ~1KB)

#### ADR-003: next-intl for i18n

**Context:** Need Finnish and English UI support with potential for more languages.  
**Decision:** Use next-intl library for internationalization.  
**Consequences:**

- ✅ App Router native support
- ✅ Type-safe translations
- ✅ Server and client component support
- ❌ Slight learning curve

#### ADR-004: Tailwind CSS for Styling

**Context:** Need rapid UI development with kid-friendly design.  
**Decision:** Use Tailwind CSS with custom configuration for playful theme.  
**Consequences:**

- ✅ Fast development with utility classes
- ✅ Easy custom theme configuration
- ✅ Built-in responsive design
- ❌ Larger HTML in development mode

---

## 4. Impact Analysis

### New Files to Create

#### Configuration Files

- `package.json` - Project dependencies and scripts
- `next.config.js` - Next.js configuration with i18n
- `tailwind.config.js` - Custom theme for kid-friendly design
- `tsconfig.json` - TypeScript configuration
- `.gitignore` - Git ignore patterns
- `.env.local.example` - Environment variables template

#### Source Code Structure

```
src/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx          - Root layout with i18n provider
│   │   ├── page.tsx             - Start screen
│   │   ├── quiz/
│   │   │   └── page.tsx         - Quiz screen (normal + practice modes)
│   │   └── results/
│   │       └── page.tsx         - Results screen
│   └── globals.css              - Global styles
├── components/
│   ├── WordListUpload.tsx       - CSV file upload component
│   ├── ManualEntryTable.tsx     - Manual word entry table
│   ├── QuizCard.tsx             - Quiz question card
│   ├── PracticeCard.tsx         - Practice mode card
│   ├── ProgressHeader.tsx       - Quiz progress display
│   ├── Timer.tsx                - Timer component
│   ├── WordListOverlay.tsx      - Global word list modal
│   ├── ResultsCard.tsx          - Results summary
│   ├── LanguageSelector.tsx     - Language switch component
│   └── ui/
│       ├── Button.tsx           - Reusable button component
│       ├── Card.tsx             - Card component
│       ├── Input.tsx            - Input component
│       └── Modal.tsx            - Modal overlay component
├── lib/
│   ├── types.ts                 - TypeScript type definitions
│   ├── csv-parser.ts            - CSV parsing logic
│   ├── quiz-logic.ts            - Core quiz state machine
│   ├── answer-matcher.ts        - Answer validation logic
│   ├── storage.ts               - localStorage utilities
│   ├── hash.ts                  - Word list fingerprinting
│   └── utils.ts                 - General utilities
├── hooks/
│   ├── useQuizStore.ts          - Zustand store for quiz state
│   ├── useTimer.ts              - Timer hook
│   └── useLocalStorage.ts       - localStorage hook
├── messages/
│   ├── en.json                  - English translations
│   └── fi.json                  - Finnish translations
└── public/
    ├── icons/
    │   ├── star.svg             - Star icon
    │   ├── trophy.svg           - Trophy icon
    │   └── rocket.svg           - Rocket icon
    └── confetti.json            - Confetti animation data (optional)
```

### Dependencies Required

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "zustand": "^4.5.0",
    "next-intl": "^3.11.0",
    "nanoid": "^5.0.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "typescript": "^5.4.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8",
    "autoprefixer": "^10",
    "eslint": "^8",
    "eslint-config-next": "^14.2.0"
  }
}
```

### Cross-Cutting Concerns

- **Routing:** All screens need i18n locale in URL path
- **State persistence:** Quiz state should survive page refresh during active quiz
- **Analytics:** Future consideration for tracking engagement metrics
- **Accessibility:** Keyboard navigation throughout application

---

## 5. Tasks Breakdown

### Phase 1: Project Setup & Infrastructure

#### Task 1.1: Initialize Next.js Project

**Story:** As a developer, I need a properly configured Next.js project with TypeScript and essential tools.

**Subtasks:**

1. Run `npx create-next-app@latest sanakoe --typescript --tailwind --app --use-npm`
2. Configure `next.config.js` with i18n settings for locale routing
3. Set up `tailwind.config.js` with custom theme (rounded corners, bright colors, large text)
4. Create base folder structure (`components/`, `lib/`, `hooks/`, `messages/`)
5. Install dependencies: `zustand`, `next-intl`, `nanoid`
6. Configure `tsconfig.json` with path aliases (`@/`)
7. Create `.env.local.example` with any configuration variables
8. Set up ESLint and Prettier configurations

**Acceptance Criteria:**

- Project builds successfully with `npm run build`
- Dev server runs on `npm run dev`
- TypeScript has no errors
- Tailwind utilities work in components

---

#### Task 1.2: Configure i18n System

**Story:** As a user, I can view the application in Finnish or English.

**Subtasks:**

1. Create `src/i18n.ts` configuration file for next-intl
2. Create `src/messages/en.json` with English translations structure
3. Create `src/messages/fi.json` with Finnish translations structure
4. Create `src/app/[locale]/layout.tsx` with i18n provider
5. Create middleware for locale detection and routing in `src/middleware.ts`
6. Implement language selector component in `src/components/LanguageSelector.tsx`
7. Add translation keys for all UI text (start screen, quiz, results)
8. Test locale switching and URL routing

**Translation Keys Needed:**

```json
{
  "start": {
    "title": "...",
    "uploadButton": "...",
    "manualButton": "...",
    "startQuiz": "..."
  },
  "quiz": {
    "progress": "...",
    "tries": "...",
    "submit": "...",
    "correct": "...",
    "incorrect": "..."
  },
  "practice": {
    "title": "...",
    "counter": "...",
    "instruction": "..."
  },
  "results": {
    "title": "...",
    "totalWords": "...",
    "totalTries": "...",
    "totalTime": "...",
    "newRecord": "...",
    "restart": "...",
    "newList": "..."
  },
  "wordList": {
    "button": "...",
    "title": "...",
    "status": {...}
  }
}
```

**Acceptance Criteria:**

- Locale is part of URL (`/en/...`, `/fi/...`)
- Language selector switches UI language immediately
- All text displays correctly in both languages
- Default locale is Finnish

---

### Phase 2: Core Data Types & Utilities

#### Task 2.1: Define TypeScript Types

**Story:** As a developer, I have type-safe data structures for all application entities.

**Subtasks:**

1. Create `src/lib/types.ts`
2. Define `WordItem` type with id, prompt, answer, attempts, firstTryFailed, resolved
3. Define `QuizSession` type with words, unresolvedIds, currentId, tries, startTimeMs, endTimeMs, mode, practiceTarget
4. Define `Records` type for personal bests
5. Define `QuizMode` union type ("normal" | "practice")
6. Define `WordListSource` type for CSV vs manual entry
7. Export all types

**Type Definitions:**

```typescript
export type WordItem = {
  id: string;
  prompt: string;
  answer: string;
  attempts: number;
  firstTryFailed: boolean;
  resolved: boolean;
};

export type QuizMode = "normal" | "practice";

export type PracticeTarget = {
  id: string;
  remaining: number; // 3, 2, 1
};

export type QuizSession = {
  words: WordItem[];
  unresolvedIds: string[];
  currentId: string | null;
  tries: number;
  startTimeMs: number;
  endTimeMs?: number;
  mode: QuizMode;
  practiceTarget?: PracticeTarget;
};

export type ListRecords = {
  bestTries?: number;
  bestTimeMs?: number;
  updatedAt: number;
};

export type Records = {
  [listFingerprint: string]: ListRecords;
};
```

**Acceptance Criteria:**

- All types compile without errors
- Types are properly exported and importable
- JSDoc comments explain each type's purpose

---

#### Task 2.2: Implement CSV Parser

**Story:** As a user, I can upload a CSV file and have it parsed into word pairs.

**Subtasks:**

1. Create `src/lib/csv-parser.ts`
2. Implement `parseCSV(content: string): WordItem[]` function
3. Auto-detect delimiter (comma vs semicolon) by scanning first line
4. Handle header row detection (skip if first row looks like header)
5. Trim whitespace from all cells
6. Skip empty rows
7. Generate stable IDs using nanoid or hash(prompt+answer)
8. Deduplicate identical pairs (same prompt + answer)
9. Throw descriptive errors for malformed CSV
10. Write unit tests for various CSV formats

**Test Cases:**

- Comma-separated values
- Semicolon-separated values
- With/without header row
- Extra whitespace
- Empty rows
- Duplicate pairs
- Malformed CSV (unbalanced quotes, single column)

**Acceptance Criteria:**

- Parses valid CSV correctly
- Auto-detects comma/semicolon separator
- Deduplicates identical pairs
- Throws user-friendly errors for invalid formats
- All unit tests pass

---

#### Task 2.3: Implement Answer Matcher

**Story:** As a user, my answers are validated fairly with case-insensitive matching.

**Subtasks:**

1. Create `src/lib/answer-matcher.ts`
2. Implement `matchAnswer(userInput: string, correctAnswer: string): boolean`
3. Trim leading/trailing whitespace
4. Convert both to lowercase for comparison
5. Collapse multiple internal spaces to single space (optional)
6. Return true if strings match exactly after normalization
7. Write unit tests for edge cases

**Test Cases:**

- Exact match
- Case differences
- Extra whitespace
- Multiple spaces
- Leading/trailing spaces
- Special characters
- Diacritics (exact match for MVP)

**Acceptance Criteria:**

- Case-insensitive matching works
- Whitespace normalized properly
- All test cases pass
- Function is pure (no side effects)

---

#### Task 2.4: Implement localStorage Utilities

**Story:** As a user, my records and last word list are saved locally.

**Subtasks:**

1. Create `src/lib/storage.ts`
2. Implement `saveRecords(records: Records): void`
3. Implement `loadRecords(): Records`
4. Implement `saveWordList(words: WordItem[]): void`
5. Implement `loadWordList(): WordItem[] | null`
6. Add error handling for localStorage quota exceeded
7. Add error handling for JSON parse errors
8. Implement versioning for storage format changes
9. Write tests using localStorage mock

**Storage Keys:**

- `sanakoe_records` - Personal best records
- `sanakoe_last_list` - Last used word list
- `sanakoe_storage_version` - Storage format version

**Acceptance Criteria:**

- Data persists across page refreshes
- Handles localStorage errors gracefully
- Returns null/default values when data missing
- Storage version managed properly

---

#### Task 2.5: Implement List Fingerprinting

**Story:** As a developer, I can uniquely identify word lists to track separate records.

**Subtasks:**

1. Create `src/lib/hash.ts`
2. Implement `generateListFingerprint(words: WordItem[]): string`
3. Sort words by prompt+answer before hashing
4. Use simple hash algorithm (or JSON stringify + base64)
5. Ensure same word list always produces same fingerprint
6. Ensure different order produces same fingerprint (sorted)
7. Write unit tests

**Acceptance Criteria:**

- Same words (different order) produce same hash
- Different words produce different hash
- Hash is stable and deterministic
- Reasonably collision-resistant

---

### Phase 3: State Management

#### Task 3.1: Create Zustand Quiz Store

**Story:** As a developer, I have centralized state management for the entire quiz flow.

**Subtasks:**

1. Create `src/hooks/useQuizStore.ts`
2. Define store interface with state and actions
3. Implement `loadWords(words: WordItem[]): void` - initializes quiz
4. Implement `startQuiz(): void` - shuffles queue, starts timer
5. Implement `submitAnswer(answer: string): void` - processes normal mode answer
6. Implement `submitPracticeAnswer(answer: string): void` - processes practice answer
7. Implement `moveToNextWord(): void` - advances to next question
8. Implement `enterPracticeMode(wordId: string): void` - switches to practice
9. Implement `exitPracticeMode(): void` - returns to normal mode
10. Implement `endQuiz(): void` - finalizes quiz
11. Implement `resetQuiz(): void` - clears state for new quiz
12. Add selectors for computed values (current word, progress, etc.)
13. Integrate answer-matcher logic
14. Integrate localStorage for persistence

**Store State:**

```typescript
interface QuizStore {
  // State
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

**Acceptance Criteria:**

- Store manages full quiz lifecycle
- State updates trigger component re-renders
- Queue operations work correctly (FIFO with rotation)
- Practice mode transitions work
- Timer tracked accurately
- Tries counted correctly (normal mode only)

---

#### Task 3.2: Create Timer Hook

**Story:** As a user, I see accurate elapsed time during the quiz.

**Subtasks:**

1. Create `src/hooks/useTimer.ts`
2. Implement `useTimer()` hook with start, pause, reset functions
3. Use `useEffect` to update elapsed time every second
4. Return formatted time string (MM:SS)
5. Handle component unmount cleanup
6. Write tests for timer functionality

**Acceptance Criteria:**

- Timer starts when quiz begins
- Timer stops when quiz ends
- Timer displays MM:SS format
- Timer cleans up on unmount
- Timer is accurate within 1 second

---

### Phase 4: UI Components Library

#### Task 4.1: Create Base UI Components

**Story:** As a developer, I have reusable, kid-friendly UI components.

**Subtasks:**

1. Create `src/components/ui/Button.tsx` with variants (primary, secondary, danger)
2. Create `src/components/ui/Card.tsx` with shadow and rounded corners
3. Create `src/components/ui/Input.tsx` with large text and focus styles
4. Create `src/components/ui/Modal.tsx` with overlay and animation
5. Style components with Tailwind using kid-friendly theme
6. Add proper TypeScript props interfaces
7. Ensure keyboard accessibility
8. Add hover and focus states

**Button Variants:**

- Primary: bright color, large text, rounded
- Secondary: outlined, less prominent
- Danger: for clear/delete actions (with confirmation)

**Acceptance Criteria:**

- Components render correctly
- Keyboard navigation works
- Styles are kid-friendly (large, colorful, rounded)
- TypeScript props properly typed
- Components are accessible (ARIA labels)

---

#### Task 4.2: Create SVG Icon Components

**Story:** As a user, I see playful visual elements throughout the app.

**Subtasks:**

1. Create `public/icons/star.svg` - for correct answers
2. Create `public/icons/trophy.svg` - for records
3. Create `public/icons/rocket.svg` - for motivation
4. Create wrapper components for each icon
5. Make icons colorful and kid-friendly
6. Ensure SVGs are optimized and accessible

**Acceptance Criteria:**

- Icons display correctly
- Icons scale properly
- Icons have appropriate alt text
- Icons match kid-friendly aesthetic

---

### Phase 5: Word List Input Components

#### Task 5.1: CSV Upload Component

**Story:** As a user, I can upload a CSV file containing my vocabulary words.

**Subtasks:**

1. Create `src/components/WordListUpload.tsx`
2. Implement file input with drag-and-drop support
3. Show upload area with clear instructions
4. Validate file type (.csv, .txt)
5. Read file using FileReader API
6. Call CSV parser with file content
7. Display parsing errors in user-friendly way
8. Show preview of parsed words (first 5)
9. Show total word count
10. Integrate with quiz store to load words
11. Add loading spinner during parsing
12. Add success feedback after successful upload

**Acceptance Criteria:**

- File upload works via button click
- Drag-and-drop works (optional for MVP)
- Parsing errors displayed clearly
- Word preview shown before starting quiz
- Invalid files rejected with helpful message
- Large files (1000+ words) parse efficiently

---

#### Task 5.2: Manual Entry Table Component

**Story:** As a user, I can manually enter vocabulary words in a table.

**Subtasks:**

1. Create `src/components/ManualEntryTable.tsx`
2. Initialize with 10 empty rows
3. Implement two-column table (localized headers)
4. Add input fields for each cell
5. Implement auto-expand: add new row when typing in last row
6. Implement keyboard navigation (Tab, Shift+Tab, Enter)
7. Implement row validation (both cells must have values)
8. Add "Clear All" button with confirmation dialog
9. Show valid row count indicator
10. Integrate with quiz store to load words
11. (Optional) Implement paste support for tab-separated values
12. Save table content to localStorage on change
13. Load saved content on component mount

**Keyboard Behavior:**

- Tab: move to next cell
- Shift+Tab: move to previous cell
- Enter: behave like Tab
- Tab on last cell of last row: create new row and move focus

**Acceptance Criteria:**

- Table starts with 10 rows
- New rows added automatically
- Keyboard navigation works perfectly
- Only valid rows (both cells filled) counted
- Clear all requires confirmation
- Table state persists in localStorage
- Tab-separated paste works (nice-to-have)

---

### Phase 6: Quiz Flow Screens

#### Task 6.1: Start Screen

**Story:** As a user, I land on a welcoming start screen where I choose how to enter words.

**Subtasks:**

1. Create `src/app/[locale]/page.tsx`
2. Add welcoming title and description (kid-friendly)
3. Integrate LanguageSelector component
4. Add two large buttons: "Upload CSV" and "Enter Manually"
5. Show WordListUpload component when upload chosen
6. Show ManualEntryTable component when manual chosen
7. Add "Start Quiz" button (enabled only when words loaded)
8. Show word count when words loaded
9. Add friendly graphics (rocket or star icon)
10. Ensure responsive layout

**Acceptance Criteria:**

- Screen is visually appealing and kid-friendly
- Both input methods work correctly
- Start quiz button enables/disables appropriately
- Language selector works
- Layout is responsive

---

#### Task 6.2: Quiz Screen (Normal Mode)

**Story:** As a user, I answer vocabulary questions in normal quiz mode.

**Subtasks:**

1. Create `src/app/[locale]/quiz/page.tsx`
2. Create `src/components/ProgressHeader.tsx` - shows resolved/total, tries, timer
3. Create `src/components/QuizCard.tsx` - shows current question
4. Display current word's prompt (large text)
5. Add answer input field (large, auto-focused)
6. Add submit button
7. Handle Enter key to submit
8. Show immediate feedback after submit (correct/incorrect)
9. For correct: show encouraging message, auto-advance after 1 second
10. For incorrect: show correct answer, transition to practice mode
11. Integrate with quiz store for state management
12. Add visual feedback (star icon for correct, encouraging message for wrong)
13. Ensure input cleared after each submission

**Feedback Messages (localized):**

- Correct: "Great!", "Well done!", "Perfect!", "Excellent!"
- Incorrect: "Not quite!", "Let's practice this one!", "Almost there!"

**Acceptance Criteria:**

- Questions display correctly
- Answer submission works
- Feedback is encouraging and age-appropriate
- Progress header updates in real-time
- Timer runs during quiz
- Transitions to practice mode on wrong answer
- Auto-advances on correct answer

---

#### Task 6.3: Quiz Screen (Practice Mode)

**Story:** As a user, I practice words I got wrong by typing them 3 times.

**Subtasks:**

1. Create `src/components/PracticeCard.tsx`
2. Conditionally render in `quiz/page.tsx` when mode is "practice"
3. Display prompt (optional but recommended)
4. Display correct answer prominently in highlighted card
5. Show counter (1/3, 2/3, 3/3)
6. Add answer input (auto-focused)
7. Add "Check" button
8. Validate practice answer matches correct answer
9. Clear input and increment counter on correct practice entry
10. Show encouraging message ("Good!", "Keep going!")
11. After 3rd repetition: show success message, return to normal mode
12. Add playful animations for transitions

**Acceptance Criteria:**

- Correct answer always visible
- Counter displays accurately
- Input cleared after each repetition
- Returns to normal mode after 3 repetitions
- Word remains unresolved and appears later
- No impact on tries counter

---

#### Task 6.4: Results Screen

**Story:** As a user, I see my quiz results with performance metrics and personal records.

**Subtasks:**

1. Create `src/app/[locale]/results/page.tsx`
2. Create `src/components/ResultsCard.tsx`
3. Display total words count
4. Display total tries
5. Display total time (formatted MM:SS)
6. Display list of words not resolved on first try
7. Load personal records from localStorage
8. Compare current performance to records
9. Show "New Record!" celebration if achieved
10. Show motivational challenge text
11. Add confetti animation on new record (optional)
12. Add "Restart Quiz" button (reshuffles same words)
13. Add "New Word List" button (returns to start screen)
14. Save new records to localStorage if achieved

**Record Detection:**

- New best tries: fewer tries than previous best
- New best time: shorter time than previous best

**Acceptance Criteria:**

- All metrics display correctly
- Records saved and loaded properly
- New record detected and celebrated
- Restart maintains same word list
- New list returns to start screen
- Words not first-try list is accurate

---

### Phase 7: Global Features

#### Task 7.1: Global Word List Overlay

**Story:** As a user, I can view all my vocabulary words and their status at any time.

**Subtasks:**

1. Create `src/components/WordListOverlay.tsx`
2. Add persistent button to all screen layouts (top-right corner)
3. Implement modal overlay with word list table
4. Display all words with prompt → answer
5. Show status indicators:
   - ✅ Resolved (correct on any attempt)
   - 🔁 Unresolved (not yet answered correctly)
   - ⚠️ Mistake made (wrong on first try)
6. Highlight current word during active quiz
7. (Optional) Add filter: All / Unresolved / Mistakes
8. Ensure overlay doesn't affect quiz state or timer
9. Make overlay keyboard-accessible (ESC to close)
10. Add smooth open/close animations

**Acceptance Criteria:**

- Button visible on all screens
- Overlay opens without affecting quiz
- Word statuses accurate
- Current word highlighted
- Timer continues running while overlay open
- Keyboard navigation works (ESC closes)
- Localized labels

---

#### Task 7.2: Responsive Layout & Mobile Support

**Story:** As a user, I can use the app on various screen sizes.

**Subtasks:**

1. Test all screens on mobile viewport
2. Adjust button sizes for touch targets (min 44px)
3. Make table scrollable horizontally if needed
4. Adjust font sizes for readability on small screens
5. Test keyboard appears correctly on mobile inputs
6. Ensure modals work on mobile
7. Test landscape and portrait orientations

**Acceptance Criteria:**

- App usable on tablet (768px+)
- Touch targets appropriately sized
- Text readable on all screen sizes
- No horizontal scrolling on narrow screens
- Keyboard interactions work on touch devices

---

### Phase 8: Polish & Edge Cases

#### Task 8.1: Error Handling & Edge Cases

**Story:** As a user, the app handles unusual inputs gracefully.

**Subtasks:**

1. Handle empty CSV upload
2. Handle CSV with only 1 column
3. Handle single-word quiz (1 word total)
4. Handle localStorage quota exceeded
5. Handle corrupted localStorage data
6. Show friendly error messages for all error cases
7. Add error boundary for React errors
8. Test with very large word lists (1000+ words)
9. Handle special characters in words
10. Test with emoji in words

**Acceptance Criteria:**

- All edge cases handled gracefully
- Error messages are user-friendly
- App never crashes
- Data corruption detected and recovered

---

#### Task 8.2: Visual Polish & Animations

**Story:** As a user, I experience smooth, delightful interactions.

**Subtasks:**

1. Add transitions for page navigation
2. Add fade-in animations for feedback messages
3. Add scale animation for correct answer (star grows)
4. Add confetti animation on new record (canvas-confetti library)
5. Add loading spinner for CSV parsing
6. Polish button hover states
7. Add focus visible styles for accessibility
8. Test animations on slower devices
9. Ensure animations respect prefers-reduced-motion

**Acceptance Criteria:**

- Transitions are smooth (not janky)
- Animations enhance experience without distraction
- Respect user's motion preferences
- Performance remains good with animations

---

#### Task 8.3: Testing & Quality Assurance

**Story:** As a developer, I'm confident the app works correctly.

**Subtasks:**

1. Write unit tests for CSV parser
2. Write unit tests for answer matcher
3. Write unit tests for quiz logic
4. Write unit tests for storage utilities
5. Write integration tests for quiz flow
6. Test keyboard navigation throughout app
7. Test with screen reader (basic accessibility)
8. Perform manual testing of full user journeys
9. Test in multiple browsers (Chrome, Firefox, Safari)
10. Fix any bugs discovered

**Test Coverage Goals:**

- Core logic: 80%+ coverage
- UI components: snapshot tests
- End-to-end: critical paths covered

**Acceptance Criteria:**

- All tests pass
- No console errors or warnings
- Keyboard navigation works throughout
- Basic screen reader support
- Works in modern browsers

---

## 6. Value Proposition

This application provides:

- **Educational value:** Helps children learn vocabulary through proven spaced repetition (wrong words return later)
- **Positive reinforcement:** Encouraging feedback builds confidence
- **Engagement:** Gamification with records motivates continued practice
- **Accessibility:** No signup or account required, works immediately
- **Flexibility:** Supports both teacher-provided CSV lists and student's own manual entry
- **Privacy:** All data stays local, no tracking or data collection

---

## 7. Threat Modeling & Risks

### Security Considerations

- **Client-side only:** No server-side vulnerabilities
- **localStorage limits:** User data could be lost if browser storage cleared
  - *Mitigation:* Warn users about data persistence limitations in UI
- **XSS risks:** User-entered words could contain malicious scripts
  - *Mitigation:* React automatically escapes content; ensure no `dangerouslySetInnerHTML`
- **CSV injection:** Malicious CSV formulas (=cmd)
  - *Mitigation:* Parser treats all input as plain text, no formula evaluation

### Privacy Considerations

- **No analytics:** MVP has no tracking; future analytics should be privacy-respecting
- **No PII collected:** Word lists might contain sensitive information
  - *Mitigation:* Document that data stays local; consider encryption in future

### Operational Risks

- **Browser compatibility:** Older browsers may not support features
  - *Mitigation:* Document supported browsers clearly
- **Storage quota:** Large word lists could exceed localStorage limits
  - *Mitigation:* Handle quota exceeded errors gracefully, show limit warnings

---

## 8. Definition of Ready

Before starting implementation, ensure:

- ✅ Specification document (sanakoe.md) is complete and reviewed
- ✅ Design mockups or wireframes approved (optional but recommended)
- ✅ Development environment set up (Node.js 18+, npm)
- ✅ Decision made on exact Next.js version to use
- ✅ Color palette and typography choices finalized for kid-friendly theme
- ✅ Translation files structure agreed upon
- ✅ Team has access to repository and communication channels

---

## 9. Definition of Done

Implementation is complete when:

- ✅ All functional requirements (FR1-FR10) implemented
- ✅ All 17 MVP acceptance criteria (from spec section 17) met
- ✅ Application builds without errors or warnings
- ✅ All automated tests pass (minimum 70% coverage)
- ✅ Manual testing completed for all user journeys:
  - Upload CSV → Complete quiz → View results → Restart
  - Manual entry → Complete quiz → View results → New list
  - Practice mode flow tested
  - Global word list tested from all screens
  - Language switching tested
- ✅ Edge cases handled (empty list, 1-word list, malformed CSV)
- ✅ Works in Chrome, Firefox, and Safari (latest versions)
- ✅ Responsive on tablet-sized screens (768px+)
- ✅ Keyboard navigation works throughout
- ✅ No console errors in production build
- ✅ localStorage persistence verified
- ✅ Records system working correctly
- ✅ Documentation updated:
  - README.md with setup and development instructions
  - Deployment guide
  - User guide (optional)
- ✅ Code reviewed by at least one other developer
- ✅ Deployed to staging/production environment

---

## 10. Testing Strategy

### Unit Testing

**Tools:** Jest, React Testing Library

**Test Coverage:**

- `csv-parser.ts`: All parsing scenarios, error cases
- `answer-matcher.ts`: All matching rules, edge cases
- `hash.ts`: Fingerprint generation, collision avoidance
- `storage.ts`: Save/load operations, error handling
- Quiz store: All state transitions, action handlers

**Target:** 80%+ coverage for utility functions

---

### Integration Testing

**Focus Areas:**

- Full quiz flow: start → answer → practice → complete
- CSV upload → parse → quiz → results
- Manual entry → validate → quiz → results
- Record saving and loading
- Language switching during active quiz

**Target:** All critical user paths covered

---

### Manual Testing Checklist

**Functional:**

- [ ] Upload valid CSV (comma-separated)
- [ ] Upload valid CSV (semicolon-separated)
- [ ] Upload invalid CSV (error handled)
- [ ] Manual entry: add 5 words, start quiz
- [ ] Manual entry: keyboard navigation (Tab, Enter)
- [ ] Manual entry: auto-expand rows
- [ ] Answer correctly: word removed from queue
- [ ] Answer incorrectly: practice mode entered
- [ ] Practice mode: type correct answer 3 times
- [ ] Complete quiz: all words resolved
- [ ] Results: metrics correct
- [ ] Results: record saved and displayed
- [ ] Restart quiz: same words, new order
- [ ] New list: returns to start
- [ ] Global word list: opens from any screen
- [ ] Global word list: shows correct statuses
- [ ] Language switch: UI updates immediately
- [ ] localStorage: data persists after refresh

**Accessibility:**

- [ ] Tab navigation through all interactive elements
- [ ] Focus visible on all focusable elements
- [ ] Enter key submits forms
- [ ] ESC closes modals
- [ ] Screen reader announces key information (basic test)

**Performance:**

- [ ] App loads in < 3 seconds
- [ ] Quiz with 100 words performs smoothly
- [ ] No UI lag during typing
- [ ] Animations smooth (60fps)

**Cross-Browser:**

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)

---

### E2E Testing (Optional)

**Tools:** Playwright or Cypress

**Scenarios:**

1. Complete happy path: upload → quiz → results
2. Practice flow: wrong answer → 3 repetitions → continue
3. Record breaking: complete same list twice, verify record

**Target:** Automated tests for critical paths (nice-to-have for MVP)

---

## 11. Deployment Considerations

### Hosting Options

- **Vercel:** Recommended (free tier, optimized for Next.js)
- **Netlify:** Alternative with similar features
- **GitHub Pages:** Requires static export configuration

### Build Configuration

```bash
# next.config.js
module.exports = {
  output: 'export', // for static hosting
  images: {
    unoptimized: true // if using static export
  }
}
```

### Environment Variables

None required for MVP (all client-side)

### Monitoring

- Basic error tracking (Sentry optional)
- No analytics in MVP (privacy-first)

---

## 12. Future Enhancements (Post-MVP)

*Not in scope for initial release but worth documenting:*

1. **Cloud sync:** Optional account system for cross-device sync
2. **Audio pronunciation:** Speak words aloud for listening practice
3. **Difficulty levels:** Timed mode, streak tracking
4. **Multiplayer:** Compete with friends in real-time
5. **Progress dashboard:** Historical performance graphs
6. **More languages:** Add more UI languages
7. **Themes:** Dark mode, different visual themes
8. **Import from Quizlet:** Direct integration with popular platforms
9. **Export results:** Download PDF report of performance
10. **Spaced repetition algorithm:** Smart scheduling of review sessions

---

## 13. Open Questions & Assumptions

### Assumptions Made

- Target devices are desktop/tablet (not optimized for phone)
- Users have modern browser with localStorage support
- Word lists typically 10-100 words (not thousands)
- Kids have basic typing skills
- Adult supervision available for initial setup

### Open Questions

- Should there be a maximum word limit per quiz? (Recommendation: warn at 200+)
- Should quiz state persist if user closes browser? (Recommendation: yes)
- Should there be a "pause" feature? (Recommendation: no for MVP, adds complexity)
- What happens if same word appears multiple times with different answers? (Recommendation: treat as separate items, don't deduplicate)

---

## 14. Success Metrics

*For post-launch evaluation:*

- **Engagement:** Average quiz completion rate > 80%
- **Usage:** Average words practiced per session > 20
- **Retention:** User returns within 7 days > 50%
- **Performance:** Quiz loads in < 3 seconds
- **Satisfaction:** Positive feedback from kids and parents
- **Technical:** Zero critical bugs reported in first month

---

**End of Implementation Plan**

This plan is ready for execution by AI agents or human developers. Each task is specific, testable, and builds incrementally toward the complete MVP. The plan prioritizes core functionality first, with polish and edge cases addressed toward the end.

User: write the plan to docs/plan/sanakoe-plan.md

GitHub Copilot: I don't have tools available to create or edit files. However, I can provide you with the complete plan content that you can save to docs/plan/sanakoe_plan.md.

Here's the full implementation plan:

```markdown
# Implementation Plan — Language Quiz for Kids (Sanakoe)

**Date:** 2026-02-01  
**Version:** 1.0  
**Status:** Ready for Implementation

---

## 1. Overview

Build a kid-friendly vocabulary quiz web application using Next.js that helps children (ages 9-13) practice language vocabulary through gamified, positive reinforcement. The application will support both CSV file uploads and manual word entry, track personal records, and provide an encouraging learning experience with practice mode for incorrect answers.

### Key Features
- Dual input methods (CSV upload + manual table entry)
- Gamified quiz with normal and practice modes
- Personal best tracking (tries and time)
- Bilingual UI (Finnish/English)
- Global word list viewer
- Kid-friendly, encouraging feedback

---

## 2. Requirements

### Functional Requirements
- **FR1:** Support CSV upload with auto-detection of comma/semicolon delimiters
- **FR2:** Provide manual word entry with dynamic table (auto-expanding rows)
- **FR3:** Implement quiz logic with randomized word order
- **FR4:** Track attempts and time for each quiz session
- **FR5:** Enter practice mode (3 repetitions) when answer is incorrect
- **FR6:** Display result summary with personal best records
- **FR7:** Support Finnish and English UI languages
- **FR8:** Provide global word list overlay accessible from any screen
- **FR9:** Persist records and last word list in localStorage
- **FR10:** Deduplicate identical word pairs

### Non-Functional Requirements
- **NFR1:** Fast startup time (no backend required for MVP)
- **NFR2:** Responsive design suitable for desktop and tablet
- **NFR3:** Keyboard-first navigation for accessibility
- **NFR4:** Case-insensitive answer matching with whitespace trimming
- **NFR5:** Kid-friendly visual design with playful elements
- **NFR6:** Browser compatibility (modern browsers with localStorage support)

---

## 3. Design Approach

### Architecture Pattern
**Client-Side SPA with App Router**
- Next.js 14+ with App Router
- Client-side state management using React Context or Zustand
- No backend API (localStorage only)
- Route-based navigation between screens

### Key Design Decisions

#### ADR-001: Client-Side Only Architecture
**Context:** MVP needs to launch quickly with minimal infrastructure.  
**Decision:** Use purely client-side implementation with localStorage for persistence.  
**Consequences:** 
- ✅ Simple deployment (static hosting)
- ✅ No server costs or scaling concerns
- ❌ No cross-device sync
- ❌ Data lost if localStorage cleared

#### ADR-002: State Management with Zustand
**Context:** Need global state for quiz session, word list, and UI state.  
**Decision:** Use Zustand for lightweight, type-safe state management.  
**Consequences:**
- ✅ Minimal boilerplate vs Context API
- ✅ DevTools support for debugging
- ✅ Easy to test and mock
- ❌ Additional dependency (but tiny: ~1KB)

#### ADR-003: next-intl for i18n
**Context:** Need Finnish and English UI support with potential for more languages.  
**Decision:** Use next-intl library for internationalization.  
**Consequences:**
- ✅ App Router native support
- ✅ Type-safe translations
- ✅ Server and client component support
- ❌ Slight learning curve

#### ADR-004: Tailwind CSS for Styling
**Context:** Need rapid UI development with kid-friendly design.  
**Decision:** Use Tailwind CSS with custom configuration for playful theme.  
**Consequences:**
- ✅ Fast development with utility classes
- ✅ Easy custom theme configuration
- ✅ Built-in responsive design
- ❌ Larger HTML in development mode

---

## 4. Impact Analysis

### New Files to Create

#### Configuration Files
- `package.json` - Project dependencies and scripts
- `next.config.js` - Next.js configuration with i18n
- `tailwind.config.js` - Custom theme for kid-friendly design
- `tsconfig.json` - TypeScript configuration
- `.gitignore` - Git ignore patterns
- `.env.local.example` - Environment variables template

#### Source Code Structure
```

src/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx          - Root layout with i18n provider
│   │   ├── page.tsx             - Start screen
│   │   ├── quiz/
│   │   │   └── page.tsx         - Quiz screen (normal + practice modes)
│   │   └── results/
│   │       └── page.tsx         - Results screen
│   └── globals.css              - Global styles
├── components/
│   ├── WordListUpload.tsx       - CSV file upload component
│   ├── ManualEntryTable.tsx     - Manual word entry table
│   ├── QuizCard.tsx             - Quiz question card
│   ├── PracticeCard.tsx         - Practice mode card
│   ├── ProgressHeader.tsx       - Quiz progress display
│   ├── Timer.tsx                - Timer component
│   ├── WordListOverlay.tsx      - Global word list modal
│   ├── ResultsCard.tsx          - Results summary
│   ├── LanguageSelector.tsx     - Language switch component
│   └── ui/
│       ├── Button.tsx           - Reusable button component
│       ├── Card.tsx             - Card component
│       ├── Input.tsx            - Input component
│       └── Modal.tsx            - Modal overlay component
├── lib/
│   ├── types.ts                 - TypeScript type definitions
│   ├── csv-parser.ts            - CSV parsing logic
│   ├── quiz-logic.ts            - Core quiz state machine
│   ├── answer-matcher.ts        - Answer validation logic
│   ├── storage.ts               - localStorage utilities
│   ├── hash.ts                  - Word list fingerprinting
│   └── utils.ts                 - General utilities
├── hooks/
│   ├── useQuizStore.ts          - Zustand store for quiz state
│   ├── useTimer.ts              - Timer hook
│   └── useLocalStorage.ts       - localStorage hook
├── messages/
│   ├── en.json                  - English translations
│   └── fi.json                  - Finnish translations
└── public/
    ├── icons/
    │   ├── star.svg             - Star icon
    │   ├── trophy.svg           - Trophy icon
    │   └── rocket.svg           - Rocket icon
    └── confetti.json            - Confetti animation data (optional)

```

### Dependencies Required
```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "zustand": "^4.5.0",
    "next-intl": "^3.11.0",
    "nanoid": "^5.0.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "typescript": "^5.4.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8",
    "autoprefixer": "^10",
    "eslint": "^8",
    "eslint-config-next": "^14.2.0"
  }
}
```

### Cross-Cutting Concerns

- **Routing:** All screens need i18n locale in URL path
- **State persistence:** Quiz state should survive page refresh during active quiz
- **Analytics:** Future consideration for tracking engagement metrics
- **Accessibility:** Keyboard navigation throughout application

---

## 5. Tasks Breakdown

### Phase 1: Project Setup & Infrastructure

#### Task 1.1: Initialize Next.js Project

**Story:** As a developer, I need a properly configured Next.js project with TypeScript and essential tools.

**Subtasks:**

1. Run `npx create-next-app@latest sanakoe --typescript --tailwind --app --use-npm`
2. Configure `next.config.js` with i18n settings for locale routing
3. Set up `tailwind.config.js` with custom theme (rounded corners, bright colors, large text)
4. Create base folder structure (`components/`, `lib/`, `hooks/`, `messages/`)
5. Install dependencies: `zustand`, `next-intl`, `nanoid`
6. Configure `tsconfig.json` with path aliases (`@/`)
7. Create `.env.local.example` with any configuration variables
8. Set up ESLint and Prettier configurations

**Acceptance Criteria:**

- Project builds successfully with `npm run build`
- Dev server runs on `npm run dev`
- TypeScript has no errors
- Tailwind utilities work in components

---

#### Task 1.2: Configure i18n System

**Story:** As a user, I can view the application in Finnish or English.

**Subtasks:**

1. Create `src/i18n.ts` configuration file for next-intl
2. Create `src/messages/en.json` with English translations structure
3. Create `src/messages/fi.json` with Finnish translations structure
4. Create `src/app/[locale]/layout.tsx` with i18n provider
5. Create middleware for locale detection and routing in `src/middleware.ts`
6. Implement language selector component in `src/components/LanguageSelector.tsx`
7. Add translation keys for all UI text (start screen, quiz, results)
8. Test locale switching and URL routing

**Translation Keys Needed:**

```json
{
  "start": {
    "title": "...",
    "uploadButton": "...",
    "manualButton": "...",
    "startQuiz": "..."
  },
  "quiz": {
    "progress": "...",
    "tries": "...",
    "submit": "...",
    "correct": "...",
    "incorrect": "..."
  },
  "practice": {
    "title": "...",
    "counter": "...",
    "instruction": "..."
  },
  "results": {
    "title": "...",
    "totalWords": "...",
    "totalTries": "...",
    "totalTime": "...",
    "newRecord": "...",
    "restart": "...",
    "newList": "..."
  },
  "wordList": {
    "button": "...",
    "title": "...",
    "status": {...}
  }
}
```

**Acceptance Criteria:**

- Locale is part of URL (`/en/...`, `/fi/...`)
- Language selector switches UI language immediately
- All text displays correctly in both languages
- Default locale is Finnish

---

### Phase 2: Core Data Types & Utilities

#### Task 2.1: Define TypeScript Types

**Story:** As a developer, I have type-safe data structures for all application entities.

**Subtasks:**

1. Create `src/lib/types.ts`
2. Define `WordItem` type with id, prompt, answer, attempts, firstTryFailed, resolved
3. Define `QuizSession` type with words, unresolvedIds, currentId, tries, startTimeMs, endTimeMs, mode, practiceTarget
4. Define `Records` type for personal bests
5. Define `QuizMode` union type ("normal" | "practice")
6. Define `WordListSource` type for CSV vs manual entry
7. Export all types

**Type Definitions:**

```typescript
export type WordItem = {
  id: string;
  prompt: string;
  answer: string;
  attempts: number;
  firstTryFailed: boolean;
  resolved: boolean;
};

export type QuizMode = "normal" | "practice";

export type PracticeTarget = {
  id: string;
  remaining: number; // 3, 2, 1
};

export type QuizSession = {
  words: WordItem[];
  unresolvedIds: string[];
  currentId: string | null;
  tries: number;
  startTimeMs: number;
  endTimeMs?: number;
  mode: QuizMode;
  practiceTarget?: PracticeTarget;
};

export type ListRecords = {
  bestTries?: number;
  bestTimeMs?: number;
  updatedAt: number;
};

export type Records = {
  [listFingerprint: string]: ListRecords;
};
```

**Acceptance Criteria:**

- All types compile without errors
- Types are properly exported and importable
- JSDoc comments explain each type's purpose

---

#### Task 2.2: Implement CSV Parser

**Story:** As a user, I can upload a CSV file and have it parsed into word pairs.

**Subtasks:**

1. Create `src/lib/csv-parser.ts`
2. Implement `parseCSV(content: string): WordItem[]` function
3. Auto-detect delimiter (comma vs semicolon) by scanning first line
4. Handle header row detection (skip if first row looks like header)
5. Trim whitespace from all cells
6. Skip empty rows
7. Generate stable IDs using nanoid or hash(prompt+answer)
8. Deduplicate identical pairs (same prompt + answer)
9. Throw descriptive errors for malformed CSV
10. Write unit tests for various CSV formats

**Test Cases:**

- Comma-separated values
- Semicolon-separated values
- With/without header row
- Extra whitespace
- Empty rows
- Duplicate pairs
- Malformed CSV (unbalanced quotes, single column)

**Acceptance Criteria:**

- Parses valid CSV correctly
- Auto-detects comma/semicolon separator
- Deduplicates identical pairs
- Throws user-friendly errors for invalid formats
- All unit tests pass

---

#### Task 2.3: Implement Answer Matcher

**Story:** As a user, my answers are validated fairly with case-insensitive matching.

**Subtasks:**

1. Create `src/lib/answer-matcher.ts`
2. Implement `matchAnswer(userInput: string, correctAnswer: string): boolean`
3. Trim leading/trailing whitespace
4. Convert both to lowercase for comparison
5. Collapse multiple internal spaces to single space (optional)
6. Return true if strings match exactly after normalization
7. Write unit tests for edge cases

**Test Cases:**

- Exact match
- Case differences
- Extra whitespace
- Multiple spaces
- Leading/trailing spaces
- Special characters
- Diacritics (exact match for MVP)

**Acceptance Criteria:**

- Case-insensitive matching works
- Whitespace normalized properly
- All test cases pass
- Function is pure (no side effects)

---

#### Task 2.4: Implement localStorage Utilities

**Story:** As a user, my records and last word list are saved locally.

**Subtasks:**

1. Create `src/lib/storage.ts`
2. Implement `saveRecords(records: Records): void`
3. Implement `loadRecords(): Records`
4. Implement `saveWordList(words: WordItem[]): void`
5. Implement `loadWordList(): WordItem[] | null`
6. Add error handling for localStorage quota exceeded
7. Add error handling for JSON parse errors
8. Implement versioning for storage format changes
9. Write tests using localStorage mock

**Storage Keys:**

- `sanakoe_records` - Personal best records
- `sanakoe_last_list` - Last used word list
- `sanakoe_storage_version` - Storage format version

**Acceptance Criteria:**

- Data persists across page refreshes
- Handles localStorage errors gracefully
- Returns null/default values when data missing
- Storage version managed properly

---

#### Task 2.5: Implement List Fingerprinting

**Story:** As a developer, I can uniquely identify word lists to track separate records.

**Subtasks:**

1. Create `src/lib/hash.ts`
2. Implement `generateListFingerprint(words: WordItem[]): string`
3. Sort words by prompt+answer before hashing
4. Use simple hash algorithm (or JSON stringify + base64)
5. Ensure same word list always produces same fingerprint
6. Ensure different order produces same fingerprint (sorted)
7. Write unit tests

**Acceptance Criteria:**

- Same words (different order) produce same hash
- Different words produce different hash
- Hash is stable and deterministic
- Reasonably collision-resistant

---

### Phase 3: State Management

#### Task 3.1: Create Zustand Quiz Store

**Story:** As a developer, I have centralized state management for the entire quiz flow.

**Subtasks:**

1. Create `src/hooks/useQuizStore.ts`
2. Define store interface with state and actions
3. Implement `loadWords(words: WordItem[]): void` - initializes quiz
4. Implement `startQuiz(): void` - shuffles queue, starts timer
5. Implement `submitAnswer(answer: string): void` - processes normal mode answer
6. Implement `submitPracticeAnswer(answer: string): void` - processes practice answer
7. Implement `moveToNextWord(): void` - advances to next question
8. Implement `enterPracticeMode(wordId: string): void` - switches to practice
9. Implement `exitPracticeMode(): void` - returns to normal mode
10. Implement `endQuiz(): void` - finalizes quiz
11. Implement `resetQuiz(): void` - clears state for new quiz
12. Add selectors for computed values (current word, progress, etc.)
13. Integrate answer-matcher logic
14. Integrate localStorage for persistence

**Store State:**

```typescript
interface QuizStore {
  // State
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

**Acceptance Criteria:**

- Store manages full quiz lifecycle
- State updates trigger component re-renders
- Queue operations work correctly (FIFO with rotation)
- Practice mode transitions work
- Timer tracked accurately
- Tries counted correctly (normal mode only)

---

#### Task 3.2: Create Timer Hook

**Story:** As a user, I see accurate elapsed time during the quiz.

**Subtasks:**

1. Create `src/hooks/useTimer.ts`
2. Implement `useTimer()` hook with start, pause, reset functions
3. Use `useEffect` to update elapsed time every second
4. Return formatted time string (MM:SS)
5. Handle component unmount cleanup
6. Write tests for timer functionality

**Acceptance Criteria:**

- Timer starts when quiz begins
- Timer stops when quiz ends
- Timer displays MM:SS format
- Timer cleans up on unmount
- Timer is accurate within 1 second

---

### Phase 4: UI Components Library

#### Task 4.1: Create Base UI Components

**Story:** As a developer, I have reusable, kid-friendly UI components.

**Subtasks:**

1. Create `src/components/ui/Button.tsx` with variants (primary, secondary, danger)
2. Create `src/components/ui/Card.tsx` with shadow and rounded corners
3. Create `src/components/ui/Input.tsx` with large text and focus styles
4. Create `src/components/ui/Modal.tsx` with overlay and animation
5. Style components with Tailwind using kid-friendly theme
6. Add proper TypeScript props interfaces
7. Ensure keyboard accessibility
8. Add hover and focus states

**Button Variants:**

- Primary: bright color, large text, rounded
- Secondary: outlined, less prominent
- Danger: for clear/delete actions (with confirmation)

**Acceptance Criteria:**

- Components render correctly
- Keyboard navigation works
- Styles are kid-friendly (large, colorful, rounded)
- TypeScript props properly typed
- Components are accessible (ARIA labels)

---

#### Task 4.2: Create SVG Icon Components

**Story:** As a user, I see playful visual elements throughout the app.

**Subtasks:**

1. Create `public/icons/star.svg` - for correct answers
2. Create `public/icons/trophy.svg` - for records
3. Create `public/icons/rocket.svg` - for motivation
4. Create wrapper components for each icon
5. Make icons colorful and kid-friendly
6. Ensure SVGs are optimized and accessible

**Acceptance Criteria:**

- Icons display correctly
- Icons scale properly
- Icons have appropriate alt text
- Icons match kid-friendly aesthetic

---

### Phase 5: Word List Input Components

#### Task 5.1: CSV Upload Component

**Story:** As a user, I can upload a CSV file containing my vocabulary words.

**Subtasks:**

1. Create `src/components/WordListUpload.tsx`
2. Implement file input with drag-and-drop support
3. Show upload area with clear instructions
4. Validate file type (.csv, .txt)
5. Read file using FileReader API
6. Call CSV parser with file content
7. Display parsing errors in user-friendly way
8. Show preview of parsed words (first 5)
9. Show total word count
10. Integrate with quiz store to load words
11. Add loading spinner during parsing
12. Add success feedback after successful upload

**Acceptance Criteria:**

- File upload works via button click
- Drag-and-drop works (optional for MVP)
- Parsing errors displayed clearly
- Word preview shown before starting quiz
- Invalid files rejected with helpful message
- Large files (1000+ words) parse efficiently

---

#### Task 5.2: Manual Entry Table Component

**Story:** As a user, I can manually enter vocabulary words in a table.

**Subtasks:**

1. Create `src/components/ManualEntryTable.tsx`
2. Initialize with 10 empty rows
3. Implement two-column table (localized headers)
4. Add input fields for each cell
5. Implement auto-expand: add new row when typing in last row
6. Implement keyboard navigation (Tab, Shift+Tab, Enter)
7. Implement row validation (both cells must have values)
8. Add "Clear All" button with confirmation dialog
9. Show valid row count indicator
10. Integrate with quiz store to load words
11. (Optional) Implement paste support for tab-separated values
12. Save table content to localStorage on change
13. Load saved content on component mount

**Keyboard Behavior:**

- Tab: move to next cell
- Shift+Tab: move to previous cell
- Enter: behave like Tab
- Tab on last cell of last row: create new row and move focus

**Acceptance Criteria:**

- Table starts with 10 rows
- New rows added automatically
- Keyboard navigation works perfectly
- Only valid rows (both cells filled) counted
- Clear all requires confirmation
- Table state persists in localStorage
- Tab-separated paste works (nice-to-have)

---

### Phase 6: Quiz Flow Screens

#### Task 6.1: Start Screen

**Story:** As a user, I land on a welcoming start screen where I choose how to enter words.

**Subtasks:**

1. Create `src/app/[locale]/page.tsx`
2. Add welcoming title and description (kid-friendly)
3. Integrate LanguageSelector component
4. Add two large buttons: "Upload CSV" and "Enter Manually"
5. Show WordListUpload component when upload chosen
6. Show ManualEntryTable component when manual chosen
7. Add "Start Quiz" button (enabled only when words loaded)
8. Show word count when words loaded
9. Add friendly graphics (rocket or star icon)
10. Ensure responsive layout

**Acceptance Criteria:**

- Screen is visually appealing and kid-friendly
- Both input methods work correctly
- Start quiz button enables/disables appropriately
- Language selector works
- Layout is responsive

---

#### Task 6.2: Quiz Screen (Normal Mode)

**Story:** As a user, I answer vocabulary questions in normal quiz mode.

**Subtasks:**

1. Create `src/app/[locale]/quiz/page.tsx`
2. Create `src/components/ProgressHeader.tsx` - shows resolved/total, tries, timer
3. Create `src/components/QuizCard.tsx` - shows current question
4. Display current word's prompt (large text)
5. Add answer input field (large, auto-focused)
6. Add submit button
7. Handle Enter key to submit
8. Show immediate feedback after submit (correct/incorrect)
9. For correct: show encouraging message, auto-advance after 1 second
10. For incorrect: show correct answer, transition to practice mode
11. Integrate with quiz store for state management
12. Add visual feedback (star icon for correct, encouraging message for wrong)
13. Ensure input cleared after each submission

**Feedback Messages (localized):**

- Correct: "Great!", "Well done!", "Perfect!", "Excellent!"
- Incorrect: "Not quite!", "Let's practice this one!", "Almost there!"

**Acceptance Criteria:**

- Questions display correctly
- Answer submission works
- Feedback is encouraging and age-appropriate
- Progress header updates in real-time
- Timer runs during quiz
- Transitions to practice mode on wrong answer
- Auto-advances on correct answer

---

#### Task 6.3: Quiz Screen (Practice Mode)

**Story:** As a user, I practice words I got wrong by typing them 3 times.

**Subtasks:**

1. Create `src/components/PracticeCard.tsx`
2. Conditionally render in `quiz/page.tsx` when mode is "practice"
3. Display prompt (optional but recommended)
4. Display correct answer prominently in highlighted card
5. Show counter (1/3, 2/3, 3/3)
6. Add answer input (auto-focused)
7. Add "Check" button
8. Validate practice answer matches correct answer
9. Clear input and increment counter on correct practice entry
10. Show encouraging message ("Good!", "Keep going!")
11. After 3rd repetition: show success message, return to normal mode
12. Add playful animations for transitions

**Acceptance Criteria:**

- Correct answer always visible
- Counter displays accurately
- Input cleared after each repetition
- Returns to normal mode after 3 repetitions
- Word remains unresolved and appears later
- No impact on tries counter

---

#### Task 6.4: Results Screen

**Story:** As a user, I see my quiz results with performance metrics and personal records.

**Subtasks:**

1. Create `src/app/[locale]/results/page.tsx`
2. Create `src/components/ResultsCard.tsx`
3. Display total words count
4. Display total tries
5. Display total time (formatted MM:SS)
6. Display list of words not resolved on first try
7. Load personal records from localStorage
8. Compare current performance to records
9. Show "New Record!" celebration if achieved
10. Show motivational challenge text
11. Add confetti animation on new record (optional)
12. Add "Restart Quiz" button (reshuffles same words)
13. Add "New Word List" button (returns to start screen)
14. Save new records to localStorage if achieved

**Record Detection:**

- New best tries: fewer tries than previous best
- New best time: shorter time than previous best

**Acceptance Criteria:**

- All metrics display correctly
- Records saved and loaded properly
- New record detected and celebrated
- Restart maintains same word list
- New list returns to start screen
- Words not first-try list is accurate

---

### Phase 7: Global Features

#### Task 7.1: Global Word List Overlay

**Story:** As a user, I can view all my vocabulary words and their status at any time.

**Subtasks:**

1. Create `src/components/WordListOverlay.tsx`
2. Add persistent button to all screen layouts (top-right corner)
3. Implement modal overlay with word list table
4. Display all words with prompt → answer
5. Show status indicators:
   - ✅ Resolved (correct on any attempt)
   - 🔁 Unresolved (not yet answered correctly)
   - ⚠️ Mistake made (wrong on first try)
6. Highlight current word during active quiz
7. (Optional) Add filter: All / Unresolved / Mistakes
8. Ensure overlay doesn't affect quiz state or timer
9. Make overlay keyboard-accessible (ESC to close)
10. Add smooth open/close animations

**Acceptance Criteria:**

- Button visible on all screens
- Overlay opens without affecting quiz
- Word statuses accurate
- Current word highlighted
- Timer continues running while overlay open
- Keyboard navigation works (ESC closes)
- Localized labels

---

#### Task 7.2: Responsive Layout & Mobile Support

**Story:** As a user, I can use the app on various screen sizes.

**Subtasks:**

1. Test all screens on mobile viewport
2. Adjust button sizes for touch targets (min 44px)
3. Make table scrollable horizontally if needed
4. Adjust font sizes for readability on small screens
5. Test keyboard appears correctly on mobile inputs
6. Ensure modals work on mobile
7. Test landscape and portrait orientations

**Acceptance Criteria:**

- App usable on tablet (768px+)
- Touch targets appropriately sized
- Text readable on all screen sizes
- No horizontal scrolling on narrow screens
- Keyboard interactions work on touch devices

---

### Phase 8: Polish & Edge Cases

#### Task 8.1: Error Handling & Edge Cases

**Story:** As a user, the app handles unusual inputs gracefully.

**Subtasks:**

1. Handle empty CSV upload
2. Handle CSV with only 1 column
3. Handle single-word quiz (1 word total)
4. Handle localStorage quota exceeded
5. Handle corrupted localStorage data
6. Show friendly error messages for all error cases
7. Add error boundary for React errors
8. Test with very large word lists (1000+ words)
9. Handle special characters in words
10. Test with emoji in words

**Acceptance Criteria:**

- All edge cases handled gracefully
- Error messages are user-friendly
- App never crashes
- Data corruption detected and recovered

---

#### Task 8.2: Visual Polish & Animations

**Story:** As a user, I experience smooth, delightful interactions.

**Subtasks:**

1. Add transitions for page navigation
2. Add fade-in animations for feedback messages
3. Add scale animation for correct answer (star grows)
4. Add confetti animation on new record (canvas-confetti library)
5. Add loading spinner for CSV parsing
6. Polish button hover states
7. Add focus visible styles for accessibility
8. Test animations on slower devices
9. Ensure animations respect prefers-reduced-motion

**Acceptance Criteria:**

- Transitions are smooth (not janky)
- Animations enhance experience without distraction
- Respect user's motion preferences
- Performance remains good with animations

---

#### Task 8.3: Testing & Quality Assurance

**Story:** As a developer, I'm confident the app works correctly.

**Subtasks:**

1. Write unit tests for CSV parser
2. Write unit tests for answer matcher
3. Write unit tests for quiz logic
4. Write unit tests for storage utilities
5. Write integration tests for quiz flow
6. Test keyboard navigation throughout app
7. Test with screen reader (basic accessibility)
8. Perform manual testing of full user journeys
9. Test in multiple browsers (Chrome, Firefox, Safari)
10. Fix any bugs discovered

**Test Coverage Goals:**

- Core logic: 80%+ coverage
- UI components: snapshot tests
- End-to-end: critical paths covered

**Acceptance Criteria:**

- All tests pass
- No console errors or warnings
- Keyboard navigation works throughout
- Basic screen reader support
- Works in modern browsers

---

## 6. Value Proposition

This application provides:

- **Educational value:** Helps children learn vocabulary through proven spaced repetition (wrong words return later)
- **Positive reinforcement:** Encouraging feedback builds confidence
- **Engagement:** Gamification with records motivates continued practice
- **Accessibility:** No signup or account required, works immediately
- **Flexibility:** Supports both teacher-provided CSV lists and student's own manual entry
- **Privacy:** All data stays local, no tracking or data collection

---

## 7. Threat Modeling & Risks

### Security Considerations

- **Client-side only:** No server-side vulnerabilities
- **localStorage limits:** User data could be lost if browser storage cleared
  - *Mitigation:* Warn users about data persistence limitations in UI
- **XSS risks:** User-entered words could contain malicious scripts
  - *Mitigation:* React automatically escapes content; ensure no `dangerouslySetInnerHTML`
- **CSV injection:** Malicious CSV formulas (=cmd)
  - *Mitigation:* Parser treats all input as plain text, no formula evaluation

### Privacy Considerations

- **No analytics:** MVP has no tracking; future analytics should be privacy-respecting
- **No PII collected:** Word lists might contain sensitive information
  - *Mitigation:* Document that data stays local; consider encryption in future

### Operational Risks

- **Browser compatibility:** Older browsers may not support features
  - *Mitigation:* Document supported browsers clearly
- **Storage quota:** Large word lists could exceed localStorage limits
  - *Mitigation:* Handle quota exceeded errors gracefully, show limit warnings

---

## 8. Definition of Ready

Before starting implementation, ensure:

- ✅ Specification document (sanakoe.md) is complete and reviewed
- ✅ Design mockups or wireframes approved (optional but recommended)
- ✅ Development environment set up (Node.js 18+, npm)
- ✅ Decision made on exact Next.js version to use
- ✅ Color palette and typography choices finalized for kid-friendly theme
- ✅ Translation files structure agreed upon
- ✅ Team has access to repository and communication channels

---

## 9. Definition of Done

Implementation is complete when:

- ✅ All functional requirements (FR1-FR10) implemented
- ✅ All 17 MVP acceptance criteria (from spec section 17) met
- ✅ Application builds without errors or warnings
- ✅ All automated tests pass (minimum 70% coverage)
- ✅ Manual testing completed for all user journeys:
  - Upload CSV → Complete quiz → View results → Restart
  - Manual entry → Complete quiz → View results → New list
  - Practice mode flow tested
  - Global word list tested from all screens
  - Language switching tested
- ✅ Edge cases handled (empty list, 1-word list, malformed CSV)
- ✅ Works in Chrome, Firefox, and Safari (latest versions)
- ✅ Responsive on tablet-sized screens (768px+)
- ✅ Keyboard navigation works throughout
- ✅ No console errors in production build
- ✅ localStorage persistence verified
- ✅ Records system working correctly
- ✅ Documentation updated:
  - README.md with setup and development instructions
  - Deployment guide
  - User guide (optional)
- ✅ Code reviewed by at least one other developer
- ✅ Deployed to staging/production environment

---

## 10. Testing Strategy

### Unit Testing

**Tools:** Jest, React Testing Library

**Test Coverage:**

- `csv-parser.ts`: All parsing scenarios, error cases
- `answer-matcher.ts`: All matching rules, edge cases
- `hash.ts`: Fingerprint generation, collision avoidance
- `storage.ts`: Save/load operations, error handling
- Quiz store: All state transitions, action handlers

**Target:** 80%+ coverage for utility functions

---

### Integration Testing

**Focus Areas:**

- Full quiz flow: start → answer → practice → complete
- CSV upload → parse → quiz → results
- Manual entry → validate → quiz → results
- Record saving and loading
- Language switching during active quiz

**Target:** All critical user paths covered

---

### Manual Testing Checklist

**Functional:**

- [ ] Upload valid CSV (comma-separated)
- [ ] Upload valid CSV (semicolon-separated)
- [ ] Upload invalid CSV (error handled)
- [ ] Manual entry: add 5 words, start quiz
- [ ] Manual entry: keyboard navigation (Tab, Enter)
- [ ] Manual entry: auto-expand rows
- [ ] Answer correctly: word removed from queue
- [ ] Answer incorrectly: practice mode entered
- [ ] Practice mode: type correct answer 3 times
- [ ] Complete quiz: all words resolved
- [ ] Results: metrics correct
- [ ] Results: record saved and displayed
- [ ] Restart quiz: same words, new order
- [ ] New list: returns to start
- [ ] Global word list: opens from any screen
- [ ] Global word list: shows correct statuses
- [ ] Language switch: UI updates immediately
- [ ] localStorage: data persists after refresh

**Accessibility:**

- [ ] Tab navigation through all interactive elements
- [ ] Focus visible on all focusable elements
- [ ] Enter key submits forms
- [ ] ESC closes modals
- [ ] Screen reader announces key information (basic test)

**Performance:**

- [ ] App loads in < 3 seconds
- [ ] Quiz with 100 words performs smoothly
- [ ] No UI lag during typing
- [ ] Animations smooth (60fps)

**Cross-Browser:**

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)

---

### E2E Testing (Optional)

**Tools:** Playwright or Cypress

**Scenarios:**

1. Complete happy path: upload → quiz → results
2. Practice flow: wrong answer → 3 repetitions → continue
3. Record breaking: complete same list twice, verify record

**Target:** Automated tests for critical paths (nice-to-have for MVP)

---

## 11. Deployment Considerations

### Hosting Options

- **Vercel:** Recommended (free tier, optimized for Next.js)
- **Netlify:** Alternative with similar features
- **GitHub Pages:** Requires static export configuration

### Build Configuration

```bash
# next.config.js
module.exports = {
  output: 'export', // for static hosting
  images: {
    unoptimized: true // if using static export
  }
}
```

### Environment Variables

None required for MVP (all client-side)

### Monitoring

- Basic error tracking (Sentry optional)
- No analytics in MVP (privacy-first)

---

## 12. Future Enhancements (Post-MVP)

*Not in scope for initial release but worth documenting:*

1. **Cloud sync:** Optional account system for cross-device sync
2. **Audio pronunciation:** Speak words aloud for listening practice
3. **Difficulty levels:** Timed mode, streak tracking
4. **Multiplayer:** Compete with friends in real-time
5. **Progress dashboard:** Historical performance graphs
6. **More languages:** Add more UI languages
7. **Themes:** Dark mode, different visual themes
8. **Import from Quizlet:** Direct integration with popular platforms
9. **Export results:** Download PDF report of performance
10. **Spaced repetition algorithm:** Smart scheduling of review sessions

---

## 13. Open Questions & Assumptions

### Assumptions Made

- Target devices are desktop/tablet (not optimized for phone)
- Users have modern browser with localStorage support
- Word lists typically 10-100 words (not thousands)
- Kids have basic typing skills
- Adult supervision available for initial setup

### Open Questions

- Should there be a maximum word limit per quiz? (Recommendation: warn at 200+)
- Should quiz state persist if user closes browser? (Recommendation: yes)
- Should there be a "pause" feature? (Recommendation: no for MVP, adds complexity)
- What happens if same word appears multiple times with different answers? (Recommendation: treat as separate items, don't deduplicate)

---

## 14. Success Metrics

*For post-launch evaluation:*

- **Engagement:** Average quiz completion rate > 80%
- **Usage:** Average words practiced per session > 20
- **Retention:** User returns within 7 days > 50%
- **Performance:** Quiz loads in < 3 seconds
- **Satisfaction:** Positive feedback from kids and parents
- **Technical:** Zero critical bugs reported in first month

---
