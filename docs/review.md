# Code Review: Sanakoe Vocabulary Quiz App

**Review Date:** February 2, 2026  
**Reviewer:** Code Review Agent  
**Codebase Version:** 0.1.0

---

## Summary

The codebase is **well-structured** and demonstrates solid software engineering practices for a Next.js application. It's a kid-friendly vocabulary quiz app with internationalization, state management via Zustand, and comprehensive testing. Overall code quality is **good**, with some areas for improvement.

---

## ✅ What's Good

### 1. Architecture & Structure

- Clean separation of concerns: `lib/` (utilities), `hooks/` (state), `components/` (UI)
- Proper use of Next.js App Router conventions
- Well-defined TypeScript interfaces in `src/lib/types.ts` with comprehensive JSDoc

### 2. State Management

- Excellent Zustand implementation in `src/hooks/useQuizStore.ts` with:
  - Clear action/selector separation
  - Immutable state updates
  - Comprehensive convenience hooks (`useQuizActions`, `useQuizSelectors`)

### 3. Type Safety

- TypeScript strict mode enabled
- Good use of discriminated unions (`QuizMode`, `FeedbackState`)
- Proper props interfaces for all components

### 4. Testing

- 26 unit test files covering utilities, hooks, and components
- 5 E2E test files with Playwright
- Tests use proper mocking patterns

### 5. Documentation

- Excellent JSDoc comments throughout
- Component usage examples in doc comments
- ADRs for architectural decisions

### 6. Accessibility & UX

- Focus management in `QuizCard.tsx`
- Minimum touch targets (44px+) in `Button.tsx`
- Reduced motion support in `useConfetti.ts`

---

## ⚠️ Issues to Address

### Critical

#### 1. Stale Closure in `useConfetti` (src/hooks/useConfetti.ts:68)

```typescript
const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
```

**Problem:** `mergedOptions` is computed once and used in `useCallback` dependencies, but if `options` changes, the callbacks won't reflect this properly.

**Recommendation:** Either memoize `mergedOptions` with `useMemo`, or pass options through refs.

---

### High Priority

#### 2. Potential Race Condition in Results Page (src/app/[locale]/results/page.tsx:117-150)

```typescript
useEffect(() => {
  if (!results || !listFingerprint || recordsSaved) return;
  // ...
  setRecordsSaved(true);
```

**Problem:** Multiple rapid renders could potentially trigger multiple saves before `recordsSaved` updates.

**Recommendation:** Use a ref to track save-in-progress state:

```typescript
const savingRef = useRef(false);
useEffect(() => {
  if (savingRef.current || recordsSaved) return;
  savingRef.current = true;
  // ... save logic
  setRecordsSaved(true);
}, [...]);
```

#### 3. Hardcoded "Back" Text (src/app/[locale]/page.tsx:89-96)

```tsx
<Button variant="secondary" onClick={...}>
  ← Back
</Button>
```

**Problem:** "Back" is not internationalized while rest of UI is.

**Recommendation:** Add translation key `t('back')` in the messages files.

#### 4. Missing Error Handling in `handleRestart` (src/app/[locale]/results/page.tsx:154-168)

**Problem:** No error boundary around store operations.

**Recommendation:** Wrap in try/catch or ensure ErrorBoundary covers this path.

---

### Medium Priority

#### 5. `any` Types in Test Files

```typescript
(useRouter as any).mockReturnValue({...})
```

**Problem:** While acceptable in tests, better patterns exist.

**Recommendation:** Use proper Jest mock typing:

```typescript
jest.mocked(useRouter).mockReturnValue({...})
```

#### 6. Unused `handlePracticeComplete` Function (src/app/[locale]/quiz/page.tsx:139-142)

**Problem:** This submits an answer that `PracticeCard` already handles internally.

**Recommendation:** Verify if `handlePracticeComplete` is needed, or if it causes double-submission.

#### 7. Magic Number: Practice Repetitions

**Problem:** `3` is hardcoded in both `quiz/page.tsx` and `useQuizStore.ts`.

**Recommendation:** Extract to a shared constant:

```typescript
// lib/constants.ts
export const PRACTICE_REPETITIONS = 3;
```

#### 8. Large Component: `ManualEntryTable` (427 lines)

**Problem:** Component handles too many responsibilities.

**Recommendation:** Extract custom hooks:

- `useTablePersistence` for localStorage
- `useTableKeyboardNavigation` for keyboard handling
- `useClipboardPaste` for paste logic

---

### Low Priority / Nitpicks

#### 9. Console Statements in Production Code

- `ManualEntryTable.tsx:56`
- `results/page.tsx:93, 150`

**Recommendation:** Use a proper logger or wrap in `NODE_ENV` check.

#### 10. Empty Author Field (package.json:27)

**Recommendation:** Fill in or remove.

---

## 🔒 Security Review

| Check                | Status | Notes                                                  |
| -------------------- | ------ | ------------------------------------------------------ |
| No hardcoded secrets | ✅     |                                                        |
| Input validation     | ✅     | CSV parser validates format                            |
| XSS prevention       | ✅     | React auto-escapes                                     |
| localStorage usage   | ⚠️     | Stored data not encrypted (acceptable for quiz scores) |
| No SQL/NoSQL         | ✅     | Client-only app                                        |

---

## 🧪 Testing Coverage

| Area                  | Status | Notes                                         |
| --------------------- | ------ | --------------------------------------------- |
| Utility functions     | ✅     | csv-parser, answer-matcher, hash, storage     |
| Zustand store         | ✅     | Comprehensive action tests                    |
| UI components         | ✅     | All major components tested                   |
| E2E flows             | ✅     | CSV upload, practice mode, language switching |
| Accessibility testing | ⚠️     | No automated a11y tests (axe-core)            |

**Recommendation:** Add axe-core integration:

```typescript
import { axe } from "jest-axe";
expect(await axe(container)).toHaveNoViolations();
```

---

## 📊 Performance Considerations

| Area                 | Status | Notes                                 |
| -------------------- | ------ | ------------------------------------- |
| Bundle splitting     | ✅     | Next.js handles automatically         |
| Lazy loading         | ✅     | `canvas-confetti` loaded dynamically  |
| Memoization          | ✅     | Good use of `useMemo`, `useCallback`  |
| Re-render prevention | ⚠️     | Some selectors could be more granular |

---

## Final Assessment

| Category      | Score |
| ------------- | ----- |
| Code Quality  | 8/10  |
| Type Safety   | 9/10  |
| Testing       | 8/10  |
| Documentation | 9/10  |
| Security      | 8/10  |
| Performance   | 8/10  |

**Overall: 8.3/10** — Production-ready with minor improvements recommended.

---

## Action Items

### Must Fix (Before Release)

- [ ] Fix stale closure in `useConfetti`
- [ ] Add race condition protection to results page save
- [ ] Internationalize "Back" button text

### Should Fix (Next Sprint)

- [ ] Extract magic numbers to constants
- [ ] Refactor `ManualEntryTable` into smaller pieces
- [ ] Add axe-core accessibility tests

### Nice to Have

- [ ] Replace `any` types in tests with proper mocks
- [ ] Add structured logging
- [ ] Optimize store selectors for granularity
