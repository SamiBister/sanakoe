# 0003. next-intl for Internationalization

**Date:** 2026-02-01  
**Status:** Accepted

## Context

Sanakoe needs to support **bilingual UI** (Finnish and English) with potential for adding more languages in the future.

**Requirements:**

1. **Locale-based routing:** `/fi/`, `/en/`, `/fi/quiz`, `/en/quiz`
2. **Server and client component support:** Next.js App Router uses both
3. **Type-safe translations:** Catch missing keys at compile time
4. **Dynamic language switching:** User can change language without reload
5. **Number/date formatting:** Respect locale conventions
6. **Pluralization support:** Handle "1 word" vs "2 words"
7. **Default locale:** Finnish (`fi`)

**Technical constraints:**

- Next.js 14+ with App Router (not Pages Router)
- TypeScript for type safety
- Client-side rendering (static export)
- Small bundle size preferred

**Translation scope:**

```
UI elements:
- Start screen (buttons, instructions, headings)
- Quiz screen (prompts, feedback messages, progress)
- Practice mode (instructions, encouragement)
- Results screen (metrics, buttons, celebration messages)
- Word list overlay (headers, status labels)
- Error messages
- Accessibility labels

NOT translated:
- Word prompts and answers (user content)
- CSV parsing errors (technical, already descriptive)
```

## Decision

We will use **next-intl** as our internationalization library.

**Implementation:**

### 1. Configuration

```typescript
// src/i18n.ts
import {getRequestConfig} from "next-intl/server";

export default getRequestConfig(async ({locale}) => ({
  messages: (await import(`./messages/${locale}.json`)).default,
}));
```

### 2. Middleware for Locale Detection

```typescript
// src/middleware.ts
import createMiddleware from "next-intl/middleware";

export default createMiddleware({
  locales: ["fi", "en"],
  defaultLocale: "fi",
  localePrefix: "always", // Always show locale in URL
});

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
```

### 3. App Layout with Provider

