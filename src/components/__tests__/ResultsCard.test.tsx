/**
 * @jest-environment jsdom
 */
import type { WordItem } from '@/lib/types';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';

// Mock useConfetti hook - must be before component import
const mockFireBurst = jest.fn();
jest.mock('@/hooks/useConfetti', () => ({
  useConfetti: () => ({
    fireConfetti: jest.fn(),
    fireBurst: mockFireBurst,
    fireCannon: jest.fn(),
    isReducedMotion: () => false,
  }),
}));

// Import component after the mock
import { ResultsCard } from '../ResultsCard';

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

describe('ResultsCard', () => {
  const mockWords: WordItem[] = [
    { id: '1', prompt: 'hello', answer: 'hei', attempts: 1, firstTryFailed: false, resolved: true },
    { id: '2', prompt: 'dog', answer: 'koira', attempts: 2, firstTryFailed: true, resolved: true },
    { id: '3', prompt: 'cat', answer: 'kissa', attempts: 1, firstTryFailed: false, resolved: true },
    { id: '4', prompt: 'house', answer: 'talo', attempts: 3, firstTryFailed: true, resolved: true },
  ];

  const wordsNotFirstTry = mockWords.filter((w) => w.firstTryFailed);

  const defaultProps = {
    totalWords: 4,
    totalTries: 7,
    totalTimeMs: 45000, // 45 seconds
    wordsNotFirstTry: wordsNotFirstTry,
    previousRecords: null,
    isNewTriesRecord: false,
    isNewTimeRecord: false,
    onRestart: jest.fn(),
    onNewList: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Render', () => {
    it('renders the title', () => {
      render(<ResultsCard {...defaultProps} />);
      expect(screen.getByText('Quiz Complete!')).toBeInTheDocument();
    });

    it('renders congratulations message', () => {
      render(<ResultsCard {...defaultProps} />);
      expect(screen.getByText('Congratulations!')).toBeInTheDocument();
    });

    it('displays total words count', () => {
      render(<ResultsCard {...defaultProps} />);
      expect(screen.getByText('Total words')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
    });

    it('displays total tries count', () => {
      render(<ResultsCard {...defaultProps} />);
      expect(screen.getByText('Total attempts')).toBeInTheDocument();
      expect(screen.getByText('7')).toBeInTheDocument();
    });

    it('displays total time formatted as MM:SS', () => {
      render(<ResultsCard {...defaultProps} />);
      expect(screen.getByText('Total time')).toBeInTheDocument();
      expect(screen.getByText('00:45')).toBeInTheDocument();
    });

    it('formats longer times correctly', () => {
      render(<ResultsCard {...defaultProps} totalTimeMs={125000} />);
      // 125 seconds = 2 minutes 5 seconds
      expect(screen.getByText('02:05')).toBeInTheDocument();
    });
  });

  describe('Words That Needed Practice', () => {
    it('displays words that needed practice', () => {
      render(<ResultsCard {...defaultProps} />);
      expect(screen.getByText('Words that needed practice:')).toBeInTheDocument();
      expect(screen.getByText('dog')).toBeInTheDocument();
      expect(screen.getByText('koira')).toBeInTheDocument();
      expect(screen.getByText('house')).toBeInTheDocument();
      expect(screen.getByText('talo')).toBeInTheDocument();
    });

    it('shows "no mistakes" message when all words were correct first try', () => {
      render(<ResultsCard {...defaultProps} wordsNotFirstTry={[]} />);
      expect(
        screen.getByText('Perfect! You got all words right on the first try!'),
      ).toBeInTheDocument();
    });
  });

  describe('New Record Celebration', () => {
    it('does not show new record when no records achieved', () => {
      render(<ResultsCard {...defaultProps} />);
      expect(screen.queryByText('🎉 New Record!')).not.toBeInTheDocument();
    });

    it('shows new record celebration for tries', () => {
      render(<ResultsCard {...defaultProps} isNewTriesRecord={true} />);
      expect(screen.getByText('🎉 New Record!')).toBeInTheDocument();
      expect(screen.getByText('New best: Fewer attempts!')).toBeInTheDocument();
    });

    it('shows new record celebration for time', () => {
      render(<ResultsCard {...defaultProps} isNewTimeRecord={true} />);
      expect(screen.getByText('🎉 New Record!')).toBeInTheDocument();
      expect(screen.getByText('New best: Faster time!')).toBeInTheDocument();
    });

    it('shows both record messages when both achieved', () => {
      render(<ResultsCard {...defaultProps} isNewTriesRecord={true} isNewTimeRecord={true} />);
      expect(screen.getByText('🎉 New Record!')).toBeInTheDocument();
      expect(screen.getByText('New best: Fewer attempts!')).toBeInTheDocument();
      expect(screen.getByText('New best: Faster time!')).toBeInTheDocument();
    });

    it('renders trophy icons when record is achieved', () => {
      render(<ResultsCard {...defaultProps} isNewTriesRecord={true} />);
      const trophyIcons = screen.getAllByTestId('trophy-icon');
      expect(trophyIcons.length).toBe(2); // Two trophy icons on either side
    });
  });

  describe('Previous Records Display', () => {
    it('shows previous best tries when records exist', () => {
      render(
        <ResultsCard
          {...defaultProps}
          previousRecords={{ bestTries: 10, bestTimeMs: 60000, updatedAt: Date.now() }}
        />,
      );
      expect(screen.getByText('Previous best: 10')).toBeInTheDocument();
    });

    it('shows previous best time when records exist', () => {
      render(
        <ResultsCard
          {...defaultProps}
          previousRecords={{ bestTries: 10, bestTimeMs: 60000, updatedAt: Date.now() }}
        />,
      );
      expect(screen.getByText('Previous best: 01:00')).toBeInTheDocument();
    });

    it('does not show previous best when no records exist', () => {
      render(<ResultsCard {...defaultProps} previousRecords={null} />);
      expect(screen.queryByText(/Previous best:/)).not.toBeInTheDocument();
    });
  });

  describe('Motivation Messages', () => {
    it('shows motivation for both records', () => {
      render(<ResultsCard {...defaultProps} isNewTriesRecord={true} isNewTimeRecord={true} />);
      expect(screen.getByText("Amazing! You're getting better and better!")).toBeInTheDocument();
    });

    it('shows motivation for tries record only', () => {
      render(<ResultsCard {...defaultProps} isNewTriesRecord={true} />);
      expect(
        screen.getByText('Great job! Can you solve them all on the first try next time?'),
      ).toBeInTheDocument();
    });

    it('shows motivation for time record only', () => {
      render(<ResultsCard {...defaultProps} isNewTimeRecord={true} />);
      expect(screen.getByText('Nice! Want to try even faster?')).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('renders restart button', () => {
      render(<ResultsCard {...defaultProps} />);
      expect(screen.getByRole('button', { name: 'Restart Quiz' })).toBeInTheDocument();
    });

    it('renders new word list button', () => {
      render(<ResultsCard {...defaultProps} />);
      expect(screen.getByRole('button', { name: 'New Word List' })).toBeInTheDocument();
    });

    it('calls onRestart when restart button is clicked', () => {
      const onRestart = jest.fn();
      render(<ResultsCard {...defaultProps} onRestart={onRestart} />);

      fireEvent.click(screen.getByRole('button', { name: 'Restart Quiz' }));
      expect(onRestart).toHaveBeenCalledTimes(1);
    });

    it('calls onNewList when new list button is clicked', () => {
      const onNewList = jest.fn();
      render(<ResultsCard {...defaultProps} onNewList={onNewList} />);

      fireEvent.click(screen.getByRole('button', { name: 'New Word List' }));
      expect(onNewList).toHaveBeenCalledTimes(1);
    });
  });

  describe('Custom className', () => {
    it('applies custom className to the card', () => {
      const { container } = render(<ResultsCard {...defaultProps} className="custom-class" />);
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Edge Cases', () => {
    it('handles zero time correctly', () => {
      render(<ResultsCard {...defaultProps} totalTimeMs={0} />);
      expect(screen.getByText('00:00')).toBeInTheDocument();
    });

    it('handles single word correctly', () => {
      render(<ResultsCard {...defaultProps} totalWords={1} totalTries={2} />);
      // Check that single word count is displayed
      const allOnes = screen.getAllByText('1');
      expect(allOnes.length).toBe(1); // Only totalWords is 1
    });

    it('handles very long time correctly', () => {
      // 1 hour 30 minutes 15 seconds = 5415000ms
      render(<ResultsCard {...defaultProps} totalTimeMs={5415000} />);
      expect(screen.getByText('90:15')).toBeInTheDocument();
    });

    it('handles empty words not first try array', () => {
      render(<ResultsCard {...defaultProps} wordsNotFirstTry={[]} />);
      expect(
        screen.getByText('Perfect! You got all words right on the first try!'),
      ).toBeInTheDocument();
    });
  });

  describe('Confetti Animation', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      mockFireBurst.mockClear();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('triggers confetti on new tries record', async () => {
      render(<ResultsCard {...defaultProps} isNewTriesRecord={true} />);

      // Advance timer past the 300ms delay
      jest.advanceTimersByTime(500);

      expect(mockFireBurst).toHaveBeenCalledTimes(1);
    });

    it('triggers confetti on new time record', async () => {
      render(<ResultsCard {...defaultProps} isNewTimeRecord={true} />);

      // Advance timer past the 300ms delay
      jest.advanceTimersByTime(500);

      expect(mockFireBurst).toHaveBeenCalledTimes(1);
    });

    it('triggers confetti on both new records', async () => {
      render(<ResultsCard {...defaultProps} isNewTriesRecord={true} isNewTimeRecord={true} />);

      // Advance timer past the 300ms delay
      jest.advanceTimersByTime(500);

      // Should only fire once even with both records
      expect(mockFireBurst).toHaveBeenCalledTimes(1);
    });

    it('does not trigger confetti when no new record', async () => {
      render(<ResultsCard {...defaultProps} isNewTriesRecord={false} isNewTimeRecord={false} />);

      // Advance timer
      jest.advanceTimersByTime(500);

      expect(mockFireBurst).not.toHaveBeenCalled();
    });

    it('only triggers confetti once on re-render', async () => {
      const { rerender } = render(<ResultsCard {...defaultProps} isNewTriesRecord={true} />);

      jest.advanceTimersByTime(500);
      expect(mockFireBurst).toHaveBeenCalledTimes(1);

      // Re-render the component
      rerender(<ResultsCard {...defaultProps} isNewTriesRecord={true} />);

      jest.advanceTimersByTime(500);
      // Should still be only 1 call
      expect(mockFireBurst).toHaveBeenCalledTimes(1);
    });
  });
});
