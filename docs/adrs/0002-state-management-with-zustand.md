# 0002. State Management with Zustand

**Date:** 2026-02-01  
**Status:** Accepted

## Context

The Sanakoe application needs global state management for:

1. **Quiz session state:**
   - Current word being displayed
   - Queue of unresolved words
   - Tries counter and timer
   - Mode (normal vs practice)
   - Practice target with remaining repetitions

2. **Word list management:**
   - All words with their metadata (attempts, resolved status)
   - Deduplication and ID generation

3. **UI state:**
   - Loading states
   - Error messages
   - Modal visibility

**Requirements:**

- Type-safe state access
- Easy to test and mock
- Minimal boilerplate
- Good DevTools support
- Small bundle size
- Server and client component compatibility (Next.js App Router)

**Team context:**

- Small team familiar with React hooks
- Need quick development velocity
- Limited experience with complex state management patterns

## Decision

We will use **Zustand** as our primary state management solution.

**Implementation approach:**

```typescript
// src/hooks/useQuizStore.ts
import {create} from "zustand";
import {QuizSession, WordItem} from "@/lib/types";

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
  getProgress: () => {resolved: number; total: number};
}

export const useQuizStore = create<QuizStore>((set, get) => ({
  session: null,

  loadWords: (words) =>
    set({
      session: {
        words,
        unresolvedIds: words.map((w) => w.id),
        currentId: null,
        tries: 0,
        startTimeMs: 0,
        mode: "normal",
      },
    }),

  startQuiz: () =>
    set((state) => ({
      session: state.session
        ? {
            ...state.session,
            unresolvedIds: shuffle(state.session.unresolvedIds),
            currentId: state.session.unresolvedIds[0],
            startTimeMs: Date.now(),
          }
        : null,
    })),

  // ... other actions

  getCurrentWord: () => {
    const {session} = get();
    if (!session?.currentId) return null;
    return session.words.find((w) => w.id === session.currentId) ?? null;
  },

  getProgress: () => {
    const {session} = get();
    if (!session) return {resolved: 0, total: 0};
    const resolved = session.words.filter((w) => w.resolved).length;
    return {resolved, total: session.words.length};
  },
}));
```

**Usage in components:**

```typescript
// Component usage
function QuizCard() {
  const currentWord = useQuizStore(state => state.getCurrentWord());
  const submitAnswer = useQuizStore(state => state.submitAnswer);

  // Optimized: only re-renders when currentWord changes
  return <div>{currentWord?.prompt}</div>;
}
```

## Consequences

### Positive

1. **Minimal boilerplate** - No actions/reducers/dispatch, just functions
2. **Excellent TypeScript support** - Full type inference, no manual typing needed
3. **Small bundle size** - ~1KB gzipped (vs 3KB for Redux)
4. **Fast performance** - Uses React's `useSyncExternalStore` under the hood
5. **Easy to learn** - Feels like `useState` but global
6. **Great DevTools** - Browser extension for time-travel debugging
7. **Simple testing** - Can access store directly without providers
8. **Flexible selectors** - Automatic re-render optimization with selector pattern
9. **No Context providers** - No wrapping components in providers
10. **Works everywhere** - Client components, server components (with separate stores), middleware

### Negative

1. **Additional dependency** - One more package to maintain (though very stable)
2. **Less opinionated** - No enforced patterns like Redux (could lead to inconsistency)
3. **Smaller ecosystem** - Fewer third-party integrations than Redux

### Neutral

1. **Different mental model** - Not flux/redux pattern, might confuse Redux veterans
2. **No built-in middleware** - Can add middleware but requires manual setup
3. **Single store pattern** - Different from Redux's multi-slice approach (though you can create multiple stores)

## Alternatives Considered

### Alternative 1: React Context API

**Description:** Use React's built-in Context API with `useReducer` hook.

```typescript
const QuizContext = createContext<QuizContextType | null>(null);

function QuizProvider({ children }) {
  const [state, dispatch] = useReducer(quizReducer, initialState);
  return (
    <QuizContext.Provider value={{ state, dispatch }}>
      {children}
    </QuizContext.Provider>
  );
}
```

**Why rejected:**

- **Performance issues:** All consumers re-render on any state change (even with `useMemo`)
- **Boilerplate heavy:** Need actions, reducer, provider, custom hooks
- **Provider hell:** Multiple contexts lead to deep nesting
- **Testing complexity:** Need to wrap components in providers for tests
- **DevTools:** No native debugging support

