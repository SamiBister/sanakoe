import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Card, CardBody, CardFooter, CardHeader } from '../Card';

describe('Card', () => {
  describe('Card component', () => {
    it('renders with default props', () => {
      render(<Card>Card content</Card>);
      expect(screen.getByText(/card content/i)).toBeInTheDocument();
    });

    it('renders with different variants', () => {
      const { rerender, container } = render(<Card variant="default">Default</Card>);
      let card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('shadow-md');

      rerender(<Card variant="outlined">Outlined</Card>);
      card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('border-2');

      rerender(<Card variant="elevated">Elevated</Card>);
      card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('shadow-xl');
    });

    it('renders with different padding sizes', () => {
      const { rerender, container } = render(<Card padding="none">None</Card>);
      let card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('p-0');

      rerender(<Card padding="sm">Small</Card>);
      card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('p-4');

      rerender(<Card padding="md">Medium</Card>);
      card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('p-6');

      rerender(<Card padding="lg">Large</Card>);
      card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('p-8');
    });

    it('renders as hoverable', () => {
      const { container } = render(<Card hoverable>Hoverable</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('hover:shadow-lg');
      expect(card).toHaveClass('cursor-pointer');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<Card ref={ref}>Card</Card>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('applies custom className', () => {
      const { container } = render(<Card className="custom-class">Card</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('custom-class');
    });
  });

  describe('CardHeader component', () => {
    it('renders header content', () => {
      render(<CardHeader>Header Title</CardHeader>);
      expect(screen.getByText(/header title/i)).toBeInTheDocument();
    });

    it('renders action element', () => {
      render(<CardHeader action={<button>Action</button>}>Title</CardHeader>);
      expect(screen.getByText(/title/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /action/i })).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(<CardHeader className="custom-header">Header</CardHeader>);
      const header = container.firstChild as HTMLElement;
      expect(header).toHaveClass('custom-header');
    });
  });

  describe('CardBody component', () => {
    it('renders body content', () => {
      render(<CardBody>Body content goes here</CardBody>);
      expect(screen.getByText(/body content goes here/i)).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(<CardBody className="custom-body">Body</CardBody>);
      const body = container.firstChild as HTMLElement;
      expect(body).toHaveClass('custom-body');
    });
  });

  describe('CardFooter component', () => {
    it('renders footer content', () => {
      render(<CardFooter>Footer content</CardFooter>);
      expect(screen.getByText(/footer content/i)).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(<CardFooter className="custom-footer">Footer</CardFooter>);
      const footer = container.firstChild as HTMLElement;
      expect(footer).toHaveClass('custom-footer');
    });

    it('has border-top styling', () => {
      const { container } = render(<CardFooter>Footer</CardFooter>);
      const footer = container.firstChild as HTMLElement;
      expect(footer).toHaveClass('border-t');
    });
  });

  describe('Card composition', () => {
    it('renders full card with all parts', () => {
      render(
        <Card>
          <CardHeader action={<button>Edit</button>}>Card Title</CardHeader>
          <CardBody>This is the main content of the card.</CardBody>
          <CardFooter>
            <button>Save</button>
          </CardFooter>
        </Card>,
      );

      expect(screen.getByText(/card title/i)).toBeInTheDocument();
      expect(screen.getByText(/this is the main content/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });
  });

  describe('interaction', () => {
    it('handles click when hoverable', async () => {
      const handleClick = jest.fn();
      const user = userEvent.setup();

      const { container } = render(
        <Card hoverable onClick={handleClick}>
          Clickable card
        </Card>,
      );

      const card = container.firstChild as HTMLElement;
      await user.click(card);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });
});
