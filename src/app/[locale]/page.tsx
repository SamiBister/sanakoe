import LanguageSelector from "@/components/LanguageSelector";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations("start");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold mb-4 text-primary-500">
          🚀 {t("title")}
        </h1>
        <p className="text-xl text-gray-700 mb-2">{t("subtitle")}</p>
        <p className="text-lg text-gray-600 mb-8">{t("description")}</p>
        <div className="mt-8 p-6 bg-white rounded-2xl shadow-medium">
          <p className="text-gray-600">
            Project initialization complete. i18n system configured!
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Ready to implement features!
          </p>
        </div>
      </div>
    </main>
  );
}