**When to reconsider:** For truly isolated, component-tree-scoped state (e.g., form state).

### Alternative 2: Redux Toolkit

**Description:** Modern Redux with less boilerplate via Redux Toolkit.

```typescript
const quizSlice = createSlice({
  name: "quiz",
  initialState,
  reducers: {
    loadWords: (state, action: PayloadAction<WordItem[]>) => {
      state.words = action.payload;
    },
  },
});
```

**Why rejected:**

- **Still verbose:** Slice creation, action creators, thunks
- **Learning curve:** Concepts like immutability helpers, normalization
- **Larger bundle:** 3KB+ vs Zustand's 1KB
- **Overkill for our use case:** We don't need time-travel debugging or complex middleware
- **Provider requirement:** Must wrap app in `<Provider>`
- **Testing overhead:** Mock store setup for tests

**When to reconsider:** For very large apps with complex state interactions and need for Redux DevTools ecosystem.

### Alternative 3: Jotai

**Description:** Atomic state management with bottom-up approach.

```typescript
const wordsAtom = atom<WordItem[]>([]);
const currentWordAtom = atom((get) => {
  const words = get(wordsAtom);
  return words[0] || null;
});
```

**Why rejected:**

- **Different paradigm:** Atoms are harder to reason about than single store
- **Selector complexity:** Derived state requires creating new atoms
- **Less mature:** Smaller community, fewer examples
- **No clear winner:** Similar bundle size and features to Zustand
- **Team preference:** Team prefers Zustand's store-based approach

**When to reconsider:** If we need more granular reactivity or Suspense integration.

### Alternative 4: MobX

**Description:** Observable-based state management with automatic reactivity.

```typescript
class QuizStore {
  @observable words: WordItem[] = [];

  @action loadWords(words: WordItem[]) {
    this.words = words;
  }
}
```

**Why rejected:**

- **Decorators:** Requires TypeScript experimental decorators
- **Magic:** Auto-tracking can be confusing and hard to debug
- **Larger bundle:** 5KB+ gzipped
- **Proxy-based:** Performance concerns for large lists
- **Less popular:** Declining community momentum

**When to reconsider:** For apps with very complex object graphs and need for fine-grained reactivity.

## Implementation Guidelines

### Store Organization

**Single store pattern:**

```typescript
// ✅ Good: Single store with clear sections
interface AppStore {
  // Quiz state
  session: QuizSession | null;
  loadWords: (words: WordItem[]) => void;

  // UI state
  isWordListOpen: boolean;
  toggleWordList: () => void;

  // Records state
  records: Records;
  saveRecord: (fingerprint: string, record: ListRecords) => void;
}
```

**Multiple stores (if needed):**

```typescript
// ✅ Also acceptable: Separate concerns
export const useQuizStore = create<QuizStore>(...);
export const useUIStore = create<UIStore>(...);
export const useRecordsStore = create<RecordsStore>(...);
```

### Selector Optimization

**Always use selectors to prevent unnecessary re-renders:**

```typescript
// ❌ Bad: Component re-renders on ANY state change
function QuizCard() {
  const store = useQuizStore();
  return <div>{store.session?.currentId}</div>;
}

// ✅ Good: Only re-renders when currentWord changes
function QuizCard() {
  const currentWord = useQuizStore(state => state.getCurrentWord());
  return <div>{currentWord?.prompt}</div>;
}

// ✅ Also good: Multiple selectors
function QuizCard() {
  const currentWord = useQuizStore(state => state.getCurrentWord());
  const progress = useQuizStore(state => state.getProgress());
  const submitAnswer = useQuizStore(state => state.submitAnswer);

  return (
    <div>
      <h2>{currentWord?.prompt}</h2>
      <p>{progress.resolved} / {progress.total}</p>
      <button onClick={() => submitAnswer('test')}>Submit</button>
    </div>
  );
}
```

### Immer Integration (Optional)

For complex state updates, use Immer middleware:

```typescript
import {create} from "zustand";
import {immer} from "zustand/middleware/immer";

export const useQuizStore = create<QuizStore>()(
  immer((set) => ({
    session: null,

    markWordResolved: (wordId: string) =>
      set((state) => {
        // Immer allows direct mutations
        const word = state.session?.words.find((w) => w.id === wordId);
        if (word) {
          word.resolved = true;
        }
      }),
  })),
);
```

