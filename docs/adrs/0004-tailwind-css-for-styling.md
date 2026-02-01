# 0004. Tailwind CSS for Styling

**Date:** 2026-02-01  
**Status:** Accepted

## Context

Sanakoe needs a styling solution that enables rapid development of a **kid-friendly, accessible, and playful UI**.

**Design Requirements:**

1. **Kid-Friendly Aesthetics:**
   - Large, readable text (18px+ base size)
   - Bright, cheerful colors
   - Rounded corners and soft edges
   - Playful animations and transitions
   - Clear visual hierarchy

2. **Accessibility:**
   - WCAG 2.1 Level AA compliance (contrast 4.5:1 minimum)
   - Focus visible styles
   - Touch targets ≥44px
   - Respect `prefers-reduced-motion`

3. **Responsive Design:**
   - Desktop-first (primary)
   - Tablet support (768px+)
   - Mobile support (nice-to-have)

4. **Development Velocity:**
   - Fast prototyping
   - Easy to iterate on designs
   - Consistent spacing and sizing
   - Reusable component patterns

**Technical constraints:**

- Next.js 14+ with App Router
- TypeScript
- Static export (no runtime styling)
- Small bundle size preferred

## Decision

We will use **Tailwind CSS** with a custom configuration optimized for kid-friendly design.

**Implementation:**

### 1. Configuration

```javascript
// tailwind.config.js
const {fontFamily} = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Kid-friendly color palette
        primary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9", // Main brand color
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
        success: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e", // Correct answer
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },
        warning: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b", // Practice mode
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },
        error: {
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#ef4444", // Incorrect answer (gentle)
          600: "#dc2626",
          700: "#b91c1c",
          800: "#991b1b",
          900: "#7f1d1d",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", ...fontFamily.sans],
      },
      fontSize: {
        // Larger base sizes for kids
        base: ["18px", {lineHeight: "1.6"}],
        lg: ["20px", {lineHeight: "1.6"}],
        xl: ["24px", {lineHeight: "1.5"}],
        "2xl": ["30px", {lineHeight: "1.4"}],
        "3xl": ["36px", {lineHeight: "1.3"}],
        "4xl": ["48px", {lineHeight: "1.2"}],
      },
      borderRadius: {
        // More rounded corners
        DEFAULT: "12px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
        "3xl": "32px",
      },
      boxShadow: {
        // Softer, more playful shadows
        sm: "0 2px 8px 0 rgb(0 0 0 / 0.08)",
        DEFAULT: "0 4px 12px 0 rgb(0 0 0 / 0.12)",
        md: "0 6px 16px 0 rgb(0 0 0 / 0.15)",
        lg: "0 10px 24px 0 rgb(0 0 0 / 0.18)",
        xl: "0 16px 32px 0 rgb(0 0 0 / 0.20)",
      },
      animation: {
        // Playful animations
        "bounce-gentle": "bounce 1s ease-in-out infinite",
        wiggle: "wiggle 0.5s ease-in-out",
        "scale-up": "scale-up 0.3s ease-out",
        "fade-in": "fade-in 0.3s ease-in",
        "slide-up": "slide-up 0.4s ease-out",
      },
      keyframes: {
        wiggle: {
          "0%, 100%": {transform: "rotate(-3deg)"},
          "50%": {transform: "rotate(3deg)"},
        },
        "scale-up": {
          "0%": {transform: "scale(0.8)", opacity: "0"},
          "100%": {transform: "scale(1)", opacity: "1"},
        },
        "fade-in": {
          "0%": {opacity: "0"},
          "100%": {opacity: "1"},
        },
        "slide-up": {
          "0%": {transform: "translateY(20px)", opacity: "0"},
          "100%": {transform: "translateY(0)", opacity: "1"},
        },
      },
      spacing: {
        // Consistent spacing scale
        18: "4.5rem",
        88: "22rem",
        112: "28rem",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"), // Better form defaults
  ],
};
```

### 2. Global Styles

