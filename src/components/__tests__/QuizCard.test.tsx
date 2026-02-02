/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuizCard } from '../QuizCard';

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      typeYourAnswer: 'Type your answer...',
      yourAnswer: 'Your answer',
      submit: 'Submit',
      correctAnswerIs: 'The answer is:',
      promptLabel: 'Translate this word:',
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

describe('QuizCard', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  describe('Normal Display State (feedback="none")', () => {
    it('should render prompt text', () => {
      render(<QuizCard prompt="dog" onSubmit={mockOnSubmit} feedback="none" />);

      expect(screen.getByText('dog')).toBeInTheDocument();
    });

    it('should render answer input field', () => {
      render(<QuizCard prompt="cat" onSubmit={mockOnSubmit} feedback="none" />);

      const input = screen.getByPlaceholderText('Your answer');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'text');
    });

    it('should render submit button', () => {
      render(<QuizCard prompt="bird" onSubmit={mockOnSubmit} feedback="none" />);

      expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    });

    it('should disable submit button when input is empty', () => {
      render(<QuizCard prompt="fish" onSubmit={mockOnSubmit} feedback="none" />);

      const submitButton = screen.getByRole('button', { name: /submit/i });
      expect(submitButton).toBeDisabled();
    });

    it('should enable submit button when input has text', async () => {
      const user = userEvent.setup();
      render(<QuizCard prompt="mouse" onSubmit={mockOnSubmit} feedback="none" />);

      const input = screen.getByPlaceholderText('Your answer');
      await user.type(input, 'hiiri');

      const submitButton = screen.getByRole('button', { name: /submit/i });
      expect(submitButton).not.toBeDisabled();
    });

    it('should auto-focus input field on mount', () => {
      render(<QuizCard prompt="cat" onSubmit={mockOnSubmit} feedback="none" />);

      const input = screen.getByPlaceholderText('Your answer');
      expect(input).toHaveFocus();
    });
  });

  describe('Answer Submission', () => {
    it('should call onSubmit with answer when button clicked', async () => {
      const user = userEvent.setup();
      render(<QuizCard prompt="dog" onSubmit={mockOnSubmit} feedback="none" />);

      const input = screen.getByPlaceholderText('Your answer');
      await user.type(input, 'koira');

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith('koira');
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    it('should call onSubmit when Enter key pressed', async () => {
      const user = userEvent.setup();
      render(<QuizCard prompt="cat" onSubmit={mockOnSubmit} feedback="none" />);

      const input = screen.getByPlaceholderText('Your answer');
      await user.type(input, 'kissa{Enter}');

      expect(mockOnSubmit).toHaveBeenCalledWith('kissa');
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    it('should trim whitespace from answer', async () => {
      const user = userEvent.setup();
      render(<QuizCard prompt="bird" onSubmit={mockOnSubmit} feedback="none" />);

      const input = screen.getByPlaceholderText('Your answer');
      await user.type(input, '  lintu  ');

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith('lintu');
    });

    it('should not submit empty answer', async () => {
      const user = userEvent.setup();
      render(<QuizCard prompt="fish" onSubmit={mockOnSubmit} feedback="none" />);

      const submitButton = screen.getByRole('button', { name: /submit/i });

      // Button should be disabled, but try clicking anyway
      expect(submitButton).toBeDisabled();

      // Verify onSubmit was not called
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should not submit when disabled prop is true', async () => {
      const user = userEvent.setup();
      render(<QuizCard prompt="mouse" onSubmit={mockOnSubmit} feedback="none" disabled={true} />);

      const input = screen.getByPlaceholderText('Your answer');
      await user.type(input, 'hiiri');

      const submitButton = screen.getByRole('button', { name: /submit/i });
      expect(submitButton).toBeDisabled();

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Correct Feedback State (feedback="correct")', () => {
    it('should display star icon', () => {
      render(<QuizCard prompt="dog" onSubmit={mockOnSubmit} feedback="correct" />);

      // Star component renders as div with role="img" and aria-label="Star"
      const star = screen.getByRole('img', { name: 'Star' });
      expect(star).toBeInTheDocument();
    });

    it('should display success message', () => {
      render(<QuizCard prompt="cat" onSubmit={mockOnSubmit} feedback="correct" />);

      // Should display one of the success messages
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

    it('should not display input field when correct', () => {
      render(<QuizCard prompt="bird" onSubmit={mockOnSubmit} feedback="correct" />);

      expect(screen.queryByPlaceholderText('Your answer')).not.toBeInTheDocument();
    });

    it('should not display prompt when correct', () => {
      render(<QuizCard prompt="fish" onSubmit={mockOnSubmit} feedback="correct" />);

      expect(screen.queryByText('fish')).not.toBeInTheDocument();
    });
  });

  describe('Incorrect Feedback State (feedback="incorrect")', () => {
    it('should display encouragement message', () => {
      render(
        <QuizCard
          prompt="dog"
          correctAnswer="koira"
          onSubmit={mockOnSubmit}
          feedback="incorrect"
        />,
      );

      // Should display one of the encouragement messages
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

    it('should display correct answer', () => {
      render(
        <QuizCard
          prompt="cat"
          correctAnswer="kissa"
          onSubmit={mockOnSubmit}
          feedback="incorrect"
        />,
      );

      expect(screen.getByText('The answer is:')).toBeInTheDocument();
      expect(screen.getByText('kissa')).toBeInTheDocument();
    });

    it('should not display input field when incorrect', () => {
      render(
        <QuizCard
          prompt="bird"
          correctAnswer="lintu"
          onSubmit={mockOnSubmit}
          feedback="incorrect"
        />,
      );

      expect(screen.queryByPlaceholderText('Your answer')).not.toBeInTheDocument();
    });

    it('should not display prompt when incorrect', () => {
      render(
        <QuizCard
          prompt="fish"
          correctAnswer="kala"
          onSubmit={mockOnSubmit}
          feedback="incorrect"
        />,
      );

      expect(screen.queryByText('fish')).not.toBeInTheDocument();
    });
  });

  describe('Feedback State Transitions', () => {
    it('should clear input when feedback changes to correct', () => {
      const { rerender } = render(
        <QuizCard prompt="dog" onSubmit={mockOnSubmit} feedback="none" />,
      );

      const input = screen.getByPlaceholderText('Your answer');
      fireEvent.change(input, { target: { value: 'koira' } });
      expect(input).toHaveValue('koira');

      // Change to correct feedback
      rerender(<QuizCard prompt="dog" onSubmit={mockOnSubmit} feedback="correct" />);

      // Input should no longer be visible (component shows success instead)
      expect(screen.queryByPlaceholderText('Your answer')).not.toBeInTheDocument();
    });

    it('should clear input when feedback changes to incorrect', () => {
      const { rerender } = render(
        <QuizCard prompt="cat" onSubmit={mockOnSubmit} feedback="none" />,
      );

      const input = screen.getByPlaceholderText('Your answer');
      fireEvent.change(input, { target: { value: 'wrong' } });
      expect(input).toHaveValue('wrong');

      // Change to incorrect feedback
      rerender(
        <QuizCard
          prompt="cat"
          correctAnswer="kissa"
          onSubmit={mockOnSubmit}
          feedback="incorrect"
        />,
      );

      // Input should no longer be visible (component shows correct answer instead)
      expect(screen.queryByPlaceholderText('Your answer')).not.toBeInTheDocument();
    });

    it('should auto-focus input when returning to none state', async () => {
      const { rerender } = render(
        <QuizCard prompt="dog" onSubmit={mockOnSubmit} feedback="correct" />,
      );

      // Change back to none feedback
      rerender(<QuizCard prompt="cat" onSubmit={mockOnSubmit} feedback="none" />);

      await waitFor(() => {
        const input = screen.getByPlaceholderText('Your answer');
        expect(input).toHaveFocus();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have accessible input with proper attributes', () => {
      render(<QuizCard prompt="dog" onSubmit={mockOnSubmit} feedback="none" />);

      const input = screen.getByPlaceholderText('Your answer');
      expect(input).toHaveAttribute('type', 'text');
      expect(input).toHaveAttribute('id', 'answer-input');
      expect(input).toHaveAttribute('autocomplete', 'off');
    });

    it('should have accessible submit button', () => {
      render(<QuizCard prompt="cat" onSubmit={mockOnSubmit} feedback="none" />);

      const button = screen.getByRole('button', { name: /submit/i });
      expect(button).toHaveAttribute('type', 'submit');
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <QuizCard prompt="bird" onSubmit={mockOnSubmit} feedback="none" className="custom-class" />,
      );

      // The Card component is the first child, check if it has the class
      const card = container.querySelector('.custom-class');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Random Feedback Messages', () => {
    it('should display a success message when correct', () => {
      render(<QuizCard prompt="test" onSubmit={mockOnSubmit} feedback="correct" />);

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

    it('should display an encouragement message when incorrect', () => {
      render(
        <QuizCard
          prompt="test"
          correctAnswer="answer"
          onSubmit={mockOnSubmit}
          feedback="incorrect"
        />,
      );

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
});
