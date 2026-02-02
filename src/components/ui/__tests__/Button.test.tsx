import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Button } from '../Button';

describe('Button', () => {
  describe('rendering', () => {
    it('renders with default props', () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toBeInTheDocument();
    });

    it('renders with primary variant', () => {
      render(<Button variant="primary">Primary</Button>);
      const button = screen.getByRole('button', { name: /primary/i });
      expect(button).toHaveClass('bg-primary-500');
    });

    it('renders with secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole('button', { name: /secondary/i });
      expect(button).toHaveClass('border-primary-500');
    });

    it('renders with danger variant', () => {
      render(<Button variant="danger">Delete</Button>);
      const button = screen.getByRole('button', { name: /delete/i });
      expect(button).toHaveClass('bg-danger-500');
    });

    it('renders with different sizes', () => {
      const { rerender } = render(<Button size="sm">Small</Button>);
      let button = screen.getByRole('button', { name: /small/i });
      expect(button).toHaveClass('text-base');

      rerender(<Button size="md">Medium</Button>);
      button = screen.getByRole('button', { name: /medium/i });
      expect(button).toHaveClass('text-lg');

      rerender(<Button size="lg">Large</Button>);
      button = screen.getByRole('button', { name: /large/i });
      expect(button).toHaveClass('text-xl');
    });

    it('renders full width when specified', () => {
      render(<Button fullWidth>Full Width</Button>);
      const button = screen.getByRole('button', { name: /full width/i });
      expect(button).toHaveClass('w-full');
    });

    it('renders loading state', () => {
      render(<Button loading>Submit</Button>);
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
      expect(screen.queryByText(/submit/i)).not.toBeInTheDocument();
    });
  });

  describe('behavior', () => {
    it('calls onClick handler when clicked', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();

      render(<Button onClick={handleClick}>Click me</Button>);
      const button = screen.getByRole('button', { name: /click me/i });

      await user.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();

      render(
        <Button onClick={handleClick} disabled>
          Disabled
        </Button>,
      );
      const button = screen.getByRole('button', { name: /disabled/i });

      await user.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('does not call onClick when loading', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();

      render(
        <Button onClick={handleClick} loading>
          Submit
        </Button>,
      );
      const button = screen.getByRole('button', { name: /loading/i });

      await user.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('is keyboard accessible', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();

      render(<Button onClick={handleClick}>Press me</Button>);
      const button = screen.getByRole('button', { name: /press me/i });

      button.focus();
      expect(button).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('accessibility', () => {
    it('has proper ARIA attributes when disabled', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button', { name: /disabled/i });
      expect(button).toBeDisabled();
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<Button ref={ref}>Button</Button>);
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });

    it('applies custom className', () => {
      render(<Button className="custom-class">Button</Button>);
      const button = screen.getByRole('button', { name: /button/i });
      expect(button).toHaveClass('custom-class');
    });
  });
});
