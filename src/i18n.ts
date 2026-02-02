import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';

// Define supported locales
export const locales = ['fi', 'en'] as const;
export type Locale = (typeof locales)[number];

// Default locale
export const defaultLocale: Locale = 'fi';

export default getRequestConfig(async ({ requestLocale }) => {
  // Typically corresponds to the `[locale]` segment
  const requested = await requestLocale;
  const locale = hasLocale(locales, requested) ? requested : defaultLocale;

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
