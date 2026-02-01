# Architectural Decision Records (ADRs)

This directory contains Architectural Decision Records (ADRs) for the Sanakoe project.

## What is an ADR?

An Architectural Decision Record (ADR) is a document that captures an important architectural decision made along with its context and consequences.

## Format

We use Michael Nygard's ADR format:

```markdown
# [Number]. [Title]

**Date:** YYYY-MM-DD  
**Status:** [Proposed | Accepted | Deprecated | Superseded]

## Context

What is the issue that we're seeing that is motivating this decision or change?

## Decision

What is the change that we're actually proposing or doing?

## Consequences

What becomes easier or more difficult to do because of this change?

### Positive

- Benefit 1
- Benefit 2

### Negative

- Trade-off 1
- Trade-off 2

### Neutral

- Side effect 1
```

## Index

| ADR                                           | Title                              | Status   | Date       |
| --------------------------------------------- | ---------------------------------- | -------- | ---------- |
| [0001](0001-client-side-only-architecture.md) | Client-Side Only Architecture      | Accepted | 2026-02-01 |
| [0002](0002-state-management-with-zustand.md) | State Management with Zustand      | Accepted | 2026-02-01 |
| [0003](0003-next-intl-for-i18n.md)            | next-intl for Internationalization | Accepted | 2026-02-01 |
| [0004](0004-tailwind-css-for-styling.md)      | Tailwind CSS for Styling           | Accepted | 2026-02-01 |

## Creating a New ADR

1. Copy the template below
2. Number it sequentially (e.g., `0005-your-title.md`)
3. Fill in all sections
4. Add it to the index table above
5. Commit with message: `docs: add ADR-XXXX [title]`

## Template

```markdown
# [Number]. [Title]

**Date:** YYYY-MM-DD  
**Status:** Proposed

## Context

[Describe the forces at play, including technological, political, social, and project local.
These forces are probably in tension, and should be called out as such.]

## Decision

[Describe our response to these forces. This is the "we will..." statement.]

## Consequences

### Positive

- [What becomes easier]
- [Benefits we gain]

### Negative

- [What becomes harder]
- [Trade-offs we accept]

### Neutral

- [Side effects that are neither good nor bad]

## Alternatives Considered

### Alternative 1: [Name]

[Why we didn't choose this]

### Alternative 2: [Name]

[Why we didn't choose this]

## Implementation Notes

[Optional: Specific guidelines or patterns to follow when implementing this decision]

## References

- [Links to related documentation]
- [External resources]
```

## Guidelines

### When to Write an ADR

Write an ADR when you make a decision that:

- **Is architecturally significant** - affects the structure, non-functional characteristics, dependencies, interfaces, or construction techniques
- **Has long-term impact** - difficult or expensive to change later
- **Involves trade-offs** - has pros and cons that need to be documented
- **Might be questioned** - future developers might wonder "why did they do it this way?"

### Examples of ADR-Worthy Decisions

- Choice of framework (React vs Vue vs Svelte)
- State management approach (Context vs Redux vs Zustand)
- Backend architecture (serverless vs traditional vs client-only)
- Database selection (SQL vs NoSQL)
- Authentication strategy (JWT vs sessions)
- Styling approach (CSS-in-JS vs CSS Modules vs Tailwind)
- Build tool choice (Webpack vs Vite vs Turbopack)

### NOT ADR-Worthy

- Implementation details of a single component
- Variable naming conventions (use linting rules)
- Code formatting (use Prettier)
- Minor refactoring decisions

### Status Values

- **Proposed:** ADR is under discussion
- **Accepted:** Decision has been made and is in effect
- **Deprecated:** Decision is no longer recommended but still in use
- **Superseded:** Decision has been replaced by a newer ADR (link to it)

### Best Practices

1. **Write in the present tense** - "We will use..." not "We used..."
2. **Be specific** - Include concrete examples and code snippets
3. **Explain the "why"** - Context and consequences are more important than the decision itself
4. **List alternatives** - Show you considered other options
5. **Keep it concise** - 1-2 pages maximum
6. **Update status** - Mark as deprecated/superseded when no longer valid
7. **Link related ADRs** - Create a web of architectural knowledge

---

## References

- [Documenting Architecture Decisions by Michael Nygard](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
- [ADR GitHub Organization](https://adr.github.io/)
- [ADR Tools](https://github.com/npryce/adr-tools)
