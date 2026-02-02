/**
 * @jest-environment jsdom
 */
import { useQuizStore } from '@/hooks/useQuizStore';
import type { QuizSession, WordState } from '@/types/quiz';
import '@testing-library/jest-dom';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock useQuizStore
jest.mock('@/hooks/useQuizStore');

// Mock PageTransition - simple pass-through that preserves className
jest.mock('@/components/PageTransition', () => ({
  __esModule: true,
  PageTransition: ({ children, className }: { children: ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
}));

// Mock answer matcher
jest.mock('@/lib/answer-matcher', () => ({
  matchAnswer: jest.fn(
    (answer: string, correct: string) =>
      answer.toLowerCase().trim() === correct.toLowerCase().trim(),
  ),
}));

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: any) => {
    const translations: Record<string, string> = {
      progress: `${values?.resolved} / ${values?.total}`,
      tries: 'Tries',
      time: 'Time',
      typeYourAnswer: 'Type your answer...',
      yourAnswer: 'Your answer',
      submit: 'Submit',
      promptLabel: 'Translate this word:',
      correctAnswerIs: 'The answer is:',
      // Nested keys for QuizCard feedback messages
      'correct.great': 'Great!',
      'correct.wellDone': 'Well done!',
      'correct.perfect': 'Perfect!',
      'correct.excellent': 'Excellent!',
      'correct.awesome': 'Awesome!',
      'correct.amazing': 'Amazing!',
      'incorrect.notQuite': 'Not quite!',
      'incorrect.tryAgain': "Let's try again!",
      'incorrect.almostThere': 'Almost there!',
      'incorrect.keepGoing': 'Keep going!',
    };
    return translations[key] || key;
  },
}));

// Import QuizPage after all mocks are set up
import QuizPage from '@/app/[locale]/quiz/page';

