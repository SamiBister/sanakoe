# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Practice mode implementation with PracticeCard component
  - 3-repetition typing practice for incorrect answers
  - Visual progress dots (1/3, 2/3, 3/3)
  - Progressive encouragement messages (Keep going! → Good! → Excellent!)
  - Success celebration after completing practice
  - Words move to back of queue after practice
- **Global Word List Overlay** (Task 7.1)
  - Floating "Word List" button accessible from all quiz screens
  - Modal overlay displays complete word list with prompt → answer pairs
  - Filter buttons: All, Remaining, Done
  - Correct/incorrect status badges
  - Word count display

### Changed

- **Responsive Layout & Mobile Support** (Task 7.2)
  - Button component: Added min-height touch targets (44px small, 48px medium, 56px large)
  - Modal component: Responsive padding (p-2 mobile, p-4 desktop), responsive border-radius and max-height
  - WordListOverlay: Responsive button positioning and filter touch targets
  - ManualEntryTable: Enhanced mobile table with min-width, responsive padding, and 44px input touch targets

### Planned

- Manual word entry table component
- Answer matcher implementation
- Quiz state management with Zustand
- Quiz flow screens (start, quiz, results)
- localStorage utilities

## [0.1.0] - 2026-02-01

### Added

- Initial Next.js 14 project setup with TypeScript
- Tailwind CSS configuration with kid-friendly theme
- i18n support with next-intl (Finnish and English)
- CSV parser with comprehensive features:
  - Auto-delimiter detection (comma/semicolon)
  - Header row detection (English/Finnish patterns)
  - Whitespace trimming and empty row skipping
  - Case-insensitive deduplication
  - Quoted value handling with escaped quotes
  - Line ending normalization (CRLF/LF/CR)
  - Unicode and emoji support
  - User-friendly error messages
- Complete test suite with Jest:
  - 27 unit tests for CSV parser
  - 98.71% code coverage
  - Test scripts in package.json
- TypeScript type definitions for core entities
- Comprehensive documentation:
  - Main design document (docs/design.md)
  - 4 Architectural Decision Records (ADRs)
  - Implementation plan (docs/plan/sanakoe-plan.md)
- Project structure and folder organization
- ESLint and TypeScript configuration
- Git repository initialization with main branch
- GitHub community files:
  - LICENSE (MIT)
  - CONTRIBUTING.md
  - CODE_OF_CONDUCT.md
  - SECURITY.md
  - Comprehensive .gitignore

### Technical

- Next.js 14.2.0 with App Router
- React 18.3.0
- TypeScript 5.4.0
- Tailwind CSS 3.4.0
- Jest testing framework
- nanoid 5.1.6 for ID generation
- next-intl 3.11.0 for internationalization

### Documentation

- ADR-001: Client-Side Only Architecture
- ADR-002: State Management with Zustand
- ADR-003: next-intl for Internationalization
- ADR-004: Tailwind CSS for Styling
- Full implementation plan with 8 phases
- Design document with architecture diagrams
- README with setup instructions
- Contributing guidelines
- Code of Conduct
- Security policy

---

## Version History

- **0.1.0** - Initial project setup and CSV parser (2026-02-01)

---

## Changelog Guidelines

### Categories

- **Added** - New features
- **Changed** - Changes to existing functionality
- **Deprecated** - Soon-to-be removed features
- **Removed** - Removed features
- **Fixed** - Bug fixes
- **Security** - Security updates

### Version Format

- **Major (X.0.0)** - Breaking changes
- **Minor (0.X.0)** - New features, backward compatible
- **Patch (0.0.X)** - Bug fixes, backward compatible

### Example Entry

```markdown
## [1.2.3] - 2026-03-15

### Added

- New feature description

### Changed

- Change description

### Fixed

- Bug fix description

### Security

- Security fix description
```

---

[Unreleased]: https://github.com/OWNER/sanakoe/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/OWNER/sanakoe/releases/tag/v0.1.0
