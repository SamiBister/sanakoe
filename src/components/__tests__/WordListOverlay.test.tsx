/**
 * @jest-environment jsdom
 */
import type { WordItem } from '@/lib/types';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { WordListOverlay } from '../WordListOverlay';

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: (namespace: string) => {
    const translations: Record<string, Record<string, string | Record<string, string>>> = {
      wordList: {
        button: 'Word List',
        title: 'All Words',
        'status.resolved': 'Resolved',
        'status.unresolved': 'Unresolved',
        'status.mistake': 'Mistake made',
        'filter.all': 'All',
        'filter.unresolved': 'Unresolved',
        'filter.mistakes': 'Mistakes',
        current: '(current)',
        empty: 'No words loaded yet',
        close: 'Close',
      },
      common: {
        close: 'Close',
      },
    };

    return (key: string) => {
      const ns = translations[namespace];
      if (!ns) return key;
      return ns[key] ?? key;
    };
  },
}));

// Mock useQuizStore
const mockSession = {
  words: [] as WordItem[],
  unresolvedIds: [] as string[],
  currentId: null as string | null,
  tries: 0,
  startTimeMs: 0,
  endTimeMs: undefined as number | undefined,
  mode: 'normal' as const,
};

jest.mock('@/hooks/useQuizStore', () => ({
  useQuizStore: jest.fn((selector: (state: { session: typeof mockSession | null }) => unknown) =>
    selector({ session: mockSession }),
  ),
}));

// Mock Modal with Portal
jest.mock('../ui/Modal', () => ({
  Modal: ({
    isOpen,
    onClose,
    title,
    children,
    footer,
  }: {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
  }) =>
    isOpen ? (
      <div data-testid="modal" role="dialog" aria-label={title}>
        <div data-testid="modal-title">{title}</div>
        <button data-testid="modal-close" onClick={onClose}>
          Close
        </button>
        <div data-testid="modal-content">{children}</div>
        {footer && <div data-testid="modal-footer">{footer}</div>}
      </div>
    ) : null,
}));

// Mock Button
jest.mock('../ui/Button', () => ({
  Button: ({
    children,
    onClick,
    variant,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: string;
  }) => (
    <button onClick={onClick} data-variant={variant}>
      {children}
    </button>
  ),
}));

