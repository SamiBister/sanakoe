import { WordItem } from '@/lib/types';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { ManualEntryTable } from '../ManualEntryTable';

// Mock nanoid to generate predictable IDs
jest.mock('nanoid', () => ({
  nanoid: () => `test-id-${Math.random().toString(36).substr(2, 9)}`,
}));

describe('ManualEntryTable', () => {
  let mockOnWordsLoaded: jest.Mock;

  beforeEach(() => {
    mockOnWordsLoaded = jest.fn();
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders table with headers', () => {
      render(<ManualEntryTable onWordsLoaded={mockOnWordsLoaded} />);

      expect(screen.getByText('Prompt')).toBeInTheDocument();
      expect(screen.getByText('Answer')).toBeInTheDocument();
    });

    it('initializes with 10 empty rows', () => {
      render(<ManualEntryTable onWordsLoaded={mockOnWordsLoaded} />);

      const inputs = screen.getAllByRole('textbox');
      // 10 rows × 2 columns = 20 inputs
      expect(inputs).toHaveLength(20);
    });

    it('displays valid word count', () => {
      render(<ManualEntryTable onWordsLoaded={mockOnWordsLoaded} />);

      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText(/valid.*words entered/i)).toBeInTheDocument();
    });

    it('renders Clear All button', () => {
      render(<ManualEntryTable onWordsLoaded={mockOnWordsLoaded} />);

      const clearButton = screen.getByRole('button', { name: /clear all/i });
      expect(clearButton).toBeInTheDocument();
      expect(clearButton).toBeDisabled(); // Disabled when all rows empty
    });

    it('renders with custom className', () => {
      const { container } = render(
        <ManualEntryTable onWordsLoaded={mockOnWordsLoaded} className="custom-class" />,
      );

      const tableWrapper = container.firstChild;
      expect(tableWrapper).toHaveClass('custom-class');
    });

    it('displays keyboard hints', () => {
      render(<ManualEntryTable onWordsLoaded={mockOnWordsLoaded} />);

      expect(screen.getByText(/use tab to move to the next cell/i)).toBeInTheDocument();
      expect(screen.getByText(/paste tab-separated values/i)).toBeInTheDocument();
    });
  });

  describe('data entry', () => {
    it('allows entering text in prompt cell', async () => {
      const user = userEvent.setup();
      render(<ManualEntryTable onWordsLoaded={mockOnWordsLoaded} />);

      const promptInputs = screen.getAllByLabelText(/prompt for row/i);
      const firstPrompt = promptInputs[0];

      await user.type(firstPrompt, 'hello');

      expect(firstPrompt).toHaveValue('hello');
    });

    it('allows entering text in answer cell', async () => {
      const user = userEvent.setup();
      render(<ManualEntryTable onWordsLoaded={mockOnWordsLoaded} />);

      const answerInputs = screen.getAllByLabelText(/answer for row/i);
      const firstAnswer = answerInputs[0];

      await user.type(firstAnswer, 'hei');

      expect(firstAnswer).toHaveValue('hei');
    });

    it('updates valid word count when both cells filled', async () => {
      const user = userEvent.setup();
      render(<ManualEntryTable onWordsLoaded={mockOnWordsLoaded} />);

      const promptInputs = screen.getAllByLabelText(/prompt for row/i);
      const answerInputs = screen.getAllByLabelText(/answer for row/i);

      await user.type(promptInputs[0], 'hello');
      await user.type(answerInputs[0], 'hei');

      await waitFor(() => {
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText(/valid.*word entered/i)).toBeInTheDocument();
      });
    });

    it('does not count incomplete rows', async () => {
      const user = userEvent.setup();
      render(<ManualEntryTable onWordsLoaded={mockOnWordsLoaded} />);

      const promptInputs = screen.getAllByLabelText(/prompt for row/i);

      // Only fill prompt, not answer
      await user.type(promptInputs[0], 'hello');

      await waitFor(() => {
        expect(screen.getByText('0')).toBeInTheDocument();
        expect(screen.getByText(/valid.*words entered/i)).toBeInTheDocument();
      });
    });

    it('calls onWordsLoaded with valid words', async () => {
      const user = userEvent.setup();
      render(<ManualEntryTable onWordsLoaded={mockOnWordsLoaded} />);

      const promptInputs = screen.getAllByLabelText(/prompt for row/i);
      const answerInputs = screen.getAllByLabelText(/answer for row/i);

      await user.type(promptInputs[0], 'hello');
      await user.type(answerInputs[0], 'hei');

      await waitFor(() => {
        expect(mockOnWordsLoaded).toHaveBeenCalled();
      });

      // Get the last call arguments
      const lastCall = mockOnWordsLoaded.mock.calls[mockOnWordsLoaded.mock.calls.length - 1];
      const words: WordItem[] = lastCall[0];

      expect(words).toHaveLength(1);
      expect(words[0]).toMatchObject({
        prompt: 'hello',
        answer: 'hei',
        attempts: 0,
        firstTryFailed: false,
        resolved: false,
      });
      expect(words[0].id).toBeDefined();
    });

    it('trims whitespace from words', async () => {
      const user = userEvent.setup();
      render(<ManualEntryTable onWordsLoaded={mockOnWordsLoaded} />);

      const promptInputs = screen.getAllByLabelText(/prompt for row/i);
      const answerInputs = screen.getAllByLabelText(/answer for row/i);

      await user.type(promptInputs[0], '  hello  ');
      await user.type(answerInputs[0], '  hei  ');

      await waitFor(() => {
        const lastCall = mockOnWordsLoaded.mock.calls[mockOnWordsLoaded.mock.calls.length - 1];
        const words: WordItem[] = lastCall[0];
        expect(words[0].prompt).toBe('hello');
        expect(words[0].answer).toBe('hei');
      });
    });
  });

  describe('auto-expand', () => {
    it('adds new row when typing in last row', async () => {
      const user = userEvent.setup();
      render(<ManualEntryTable onWordsLoaded={mockOnWordsLoaded} />);

      const allInputs = screen.getAllByRole('textbox');
      const initialCount = allInputs.length;

      // Get the last prompt input (second-to-last overall)
      const lastPromptInput = allInputs[allInputs.length - 2];

      await user.type(lastPromptInput, 'hello');

      await waitFor(() => {
        const updatedInputs = screen.getAllByRole('textbox');
        expect(updatedInputs.length).toBeGreaterThan(initialCount);
      });
    });

    it('adds new row when typing in last answer cell', async () => {
      const user = userEvent.setup();
      render(<ManualEntryTable onWordsLoaded={mockOnWordsLoaded} />);

      const allInputs = screen.getAllByRole('textbox');
      const initialCount = allInputs.length;

      // Get the last answer input
      const lastAnswerInput = allInputs[allInputs.length - 1];

      await user.type(lastAnswerInput, 'hei');

      await waitFor(() => {
        const updatedInputs = screen.getAllByRole('textbox');
        expect(updatedInputs.length).toBeGreaterThan(initialCount);
      });
    });

    it('does not add row when typing in middle rows', async () => {
      const user = userEvent.setup();
      render(<ManualEntryTable onWordsLoaded={mockOnWordsLoaded} />);

      const allInputs = screen.getAllByRole('textbox');
      const initialCount = allInputs.length;

      // Type in the first row
      await user.type(allInputs[0], 'hello');

      // Should not add new row
      await waitFor(
        () => {
          const updatedInputs = screen.getAllByRole('textbox');
          expect(updatedInputs.length).toBe(initialCount);
        },
        { timeout: 500 },
      );
    });
  });

  describe('keyboard navigation', () => {
    it('moves to next cell on Tab', async () => {
      const user = userEvent.setup();
      render(<ManualEntryTable onWordsLoaded={mockOnWordsLoaded} />);

      const promptInputs = screen.getAllByLabelText(/prompt for row 1/i);
      const answerInputs = screen.getAllByLabelText(/answer for row 1/i);

      const firstPrompt = promptInputs[0];
      firstPrompt.focus();

      await user.keyboard('{Tab}');

      expect(answerInputs[0]).toHaveFocus();
    });

    it('moves to previous cell on Shift+Tab', async () => {
      const user = userEvent.setup();
      render(<ManualEntryTable onWordsLoaded={mockOnWordsLoaded} />);

      const promptInputs = screen.getAllByLabelText(/prompt for row 1/i);
      const answerInputs = screen.getAllByLabelText(/answer for row 1/i);

      const firstAnswer = answerInputs[0];
      firstAnswer.focus();

      await user.keyboard('{Shift>}{Tab}{/Shift}');

      expect(promptInputs[0]).toHaveFocus();
    });

    it('moves to next row on Tab from answer cell', async () => {
      const user = userEvent.setup();
      render(<ManualEntryTable onWordsLoaded={mockOnWordsLoaded} />);

      const answerInputs = screen.getAllByLabelText(/answer for row/i);
      const promptInputs = screen.getAllByLabelText(/prompt for row/i);

      const firstAnswer = answerInputs[0];
      firstAnswer.focus();

      await user.keyboard('{Tab}');

      // Should focus prompt of row 2
      expect(promptInputs[1]).toHaveFocus();
    });

    it('behaves like Tab on Enter key', async () => {
      const user = userEvent.setup();
      render(<ManualEntryTable onWordsLoaded={mockOnWordsLoaded} />);

      const promptInputs = screen.getAllByLabelText(/prompt for row 1/i);
      const answerInputs = screen.getAllByLabelText(/answer for row 1/i);

      const firstPrompt = promptInputs[0];
      firstPrompt.focus();

      await user.keyboard('{Enter}');

      expect(answerInputs[0]).toHaveFocus();
    });

    it('adds new row and moves focus when Tab on last cell', async () => {
      const user = userEvent.setup();
      render(<ManualEntryTable onWordsLoaded={mockOnWordsLoaded} />);

      const allInputs = screen.getAllByRole('textbox');
      const lastInput = allInputs[allInputs.length - 1];

      lastInput.focus();

      await user.keyboard('{Tab}');

      await waitFor(() => {
        const updatedInputs = screen.getAllByRole('textbox');
        expect(updatedInputs.length).toBeGreaterThan(allInputs.length);
      });

      // New first prompt of the new row should have focus
      await waitFor(() => {
        const updatedInputs = screen.getAllByRole('textbox');
        const newFirstPrompt = updatedInputs[allInputs.length];
        expect(newFirstPrompt).toHaveFocus();
      });
    });

    it('does not move before first cell on Shift+Tab', async () => {
      const user = userEvent.setup();
      render(<ManualEntryTable onWordsLoaded={mockOnWordsLoaded} />);

      const promptInputs = screen.getAllByLabelText(/prompt for row 1/i);
      const firstPrompt = promptInputs[0];

      firstPrompt.focus();

      await user.keyboard('{Shift>}{Tab}{/Shift}');

      // Should still be focused (no previous cell)
      expect(firstPrompt).toHaveFocus();
    });
  });

  describe('paste support', () => {
    it('handles tab-separated values paste', async () => {
      render(<ManualEntryTable onWordsLoaded={mockOnWordsLoaded} />);

      const firstPrompt = screen.getAllByLabelText(/prompt for row/i)[0];
      firstPrompt.focus();

      const pasteData = 'hello\thei\ngoodbye\tnäkemiin';

      fireEvent.paste(firstPrompt, {
        clipboardData: {
          getData: () => pasteData,
        },
      });

      await waitFor(() => {
        const promptInputs = screen.getAllByLabelText(/prompt for row/i);
        const answerInputs = screen.getAllByLabelText(/answer for row/i);

        expect(promptInputs[0]).toHaveValue('hello');
        expect(answerInputs[0]).toHaveValue('hei');
        expect(promptInputs[1]).toHaveValue('goodbye');
        expect(answerInputs[1]).toHaveValue('näkemiin');
      });
    });

    it('updates valid word count after paste', async () => {
      render(<ManualEntryTable onWordsLoaded={mockOnWordsLoaded} />);

      const firstPrompt = screen.getAllByLabelText(/prompt for row/i)[0];
      firstPrompt.focus();

      const pasteData = 'hello\thei\ngoodbye\tnäkemiin';

      fireEvent.paste(firstPrompt, {
        clipboardData: {
          getData: () => pasteData,
        },
      });

      await waitFor(
        () => {
          expect(screen.getByText('2')).toBeInTheDocument();
          expect(screen.getByText(/valid.*words entered/i)).toBeInTheDocument();
        },
        { timeout: 2000 },
      );
    });

    it('handles paste with only newlines', async () => {
      render(<ManualEntryTable onWordsLoaded={mockOnWordsLoaded} />);

      const firstPrompt = screen.getAllByLabelText(/prompt for row/i)[0];
      firstPrompt.focus();

      const pasteData = 'hello\thei\n\n\ngoodbye\tnäkemiin';

      fireEvent.paste(firstPrompt, {
        clipboardData: {
          getData: () => pasteData,
        },
      });

      await waitFor(() => {
        const promptInputs = screen.getAllByLabelText(/prompt for row/i);
        expect(promptInputs[0]).toHaveValue('hello');
        expect(promptInputs[1]).toHaveValue('goodbye');
      });
    });
  });

  describe('Clear All functionality', () => {
    it('enables Clear All button when rows have data', async () => {
      const user = userEvent.setup();
      render(<ManualEntryTable onWordsLoaded={mockOnWordsLoaded} />);

      const clearButton = screen.getByRole('button', { name: /clear all/i });
      expect(clearButton).toBeDisabled();

      const firstPrompt = screen.getAllByLabelText(/prompt for row/i)[0];
      await user.type(firstPrompt, 'hello');

      await waitFor(() => {
        expect(clearButton).toBeEnabled();
      });
    });

    it('shows confirmation dialog on Clear All click', async () => {
      const user = userEvent.setup();
      render(<ManualEntryTable onWordsLoaded={mockOnWordsLoaded} />);

      // Add some data first
      const firstPrompt = screen.getAllByLabelText(/prompt for row/i)[0];
      await user.type(firstPrompt, 'hello');

      const clearButton = screen.getByRole('button', { name: /clear all/i });
      await user.click(clearButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText(/clear all entries/i)).toBeInTheDocument();
      });
    });

    it('clears all rows when confirmed', async () => {
      const user = userEvent.setup();
      render(<ManualEntryTable onWordsLoaded={mockOnWordsLoaded} />);

      // Add data
      const promptInputs = screen.getAllByLabelText(/prompt for row/i);
      const answerInputs = screen.getAllByLabelText(/answer for row/i);

      await user.type(promptInputs[0], 'hello');
      await user.type(answerInputs[0], 'hei');

      // Open confirmation
      const clearButton = screen.getByRole('button', { name: /clear all/i });
      await user.click(clearButton);

      // Confirm - the second "Clear All" button is in the dialog
      const allClearButtons = screen.getAllByRole('button', { name: /clear all/i });
      const confirmButton = allClearButtons[1]; // Second button is in dialog
      await user.click(confirmButton);

      await waitFor(() => {
        // Dialog should close
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

        // All inputs should be empty
        const updatedPrompts = screen.getAllByLabelText(/prompt for row/i);
        updatedPrompts.forEach((input) => {
          expect(input).toHaveValue('');
        });
      });
    });

    it('cancels clear operation when canceled', async () => {
      const user = userEvent.setup();
      render(<ManualEntryTable onWordsLoaded={mockOnWordsLoaded} />);

      // Add data
      const promptInputs = screen.getAllByLabelText(/prompt for row/i);
      await user.type(promptInputs[0], 'hello');

      // Open confirmation
      const clearButton = screen.getByRole('button', { name: /clear all/i });
      await user.click(clearButton);

      // Cancel
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      await waitFor(() => {
        // Dialog should close
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

        // Data should remain
        expect(promptInputs[0]).toHaveValue('hello');
      });
    });

    it('resets to 10 rows after clear', async () => {
      const user = userEvent.setup();
      render(<ManualEntryTable onWordsLoaded={mockOnWordsLoaded} />);

      // Add data to multiple rows to create more rows
      const promptInputs = screen.getAllByLabelText(/prompt for row/i);
      await user.type(promptInputs[0], 'hello');
      await user.type(promptInputs[9], 'test'); // Last row will add new row

      await waitFor(() => {
        const allInputs = screen.getAllByRole('textbox');
        expect(allInputs.length).toBeGreaterThan(20);
      });

      // Clear all
      const clearButton = screen.getByRole('button', { name: /clear all/i });
      await user.click(clearButton);

      const confirmButton = screen.getAllByRole('button', { name: /clear all/i })[1];
      await user.click(confirmButton);

      await waitFor(() => {
        const allInputs = screen.getAllByRole('textbox');
        expect(allInputs.length).toBe(20); // 10 rows × 2 columns
      });
    });
  });

  describe('localStorage persistence', () => {
    it('saves data to localStorage', async () => {
      const user = userEvent.setup();
      render(<ManualEntryTable onWordsLoaded={mockOnWordsLoaded} />);

      const promptInputs = screen.getAllByLabelText(/prompt for row/i);
      const answerInputs = screen.getAllByLabelText(/answer for row/i);

      await user.type(promptInputs[0], 'hello');
      await user.type(answerInputs[0], 'hei');

      await waitFor(() => {
        const saved = localStorage.getItem('sanakoe_manual_entry');
        expect(saved).toBeTruthy();

        const parsed = JSON.parse(saved!);
        expect(parsed[0].prompt).toBe('hello');
        expect(parsed[0].answer).toBe('hei');
      });
    });

    it('loads data from localStorage on mount', () => {
      const savedData = JSON.stringify([
        { id: 'test-1', prompt: 'hello', answer: 'hei' },
        { id: 'test-2', prompt: 'goodbye', answer: 'näkemiin' },
        { id: 'test-3', prompt: '', answer: '' },
        { id: 'test-4', prompt: '', answer: '' },
        { id: 'test-5', prompt: '', answer: '' },
        { id: 'test-6', prompt: '', answer: '' },
        { id: 'test-7', prompt: '', answer: '' },
        { id: 'test-8', prompt: '', answer: '' },
        { id: 'test-9', prompt: '', answer: '' },
        { id: 'test-10', prompt: '', answer: '' },
      ]);

      localStorage.setItem('sanakoe_manual_entry', savedData);

      render(<ManualEntryTable onWordsLoaded={mockOnWordsLoaded} />);

      const promptInputs = screen.getAllByLabelText(/prompt for row/i);
      const answerInputs = screen.getAllByLabelText(/answer for row/i);

      expect(promptInputs[0]).toHaveValue('hello');
      expect(answerInputs[0]).toHaveValue('hei');
      expect(promptInputs[1]).toHaveValue('goodbye');
      expect(answerInputs[1]).toHaveValue('näkemiin');
    });

    it('clears localStorage on Clear All', async () => {
      const user = userEvent.setup();

      // Pre-populate localStorage
      const savedData = JSON.stringify([{ id: 'test-1', prompt: 'hello', answer: 'hei' }]);
      localStorage.setItem('sanakoe_manual_entry', savedData);

      render(<ManualEntryTable onWordsLoaded={mockOnWordsLoaded} />);

      // Clear all
      const clearButton = screen.getByRole('button', { name: /clear all entries/i });
      await user.click(clearButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const allClearButtons = screen.getAllByRole('button', { name: /clear all/i });
      const confirmButton = allClearButtons[1];
      await user.click(confirmButton);

      await waitFor(() => {
        expect(localStorage.getItem('sanakoe_manual_entry')).toBeNull();
      });
    });

    it('handles corrupted localStorage data gracefully', () => {
      localStorage.setItem('sanakoe_manual_entry', 'invalid json');

      render(<ManualEntryTable onWordsLoaded={mockOnWordsLoaded} />);

      // Should fall back to 10 empty rows
      const allInputs = screen.getAllByRole('textbox');
      expect(allInputs.length).toBe(20);
    });
  });

  describe('accessibility', () => {
    it('has accessible labels for all inputs', () => {
      render(<ManualEntryTable onWordsLoaded={mockOnWordsLoaded} />);

      const promptInputs = screen.getAllByLabelText(/prompt for row/i);
      const answerInputs = screen.getAllByLabelText(/answer for row/i);

      expect(promptInputs.length).toBe(10);
      expect(answerInputs.length).toBe(10);
    });

    it('has accessible Clear All button', () => {
      render(<ManualEntryTable onWordsLoaded={mockOnWordsLoaded} />);

      const clearButton = screen.getByRole('button', { name: /clear all entries/i });
      expect(clearButton).toBeInTheDocument();
    });

    it('confirmation dialog has proper ARIA attributes', async () => {
      const user = userEvent.setup();
      render(<ManualEntryTable onWordsLoaded={mockOnWordsLoaded} />);

      // Add data and open confirmation
      const firstPrompt = screen.getAllByLabelText(/prompt for row/i)[0];
      await user.type(firstPrompt, 'hello');

      const clearButton = screen.getByRole('button', { name: /clear all/i });
      await user.click(clearButton);

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog).toHaveAttribute('aria-modal', 'true');
        expect(dialog).toHaveAttribute('aria-labelledby');
      });
    });

    it('supports ref forwarding', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<ManualEntryTable ref={ref} onWordsLoaded={mockOnWordsLoaded} />);

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });
});