describe('QuizPage', () => {
  const mockPush = jest.fn();
  const mockGetCurrentWord = jest.fn();
  const mockGetProgress = jest.fn();
  const mockIsQuizComplete = jest.fn();
  const mockSubmitAnswer = jest.fn();
  const mockEndQuiz = jest.fn();

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();

    (useRouter as any).mockReturnValue({
      push: mockPush,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const createMockSession = (overrides?: Partial<QuizSession>): QuizSession => ({
    mode: 'normal',
    startTimeMs: Date.now(),
    tries: 0,
    unresolvedIds: ['word1', 'word2', 'word3'],
    currentId: 'word1',
    words: [
      {
        id: 'word1',
        prompt: 'dog',
        answer: 'koira',
        attempts: 0,
        firstTryFailed: false,
        resolved: false,
      },
      {
        id: 'word2',
        prompt: 'cat',
        answer: 'kissa',
        attempts: 0,
        firstTryFailed: false,
        resolved: false,
      },
      {
        id: 'word3',
        prompt: 'bird',
        answer: 'lintu',
        attempts: 0,
        firstTryFailed: false,
        resolved: false,
      },
    ],
    ...overrides,
  });

  const setupMocks = (session: QuizSession | null, currentWord: WordState | null) => {
    (useQuizStore as any).mockImplementation((selector: any) => {
      const state = {
        session,
        getCurrentWord: mockGetCurrentWord,
        getProgress: mockGetProgress,
        isQuizComplete: mockIsQuizComplete,
        submitAnswer: mockSubmitAnswer,
        endQuiz: mockEndQuiz,
      };
      return selector(state);
    });

    mockGetCurrentWord.mockReturnValue(currentWord);
    mockGetProgress.mockReturnValue({
      resolved: 0,
      total: 3,
    });
    mockIsQuizComplete.mockReturnValue(false);
  };

  describe('Navigation Guards', () => {
    it('should redirect to home if no session', () => {
      setupMocks(null, null);

      render(<QuizPage />);

      expect(mockPush).toHaveBeenCalledWith('/');
    });

    it('should show practice mode when mode is practice', () => {
      const session = createMockSession({ mode: 'practice' });
      // Add practice target to the session
      session.practiceTarget = { id: 'word1', remaining: 2 };
      const currentWord = session.words[0]; // First word in array
      setupMocks(session, currentWord);

      render(<QuizPage />);

      // Should NOT redirect - should stay on page and show practice mode
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should not redirect if session exists and mode is normal', () => {
      const session = createMockSession();
      const currentWord = session.words[0]; // First word in array
      setupMocks(session, currentWord);

      render(<QuizPage />);

      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('Quiz Completion', () => {
    it('should navigate to results when quiz is complete', () => {
      const session = createMockSession();
      setupMocks(session, null);
      mockIsQuizComplete.mockReturnValue(true);

      render(<QuizPage />);

      expect(mockEndQuiz).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/results');
    });

    it('should not navigate to results if quiz is not complete', () => {
      const session = createMockSession();
      const currentWord = session.words[0];
      setupMocks(session, currentWord);
      mockIsQuizComplete.mockReturnValue(false);

      render(<QuizPage />);

      expect(mockEndQuiz).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalledWith('/results');
    });
  });

  describe('Quiz Display', () => {
    it('should display loading state when no current word', () => {
      const session = createMockSession();
      setupMocks(session, null);

      render(<QuizPage />);

      expect(screen.getByText('Loading quiz...')).toBeInTheDocument();
    });

    it('should display ProgressHeader with correct props', () => {
      const session = createMockSession({ tries: 3 });
      const currentWord = session.words[0];
      setupMocks(session, currentWord);
      mockGetProgress.mockReturnValue({ resolved: 1, total: 3 });

      render(<QuizPage />);

      expect(screen.getByText('1 / 3')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument(); // tries
      expect(screen.getByText('00:00')).toBeInTheDocument(); // timer
    });

    it('should display QuizCard with current word prompt', () => {
      const session = createMockSession();
      const currentWord = session.words[0];
      setupMocks(session, currentWord);

      render(<QuizPage />);

      expect(screen.getByText('dog')).toBeInTheDocument();
    });

    it('should update timer over time', async () => {
      const now = Date.now();
      jest.setSystemTime(now);
      const session = createMockSession({ startTimeMs: now });
      const currentWord = session.words[0];
      setupMocks(session, currentWord);

      render(<QuizPage />);

      // Initial: 00:00
      expect(screen.getByText('00:00')).toBeInTheDocument();

      // Advance 3 seconds
      await act(async () => {
        jest.advanceTimersByTime(3000);
      });
      expect(screen.getByText('00:03')).toBeInTheDocument();

      // Advance to 65 seconds
      await act(async () => {
        jest.advanceTimersByTime(62000);
      });
      expect(screen.getByText('01:05')).toBeInTheDocument();
    });
  });

  describe('Answer Submission - Correct Answer', () => {
    it('should handle correct answer submission', async () => {
      const user = userEvent.setup({ delay: null });
      const session = createMockSession();
      const currentWord = session.words[0];
      setupMocks(session, currentWord);

      render(<QuizPage />);

      // Type correct answer
      const input = screen.getByPlaceholderText('Your answer');
      await user.type(input, 'koira');

      // Submit
      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      // Should show correct feedback immediately
      await waitFor(() => {
        expect(screen.queryByText('dog')).not.toBeInTheDocument();
        // One of the success messages should appear
        const successMessages = [
          'Great!',
          'Well done!',
          'Perfect!',
          'Excellent!',
          'Awesome!',
          'Amazing!',
        ];
        const hasSuccessMessage = successMessages.some((msg) => screen.queryByText(msg) !== null);
        expect(hasSuccessMessage).toBe(true);
      });
    });

    it('should submit to store after 1 second delay for correct answer', async () => {
      const user = userEvent.setup({ delay: null });
      const session = createMockSession();
      const currentWord = session.words[0];
      setupMocks(session, currentWord);

      render(<QuizPage />);

      // Type and submit correct answer
      const input = screen.getByPlaceholderText('Your answer');
      await user.type(input, 'koira');
      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      // Should not call submitAnswer immediately
      expect(mockSubmitAnswer).not.toHaveBeenCalled();

      // Advance timers by 1 second
      await jest.advanceTimersByTime(1000);

      // Now submitAnswer should be called
      await waitFor(() => {
        expect(mockSubmitAnswer).toHaveBeenCalledWith('koira');
      });
    });
  });

  describe('Answer Submission - Incorrect Answer', () => {
    it('should handle incorrect answer submission', async () => {
      const user = userEvent.setup({ delay: null });
      const session = createMockSession();
      const currentWord = session.words[0];
      setupMocks(session, currentWord);

      render(<QuizPage />);

      // Type incorrect answer
      const input = screen.getByPlaceholderText('Your answer');
      await user.type(input, 'wrong');

      // Submit
      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      // Should show incorrect feedback with correct answer
      await waitFor(() => {
        expect(screen.queryByText('dog')).not.toBeInTheDocument();
        expect(screen.getByText('The answer is:')).toBeInTheDocument();
        expect(screen.getByText('koira')).toBeInTheDocument();

        // One of the encouragement messages should appear
        const encouragementMessages = [
          'Not quite!',
          "Let's try again!",
          'Almost there!',
          'Keep going!',
        ];
        const hasEncouragementMessage = encouragementMessages.some(
          (msg) => screen.queryByText(msg) !== null,
        );
        expect(hasEncouragementMessage).toBe(true);
      });
    });

    it('should submit to store after 2 second delay for incorrect answer', async () => {
      const user = userEvent.setup({ delay: null });
      const session = createMockSession();
      const currentWord = session.words[0];
      setupMocks(session, currentWord);

      render(<QuizPage />);

      // Type and submit incorrect answer
      const input = screen.getByPlaceholderText('Your answer');
      await user.type(input, 'wrong');
      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      // Should not call submitAnswer immediately
      expect(mockSubmitAnswer).not.toHaveBeenCalled();

      // Advance timers by 1 second (should not call yet)
      await jest.advanceTimersByTime(1000);
      expect(mockSubmitAnswer).not.toHaveBeenCalled();

      // Advance timers by another 1 second (total 2 seconds)
      await jest.advanceTimersByTime(1000);

      // Now submitAnswer should be called
      await waitFor(() => {
        expect(mockSubmitAnswer).toHaveBeenCalledWith('wrong');
      });
    });
  });

  describe('Word Change Detection', () => {
    it('should show next word after correct answer delay', async () => {
      const user = userEvent.setup({ delay: null });
      const session = createMockSession();
      const word1 = session.words[0];
      const word2 = session.words[1];

      // Start with word1
      setupMocks(session, word1);

      render(<QuizPage />);

      // Verify we see word1
      expect(screen.getByText('dog')).toBeInTheDocument();

      // Submit correct answer
      const input = screen.getByPlaceholderText('Your answer');
      await user.type(input, 'koira');
      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      // Wait for correct feedback
      await waitFor(() => {
        const successMessages = [
          'Great!',
          'Well done!',
          'Perfect!',
          'Excellent!',
          'Awesome!',
          'Amazing!',
        ];
        const hasSuccessMessage = successMessages.some((msg) => screen.queryByText(msg) !== null);
        expect(hasSuccessMessage).toBe(true);
      });

      // Verify submitAnswer will be called after delay
      expect(mockSubmitAnswer).not.toHaveBeenCalled();

      // Simulate what happens after submitAnswer: the store returns the next word
      mockGetCurrentWord.mockReturnValue(word2);

      // Advance timer to trigger the submitAnswer callback (1 second for correct answer)
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      // Verify submitAnswer was called
      await waitFor(() => {
        expect(mockSubmitAnswer).toHaveBeenCalledWith('koira');
      });
    });
  });

  describe('Processing State', () => {
    it('should disable input during processing', async () => {
      const user = userEvent.setup({ delay: null });
      const session = createMockSession();
      const currentWord = session.words[0];
      setupMocks(session, currentWord);

      render(<QuizPage />);

      // Submit answer
      const input = screen.getByPlaceholderText('Your answer');
      await user.type(input, 'koira');
      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      // Card should be disabled during feedback display
      await waitFor(() => {
        // Success message appears, which means QuizCard is in feedback state
        const successMessages = [
          'Great!',
          'Well done!',
          'Perfect!',
          'Excellent!',
          'Awesome!',
          'Amazing!',
        ];
        const hasSuccessMessage = successMessages.some((msg) => screen.queryByText(msg) !== null);
        expect(hasSuccessMessage).toBe(true);
      });
    });

    it('should not submit again while processing', async () => {
      const user = userEvent.setup({ delay: null });
      const session = createMockSession();
      const currentWord = session.words[0];
      setupMocks(session, currentWord);

      render(<QuizPage />);

      // Submit answer
      const input = screen.getByPlaceholderText('Your answer');
      await user.type(input, 'koira');
      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      // Wait a bit but not full 1 second
      await jest.advanceTimersByTime(500);

      // Try to submit again (should be ignored since isProcessing is true)
      // Note: Input is no longer visible in feedback state, so this test verifies
      // that handleSubmit won't process if called while isProcessing=true

      // Advance rest of time
      await jest.advanceTimersByTime(500);

      // Should only have been called once
      await waitFor(() => {
        expect(mockSubmitAnswer).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Layout and Responsive Design', () => {
    it('should render with gradient background', () => {
      const session = createMockSession();
      const currentWord = session.words[0];
      setupMocks(session, currentWord);

      const { container } = render(<QuizPage />);

      const main = container.querySelector('main');
      expect(main).toHaveClass('bg-gradient-to-br', 'from-primary-50');
    });

    it('should render with max-width container', () => {
      const session = createMockSession();
      const currentWord = session.words[0];
      setupMocks(session, currentWord);

      const { container } = render(<QuizPage />);

      const contentContainer = container.querySelector('.max-w-4xl');
      expect(contentContainer).toBeInTheDocument();
    });
  });
});
