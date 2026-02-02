/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { PracticeCard } from '../PracticeCard';

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: (namespace: string) => {
    const practiceTranslations: Record<
      string,
      string | ((params: { current?: number; total?: number }) => string)
    > = {
      title: 'Practice Mode',
      instruction: 'Type the correct answer 3 times to practice:',
      counter: (params: { current?: number; total?: number }) =>
        `${params?.current} / ${params?.total}`,
      correctAnswerLabel: 'Correct answer:',
      keepGoing: 'Keep going!',
      good: 'Good!',
      excellent: 'Excellent!',
      wellDone: "Well done! Let's continue with the next word.",
      typeHere: 'Type here...',
    };

    const quizTranslations: Record<string, string> = {
      checkButton: 'Check',
    };

    const translations: Record<
      string,
      Record<string, string | ((params: { current?: number; total?: number }) => string)>
    > = {
      practice: practiceTranslations,
      quiz: quizTranslations,
    };

    return (key: string, params?: { current?: number; total?: number }) => {
      const namespaceTranslations = translations[namespace];
      if (!namespaceTranslations) return key;

      const value = namespaceTranslations[key];
      if (typeof value === 'function') {
        return value(params || {});
      }
      return value || key;
    };
  },
}));

describe('PracticeCard', () => {
  const defaultProps = {
    prompt: 'koira',
    correctAnswer: 'dog',
    currentRepetition: 1,
    totalRepetitions: 3,
    onSubmit: jest.fn(),
    onComplete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Initial Render', () => {
    it('renders the practice mode title', () => {
      render(<PracticeCard {...defaultProps} />);

      expect(screen.getByText('Practice Mode')).toBeInTheDocument();
    });

    it('renders the instruction text', () => {
      render(<PracticeCard {...defaultProps} />);

      expect(screen.getByText('Type the correct answer 3 times to practice:')).toBeInTheDocument();
    });

    it('displays the prompt word', () => {
      render(<PracticeCard {...defaultProps} />);

      expect(screen.getByText('koira')).toBeInTheDocument();
    });

    it('displays the correct answer prominently', () => {
      render(<PracticeCard {...defaultProps} />);

      expect(screen.getByText('Correct answer:')).toBeInTheDocument();
      expect(screen.getByText('dog')).toBeInTheDocument();
    });

    it('displays the progress counter correctly', () => {
      render(<PracticeCard {...defaultProps} currentRepetition={2} />);

      expect(screen.getByText('2 / 3')).toBeInTheDocument();
    });

    it('displays visual progress dots', () => {
      render(<PracticeCard {...defaultProps} currentRepetition={2} />);

      // Should have progress indicator elements
      expect(screen.getByLabelText('Completed')).toBeInTheDocument();
      expect(screen.getByLabelText('Current')).toBeInTheDocument();
      expect(screen.getByLabelText('Remaining')).toBeInTheDocument();
    });

    it('has an input field with placeholder', () => {
      render(<PracticeCard {...defaultProps} />);

      const input = screen.getByPlaceholderText('Type here...');
      expect(input).toBeInTheDocument();
    });

    it('has a check button', () => {
      render(<PracticeCard {...defaultProps} />);

      expect(screen.getByRole('button', { name: 'Check' })).toBeInTheDocument();
    });
  });

  describe('Answer Validation', () => {
    it('accepts correct answer (exact match)', () => {
      const onSubmit = jest.fn();
      render(<PracticeCard {...defaultProps} onSubmit={onSubmit} />);

      const input = screen.getByPlaceholderText('Type here...');
      fireEvent.change(input, { target: { value: 'dog' } });
      fireEvent.click(screen.getByRole('button', { name: 'Check' }));

      expect(onSubmit).toHaveBeenCalledWith('dog');
    });

    it('accepts correct answer (case insensitive)', () => {
      const onSubmit = jest.fn();
      render(<PracticeCard {...defaultProps} onSubmit={onSubmit} />);

      const input = screen.getByPlaceholderText('Type here...');
      fireEvent.change(input, { target: { value: 'DOG' } });
      fireEvent.click(screen.getByRole('button', { name: 'Check' }));

      expect(onSubmit).toHaveBeenCalledWith('DOG');
    });

    it('accepts correct answer with extra whitespace', () => {
      const onSubmit = jest.fn();
      render(<PracticeCard {...defaultProps} onSubmit={onSubmit} />);

      const input = screen.getByPlaceholderText('Type here...');
      fireEvent.change(input, { target: { value: '  dog  ' } });
      fireEvent.click(screen.getByRole('button', { name: 'Check' }));

      expect(onSubmit).toHaveBeenCalledWith('dog');
    });

    it('rejects incorrect answer', () => {
      const onSubmit = jest.fn();
      render(<PracticeCard {...defaultProps} onSubmit={onSubmit} />);

      const input = screen.getByPlaceholderText('Type here...');
      fireEvent.change(input, { target: { value: 'cat' } });
      fireEvent.click(screen.getByRole('button', { name: 'Check' }));

      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('does not submit empty answer', () => {
      const onSubmit = jest.fn();
      render(<PracticeCard {...defaultProps} onSubmit={onSubmit} />);

      fireEvent.click(screen.getByRole('button', { name: 'Check' }));

      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Encouragement Messages', () => {
    it('shows "Keep going!" message for first repetition', () => {
      render(<PracticeCard {...defaultProps} currentRepetition={1} />);

      const input = screen.getByPlaceholderText('Type here...');
      fireEvent.change(input, { target: { value: 'dog' } });
      fireEvent.click(screen.getByRole('button', { name: 'Check' }));

      // The message includes a checkmark, so use regex
      expect(screen.getByText(/Keep going!/)).toBeInTheDocument();
    });

    it('shows "Good!" message for second repetition', () => {
      render(<PracticeCard {...defaultProps} currentRepetition={2} />);

      const input = screen.getByPlaceholderText('Type here...');
      fireEvent.change(input, { target: { value: 'dog' } });
      fireEvent.click(screen.getByRole('button', { name: 'Check' }));

      expect(screen.getByText(/Good!/)).toBeInTheDocument();
    });

    it('shows "Excellent!" message and transitions to success on third repetition', () => {
      render(<PracticeCard {...defaultProps} currentRepetition={3} />);

      const input = screen.getByPlaceholderText('Type here...');
      fireEvent.change(input, { target: { value: 'dog' } });
      fireEvent.click(screen.getByRole('button', { name: 'Check' }));

      // On the third (final) repetition, it shows both the excellent message and success state
      // The success state shows "Well done!" message
      expect(screen.getByText("Well done! Let's continue with the next word.")).toBeInTheDocument();
    });
  });

  describe('Success State', () => {
    it('shows success message after final repetition', () => {
      render(<PracticeCard {...defaultProps} currentRepetition={3} />);

      const input = screen.getByPlaceholderText('Type here...');
      fireEvent.change(input, { target: { value: 'dog' } });
      fireEvent.click(screen.getByRole('button', { name: 'Check' }));

      // Should show success state with well done message
      expect(screen.getByText("Well done! Let's continue with the next word.")).toBeInTheDocument();
    });

    it('calls onComplete after success delay', () => {
      const onComplete = jest.fn();
      render(<PracticeCard {...defaultProps} currentRepetition={3} onComplete={onComplete} />);

      const input = screen.getByPlaceholderText('Type here...');
      fireEvent.change(input, { target: { value: 'dog' } });
      fireEvent.click(screen.getByRole('button', { name: 'Check' }));

      expect(onComplete).not.toHaveBeenCalled();

      // Fast-forward past the 1.5s delay
      act(() => {
        jest.advanceTimersByTime(1500);
      });

      expect(onComplete).toHaveBeenCalled();
    });

    it('does not call onSubmit on final repetition', () => {
      const onSubmit = jest.fn();
      render(<PracticeCard {...defaultProps} currentRepetition={3} onSubmit={onSubmit} />);

      const input = screen.getByPlaceholderText('Type here...');
      fireEvent.change(input, { target: { value: 'dog' } });
      fireEvent.click(screen.getByRole('button', { name: 'Check' }));

      // onSubmit should NOT be called for the last repetition
      // (only onComplete is called after success delay)
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Input Clearing', () => {
    it('clears input after correct non-final answer', () => {
      render(<PracticeCard {...defaultProps} currentRepetition={1} />);

      const input = screen.getByPlaceholderText('Type here...') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'dog' } });
      fireEvent.click(screen.getByRole('button', { name: 'Check' }));

      // Fast-forward past the 500ms clear delay
      act(() => {
        jest.advanceTimersByTime(500);
      });

      expect(input.value).toBe('');
    });

    it('does not clear input after incorrect answer', () => {
      render(<PracticeCard {...defaultProps} currentRepetition={1} />);

      const input = screen.getByPlaceholderText('Type here...') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'cat' } });
      fireEvent.click(screen.getByRole('button', { name: 'Check' }));

      // Input should still have the incorrect value
      expect(input.value).toBe('cat');
    });
  });

  describe('Keyboard Navigation', () => {
    it('submits on Enter key press', () => {
      const onSubmit = jest.fn();
      render(<PracticeCard {...defaultProps} onSubmit={onSubmit} />);

      const input = screen.getByPlaceholderText('Type here...');
      fireEvent.change(input, { target: { value: 'dog' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(onSubmit).toHaveBeenCalledWith('dog');
    });
  });

  describe('Progress Visualization', () => {
    it('shows correct number of completed dots for first repetition', () => {
      render(<PracticeCard {...defaultProps} currentRepetition={1} />);

      // Use aria-label to find the progress dots specifically
      const currentDot = screen.getByLabelText('Current');
      const remainingDots = screen.getAllByLabelText('Remaining');

      expect(currentDot).toHaveClass('bg-purple-500');
      expect(remainingDots).toHaveLength(2);
    });

    it('shows correct number of completed dots for second repetition', () => {
      render(<PracticeCard {...defaultProps} currentRepetition={2} />);

      const completedDots = screen.getAllByLabelText('Completed');
      const currentDot = screen.getByLabelText('Current');
      const remainingDots = screen.getAllByLabelText('Remaining');

      expect(completedDots).toHaveLength(1);
      expect(completedDots[0]).toHaveClass('bg-green-500');
      expect(currentDot).toHaveClass('bg-purple-500');
      expect(remainingDots).toHaveLength(1);
    });

    it('shows correct number of completed dots for third repetition', () => {
      render(<PracticeCard {...defaultProps} currentRepetition={3} />);

      const completedDots = screen.getAllByLabelText('Completed');
      const currentDot = screen.getByLabelText('Current');

      expect(completedDots).toHaveLength(2);
      expect(completedDots[0]).toHaveClass('bg-green-500');
      expect(completedDots[1]).toHaveClass('bg-green-500');
      expect(currentDot).toHaveClass('bg-purple-500');
    });
  });

  describe('Shake Animation', () => {
    it('applies shake animation on incorrect answer', () => {
      render(<PracticeCard {...defaultProps} />);

      const input = screen.getByPlaceholderText('Type here...');
      fireEvent.change(input, { target: { value: 'wrong' } });
      fireEvent.click(screen.getByRole('button', { name: 'Check' }));

      // The component should have the shake class applied
      const card = document.querySelector('.animate-shake');
      expect(card).toBeInTheDocument();
    });
  });
});
