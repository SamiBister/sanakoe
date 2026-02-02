import { render, screen } from '@testing-library/react';
import React from 'react';
import { Star } from '../Star';

describe('Star', () => {
  describe('rendering', () => {
    it('renders without crashing', () => {
      render(<Star />);
      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('renders with default size (24px)', () => {
      render(<Star />);
      const img = screen.getByRole('img');
      const image = img.querySelector('img');
      expect(image).toHaveAttribute('width', '24');
      expect(image).toHaveAttribute('height', '24');
    });

    it('renders with custom size', () => {
      render(<Star size={48} />);
      const img = screen.getByRole('img');
      const image = img.querySelector('img');
      expect(image).toHaveAttribute('width', '48');
      expect(image).toHaveAttribute('height', '48');
    });

    it('renders with default aria-label', () => {
      render(<Star />);
      expect(screen.getByLabelText('Star')).toBeInTheDocument();
    });

    it('renders with custom aria-label', () => {
      render(<Star ariaLabel="Correct answer" />);
      expect(screen.getByLabelText('Correct answer')).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      render(<Star className="custom-class" />);
      const img = screen.getByRole('img');
      expect(img).toHaveClass('custom-class');
    });

    it('loads star.svg icon', () => {
      render(<Star />);
      const img = screen.getByRole('img');
      const image = img.querySelector('img');
      expect(image).toHaveAttribute('src', '/icons/star.svg');
    });
  });

  describe('accessibility', () => {
    it("has role='img'", () => {
      render(<Star />);
      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('has aria-label for screen readers', () => {
      render(<Star ariaLabel="Achievement star" />);
      expect(screen.getByLabelText('Achievement star')).toBeInTheDocument();
    });

    it('image has empty alt text (decorative)', () => {
      render(<Star />);
      const img = screen.getByRole('img');
      const image = img.querySelector('img');
      expect(image).toHaveAttribute('alt', '');
    });

    it('supports ref forwarding', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<Star ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('interaction', () => {
    it('accepts onClick handler', () => {
      const handleClick = jest.fn();
      render(<Star onClick={handleClick} />);
      const img = screen.getByRole('img');
      img.click();
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('spreads additional HTML attributes', () => {
      render(<Star data-testid="star-icon" />);
      expect(screen.getByTestId('star-icon')).toBeInTheDocument();
    });
  });
});