```css
/* src/app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --font-inter: "Inter", system-ui, sans-serif;
  }

  * {
    @apply border-gray-200;
  }

  html {
    @apply antialiased;
  }

  body {
    @apply bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 text-gray-900;
    @apply min-h-screen;
  }

  /* Focus visible for accessibility */
  *:focus-visible {
    @apply outline-none ring-4 ring-primary-400 ring-offset-2;
  }

  /* Respect reduced motion preference */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
}

@layer components {
  /* Button variants */
  .btn {
    @apply inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-lg;
    @apply transition-all duration-200 focus-visible:ring-4;
    @apply disabled:opacity-50 disabled:cursor-not-allowed;
  }

  .btn-primary {
    @apply btn bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700;
    @apply shadow-md hover:shadow-lg;
  }

  .btn-secondary {
    @apply btn bg-white text-primary-600 border-2 border-primary-500;
    @apply hover:bg-primary-50 active:bg-primary-100;
  }

  .btn-success {
    @apply btn bg-success-500 text-white hover:bg-success-600;
    @apply shadow-md hover:shadow-lg;
  }

  .btn-danger {
    @apply btn bg-error-500 text-white hover:bg-error-600;
  }

  /* Card component */
  .card {
    @apply bg-white rounded-2xl shadow-md p-6;
    @apply border border-gray-100;
  }

  .card-hover {
    @apply card transition-all duration-200;
    @apply hover:shadow-lg hover:-translate-y-1;
  }

  /* Input component */
  .input {
    @apply w-full px-4 py-3 rounded-lg border-2 border-gray-300;
    @apply text-lg focus:border-primary-500 focus:ring-0;
    @apply transition-colors duration-200;
    @apply placeholder:text-gray-400;
  }

  .input-error {
    @apply input border-error-500 focus:border-error-600;
  }

  /* Badge/Label */
  .badge {
    @apply inline-flex items-center px-3 py-1 rounded-full text-sm font-medium;
  }

  .badge-success {
    @apply badge bg-success-100 text-success-700;
  }

  .badge-warning {
    @apply badge bg-warning-100 text-warning-700;
  }

  .badge-error {
    @apply badge bg-error-100 text-error-700;
  }
}

@layer utilities {
  /* Touch-friendly minimum sizes */
  .touch-target {
    @apply min-w-[44px] min-h-[44px];
  }

  /* Text truncation helpers */
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}
```

### 3. Component Examples

**Button Component:**

```typescript
// src/components/ui/Button.tsx
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'btn touch-target',
          {
            'btn-primary': variant === 'primary',
            'btn-secondary': variant === 'secondary',
            'btn-success': variant === 'success',
            'btn-danger': variant === 'danger',
            'px-4 py-2 text-base': size === 'sm',
            'px-6 py-3 text-lg': size === 'md',
            'px-8 py-4 text-xl': size === 'lg',
          },
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
```

**Card Component:**

```typescript
// src/components/ui/Card.tsx
import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(hover ? 'card-hover' : 'card', className)}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';
```

**Utility Function:**

```typescript
// src/lib/utils.ts
import {clsx, type ClassValue} from "clsx";
import {twMerge} from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### 4. Usage in Pages

```typescript
// src/app/[locale]/page.tsx
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function StartPage() {
  return (
    <main className="container mx-auto px-4 py-12 min-h-screen flex items-center justify-center">
      <Card className="max-w-2xl w-full">
        <h1 className="text-4xl font-bold text-center mb-4 text-primary-600">
          Vocabulary Quiz
        </h1>
        <p className="text-xl text-center text-gray-600 mb-8">
          Practice your words and improve your skills!
        </p>

        <div className="space-y-4">
          <Button variant="primary" className="w-full">
            Upload CSV File
          </Button>
          <Button variant="secondary" className="w-full">
            Enter Words Manually
          </Button>
        </div>
      </Card>
    </main>
  );
}
```

## Consequences

### Positive

1. **Rapid development** - Utility classes enable fast prototyping
2. **Consistent design system** - Custom config ensures uniformity
3. **Small bundle size** - PurgeCSS removes unused styles (typically <10KB)
4. **Great DX** - IntelliSense autocomplete for classes
5. **Responsive by default** - Mobile-first breakpoints built-in
6. **Accessibility helpers** - Form plugins and focus styles included
7. **No naming conflicts** - No CSS class naming decisions needed
8. **Easy theming** - Custom colors and spacing in one config file
9. **Production-ready** - Optimized builds with PostCSS
10. **Large community** - Extensive examples and component libraries

### Negative

1. **HTML verbosity** - Long className strings can be unwieldy
2. **Learning curve** - Team needs to learn utility class names
3. **Purge misconfiguration risks** - Wrong config can remove needed styles
4. **Less semantic HTML** - Classes describe styling, not content
5. **Harder code reviews** - Long className diffs in Git
6. **Debugging complexity** - No traditional CSS files to inspect

### Neutral

1. **Opinionated approach** - Love-it-or-hate-it utility-first methodology
2. **Build step required** - Need PostCSS processing (already have with Next.js)
3. **Component extraction needed** - Reusable components still require separate files

## Alternatives Considered

### Alternative 1: CSS Modules

**Description:** Scoped CSS with `.module.css` files.

```css
/* Button.module.css */
.button {
  padding: 12px 24px;
  border-radius: 8px;
  background: blue;
}

