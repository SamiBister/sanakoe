/**
 * @jest-environment jsdom
 */
import ResultsPage from '@/app/[locale]/results/page';
import { useQuizStore } from '@/hooks/useQuizStore';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock useQuizStore
jest.mock('@/hooks/useQuizStore');

// Mock storage utilities
jest.mock('@/lib/storage', () => ({
  loadRecords: jest.fn(() => ({})),
  saveRecords: jest.fn(),
}));

// Mock hash utility
jest.mock('@/lib/hash', () => ({
  generateListFingerprint: jest.fn(() => 'test-fingerprint'),
}));

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => {
    const translations: Record<string, string> = {
      title: 'Quiz Complete!',
      congratulations: 'Congratulations!',
      summary: "Here's how you did:",
      totalWords: 'Total words',
      totalTries: 'Total attempts',
      totalTime: 'Total time',
      wordsNotFirstTry: 'Words that needed practice:',
      noMistakes: 'Perfect! You got all words right on the first try!',
      newRecord: '🎉 New Record!',
      newRecordTries: 'New best: Fewer attempts!',
      newRecordTime: 'New best: Faster time!',
      motivationFewer: 'Great job! Can you solve them all on the first try next time?',
      motivationFaster: 'Nice! Want to try even faster?',
      motivationBoth: "Amazing! You're getting better and better!",
      restart: 'Restart Quiz',
      newList: 'New Word List',
      previousBest: 'Previous best',
      currentScore: 'Your score',
    };
    return (key: string) => translations[key] || key;
  },
}));

// Mock Trophy icon
jest.mock('@/components/icons', () => ({
  Trophy: ({ size, className }: { size?: number; className?: string }) => (
    <div data-testid="trophy-icon" className={className} style={{ width: size, height: size }}>
      Trophy
    </div>
  ),
}));

