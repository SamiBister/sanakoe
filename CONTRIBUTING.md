# Contributing to Sanakoe

Thank you for your interest in contributing to Sanakoe! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Message Guidelines](#commit-message-guidelines)

## Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow. Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before contributing.

## Getting Started

### Prerequisites

- Node.js 18+
- npm (comes with Node.js)
- Git

### Setup Development Environment

1. **Fork the repository**

   ```bash
   # Click the "Fork" button on GitHub
   ```

2. **Clone your fork**

   ```bash
   git clone https://github.com/YOUR_USERNAME/sanakoe.git
   cd sanakoe
   ```

3. **Add upstream remote**

   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/sanakoe.git
   ```

4. **Install dependencies**

   ```bash
   npm install
   ```

5. **Run development server**

   ```bash
   npm run dev
   ```

6. **Run tests**

   ```bash
   npm test
   ```

## Development Process

### Branching Strategy

- `main` - Production-ready code
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates
- `refactor/*` - Code refactoring

### Creating a Branch

```bash
# Update main branch
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name
```

## Pull Request Process

1. **Ensure all tests pass**

   ```bash
   npm test
   npm run build
   ```

2. **Update documentation**
   - Update README.md if needed
   - Add JSDoc comments to new functions
   - Update relevant ADRs in `docs/adrs/`

3. **Create Pull Request**
   - Use a clear, descriptive title
   - Reference related issues
   - Describe what changed and why
   - Include screenshots for UI changes
   - Mark as draft if work in progress

4. **PR Template**

   ```markdown
   ## Description

   Brief description of changes

   ## Type of Change

   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Related Issues

   Closes #123

   ## Testing

   - [ ] Unit tests added/updated
   - [ ] Manual testing completed
   - [ ] All tests passing

   ## Screenshots

   (if applicable)

   ## Checklist

   - [ ] Code follows project style guidelines
   - [ ] Self-reviewed code
   - [ ] Commented hard-to-understand areas
   - [ ] Documentation updated
   - [ ] No new warnings
   ```

5. **Review Process**
   - Address review comments promptly
   - Push fixes to the same branch
   - Request re-review when ready

6. **Merging**
   - Maintainers will merge approved PRs
   - Squash commits for clean history
   - Delete branch after merge

## Coding Standards

### TypeScript

- Use TypeScript strict mode
- Define explicit types (avoid `any`)
- Use interfaces for object shapes
- Prefer `type` for unions/intersections

```typescript
// ✅ Good
interface User {
  name: string;
  age: number;
}

function greet(user: User): string {
  return `Hello, ${user.name}`;
}

// ❌ Bad
function greet(user: any) {
  return `Hello, ${user.name}`;
}
```

### React Components

- Use functional components with hooks
- Extract reusable logic to custom hooks
- Keep components small and focused
- Use TypeScript props interfaces

```typescript
// ✅ Good
interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export function Button({ onClick, children, variant = 'primary' }: ButtonProps) {
  return (
    <button onClick={onClick} className={`btn btn-${variant}`}>
      {children}
    </button>
  );
}

// ❌ Bad
export function Button(props) {
  return <button onClick={props.onClick}>{props.children}</button>;
}
```

### File Organization

```
src/
├── app/              # Next.js App Router pages
├── components/       # React components
│   ├── ui/          # Reusable UI primitives
│   └── *.tsx        # Feature components
├── lib/             # Utility functions
├── hooks/           # Custom React hooks
└── messages/        # i18n translations
```

### Naming Conventions

- **Files:** `kebab-case.tsx`, `camelCase.ts`
- **Components:** `PascalCase`
- **Functions:** `camelCase`
- **Constants:** `SCREAMING_SNAKE_CASE`
- **Types/Interfaces:** `PascalCase`

### CSS/Tailwind

- Use Tailwind utility classes
- Extract repeated patterns to components
- Use `cn()` utility for conditional classes
- Follow kid-friendly design system

```typescript
// ✅ Good
<button className={cn(
  'btn btn-primary',
  isLoading && 'opacity-50 cursor-wait',
  className
)}>
  {children}
</button>
```

## Testing Guidelines

### Unit Tests

- Test all utility functions
- Aim for 80%+ code coverage
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

```typescript
describe("parseCSV", () => {
  it("should parse comma-separated values correctly", () => {
    // Arrange
    const csv = "hello,moi\nworld,maailma";

    // Act
    const result = parseCSV(csv);

    // Assert
    expect(result).toHaveLength(2);
    expect(result[0].prompt).toBe("hello");
    expect(result[0].answer).toBe("moi");
  });
});
```

### Component Tests

- Test user interactions
- Test accessibility
- Use React Testing Library
- Avoid implementation details

```typescript
test('button calls onClick when clicked', () => {
  const handleClick = jest.fn();
  render(<Button onClick={handleClick}>Click me</Button>);

  fireEvent.click(screen.getByText('Click me'));

  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Commit Message Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, no logic change)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks (deps, config, etc.)
- `perf:` - Performance improvements

### Examples

```bash
# Feature
feat(csv-parser): add support for tab-separated values

# Bug fix
fix(quiz): prevent timer from running after quiz ends

# Documentation
docs(readme): add installation instructions

# Breaking change
feat(api)!: change WordItem type structure

BREAKING CHANGE: WordItem.attempts is now required
```

### Scope

Optional, indicates area of change:

- `csv-parser`
- `quiz`
- `i18n`
- `ui`
- `tests`

### Best Practices

- Use imperative mood ("add" not "added")
- Keep subject line under 72 characters
- Capitalize first letter
- No period at the end
- Explain **what** and **why**, not **how**

## Internationalization (i18n)

When adding new UI text:

1. **Add translation keys to both languages**

   ```json
   // src/messages/en.json
   {
     "newFeature": {
       "title": "New Feature",
       "description": "This is a new feature"
     }
   }
   ```

   ```json
   // src/messages/fi.json
   {
     "newFeature": {
       "title": "Uusi ominaisuus",
       "description": "Tämä on uusi ominaisuus"
     }
   }
   ```

2. **Use in components**

   ```typescript
   const t = useTranslations('newFeature');
   return <h1>{t('title')}</h1>;
   ```

## Accessibility

- Use semantic HTML
- Add ARIA labels to icons/buttons
- Ensure keyboard navigation works
- Test with screen readers
- Maintain color contrast ratios (WCAG AA)
- Support `prefers-reduced-motion`

## Performance

- Optimize images (use Next.js Image)
- Lazy load components when appropriate
- Use React.memo for expensive components
- Avoid unnecessary re-renders
- Keep bundle size small

## Documentation

- Update README.md for user-facing changes
- Add JSDoc comments to functions
- Update ADRs for architectural decisions
- Keep design.md in sync with implementation

## Getting Help

- **Questions?** Open a [Discussion](https://github.com/OWNER/sanakoe/discussions)
- **Bug report?** Open an [Issue](https://github.com/OWNER/sanakoe/issues)
- **Feature idea?** Start a [Discussion](https://github.com/OWNER/sanakoe/discussions) first

## Recognition

Contributors will be recognized in:

- README.md contributors section
- Release notes
- Git commit history

Thank you for contributing to Sanakoe! 🎉