.buttonPrimary {
  background: #0ea5e9;
}
```

```typescript
import styles from './Button.module.css';
<button className={styles.buttonPrimary}>Click</button>
```

**Why rejected:**

- **Slow iteration** - Switch between CSS and TSX files constantly
- **Naming overhead** - Need to invent class names for everything
- **No design system** - Manual spacing, colors, sizes
- **Larger bundle** - No automatic purging of unused styles
- **Responsive complexity** - Media queries in separate file

**When to reconsider:** If team strongly prefers traditional CSS or needs complex animations.

### Alternative 2: Styled Components (CSS-in-JS)

**Description:** Write CSS directly in JavaScript with tagged templates.

```typescript
import styled from 'styled-components';

const Button = styled.button`
  padding: 12px 24px;
  background: ${props => props.primary ? '#0ea5e9' : '#fff'};
  border-radius: 8px;

  &:hover {
    background: ${props => props.primary ? '#0284c7' : '#f0f9ff'};
  }
`;

<Button primary>Click</Button>
```

**Why rejected:**

- **Runtime cost** - Styles injected at runtime (slower initial render)
- **Larger bundle** - 12KB+ for styled-components library
- **SSR complexity** - Server-side rendering configuration needed
- **Static export issues** - Not ideal for Next.js static export
- **Slow build times** - CSS-in-JS processing adds build overhead
- **Hydration overhead** - Need to rehydrate styles on client

**When to reconsider:** If need dynamic theming with runtime style changes.

### Alternative 3: Vanilla CSS with BEM

**Description:** Traditional CSS with Block-Element-Modifier naming convention.

```css
/* styles.css */
.button {
  padding: 12px 24px;
}

.button--primary {
  background: #0ea5e9;
}

.button__icon {
  margin-right: 8px;
}
```

```typescript
<button className="button button--primary">
  <span className="button__icon">★</span>
  Click
</button>
```

**Why rejected:**

- **Manual design system** - No built-in spacing/color scale
- **Global namespace** - Risk of naming conflicts
- **No purging** - Unused styles included in bundle
- **Responsive pain** - Lots of media query boilerplate
- **Maintenance burden** - CSS file grows endlessly

**When to reconsider:** Never for this project.

### Alternative 4: Chakra UI (Component Library)

**Description:** Pre-built component library with Tailwind-like props.

```typescript
import { Button, Box, Text } from '@chakra-ui/react';

<Box p={4} bg="blue.500">
  <Text fontSize="xl">Hello</Text>
  <Button colorScheme="blue">Click</Button>
</Box>
```

**Why rejected:**

- **Large bundle** - 50KB+ for full library
- **Limited customization** - Harder to achieve kid-friendly aesthetic
- **Runtime styling** - Uses Emotion (CSS-in-JS) under the hood
- **Learning curve** - New prop API to learn
- **Opinionated design** - Default theme doesn't match our vision
- **Over-engineering** - We don't need complex components like Accordion, Drawer, etc.

**When to reconsider:** For rapid prototyping with pre-built complex components.

## Implementation Guidelines

### Component Patterns

**Compound Components:**

```typescript
// ✅ Good: Reusable card with composition
<Card>
  <CardHeader>
    <CardTitle>Quiz Results</CardTitle>
  </CardHeader>
  <CardContent>
    <p>You scored 10/10!</p>
  </CardContent>
  <CardFooter>
    <Button>Restart</Button>
  </CardFooter>