```typescript
// src/app/[locale]/layout.tsx
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

### 4. Translation Files

```json
// src/messages/en.json
{
  "start": {
    "title": "Vocabulary Quiz",
    "subtitle": "Practice your words!",
    "uploadButton": "Upload CSV File",
    "manualButton": "Enter Words Manually",
    "startQuiz": "Start Quiz",
    "wordCount": "{count, plural, =0 {No words} =1 {1 word} other {# words}} loaded"
  },
  "quiz": {
    "progress": "{resolved} of {total} words",
    "tries": "{count, plural, =1 {1 attempt} other {# attempts}}",
    "submit": "Check Answer",
    "correct": {
      "messages": ["Great!", "Well done!", "Perfect!", "Excellent!", "Amazing!"]
    },
    "incorrect": {
      "messages": [
        "Not quite!",
        "Let's practice!",
        "Almost there!",
        "Try again!"
      ]
    },
    "timeElapsed": "Time: {minutes}:{seconds}"
  },
  "practice": {
    "title": "Practice Mode",
    "instruction": "Type the correct answer:",
    "counter": "{current} of 3",
    "encouragement": ["Good!", "Keep going!", "One more!", "You've got this!"]
  },
  "results": {
    "title": "Quiz Complete!",
    "totalWords": "Words practiced: {count}",
    "totalTries": "Total attempts: {count}",
    "totalTime": "Time: {minutes}:{seconds}",
    "newRecord": "🎉 New Personal Best!",
    "mistakesList": "Words to review:",
    "noMistakes": "Perfect! No mistakes!",
    "restart": "Restart Quiz",
    "newList": "New Word List"
  },
  "wordList": {
    "button": "View Word List",
    "title": "All Words",
    "close": "Close",
    "status": {
      "resolved": "Correct",
      "unresolved": "Not tried",
      "mistake": "Mistake made"
    },
    "filter": {
      "all": "All",
      "unresolved": "Unresolved",
      "mistakes": "Mistakes"
    }
  },
  "errors": {
    "csvParse": "Failed to parse CSV file. Please check the format.",
    "emptyList": "Please add at least one word to start the quiz.",
    "storageQuota": "Storage full. Please clear some data.",
    "unknown": "An error occurred. Please try again."
  }
}
```

```json
// src/messages/fi.json
{
  "start": {
    "title": "Sanavisa",
    "subtitle": "Harjoittele sanoja!",
    "uploadButton": "Lataa CSV-tiedosto",
    "manualButton": "Syötä sanat manuaalisesti",
    "startQuiz": "Aloita visa",
    "wordCount": "{count, plural, =0 {Ei sanoja} =1 {1 sana} other {# sanaa}} ladattu"
  },
  "quiz": {
    "progress": "{resolved} / {total} sanaa",
    "tries": "{count, plural, =1 {1 yritys} other {# yritystä}}",
    "submit": "Tarkista vastaus",
    "correct": {
      "messages": [
        "Hienoa!",
        "Hyvin tehty!",
        "Täydellistä!",
        "Erinomaisesti!",
        "Mahtavaa!"
      ]
    },
    "incorrect": {
      "messages": [
        "Ei aivan!",
        "Harjoitellaan!",
        "Melkein!",
        "Yritä uudelleen!"
      ]
    },
    "timeElapsed": "Aika: {minutes}:{seconds}"
  },
  "practice": {
    "title": "Harjoittelutila",
    "instruction": "Kirjoita oikea vastaus:",
    "counter": "{current} / 3",
    "encouragement": [
      "Hyvä!",
      "Jatka samaan malliin!",
      "Vielä yksi!",
      "Sinä pystyt!"
    ]
  },
  "results": {
    "title": "Visa valmis!",
    "totalWords": "Harjoiteltuja sanoja: {count}",
    "totalTries": "Yrityksiä yhteensä: {count}",
    "totalTime": "Aika: {minutes}:{seconds}",
    "newRecord": "🎉 Uusi ennätys!",
    "mistakesList": "Kertausta vaativat sanat:",
    "noMistakes": "Täydellinen! Ei virheitä!",
    "restart": "Aloita uudelleen",
    "newList": "Uusi sanalista"
  },
  "wordList": {
    "button": "Näytä sanalista",
    "title": "Kaikki sanat",
    "close": "Sulje",
    "status": {
      "resolved": "Oikein",
      "unresolved": "Ei yritetty",
      "mistake": "Virhe tehty"
    },
    "filter": {
      "all": "Kaikki",
      "unresolved": "Ratkaisemattomat",
      "mistakes": "Virheet"
    }
  },
  "errors": {
    "csvParse": "CSV-tiedoston jäsennys epäonnistui. Tarkista muoto.",
    "emptyList": "Lisää vähintään yksi sana aloittaaksesi visan.",
    "storageQuota": "Tallennustila täynnä. Tyhjennä joitain tietoja.",
    "unknown": "Tapahtui virhe. Yritä uudelleen."
  }
}
```

### 5. Component Usage

**Server components:**

```typescript
import { useTranslations } from 'next-intl';

export default function StartPage() {
  const t = useTranslations('start');

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('subtitle')}</p>
      <button>{t('uploadButton')}</button>
    </div>
  );
}
```

**Client components:**

```typescript
'use client';

import { useTranslations } from 'next-intl';

export function QuizCard() {
  const t = useTranslations('quiz');

  return (
    <div>
      <button>{t('submit')}</button>
      <p>{t('progress', { resolved: 5, total: 10 })}</p>
    </div>
  );
}
```

**Random feedback message:**

```typescript
const t = useTranslations("quiz.correct");
const messages = t.raw("messages") as string[];
const randomMessage = messages[Math.floor(Math.random() * messages.length)];
```

### 6. Language Switcher Component

```typescript
'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';