### Persistence Middleware

Sync with localStorage:

```typescript
import {create} from "zustand";
import {persist} from "zustand/middleware";

export const useRecordsStore = create<RecordsStore>()(
  persist(
    (set) => ({
      records: {},
      saveRecord: (fingerprint, record) =>
        set((state) => ({
          records: {
            ...state.records,
            [fingerprint]: record,
          },
        })),
    }),
    {
      name: "sanakoe_records", // localStorage key
    },
  ),
);
```

### Testing

**Unit tests for store logic:**

```typescript
import {renderHook, act} from "@testing-library/react";
import {useQuizStore} from "@/hooks/useQuizStore";

describe("useQuizStore", () => {
  it("loads words correctly", () => {
    const {result} = renderHook(() => useQuizStore());

    act(() => {
      result.current.loadWords([
        {
          id: "1",
          prompt: "hello",
          answer: "moi",
          attempts: 0,
          firstTryFailed: false,
          resolved: false,
        },
      ]);
    });

    expect(result.current.session?.words).toHaveLength(1);
  });

  it("starts quiz with shuffled words", () => {
    const {result} = renderHook(() => useQuizStore());

    act(() => {
      result.current.loadWords([
        /* ... */
      ]);
      result.current.startQuiz();
    });

    expect(result.current.session?.startTimeMs).toBeGreaterThan(0);
    expect(result.current.session?.currentId).toBeTruthy();
  });
});
```

**Component tests with store:**

```typescript
import { render, screen } from '@testing-library/react';
import { useQuizStore } from '@/hooks/useQuizStore';
import QuizCard from '@/components/QuizCard';

describe('QuizCard', () => {
  beforeEach(() => {
    useQuizStore.setState({
      session: {
        words: [{ id: '1', prompt: 'test', answer: 'testi', /* ... */ }],
        currentId: '1',
        // ...
      }
    });
  });

  it('displays current word prompt', () => {
    render(<QuizCard />);
    expect(screen.getByText('test')).toBeInTheDocument();
  });
});
```

### DevTools Setup

```typescript
import {create} from "zustand";
import {devtools} from "zustand/middleware";

export const useQuizStore = create<QuizStore>()(
  devtools(
    (set) => ({
      // ... store implementation
    }),
    {
      name: "QuizStore", // Shows in Redux DevTools
      enabled: process.env.NODE_ENV === "development",
    },
  ),
);
```

## Performance Considerations

### Selector Memoization

Zustand automatically memoizes selector results using shallow comparison:

```typescript
// Optimized: Only re-renders if array reference changes
const unresolvedWords = useQuizStore(
  (state) => state.session?.words.filter((w) => !w.resolved) ?? [],
);
```

For complex selectors, use `shallow` for deep comparison:

```typescript
import {shallow} from "zustand/shallow";

const {currentWord, progress} = useQuizStore(
  (state) => ({
    currentWord: state.getCurrentWord(),
    progress: state.getProgress(),
  }),
  shallow, // Compare object properties, not reference
);
```

### Large State Warnings

For word lists >1000 items, consider:

- Virtualizing list rendering (react-window)
- Splitting state into multiple stores
- Using IndexedDB instead of localStorage

## Migration Path

If we outgrow Zustand (unlikely), migration paths exist:

1. **To Redux:** Store logic already separated, just need to convert to slices
2. **To Jotai:** Gradual migration by creating atoms that read from Zustand
3. **To Context:** Wrap Zustand store in Context for provider-based access

All migrations are non-breaking due to Zustand's simple API surface.

## Success Criteria

This decision is successful if:

1. ✅ State updates are fast (<16ms for 60fps)
2. ✅ DevTools help debug issues quickly
3. ✅ New developers understand store in <1 hour
4. ✅ No performance complaints related to state management
5. ✅ Test coverage for store logic >70%

## Review Trigger

Revisit this decision if:

- Performance issues related to state updates (>5% of issues)
- Team requests Redux due to familiarity
- Need for complex async state management (consider React Query)
- App scales to >10 interconnected stores

## References

- [Zustand Documentation](https://docs.pmnd.rs/zustand)
- [Zustand GitHub](https://github.com/pmndrs/zustand)
- [Zustand vs Redux](https://github.com/pmndrs/zustand/wiki/Zustand-vs-Redux)
- [React State Management in 2024](https://leerob.io/blog/react-state-management)