</Card>
```

**Utility Function for Conditional Classes:**

```typescript
// ✅ Always use cn() utility
import { cn } from '@/lib/utils';

<div className={cn(
  'base-class',
  isActive && 'active-class',
  isDisabled && 'disabled-class',
  className // Allow prop overrides
)} />
```

### Color Usage Guidelines

```typescript
// ✅ Use semantic color names
bg-primary-500    // Brand color
text-success-600  // Correct answers
bg-warning-100    // Practice mode
text-error-500    // Incorrect answers

// ❌ Avoid arbitrary colors
bg-[#0ea5e9]      // Hard to maintain
```

### Spacing Consistency

```typescript
// ✅ Use spacing scale
space-y-4   // 1rem (16px)
space-y-6   // 1.5rem (24px)
space-y-8   // 2rem (32px)

// ❌ Avoid arbitrary values
space-y-[17px]  // Breaks design system
```

### Responsive Design

```typescript
// ✅ Mobile-first approach
<div className="
  text-base      // 18px on mobile
  md:text-lg     // 20px on tablet
  lg:text-xl     // 24px on desktop
">
  Content
</div>
```

### Accessibility

```typescript
// ✅ Always include focus states
<button className="
  bg-primary-500
  hover:bg-primary-600
  focus-visible:ring-4 focus-visible:ring-primary-400
  disabled:opacity-50 disabled:cursor-not-allowed
">
  Submit
</button>

// ✅ Respect reduced motion
<div className="
  transition-transform duration-300
  motion-reduce:transition-none
">
  Animated content
</div>
```

### Custom Animations

```typescript
// ✅ Use configured animations
className = "animate-fade-in";
className = "animate-scale-up";
className = "animate-wiggle";

// For one-off animations, use arbitrary values
className = "animate-[wiggle_1s_ease-in-out]";
```

## Performance Optimization

### PurgeCSS Configuration

Tailwind automatically removes unused styles in production:

```javascript
// next.config.js ensures all files are scanned
content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"];
```

**Result:** Production CSS typically <10KB gzipped.

### Dynamic Classes

```typescript
// ❌ Bad: Dynamic classes won't be purged properly
const buttonColor = `bg-${color}-500`; // Don't do this!

// ✅ Good: Use complete class names
const buttonClasses = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  red: 'bg-red-500'
};
className={buttonClasses[color]}
```

### JIT Mode

Tailwind 3+ uses Just-In-Time mode by default:

- Generates styles on-demand during development
- Faster build times
- Smaller development CSS file
- Support for arbitrary values: `w-[137px]`

## Testing

### Snapshot Tests

```typescript
import { render } from '@testing-library/react';
import { Button } from './Button';

test('renders primary button correctly', () => {
  const { container } = render(<Button variant="primary">Click</Button>);
  expect(container.firstChild).toMatchSnapshot();
});
```

### Class Testing

```typescript
test('applies correct classes', () => {
  const { container } = render(<Button variant="primary" size="lg" />);
  const button = container.firstChild;

  expect(button).toHaveClass('btn-primary');
  expect(button).toHaveClass('px-8');
  expect(button).toHaveClass('py-4');
});
```

## Success Criteria

This decision is successful if:

1. ✅ Can build complete UI in <2 weeks
2. ✅ Design system is consistent across all screens
3. ✅ Production CSS bundle <10KB gzipped
4. ✅ New developers productive within <1 day
5. ✅ WCAG 2.1 AA compliance achieved

## Review Trigger

Revisit this decision if:

- Bundle size exceeds 15KB (check PurgeCSS config)
- Team struggles with utility class approach (>30% of feedback)
- Need for complex animations that Tailwind can't handle
- Performance issues related to CSS (unlikely)

## References

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Tailwind CSS Best Practices](https://tailwindcss.com/docs/reusing-styles)
- [Next.js with Tailwind](https://nextjs.org/docs/app/building-your-application/styling/tailwind-css)
- [Accessible Color Combinations](https://www.a11yproject.com/posts/what-is-color-contrast/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
