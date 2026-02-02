/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import Home from '../page';

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      title: 'Vocabulary Quiz',
      subtitle: 'Practice your vocabulary words!',
      description: 'Upload a CSV file or enter words manually to start practicing.',
      uploadButton: 'Upload CSV',
      manualButton: 'Enter Manually',
      startQuiz: 'Start Quiz',
      wordCount: '0 words ready',
    };
    return translations[key] || key;
  },
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock LanguageSelector
jest.mock('@/components/LanguageSelector', () => {
  return function LanguageSelector() {
    return <div>Language Selector</div>;
  };
});

// Mock WordListUpload
jest.mock('@/components/WordListUpload', () => ({
  WordListUpload: jest.fn(({ onWordsLoaded }) => {
    return (
      <div data-testid="word-list-upload">
        <button
          onClick={() =>
            onWordsLoaded([
              {
                id: '1',
                prompt: 'hello',
                answer: 'hei',
                attempts: 0,
                firstTryFailed: false,
                resolved: false,
              },
              {
                id: '2',
                prompt: 'goodbye',
                answer: 'näkemiin',
                attempts: 0,
                firstTryFailed: false,
                resolved: false,
              },
            ])
          }
        >
          Mock Upload
        </button>
      </div>
    );
  }),
}));

// Mock ManualEntryTable
jest.mock('@/components/ManualEntryTable', () => ({
  ManualEntryTable: jest.fn(({ onWordsLoaded }) => {
    return (
      <div data-testid="manual-entry-table">
        <button
          onClick={() =>
            onWordsLoaded([
              {
                id: '1',
                prompt: 'test',
                answer: 'testi',
                attempts: 0,
                firstTryFailed: false,
                resolved: false,
              },
            ])
          }
        >
          Mock Manual Entry
        </button>
      </div>
    );
  }),
}));

// Mock Rocket icon
jest.mock('@/components/icons', () => ({
  Rocket: () => <div data-testid="rocket-icon">🚀</div>,
}));

// Mock quiz store
const mockLoadWords = jest.fn();
const mockStartQuiz = jest.fn();
jest.mock('@/hooks/useQuizStore', () => ({
  useQuizStore: (selector: any) => {
    const store = {
      loadWords: mockLoadWords,
      startQuiz: mockStartQuiz,
    };
    return selector(store);
  },
}));

