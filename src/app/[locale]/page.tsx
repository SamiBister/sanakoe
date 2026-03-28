'use client';

import LanguageSelector from '@/components/LanguageSelector';
import { ManualEntryTable } from '@/components/ManualEntryTable';
import { PageTransition } from '@/components/PageTransition';
import { WordListUpload } from '@/components/WordListUpload';
import { Rocket } from '@/components/icons';
import { Button } from '@/components/ui';
import { useQuizStore } from '@/hooks/useQuizStore';
import { loadWordList, saveWordList } from '@/lib/storage';
import type { WordItem } from '@/lib/types';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

type InputMode = 'none' | 'upload' | 'manual';

export default function Home() {
  const t = useTranslations('start');
  const locale = useLocale();
  const router = useRouter();
  const loadWords = useQuizStore((state) => state.loadWords);
  const startQuiz = useQuizStore((state) => state.startQuiz);

  const [inputMode, setInputMode] = useState<InputMode>('none');
  const [words, setWords] = useState<WordItem[]>([]);
  const [savedWords, setSavedWords] = useState<WordItem[] | null>(null);

  // Load persisted word list on mount
  useEffect(() => {
    try {
      const stored = loadWordList();
      if (stored && stored.length > 0) {
        setSavedWords(stored);
      }
    } catch {
      // Ignore storage errors — user just won't see a saved list
    }
  }, []);

  const handleWordsLoaded = useCallback((loadedWords: WordItem[]) => {
    setWords(loadedWords);
    // Persist so the user can reuse the list next time
    try {
      saveWordList(loadedWords);
      setSavedWords(loadedWords);
    } catch {
      // Non-fatal — quiz still works, words just won't be persisted
    }
  }, []);

  const handleStartQuiz = (wordsToUse: WordItem[] = words) => {
    if (wordsToUse.length === 0) return;
    loadWords(wordsToUse);
    startQuiz();
    router.push(`/${locale}/quiz`);
  };

  const handleClearSaved = () => {
    try {
      saveWordList([]);
    } catch {
      // ignore
    }
    setSavedWords(null);
  };

  const wordCount = words.length;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Language Selector */}
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>

      {/* Main Content with Page Transition */}
      <PageTransition className="w-full max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-8 pt-10 sm:pt-0">
          <div className="flex justify-center mb-4">
            <Rocket className="w-20 h-20 text-primary-500" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold mb-4 text-primary-600">{t('title')}</h1>
          <p className="text-xl sm:text-2xl text-gray-700 mb-2">{t('subtitle')}</p>
          <p className="text-lg text-gray-600">{t('description')}</p>
        </div>

        {/* Saved word list — shown when available and no input mode chosen yet */}
        {inputMode === 'none' && savedWords && savedWords.length > 0 && (
          <div className="mb-6 p-5 bg-primary-50 border-2 border-primary-200 rounded-2xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-primary-700">
                  💾 {t('savedList', { count: savedWords.length })}
                </p>
                <p className="text-sm text-primary-500 mt-1">
                  {savedWords
                    .slice(0, 3)
                    .map((w) => w.prompt)
                    .join(', ')}
                  {savedWords.length > 3 ? ` +${savedWords.length - 3}` : ''}
                </p>
              </div>
              <div className="flex gap-3 shrink-0">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => handleStartQuiz(savedWords)}
                  className="text-lg py-4 px-6"
                >
                  🚀 {t('startWithSaved')}
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={handleClearSaved}
                  className="text-sm"
                >
                  {t('clearSaved')}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Input Mode Selection */}
        {inputMode === 'none' && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button
              variant={savedWords ? 'secondary' : 'primary'}
              size="lg"
              onClick={() => setInputMode('upload')}
              className="text-lg sm:text-xl py-6 px-8 w-full sm:min-w-[240px]"
            >
              📁 {t('uploadButton')}
            </Button>
            <Button
              variant={savedWords ? 'secondary' : 'primary'}
              size="lg"
              onClick={() => setInputMode('manual')}
              className="text-lg sm:text-xl py-6 px-8 w-full sm:min-w-[240px]"
            >
              ✏️ {t('manualButton')}
            </Button>
          </div>
        )}

        {/* Word Input Components */}
        {inputMode === 'upload' && (
          <div className="mb-8">
            <div className="flex justify-center mb-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setInputMode('none');
                  setWords([]);
                }}
              >
                ← {t('back')}
              </Button>
            </div>
            <WordListUpload onWordsLoaded={handleWordsLoaded} />
          </div>
        )}

        {inputMode === 'manual' && (
          <div className="mb-8">
            <div className="flex justify-center mb-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setInputMode('none');
                  setWords([]);
                }}
              >
                ← {t('back')}
              </Button>
            </div>
            <ManualEntryTable onWordsLoaded={handleWordsLoaded} />
          </div>
        )}

        {/* Word Count and Start Button */}
        {inputMode !== 'none' && (
          <div className="mt-8 text-center">
            <div className="mb-6">
              <p className="text-2xl font-semibold text-gray-700">
                {t('wordCount', { count: wordCount })}
              </p>
            </div>

            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={() => handleStartQuiz()}
              disabled={wordCount === 0}
              className="w-full text-xl sm:text-2xl sm:py-6 sm:px-12 sm:min-w-[280px]"
            >
              🚀 {t('startQuiz')}
            </Button>
          </div>
        )}
      </PageTransition>
    </main>
  );
}