describe('ResultsPage', () => {
  const mockPush = jest.fn();
  const mockStartQuiz = jest.fn();
  const mockResetQuiz = jest.fn();
  const mockLoadWords = jest.fn();

  const createMockSession = (overrides = {}) => ({
    mode: 'normal' as const,
    startTimeMs: Date.now() - 45000,
    endTimeMs: Date.now(),
    tries: 7,
    unresolvedIds: [],
    currentId: null,
    words: [
      {
        id: '1',
        prompt: 'hello',
        answer: 'hei',
        attempts: 1,
        firstTryFailed: false,
        resolved: true,
      },
      {
        id: '2',
        prompt: 'dog',
        answer: 'koira',
        attempts: 2,
        firstTryFailed: true,
        resolved: true,
      },
      {
        id: '3',
        prompt: 'cat',
        answer: 'kissa',
        attempts: 1,
        firstTryFailed: false,
        resolved: true,
      },
      {
        id: '4',
        prompt: 'house',
        answer: 'talo',
        attempts: 3,
        firstTryFailed: true,
        resolved: true,
      },
    ],
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();

    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    // Mock useQuizStore.getState()
    (useQuizStore as unknown as jest.Mock).getState = jest.fn(() => ({
      loadWords: mockLoadWords,
    }));
  });

  const setupMocks = (session: ReturnType<typeof createMockSession> | null) => {
    (useQuizStore as unknown as jest.Mock).mockImplementation(
      (selector: (state: unknown) => unknown) => {
        const state = {
          session,
          startQuiz: mockStartQuiz,
          resetQuiz: mockResetQuiz,
        };
        return selector(state);
      },
    );
  };

  describe('Navigation Guards', () => {
    it('redirects to home if no session exists', () => {
      setupMocks(null);

      render(<ResultsPage />);

      expect(mockPush).toHaveBeenCalledWith('/');
    });

    it('redirects to home if session has no endTimeMs', () => {
      const session = createMockSession({ endTimeMs: undefined });
      setupMocks(session);

      render(<ResultsPage />);

      expect(mockPush).toHaveBeenCalledWith('/');
    });

    it('does not redirect if session is complete', () => {
      const session = createMockSession();
      setupMocks(session);

      render(<ResultsPage />);

      // Should render results, not redirect
      expect(screen.getByText('Quiz Complete!')).toBeInTheDocument();
    });
  });

  describe('Results Display', () => {
    it('displays total words count', () => {
      const session = createMockSession();
      setupMocks(session);

      render(<ResultsPage />);

      expect(screen.getByText('Total words')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
    });

    it('displays total tries count', () => {
      const session = createMockSession();
      setupMocks(session);

      render(<ResultsPage />);

      expect(screen.getByText('Total attempts')).toBeInTheDocument();
      expect(screen.getByText('7')).toBeInTheDocument();
    });

    it('displays total time formatted correctly', () => {
      const session = createMockSession({
        startTimeMs: Date.now() - 45000,
        endTimeMs: Date.now(),
      });
      setupMocks(session);

      render(<ResultsPage />);

      expect(screen.getByText('Total time')).toBeInTheDocument();
      expect(screen.getByText('00:45')).toBeInTheDocument();
    });

    it('displays words that needed practice', () => {
      const session = createMockSession();
      setupMocks(session);

      render(<ResultsPage />);

      expect(screen.getByText('Words that needed practice:')).toBeInTheDocument();
      expect(screen.getByText('dog')).toBeInTheDocument();
      expect(screen.getByText('koira')).toBeInTheDocument();
      expect(screen.getByText('house')).toBeInTheDocument();
      expect(screen.getByText('talo')).toBeInTheDocument();
    });

    it('shows perfect message when no mistakes', () => {
      const session = createMockSession({
        words: [
          {
            id: '1',
            prompt: 'hello',
            answer: 'hei',
            attempts: 1,
            firstTryFailed: false,
            resolved: true,
          },
          {
            id: '2',
            prompt: 'dog',
            answer: 'koira',
            attempts: 1,
            firstTryFailed: false,
            resolved: true,
          },
        ],
        tries: 2,
      });
      setupMocks(session);

      render(<ResultsPage />);

      expect(
        screen.getByText('Perfect! You got all words right on the first try!'),
      ).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('renders restart button', () => {
      const session = createMockSession();
      setupMocks(session);

      render(<ResultsPage />);

      expect(screen.getByRole('button', { name: 'Restart Quiz' })).toBeInTheDocument();
    });

    it('renders new word list button', () => {
      const session = createMockSession();
      setupMocks(session);

      render(<ResultsPage />);

      expect(screen.getByRole('button', { name: 'New Word List' })).toBeInTheDocument();
    });

    it('calls resetQuiz and navigates to home when new list button is clicked', () => {
      const session = createMockSession();
      setupMocks(session);

      render(<ResultsPage />);

      fireEvent.click(screen.getByRole('button', { name: 'New Word List' }));

      expect(mockResetQuiz).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/');
    });

    it('restarts quiz and navigates to quiz when restart button is clicked', () => {
      const session = createMockSession();
      setupMocks(session);

      render(<ResultsPage />);

      fireEvent.click(screen.getByRole('button', { name: 'Restart Quiz' }));

      // Should have called loadWords (via getState().loadWords) and startQuiz
      expect(mockStartQuiz).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/quiz');
    });
  });

  describe('Record Handling', () => {
    it('shows new record celebration when first quiz completed', async () => {
      const session = createMockSession();
      setupMocks(session);

      // First quiz - no previous records
      const { loadRecords } = require('@/lib/storage');
      loadRecords.mockReturnValue({});

      render(<ResultsPage />);

      // First quiz with no previous records should show new record
      await waitFor(() => {
        expect(screen.getByText('🎉 New Record!')).toBeInTheDocument();
      });
    });

    it('saves records to localStorage when new record achieved', async () => {
      const session = createMockSession();
      setupMocks(session);

      const { loadRecords, saveRecords } = require('@/lib/storage');
      loadRecords.mockReturnValue({});

      render(<ResultsPage />);

      await waitFor(() => {
        expect(saveRecords).toHaveBeenCalled();
      });
    });
  });

  describe('Loading State', () => {
    it('shows loading state when session is not available', () => {
      setupMocks(null);
      // Prevent immediate redirect for this test
      (useRouter as jest.Mock).mockReturnValue({
        push: jest.fn(),
      });

      render(<ResultsPage />);

      // The loading text or redirect will occur
      // Since no session, it shows loading then redirects
      expect(screen.getByText('Loading results...')).toBeInTheDocument();
    });
  });
});