describe('Start Screen (Home Page)', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  describe('initial render', () => {
    it('renders the hero section with title and description', () => {
      render(<Home />);

      expect(screen.getByText('Vocabulary Quiz')).toBeInTheDocument();
      expect(screen.getByText('Practice your vocabulary words!')).toBeInTheDocument();
      expect(
        screen.getByText('Upload a CSV file or enter words manually to start practicing.'),
      ).toBeInTheDocument();
    });

    it('renders the Rocket icon', () => {
      render(<Home />);

      expect(screen.getByTestId('rocket-icon')).toBeInTheDocument();
    });

    it('renders the Language Selector', () => {
      render(<Home />);

      expect(screen.getByText('Language Selector')).toBeInTheDocument();
    });

    it('displays input mode selection buttons', () => {
      render(<Home />);

      expect(screen.getByRole('button', { name: /upload csv/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /enter manually/i })).toBeInTheDocument();
    });

    it('does not show word input components initially', () => {
      render(<Home />);

      expect(screen.queryByTestId('word-list-upload')).not.toBeInTheDocument();
      expect(screen.queryByTestId('manual-entry-table')).not.toBeInTheDocument();
    });

    it('does not show Start Quiz button initially', () => {
      render(<Home />);

      expect(screen.queryByRole('button', { name: /start quiz/i })).not.toBeInTheDocument();
    });
  });

  describe('upload mode', () => {
    it('shows WordListUpload component when upload button clicked', async () => {
      const user = userEvent.setup();
      render(<Home />);

      const uploadButton = screen.getByRole('button', { name: /upload csv/i });
      await user.click(uploadButton);

      expect(screen.getByTestId('word-list-upload')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
    });

    it('hides mode selection buttons when in upload mode', async () => {
      const user = userEvent.setup();
      render(<Home />);

      const uploadButton = screen.getByRole('button', { name: /upload csv/i });
      await user.click(uploadButton);

      expect(screen.queryByRole('button', { name: /upload csv/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /enter manually/i })).not.toBeInTheDocument();
    });

    it('shows Start Quiz button when words are loaded from upload', async () => {
      const user = userEvent.setup();
      render(<Home />);

      // Click upload mode
      await user.click(screen.getByRole('button', { name: /upload csv/i }));

      // Load words using mock button
      await user.click(screen.getByRole('button', { name: /mock upload/i }));

      // Start Quiz button should appear
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /start quiz/i })).toBeInTheDocument();
      });
    });

    it('returns to mode selection when back button clicked', async () => {
      const user = userEvent.setup();
      render(<Home />);

      // Enter upload mode
      await user.click(screen.getByRole('button', { name: /upload csv/i }));
      expect(screen.getByTestId('word-list-upload')).toBeInTheDocument();

      // Click back
      await user.click(screen.getByRole('button', { name: /back/i }));

      // Should show mode selection again
      expect(screen.getByRole('button', { name: /upload csv/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /enter manually/i })).toBeInTheDocument();
      expect(screen.queryByTestId('word-list-upload')).not.toBeInTheDocument();
    });
  });

  describe('manual entry mode', () => {
    it('shows ManualEntryTable component when manual button clicked', async () => {
      const user = userEvent.setup();
      render(<Home />);

      const manualButton = screen.getByRole('button', { name: /enter manually/i });
      await user.click(manualButton);

      expect(screen.getByTestId('manual-entry-table')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
    });

    it('shows Start Quiz button when words are loaded from manual entry', async () => {
      const user = userEvent.setup();
      render(<Home />);

      // Click manual mode
      await user.click(screen.getByRole('button', { name: /enter manually/i }));

      // Load words using mock button
      await user.click(screen.getByRole('button', { name: /mock manual entry/i }));

      // Start Quiz button should appear
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /start quiz/i })).toBeInTheDocument();
      });
    });
  });

  describe('start quiz functionality', () => {
    it('Start Quiz button is disabled when no words loaded', async () => {
      const user = userEvent.setup();
      render(<Home />);

      // Enter upload mode
      await user.click(screen.getByRole('button', { name: /upload csv/i }));

      // Start Quiz button should be present but disabled
      const startButton = screen.getByRole('button', { name: /start quiz/i });
      expect(startButton).toBeInTheDocument();
      expect(startButton).toBeDisabled();
    });

    it('calls loadWords and startQuiz when Start Quiz clicked', async () => {
      const user = userEvent.setup();
      render(<Home />);

      // Enter upload mode and load words
      await user.click(screen.getByRole('button', { name: /upload csv/i }));
      await user.click(screen.getByRole('button', { name: /mock upload/i }));

      // Wait for Start Quiz button and click it
      const startButton = await screen.findByRole('button', { name: /start quiz/i });
      await user.click(startButton);

      // Should call quiz store methods
      expect(mockLoadWords).toHaveBeenCalledTimes(1);
      expect(mockStartQuiz).toHaveBeenCalledTimes(1);
    });

    it('navigates to quiz page when Start Quiz clicked', async () => {
      const user = userEvent.setup();
      render(<Home />);

      // Enter upload mode and load words
      await user.click(screen.getByRole('button', { name: /upload csv/i }));
      await user.click(screen.getByRole('button', { name: /mock upload/i }));

      // Wait for Start Quiz button and click it
      const startButton = await screen.findByRole('button', { name: /start quiz/i });
      await user.click(startButton);

      // Should navigate to /quiz
      expect(mockPush).toHaveBeenCalledWith('/quiz');
    });
  });

  describe('responsive layout', () => {
    it('renders with responsive classes', () => {
      render(<Home />);

      const main = screen.getByRole('main');
      expect(main).toHaveClass('min-h-screen');
      expect(main).toHaveClass('p-4');
      expect(main).toHaveClass('sm:p-8');
    });

    it('mode selection buttons have responsive flex classes', () => {
      render(<Home />);

      const uploadButton = screen.getByRole('button', { name: /upload csv/i });
      const buttonContainer = uploadButton.parentElement;

      expect(buttonContainer).toHaveClass('flex-col');
      expect(buttonContainer).toHaveClass('sm:flex-row');
    });
  });
});
