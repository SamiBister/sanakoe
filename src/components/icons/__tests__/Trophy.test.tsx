import React from "react";
import { render, screen } from "@testing-library/react";
import { Trophy } from "../Trophy";

describe("Trophy", () => {
  describe("rendering", () => {
    it("renders without crashing", () => {
      render(<Trophy />);
      expect(screen.getByRole("img")).toBeInTheDocument();
    });

    it("renders with default size (24px)", () => {
      render(<Trophy />);
      const img = screen.getByRole("img");
      const image = img.querySelector("img");
      expect(image).toHaveAttribute("width", "24");
      expect(image).toHaveAttribute("height", "24");
    });

    it("renders with custom size", () => {
      render(<Trophy size={64} />);
      const img = screen.getByRole("img");
      const image = img.querySelector("img");
      expect(image).toHaveAttribute("width", "64");
      expect(image).toHaveAttribute("height", "64");
    });

    it("renders with default aria-label", () => {
      render(<Trophy />);
      expect(screen.getByLabelText("Trophy")).toBeInTheDocument();
    });

    it("renders with custom aria-label", () => {
      render(<Trophy ariaLabel="New record trophy" />);
      expect(screen.getByLabelText("New record trophy")).toBeInTheDocument();
    });

    it("renders with custom className", () => {
      render(<Trophy className="trophy-icon" />);
      const img = screen.getByRole("img");
      expect(img).toHaveClass("trophy-icon");
    });

    it("loads trophy.svg icon", () => {
      render(<Trophy />);
      const img = screen.getByRole("img");
      const image = img.querySelector("img");
      expect(image).toHaveAttribute("src", "/icons/trophy.svg");
    });
  });

  describe("accessibility", () => {
    it("has role='img'", () => {
      render(<Trophy />);
      expect(screen.getByRole("img")).toBeInTheDocument();
    });

    it("has aria-label for screen readers", () => {
      render(<Trophy ariaLabel="Best score trophy" />);
      expect(screen.getByLabelText("Best score trophy")).toBeInTheDocument();
    });

    it("image has empty alt text (decorative)", () => {
      render(<Trophy />);
      const img = screen.getByRole("img");
      const image = img.querySelector("img");
      expect(image).toHaveAttribute("alt", "");
    });

    it("supports ref forwarding", () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<Trophy ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe("interaction", () => {
    it("accepts onClick handler", () => {
      const handleClick = jest.fn();
      render(<Trophy onClick={handleClick} />);
      const img = screen.getByRole("img");
      img.click();
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("spreads additional HTML attributes", () => {
      render(<Trophy data-testid="trophy-icon" />);
      expect(screen.getByTestId("trophy-icon")).toBeInTheDocument();
    });
  });
});
