import * as csvParser from '@/lib/csv-parser';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { WordListUpload } from '../WordListUpload';

// Mock the CSV parser
jest.mock('@/lib/csv-parser');

describe('WordListUpload', () => {
  const mockOnWordsLoaded = jest.fn();
  const mockParseCSV = csvParser.parseCSV as jest.MockedFunction<typeof csvParser.parseCSV>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders upload area with instructions', () => {
      render(<WordListUpload onWordsLoaded={mockOnWordsLoaded} />);

      expect(screen.getByText(/drag and drop your CSV file here/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /choose file/i })).toBeInTheDocument();
      expect(screen.getByText(/supported formats/i)).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      const { container } = render(
        <WordListUpload onWordsLoaded={mockOnWordsLoaded} className="custom-class" />,
      );
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('has hidden file input with correct accept attribute', () => {
      render(<WordListUpload onWordsLoaded={mockOnWordsLoaded} />);
      const fileInput = screen.getByLabelText(/upload csv file/i);
      expect(fileInput).toHaveAttribute('type', 'file');
      expect(fileInput).toHaveAttribute('accept', '.csv,.txt');
      expect(fileInput).toHaveClass('hidden');
    });
  });

  describe('file selection via button', () => {
    it('triggers file input when button clicked', async () => {
      const user = userEvent.setup();
      render(<WordListUpload onWordsLoaded={mockOnWordsLoaded} />);

      const button = screen.getByRole('button', { name: /choose file/i });
      const fileInput = screen.getByLabelText(/upload csv file/i) as HTMLInputElement;

      const clickSpy = jest.spyOn(fileInput, 'click');
      await user.click(button);

      expect(clickSpy).toHaveBeenCalled();
    });

    it('processes valid CSV file', async () => {
      const user = userEvent.setup();
      const mockWords = [
        {
          id: '1',
          prompt: 'cat',
          answer: 'kissa',
          attempts: 0,
          firstTryFailed: false,
          resolved: false,
        },
        {
          id: '2',
          prompt: 'dog',
          answer: 'koira',
          attempts: 0,
          firstTryFailed: false,
          resolved: false,
        },
      ];

      mockParseCSV.mockReturnValue(mockWords);

      render(<WordListUpload onWordsLoaded={mockOnWordsLoaded} />);

      const file = new File(['cat,kissa\ndog,koira'], 'words.csv', { type: 'text/csv' });
      const fileInput = screen.getByLabelText(/upload csv file/i) as HTMLInputElement;

      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(mockParseCSV).toHaveBeenCalledWith('cat,kissa\ndog,koira');
        expect(mockOnWordsLoaded).toHaveBeenCalledWith(mockWords);
      });
    });

    it('shows loading state during file processing', async () => {
      const user = userEvent.setup();
      mockParseCSV.mockReturnValue([
        {
          id: '1',
          prompt: 'test',
          answer: 'testi',
          attempts: 0,
          firstTryFailed: false,
          resolved: false,
        },
      ]);

      render(<WordListUpload onWordsLoaded={mockOnWordsLoaded} />);

      const file = new File(['test,testi'], 'words.csv', { type: 'text/csv' });
      const fileInput = screen.getByLabelText(/upload csv file/i) as HTMLInputElement;

      await user.upload(fileInput, file);

      // Loading state should appear briefly
      expect(screen.getByText(/parsing words\.csv/i)).toBeInTheDocument();
    });
  });

  describe('file validation', () => {
    it('rejects non-CSV/TXT files', async () => {
      const user = userEvent.setup();
      render(<WordListUpload onWordsLoaded={mockOnWordsLoaded} />);

      const file = new File(['content'], 'document.pdf', { type: 'application/pdf' });
      const fileInput = screen.getByLabelText(/upload csv file/i) as HTMLInputElement;

      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText(/please upload a CSV or TXT file/i)).toBeInTheDocument();
        expect(mockParseCSV).not.toHaveBeenCalled();
        expect(mockOnWordsLoaded).not.toHaveBeenCalled();
      });
    });

    it('accepts .csv files', async () => {
      const user = userEvent.setup();
      mockParseCSV.mockReturnValue([
        {
          id: '1',
          prompt: 'test',
          answer: 'testi',
          attempts: 0,
          firstTryFailed: false,
          resolved: false,
        },
      ]);

      render(<WordListUpload onWordsLoaded={mockOnWordsLoaded} />);

      const file = new File(['test,testi'], 'words.csv', { type: 'text/csv' });
      const fileInput = screen.getByLabelText(/upload csv file/i) as HTMLInputElement;

      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(mockParseCSV).toHaveBeenCalled();
      });
    });

    it('accepts .txt files', async () => {
      const user = userEvent.setup();
      mockParseCSV.mockReturnValue([
        {
          id: '1',
          prompt: 'test',
          answer: 'testi',
          attempts: 0,
          firstTryFailed: false,
          resolved: false,
        },
      ]);

      render(<WordListUpload onWordsLoaded={mockOnWordsLoaded} />);

      const file = new File(['test,testi'], 'words.txt', { type: 'text/plain' });
      const fileInput = screen.getByLabelText(/upload csv file/i) as HTMLInputElement;

      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(mockParseCSV).toHaveBeenCalled();
      });
    });
  });

  describe('error handling', () => {
    it('displays CSV parse errors', async () => {
      const user = userEvent.setup();
      const parseError = new csvParser.CSVParseError('Invalid CSV format: expected 2 columns');
      mockParseCSV.mockImplementation(() => {
        throw parseError;
      });

      render(<WordListUpload onWordsLoaded={mockOnWordsLoaded} />);

      const file = new File(['invalid'], 'words.csv', { type: 'text/csv' });
      const fileInput = screen.getByLabelText(/upload csv file/i) as HTMLInputElement;

      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText(/upload failed/i)).toBeInTheDocument();
        expect(screen.getByText(/invalid csv format: expected 2 columns/i)).toBeInTheDocument();
        expect(mockOnWordsLoaded).not.toHaveBeenCalled();
      });
    });

    it('displays generic errors', async () => {
      const user = userEvent.setup();
      mockParseCSV.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      render(<WordListUpload onWordsLoaded={mockOnWordsLoaded} />);

      const file = new File(['test'], 'words.csv', { type: 'text/csv' });
      const fileInput = screen.getByLabelText(/upload csv file/i) as HTMLInputElement;

      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText(/upload failed/i)).toBeInTheDocument();
        expect(screen.getByText(/unexpected error/i)).toBeInTheDocument();
      });
    });

    it('shows error when no words parsed', async () => {
      const user = userEvent.setup();
      mockParseCSV.mockReturnValue([]);

      render(<WordListUpload onWordsLoaded={mockOnWordsLoaded} />);

      const file = new File([''], 'empty.csv', { type: 'text/csv' });
      const fileInput = screen.getByLabelText(/upload csv file/i) as HTMLInputElement;

      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText(/no valid word pairs found/i)).toBeInTheDocument();
        expect(mockOnWordsLoaded).not.toHaveBeenCalled();
      });
    });

    it('allows retry after error', async () => {
      const user = userEvent.setup();
      mockParseCSV.mockImplementation(() => {
        throw new csvParser.CSVParseError('Test error');
      });

      render(<WordListUpload onWordsLoaded={mockOnWordsLoaded} />);

      const file = new File(['invalid'], 'words.csv', { type: 'text/csv' });
      const fileInput = screen.getByLabelText(/upload csv file/i) as HTMLInputElement;

      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText(/upload failed/i)).toBeInTheDocument();
      });

      // Click "Try Again"
      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      await user.click(tryAgainButton);

      // Error should be cleared
      expect(screen.queryByText(/upload failed/i)).not.toBeInTheDocument();
      expect(screen.getByText(/drag and drop/i)).toBeInTheDocument();
    });
  });

  describe('success state', () => {
    it('displays word count and preview', async () => {
      const user = userEvent.setup();
      const mockWords = [
        {
          id: '1',
          prompt: 'cat',
          answer: 'kissa',
          attempts: 0,
          firstTryFailed: false,
          resolved: false,
        },
        {
          id: '2',
          prompt: 'dog',
          answer: 'koira',
          attempts: 0,
          firstTryFailed: false,
          resolved: false,
        },
        {
          id: '3',
          prompt: 'bird',
          answer: 'lintu',
          attempts: 0,
          firstTryFailed: false,
          resolved: false,
        },
      ];

      mockParseCSV.mockReturnValue(mockWords);

      render(<WordListUpload onWordsLoaded={mockOnWordsLoaded} />);

      const file = new File(['cat,kissa\ndog,koira\nbird,lintu'], 'words.csv', {
        type: 'text/csv',
      });
      const fileInput = screen.getByLabelText(/upload csv file/i) as HTMLInputElement;

      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText(/upload successful/i)).toBeInTheDocument();
        expect(screen.getByText(/loaded/i)).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
        expect(screen.getByText(/preview/i)).toBeInTheDocument();
        expect(screen.getByText('cat')).toBeInTheDocument();
        expect(screen.getByText('kissa')).toBeInTheDocument();
        expect(screen.getByText('dog')).toBeInTheDocument();
        expect(screen.getByText('bird')).toBeInTheDocument();
      });
    });

    it('shows first 5 words in preview', async () => {
      const user = userEvent.setup();
      const mockWords = Array.from({ length: 10 }, (_, i) => ({
        id: `${i + 1}`,
        prompt: `word${i + 1}`,
        answer: `translation${i + 1}`,
        attempts: 0,
        firstTryFailed: false,
        resolved: false,
      }));

      mockParseCSV.mockReturnValue(mockWords);

      render(<WordListUpload onWordsLoaded={mockOnWordsLoaded} />);

      const file = new File(['data'], 'words.csv', { type: 'text/csv' });
      const fileInput = screen.getByLabelText(/upload csv file/i) as HTMLInputElement;

      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText('word1')).toBeInTheDocument();
        expect(screen.getByText('word5')).toBeInTheDocument();
        expect(screen.queryByText('word6')).not.toBeInTheDocument();
        expect(screen.getByText(/\.\.\.and 5 more words/i)).toBeInTheDocument();
      });
    });

    it('allows uploading different file after success', async () => {
      const user = userEvent.setup();
      mockParseCSV.mockReturnValue([
        {
          id: '1',
          prompt: 'test',
          answer: 'testi',
          attempts: 0,
          firstTryFailed: false,
          resolved: false,
        },
      ]);

      render(<WordListUpload onWordsLoaded={mockOnWordsLoaded} />);

      const file = new File(['test,testi'], 'words.csv', { type: 'text/csv' });
      const fileInput = screen.getByLabelText(/upload csv file/i) as HTMLInputElement;

      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText(/upload successful/i)).toBeInTheDocument();
      });

      // Click "Upload Different File"
      const uploadDifferentButton = screen.getByRole('button', { name: /upload different file/i });
      await user.click(uploadDifferentButton);

      // Success message should be cleared
      expect(screen.queryByText(/upload successful/i)).not.toBeInTheDocument();
      expect(screen.getByText(/drag and drop/i)).toBeInTheDocument();
    });
  });

  describe('drag and drop', () => {
    it('highlights drop zone on drag enter', () => {
      render(<WordListUpload onWordsLoaded={mockOnWordsLoaded} />);

      const dropZone = screen.getByText(/drag and drop/i).closest('div');

      // Simulate drag enter
      const dragEnterEvent = new Event('dragenter', { bubbles: true });
      Object.defineProperty(dragEnterEvent, 'dataTransfer', {
        value: { files: [] },
      });
      dropZone?.dispatchEvent(dragEnterEvent);

      // Check if border color changed (indicates highlighting)
      expect(dropZone).toHaveClass('border-primary-500');
    });

    it('processes dropped file', async () => {
      mockParseCSV.mockReturnValue([
        {
          id: '1',
          prompt: 'test',
          answer: 'testi',
          attempts: 0,
          firstTryFailed: false,
          resolved: false,
        },
      ]);

      render(<WordListUpload onWordsLoaded={mockOnWordsLoaded} />);

      const dropZone = screen.getByText(/drag and drop/i).closest('div');
      const file = new File(['test,testi'], 'words.csv', { type: 'text/csv' });

      // Simulate drop
      const dropEvent = new Event('drop', { bubbles: true });
      Object.defineProperty(dropEvent, 'dataTransfer', {
        value: { files: [file] },
      });
      dropZone?.dispatchEvent(dropEvent);

      await waitFor(() => {
        expect(mockParseCSV).toHaveBeenCalled();
        expect(mockOnWordsLoaded).toHaveBeenCalled();
      });
    });
  });

  describe('accessibility', () => {
    it('has accessible file input label', () => {
      render(<WordListUpload onWordsLoaded={mockOnWordsLoaded} />);
      expect(screen.getByLabelText(/upload csv file/i)).toBeInTheDocument();
    });

    it('disables button during loading', async () => {
      const user = userEvent.setup();
      mockParseCSV.mockReturnValue([
        {
          id: '1',
          prompt: 'test',
          answer: 'testi',
          attempts: 0,
          firstTryFailed: false,
          resolved: false,
        },
      ]);

      render(<WordListUpload onWordsLoaded={mockOnWordsLoaded} />);

      const file = new File(['test,testi'], 'words.csv', { type: 'text/csv' });
      const fileInput = screen.getByLabelText(/upload csv file/i) as HTMLInputElement;

      await user.upload(fileInput, file);

      const button = screen.getByRole('button', { name: /loading/i });
      expect(button).toBeDisabled();
    });

    it('supports ref forwarding', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<WordListUpload onWordsLoaded={mockOnWordsLoaded} ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });
});