export function LanguageSelector() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    // Replace locale in path
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  return (
    <div>
      <button
        onClick={() => switchLocale('fi')}
        className={locale === 'fi' ? 'active' : ''}
      >
        Suomi
      </button>
      <button
        onClick={() => switchLocale('en')}
        className={locale === 'en' ? 'active' : ''}
      >
        English
      </button>
    </div>
  );
}
```

## Consequences

### Positive

1. **Native App Router support** - Built specifically for Next.js 14+ App Router
2. **Type-safe translations** - TypeScript integration catches missing keys
3. **Server + client components** - Works seamlessly with both
4. **Small bundle size** - ~2KB gzipped
5. **Rich formatting** - Built-in support for ICU MessageFormat (plurals, dates, numbers)
6. **SEO-friendly** - Proper `<html lang>` attribute, locale-based URLs
7. **Automatic locale detection** - From URL or browser settings
8. **Static export compatible** - Works with Next.js static export
9. **No runtime overhead** - Translations loaded once per locale
10. **Easy testing** - Can mock translations in tests

### Negative

1. **Learning curve** - ICU MessageFormat syntax can be complex
2. **Bundle duplication** - Each locale adds to bundle (but lazy-loaded)
3. **Limited ecosystem** - Fewer third-party tools vs react-i18next

### Neutral

1. **Middleware required** - Adds middleware layer for routing
2. **JSON structure** - Nested JSON might be harder to manage at scale (but tools exist)
3. **No translation management** - Need external tool for translator collaboration (Lokalise, Crowdin)

## Alternatives Considered

### Alternative 1: react-i18next

**Description:** Most popular React i18n library, not Next.js-specific.

```typescript
import { useTranslation } from 'react-i18next';

function Component() {
  const { t } = useTranslation();
  return <div>{t('key')}</div>;
}
```

**Why rejected:**

- **Not optimized for App Router:** Extra setup for server components
- **Larger bundle:** ~7KB vs next-intl's 2KB
- **Complex configuration:** Requires custom setup for Next.js routing
- **No native locale routing:** Need to implement yourself
- **Server/client mismatch risks:** Hydration issues with SSR

**When to reconsider:** If migrating from existing react-i18next codebase or need specific plugins.

### Alternative 2: next-translate

**Description:** Next.js i18n library, older alternative to next-intl.

```typescript
import useTranslation from 'next-translate/useTranslation';

function Component() {
  const { t } = useTranslation('common');
  return <div>{t('key')}</div>;
}
```

**Why rejected:**

- **Pages Router focus:** Less optimized for App Router
- **Less active development:** next-intl has more momentum
- **No ICU MessageFormat:** Limited formatting capabilities
- **Weaker TypeScript support:** No type-safe keys

**When to reconsider:** If using Pages Router (not applicable here).

### Alternative 3: Format.js (react-intl)

**Description:** Robust i18n library from Yahoo/FormatJS team.

```typescript
import { FormattedMessage } from 'react-intl';

<FormattedMessage
  id="greeting"
  defaultMessage="Hello {name}"
  values={{ name: 'World' }}
/>
```

**Why rejected:**

- **Component-based API:** More verbose than hook-based
- **Larger bundle:** ~14KB gzipped
- **Overkill for our needs:** Enterprise features we don't need
- **Complex setup:** Requires IntlProvider wrapping

**When to reconsider:** For enterprise apps needing advanced features (relative time, list formatting, etc.).

### Alternative 4: DIY (Custom Implementation)

**Description:** Build custom i18n with Context API.

```typescript
const translations = {
  en: {greeting: "Hello"},
  fi: {greeting: "Terve"},
};