describe('WordListOverlay', () => {
  const mockWords: WordItem[] = [
    { id: '1', prompt: 'hello', answer: 'hei', attempts: 1, firstTryFailed: false, resolved: true },
    { id: '2', prompt: 'dog', answer: 'koira', attempts: 2, firstTryFailed: true, resolved: true },
    {
      id: '3',
      prompt: 'cat',
      answer: 'kissa',
      attempts: 0,
      firstTryFailed: false,
      resolved: false,
    },
    {
      id: '4',
      prompt: 'house',
      answer: 'talo',
      attempts: 1,
      firstTryFailed: true,
      resolved: false,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock session
    mockSession.words = [];
    mockSession.unresolvedIds = [];
    mockSession.currentId = null;
    mockSession.startTimeMs = 0;
    mockSession.endTimeMs = undefined;
  });

  describe('Button Visibility', () => {
    it('does not render button when no words loaded', () => {
      render(<WordListOverlay />);
      expect(screen.queryByText('Word List')).not.toBeInTheDocument();
    });

    it('renders button when words are provided as props', () => {
      render(<WordListOverlay words={mockWords} />);
      expect(screen.getByText('Word List')).toBeInTheDocument();
    });

    it('renders button when words are in store', () => {
      mockSession.words = mockWords;
      render(<WordListOverlay />);
      expect(screen.getByText('Word List')).toBeInTheDocument();
    });

    it('button has correct aria-label', () => {
      render(<WordListOverlay words={mockWords} />);
      expect(screen.getByRole('button', { name: 'Word List' })).toBeInTheDocument();
    });
  });

  describe('Modal Opening and Closing', () => {
    it('opens modal when button is clicked', () => {
      render(<WordListOverlay words={mockWords} />);
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();

      fireEvent.click(screen.getByText('Word List'));
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });

    it('displays title in modal', () => {
      render(<WordListOverlay words={mockWords} />);
      fireEvent.click(screen.getByText('Word List'));

      expect(screen.getByTestId('modal-title')).toHaveTextContent('All Words');
    });

    it('closes modal when close button is clicked', () => {
      render(<WordListOverlay words={mockWords} />);
      fireEvent.click(screen.getByText('Word List'));

      expect(screen.getByTestId('modal')).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('modal-close'));
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });

    it('closes modal when footer close button is clicked', () => {
      render(<WordListOverlay words={mockWords} />);
      fireEvent.click(screen.getByText('Word List'));

      const footer = screen.getByTestId('modal-footer');
      fireEvent.click(within(footer).getByText('Close'));
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });
  });

  describe('Word List Display', () => {
    it('displays all words in table', () => {
      render(<WordListOverlay words={mockWords} />);
      fireEvent.click(screen.getByText('Word List'));

      expect(screen.getByText('hello')).toBeInTheDocument();
      expect(screen.getByText('hei')).toBeInTheDocument();
      expect(screen.getByText('dog')).toBeInTheDocument();
      expect(screen.getByText('koira')).toBeInTheDocument();
      expect(screen.getByText('cat')).toBeInTheDocument();
      expect(screen.getByText('kissa')).toBeInTheDocument();
      expect(screen.getByText('house')).toBeInTheDocument();
      expect(screen.getByText('talo')).toBeInTheDocument();
    });

    it('displays status emoji for resolved words', () => {
      render(<WordListOverlay words={mockWords} />);
      fireEvent.click(screen.getByText('Word List'));

      const content = screen.getByTestId('modal-content');
      // Should have ✅ for resolved words
      expect(content).toHaveTextContent('✅');
    });

    it('displays status emoji for unresolved words', () => {
      render(<WordListOverlay words={mockWords} />);
      fireEvent.click(screen.getByText('Word List'));

      const content = screen.getByTestId('modal-content');
      // Should have 🔁 for unresolved words
      expect(content).toHaveTextContent('🔁');
    });

    it('displays status emoji for words with mistakes', () => {
      render(<WordListOverlay words={mockWords} />);
      fireEvent.click(screen.getByText('Word List'));

      const content = screen.getByTestId('modal-content');
      // Should have ⚠️ for words with mistakes
      expect(content).toHaveTextContent('⚠️');
    });
  });

  describe('Filtering', () => {
    it('displays filter buttons with counts', () => {
      render(<WordListOverlay words={mockWords} />);
      fireEvent.click(screen.getByText('Word List'));

      // All: 4 words
      expect(screen.getByText(/All.*\(4\)/)).toBeInTheDocument();
      // Unresolved: 2 words (cat, house)
      expect(screen.getByText(/Unresolved.*\(2\)/)).toBeInTheDocument();
      // Mistakes: 2 words (dog, house)
      expect(screen.getByText(/Mistakes.*\(2\)/)).toBeInTheDocument();
    });

    it('filters to show only unresolved words', () => {
      render(<WordListOverlay words={mockWords} />);
      fireEvent.click(screen.getByText('Word List'));

      // Click unresolved filter
      fireEvent.click(screen.getByText(/Unresolved.*\(2\)/));

      // Should show unresolved words
      expect(screen.getByText('cat')).toBeInTheDocument();
      expect(screen.getByText('house')).toBeInTheDocument();

      // Should not show resolved words
      expect(screen.queryByText('hello')).not.toBeInTheDocument();
      expect(screen.queryByText('dog')).not.toBeInTheDocument();
    });

    it('filters to show only words with mistakes', () => {
      render(<WordListOverlay words={mockWords} />);
      fireEvent.click(screen.getByText('Word List'));

      // Click mistakes filter
      fireEvent.click(screen.getByText(/Mistakes.*\(2\)/));

      // Should show words with mistakes
      expect(screen.getByText('dog')).toBeInTheDocument();
      expect(screen.getByText('house')).toBeInTheDocument();

      // Should not show words without mistakes
      expect(screen.queryByText('hello')).not.toBeInTheDocument();
      expect(screen.queryByText('cat')).not.toBeInTheDocument();
    });

    it('shows all words when All filter is clicked', () => {
      render(<WordListOverlay words={mockWords} />);
      fireEvent.click(screen.getByText('Word List'));

      // First filter to mistakes
      fireEvent.click(screen.getByText(/Mistakes.*\(2\)/));
      expect(screen.queryByText('hello')).not.toBeInTheDocument();

      // Then click All to show all words
      fireEvent.click(screen.getByText(/All.*\(4\)/));
      expect(screen.getByText('hello')).toBeInTheDocument();
      expect(screen.getByText('dog')).toBeInTheDocument();
      expect(screen.getByText('cat')).toBeInTheDocument();
      expect(screen.getByText('house')).toBeInTheDocument();
    });

    it('filter buttons have correct aria-pressed state', () => {
      render(<WordListOverlay words={mockWords} />);
      fireEvent.click(screen.getByText('Word List'));

      const allFilter = screen.getByText(/All.*\(4\)/).closest('button');
      const unresolvedFilter = screen.getByText(/Unresolved.*\(2\)/).closest('button');

      // All should be pressed by default
      expect(allFilter).toHaveAttribute('aria-pressed', 'true');
      expect(unresolvedFilter).toHaveAttribute('aria-pressed', 'false');

      // Click unresolved
      fireEvent.click(unresolvedFilter!);
      expect(allFilter).toHaveAttribute('aria-pressed', 'false');
      expect(unresolvedFilter).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('Current Word Highlighting', () => {
    it('highlights current word during active quiz', () => {
      mockSession.words = mockWords;
      mockSession.currentId = '2'; // dog
      mockSession.startTimeMs = Date.now();
      mockSession.endTimeMs = undefined;

      render(<WordListOverlay currentWordId="2" words={mockWords} />);
      fireEvent.click(screen.getByText('Word List'));

      // Current word should have "(current)" indicator
      expect(screen.getByText('(current)')).toBeInTheDocument();
    });

    it('does not show current indicator when quiz is not active', () => {
      mockSession.words = mockWords;
      mockSession.currentId = '2';
      mockSession.startTimeMs = 0; // Quiz not started

      render(<WordListOverlay currentWordId="2" words={mockWords} />);
      fireEvent.click(screen.getByText('Word List'));

      expect(screen.queryByText('(current)')).not.toBeInTheDocument();
    });

    it('does not show current indicator when quiz is complete', () => {
      mockSession.words = mockWords;
      mockSession.currentId = '2';
      mockSession.startTimeMs = Date.now() - 60000;
      mockSession.endTimeMs = Date.now(); // Quiz ended

      render(<WordListOverlay currentWordId="2" words={mockWords} />);
      fireEvent.click(screen.getByText('Word List'));

      expect(screen.queryByText('(current)')).not.toBeInTheDocument();
    });
  });

  describe('Empty States', () => {
    it('shows empty message when filtered list is empty', () => {
      const allResolved: WordItem[] = [
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
      ];

      render(<WordListOverlay words={allResolved} />);
      fireEvent.click(screen.getByText('Word List'));

      // Click mistakes filter - no words with mistakes
      fireEvent.click(screen.getByText(/Mistakes.*\(0\)/));

      expect(screen.getByText('No words loaded yet')).toBeInTheDocument();
    });
  });

  describe('Legend Display', () => {
    it('displays legend with all status indicators', () => {
      render(<WordListOverlay words={mockWords} />);
      fireEvent.click(screen.getByText('Word List'));

      const content = screen.getByTestId('modal-content');
      expect(content).toHaveTextContent('Resolved');
      expect(content).toHaveTextContent('Unresolved');
      expect(content).toHaveTextContent('Mistake made');
    });
  });

  describe('Accessibility', () => {
    it('has accessible filter group', () => {
      render(<WordListOverlay words={mockWords} />);
      fireEvent.click(screen.getByText('Word List'));

      expect(screen.getByRole('group', { name: 'Filter options' })).toBeInTheDocument();
    });

    it('table has correct role', () => {
      render(<WordListOverlay words={mockWords} />);
      fireEvent.click(screen.getByText('Word List'));

      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('status emojis have aria-labels', () => {
      render(<WordListOverlay words={mockWords} />);
      fireEvent.click(screen.getByText('Word List'));

      const content = screen.getByTestId('modal-content');
      // Check that status emojis have accessible labels
      expect(within(content).getAllByLabelText('Resolved').length).toBeGreaterThan(0);
    });
  });

  describe('Props Override Store', () => {
    it('uses prop words over store words', () => {
      mockSession.words = [
        {
          id: '1',
          prompt: 'store-word',
          answer: 'store-answer',
          attempts: 0,
          firstTryFailed: false,
          resolved: false,
        },
      ];

      const propWords: WordItem[] = [
        {
          id: '2',
          prompt: 'prop-word',
          answer: 'prop-answer',
          attempts: 0,
          firstTryFailed: false,
          resolved: false,
        },
      ];

      render(<WordListOverlay words={propWords} />);
      fireEvent.click(screen.getByText('Word List'));

      expect(screen.getByText('prop-word')).toBeInTheDocument();
      expect(screen.queryByText('store-word')).not.toBeInTheDocument();
    });

    it('uses prop currentWordId over store currentId', () => {
      mockSession.words = mockWords;
      mockSession.currentId = '1'; // hello
      mockSession.startTimeMs = Date.now();

      render(<WordListOverlay words={mockWords} currentWordId="3" />);
      fireEvent.click(screen.getByText('Word List'));

      // Should highlight cat (id: 3), not hello (id: 1)
      const catRow = screen.getByText('cat').closest('tr');
      expect(catRow).toHaveTextContent('(current)');
    });
  });
});
