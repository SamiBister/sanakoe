import { render, screen } from '@testing-library/react';
import React from 'react';
import { Rocket } from '../Rocket';

describe('Rocket', () => {
  describe('rendering', () => {
    it('renders without crashing', () => {
      render(<Rocket />);
      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('renders with default size (24px)', () => {
      render(<Rocket />);
      const img = screen.getByRole('img');
      const image = img.querySelector('img');
      expect(image).toHaveAttribute('width', '24');
      expect(image).toHaveAttribute('height', '24');
    });

    it('renders with custom size', () => {
      render(<Rocket size={32} />);
      const img = screen.getByRole('img');
      const image = img.querySelector('img');
      expect(image).toHaveAttribute('width', '32');
      expect(image).toHaveAttribute('height', '32');
    });

    it('renders with default aria-label', () => {
      render(<Rocket />);
      expect(screen.getByLabelText('Rocket')).toBeInTheDocument();
    });

    it('renders with custom aria-label', () => {
      render(<Rocket ariaLabel="Launch rocket" />);
      expect(screen.getByLabelText('Launch rocket')).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      render(<Rocket className="rocket-icon" />);
      const img = screen.getByRole('img');
      expect(img).toHaveClass('rocket-icon');
    });

    it('loads rocket.svg icon', () => {
      render(<Rocket />);
      const img = screen.getByRole('img');
      const image = img.querySelector('img');
      expect(image).toHaveAttribute('src', '/icons/rocket.svg');
    });
  });

  describe('accessibility', () => {
    it("has role='img'", () => {
      render(<Rocket />);
      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('has aria-label for screen readers', () => {
      render(<Rocket ariaLabel="Motivation rocket" />);
      expect(screen.getByLabelText('Motivation rocket')).toBeInTheDocument();
    });

    it('image has empty alt text (decorative)', () => {
      render(<Rocket />);
      const img = screen.getByRole('img');
      const image = img.querySelector('img');
      expect(image).toHaveAttribute('alt', '');
    });

    it('supports ref forwarding', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<Rocket ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('interaction', () => {
    it('accepts onClick handler', () => {
      const handleClick = jest.fn();
      render(<Rocket onClick={handleClick} />);
      const img = screen.getByRole('img');
      img.click();
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('spreads additional HTML attributes', () => {
      render(<Rocket data-testid="rocket-icon" />);
      expect(screen.getByTestId('rocket-icon')).toBeInTheDocument();
    });
  });
});