function t(key: string) {
  return translations[locale][key];
}
```

**Why rejected:**

- **Reinventing the wheel:** Formatting, pluralization, etc. are complex
- **No type safety:** Manual typing effort
- **Missing features:** No locale routing, date formatting, etc.
- **Maintenance burden:** Custom code to maintain
- **No ecosystem:** No tools, no community

**When to reconsider:** Never for this project.

## Implementation Notes

### Type Safety Setup

```typescript
// global.d.ts
type Messages = typeof import("./messages/en.json");
declare interface IntlMessages extends Messages {}
```

This gives autocomplete for all translation keys:

```typescript
t("start.title"); // ✅ Autocomplete works
t("start.invalid"); // ❌ TypeScript error
```

### Pluralization Examples

```json
{
  "wordCount": "{count, plural, =0 {No words} =1 {1 word} other {# words}}"
}
```

Usage:

```typescript
t("wordCount", {count: 0}); // "No words"
t("wordCount", {count: 1}); // "1 word"
t("wordCount", {count: 5}); // "5 words"
```

### Number Formatting

```typescript
const t = useTranslations();

// Automatic locale-aware formatting
t("price", {value: 1234.56});
// en: "1,234.56"
// fi: "1 234,56"
```

### Date/Time Formatting

```typescript
import { useFormatter } from 'next-intl';

function Component() {
  const format = useFormatter();

  return (
    <time>
      {format.dateTime(new Date(), {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}
    </time>
  );
  // en: "February 1, 2026"
  // fi: "1. helmikuuta 2026"
}
```

### Testing

```typescript
import { NextIntlClientProvider } from 'next-intl';
import { render } from '@testing-library/react';

const messages = {
  start: {
    title: 'Vocabulary Quiz'
  }
};

test('renders title', () => {
  render(
    <NextIntlClientProvider messages={messages} locale="en">
      <StartPage />
    </NextIntlClientProvider>
  );

  expect(screen.getByText('Vocabulary Quiz')).toBeInTheDocument();
});
```

### Adding New Languages

1. Create new translation file: `src/messages/sv.json`
2. Update middleware: `locales: ['fi', 'en', 'sv']`
3. Add language to selector component
4. Test all pages with new locale

## Performance Considerations

### Bundle Size per Locale

- English translations: ~2KB
- Finnish translations: ~2KB
- next-intl library: ~2KB

Total per locale: ~4KB (acceptable for 2-3 languages)

### Lazy Loading

next-intl automatically lazy-loads locale data:

- Only active locale is loaded
- Switching language loads new locale dynamically
- No all-locales bundle created

### Static Export Optimization

```javascript
// next.config.js
module.exports = {
  output: "export",
  // Each locale gets its own HTML folder
  // /out/fi/index.html
  // /out/en/index.html
};
```

## SEO Considerations

### Locale-Specific Meta Tags

```typescript
// src/app/[locale]/layout.tsx
export function generateMetadata({params: {locale}}: Props) {
  const t = getTranslations({locale, namespace: "metadata"});

  return {
    title: t("title"),
    description: t("description"),
    language: locale,
    alternates: {
      canonical: `/${locale}`,
      languages: {
        fi: "/fi",
        en: "/en",
      },
    },
  };
}
```

### hreflang Tags

```typescript
<link rel="alternate" hreflang="fi" href="https://sanakoe.app/fi" />
<link rel="alternate" hreflang="en" href="https://sanakoe.app/en" />
<link rel="alternate" hreflang="x-default" href="https://sanakoe.app/fi" />
```

## Success Criteria

This decision is successful if:

1. ✅ Language switching works instantly without reload
2. ✅ No missing translation errors in production
3. ✅ TypeScript catches translation key typos
4. ✅ SEO scores are good (proper lang attributes)
5. ✅ Adding new language takes <1 hour

## Review Trigger

Revisit this decision if:

- Need to support >5 languages (consider translation management platform)
- Performance issues related to i18n bundle size
- Complex formatting needs (relative time, list formatting)
- Team strongly prefers react-i18next ecosystem

## References

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Next.js Internationalization](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
- [ICU MessageFormat Guide](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
- [Web Accessibility and i18n](https://www.w3.org/International/questions/qa-i18n)
