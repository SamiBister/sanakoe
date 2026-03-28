"use client";

import { locales } from "@/i18n";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";

export default function LanguageSelector() {
  const t = useTranslations("language");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLocaleChange = (newLocale: string) => {
    // Replace the locale in the current pathname
    const segments = pathname.split("/");
    segments[1] = newLocale;
    const newPathname = segments.join("/");

    router.push(newPathname);
  };

  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor="language-select"
        className="hidden sm:inline text-sm font-medium text-gray-700"
      >
        {t("label")}:
      </label>
      <select
        id="language-select"
        value={locale}
        onChange={(e) => handleLocaleChange(e.target.value)}
        className="min-h-[44px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-gray-900 cursor-pointer"
        aria-label={t("label")}
      >
        {locales.map((loc) => (
          <option key={loc} value={loc}>
            {t(loc)}
          </option>
        ))}
      </select>
    </div>
  );
}
