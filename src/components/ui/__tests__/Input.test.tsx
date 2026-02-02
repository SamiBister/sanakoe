import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Input, Textarea } from '../Input';

describe('Input', () => {
  describe('rendering', () => {
    it('renders without label', () => {
      render(<Input placeholder="Enter text" />);
      expect(screen.getByPlaceholderText(/enter text/i)).toBeInTheDocument();
    });

    it('renders with label', () => {
      render(<Input label="Username" />);
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    });

    it('renders with error message', () => {
      render(<Input error="This field is required" />);
      expect(screen.getByRole('alert')).toHaveTextContent(/this field is required/i);
    });

    it('renders with helper text', () => {
      render(<Input helperText="Enter your email address" />);
      expect(screen.getByText(/enter your email address/i)).toBeInTheDocument();
    });

    it('shows error instead of helper text when both provided', () => {
      render(<Input error="Error message" helperText="Helper text" />);
      expect(screen.getByRole('alert')).toHaveTextContent(/error message/i);
      expect(screen.queryByText(/helper text/i)).not.toBeInTheDocument();
    });

    it('renders with different sizes', () => {
      const { rerender } = render(<Input inputSize="md" />);
      let input = screen.getByRole('textbox');
      expect(input).toHaveClass('text-base');

      rerender(<Input inputSize="lg" />);
      input = screen.getByRole('textbox');
      expect(input).toHaveClass('text-lg');
    });

    it('renders full width', () => {
      render(<Input fullWidth />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('w-full');
    });

    it('applies error styling when isError is true', () => {
      render(<Input isError />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-danger-500');
    });
  });

  describe('behavior', () => {
    it('accepts user input', async () => {
      const user = userEvent.setup();
      render(<Input />);
      const input = screen.getByRole('textbox');

      await user.type(input, 'Hello World');
      expect(input).toHaveValue('Hello World');
    });

    it('calls onChange handler', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();

      render(<Input onChange={handleChange} />);
      const input = screen.getByRole('textbox');

      await user.type(input, 'a');
      expect(handleChange).toHaveBeenCalled();
    });

    it('can be disabled', () => {
      render(<Input disabled />);
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('associates label with input', () => {
      render(<Input label="Email" />);
      const input = screen.getByLabelText(/email/i);
      const label = screen.getByText(/email/i);
      expect(input).toHaveAccessibleName(/email/i);
    });
  });

  describe('accessibility', () => {
    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<Input ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });

    it('has proper ARIA attributes when disabled', () => {
      render(<Input disabled label="Disabled input" />);
      const input = screen.getByLabelText(/disabled input/i);
      expect(input).toBeDisabled();
    });

    it('error message has role alert', () => {
      render(<Input error="Error" />);
      const error = screen.getByRole('alert');
      expect(error).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<Input className="custom-input" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('custom-input');
    });
  });

  describe('focus management', () => {
    it('can receive focus', async () => {
      const user = userEvent.setup();
      render(<Input />);
      const input = screen.getByRole('textbox');

      await user.click(input);
      expect(input).toHaveFocus();
    });

    it('applies focus styles', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('focus:ring-4');
    });
  });
});

describe('Textarea', () => {
  describe('rendering', () => {
    it('renders without label', () => {
      render(<Textarea placeholder="Enter text" />);
      expect(screen.getByPlaceholderText(/enter text/i)).toBeInTheDocument();
    });

    it('renders with label', () => {
      render(<Textarea label="Description" />);
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    });

    it('renders with error message', () => {
      render(<Textarea error="This field is required" />);
      expect(screen.getByRole('alert')).toHaveTextContent(/this field is required/i);
    });

    it('renders with helper text', () => {
      render(<Textarea helperText="Enter a description" />);
      expect(screen.getByText(/enter a description/i)).toBeInTheDocument();
    });

    it('renders with specified rows', () => {
      render(<Textarea rows={6} />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('rows', '6');
    });

    it('renders full width', () => {
      render(<Textarea fullWidth />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('w-full');
    });
  });

  describe('behavior', () => {
    it('accepts user input', async () => {
      const user = userEvent.setup();
      render(<Textarea />);
      const textarea = screen.getByRole('textbox');

      await user.type(textarea, 'Multi-line\ntext');
      expect(textarea).toHaveValue('Multi-line\ntext');
    });

    it('calls onChange handler', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();

      render(<Textarea onChange={handleChange} />);
      const textarea = screen.getByRole('textbox');

      await user.type(textarea, 'a');
      expect(handleChange).toHaveBeenCalled();
    });

    it('can be disabled', () => {
      render(<Textarea disabled />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeDisabled();
    });
  });

  describe('accessibility', () => {
    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLTextAreaElement>();
      render(<Textarea ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
    });

    it('applies custom className', () => {
      render(<Textarea className="custom-textarea" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('custom-textarea');
    });

    it('error message has role alert', () => {
      render(<Textarea error="Error" />);
      const error = screen.getByRole('alert');
      expect(error).toBeInTheDocument();
    });
  });
});
