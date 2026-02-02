import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Modal } from '../Modal';

// Mock createPortal to render in the same container
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (node: React.ReactNode) => node,
}));

describe('Modal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    children: <div>Modal content</div>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Clean up body overflow style
    document.body.style.overflow = '';
  });

  describe('rendering', () => {
    it('renders when isOpen is true', () => {
      render(<Modal {...defaultProps} />);
      expect(screen.getByText(/modal content/i)).toBeInTheDocument();
    });

    it('does not render when isOpen is false', () => {
      render(<Modal {...defaultProps} isOpen={false} />);
      expect(screen.queryByText(/modal content/i)).not.toBeInTheDocument();
    });

    it('renders with title', () => {
      render(<Modal {...defaultProps} title="Test Modal" />);
      expect(screen.getByText(/test modal/i)).toBeInTheDocument();
    });

    it('renders with footer', () => {
      render(<Modal {...defaultProps} footer={<button>Save</button>} />);
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });

    it('renders close button by default', () => {
      render(<Modal {...defaultProps} title="Modal" />);
      expect(screen.getByRole('button', { name: /close modal/i })).toBeInTheDocument();
    });

    it('hides close button when showCloseButton is false', () => {
      render(<Modal {...defaultProps} title="Modal" showCloseButton={false} />);
      expect(screen.queryByRole('button', { name: /close modal/i })).not.toBeInTheDocument();
    });

    it('renders with different sizes', () => {
      const { rerender, container } = render(<Modal {...defaultProps} size="sm" />);
      let modalContent = container.querySelector('.max-w-md');
      expect(modalContent).toBeInTheDocument();

      rerender(<Modal {...defaultProps} size="md" />);
      modalContent = container.querySelector('.max-w-lg');
      expect(modalContent).toBeInTheDocument();

      rerender(<Modal {...defaultProps} size="lg" />);
      modalContent = container.querySelector('.max-w-2xl');
      expect(modalContent).toBeInTheDocument();

      rerender(<Modal {...defaultProps} size="xl" />);
      modalContent = container.querySelector('.max-w-4xl');
      expect(modalContent).toBeInTheDocument();
    });
  });

  describe('behavior', () => {
    it('calls onClose when close button is clicked', async () => {
      const handleClose = jest.fn();
      const user = userEvent.setup();

      render(<Modal {...defaultProps} onClose={handleClose} title="Modal" />);

      const closeButton = screen.getByRole('button', { name: /close modal/i });
      await user.click(closeButton);

      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when ESC key is pressed', async () => {
      const handleClose = jest.fn();
      const user = userEvent.setup();

      render(<Modal {...defaultProps} onClose={handleClose} />);

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(handleClose).toHaveBeenCalledTimes(1);
      });
    });

    it('does not call onClose on ESC when closeOnEsc is false', async () => {
      const handleClose = jest.fn();
      const user = userEvent.setup();

      render(<Modal {...defaultProps} onClose={handleClose} closeOnEsc={false} />);

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(handleClose).not.toHaveBeenCalled();
      });
    });

    it('calls onClose when overlay is clicked', async () => {
      const handleClose = jest.fn();
      const user = userEvent.setup();

      render(<Modal {...defaultProps} onClose={handleClose} />);

      const dialog = screen.getByRole('dialog');
      await user.click(dialog);

      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose when clicking modal content', async () => {
      const handleClose = jest.fn();
      const user = userEvent.setup();

      render(<Modal {...defaultProps} onClose={handleClose} />);

      const content = screen.getByText(/modal content/i);
      await user.click(content);

      expect(handleClose).not.toHaveBeenCalled();
    });

    it('does not call onClose on overlay click when closeOnOverlayClick is false', async () => {
      const handleClose = jest.fn();
      const user = userEvent.setup();

      render(<Modal {...defaultProps} onClose={handleClose} closeOnOverlayClick={false} />);

      const dialog = screen.getByRole('dialog');
      await user.click(dialog);

      expect(handleClose).not.toHaveBeenCalled();
    });
  });

  describe('body scroll', () => {
    it('prevents body scroll when modal is open', () => {
      render(<Modal {...defaultProps} />);
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('restores body scroll when modal closes', () => {
      const { rerender } = render(<Modal {...defaultProps} />);
      expect(document.body.style.overflow).toBe('hidden');

      rerender(<Modal {...defaultProps} isOpen={false} />);
      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('accessibility', () => {
    it('has role dialog', () => {
      render(<Modal {...defaultProps} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('has aria-modal attribute', () => {
      render(<Modal {...defaultProps} />);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('has aria-labelledby when title is provided', () => {
      render(<Modal {...defaultProps} title="Test Modal" />);
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
    });

    it('close button has aria-label', () => {
      render(<Modal {...defaultProps} title="Modal" />);
      const closeButton = screen.getByRole('button', { name: /close modal/i });
      expect(closeButton).toHaveAttribute('aria-label', 'Close modal');
    });

    it('focuses modal content when opened', async () => {
      jest.useFakeTimers();
      render(<Modal {...defaultProps} />);

      // Fast-forward time to allow focus
      jest.advanceTimersByTime(150);

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        const modalContent = dialog.querySelector('[tabindex="-1"]');
        expect(modalContent).toHaveFocus();
      });

      jest.useRealTimers();
    });
  });

  describe('focus trap', () => {
    it('traps focus within modal', async () => {
      const user = userEvent.setup();

      render(
        <Modal {...defaultProps} title="Modal">
          <button>First button</button>
          <button>Second button</button>
        </Modal>,
      );

      const firstButton = screen.getByRole('button', { name: /first button/i });
      const secondButton = screen.getByRole('button', {
        name: /second button/i,
      });
      const closeButton = screen.getByRole('button', { name: /close modal/i });

      // Focus first button
      firstButton.focus();
      expect(firstButton).toHaveFocus();

      // Tab forward
      await user.tab();
      expect(secondButton).toHaveFocus();

      await user.tab();
      expect(closeButton).toHaveFocus();

      // Tab from last element should wrap to first
      await user.tab();
      expect(firstButton).toHaveFocus();
    });

    it('supports shift+tab to navigate backwards', async () => {
      const user = userEvent.setup();

      render(
        <Modal {...defaultProps} title="Modal">
          <button>First button</button>
          <button>Second button</button>
        </Modal>,
      );

      const firstButton = screen.getByRole('button', { name: /first button/i });
      const closeButton = screen.getByRole('button', { name: /close modal/i });

      // Focus first button
      firstButton.focus();
      expect(firstButton).toHaveFocus();

      // Shift+Tab from first element should wrap to last
      await user.tab({ shift: true });
      expect(closeButton).toHaveFocus();
    });
  });
});
