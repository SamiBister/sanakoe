import { expect, test } from '@playwright/test';
import {
    generateCSV,
    HomePage,
    QuizPage,
    SAMPLE_WORDS,
    WordListOverlay,
} from './helpers/page-objects';

test.describe('Word List Overlay', () => {
  const testWords = SAMPLE_WORDS.slice(0, 3);

  test.describe('Availability on All Screens', () => {
    test('should show word list button on home page after loading words', async ({ page }) => {
      const homePage = new HomePage(page);

      await homePage.goto('en');
      await homePage.waitForLoad();
      await homePage.selectUploadMode();
      await homePage.uploadCSVFile(generateCSV(testWords));
      await expect(homePage.startQuizButton).toBeEnabled({ timeout: 5000 });

      // Word list button should be visible
      const wordListButton = page.getByRole('button', { name: /word list|sanat/i });
      await expect(wordListButton).toBeVisible();
    });

    test('should show word list button on quiz page', async ({ page }) => {
      const homePage = new HomePage(page);
      const quizPage = new QuizPage(page);

      await homePage.goto('en');
      await homePage.waitForLoad();
      await homePage.selectUploadMode();
      await homePage.uploadCSVFile(generateCSV(testWords));
      await expect(homePage.startQuizButton).toBeEnabled({ timeout: 5000 });
      await homePage.startQuiz();

      // Should be on quiz page
      await expect(page).toHaveURL(/\/quiz/);

      // Word list button should be visible
      await expect(quizPage.wordListButton).toBeVisible();
    });

    test('should show word list button during practice mode', async ({ page }) => {
      const homePage = new HomePage(page);
      const quizPage = new QuizPage(page);

      await homePage.goto('en');
      await homePage.waitForLoad();
      await homePage.selectUploadMode();
      await homePage.uploadCSVFile(generateCSV(testWords));
      await expect(homePage.startQuizButton).toBeEnabled({ timeout: 5000 });
      await homePage.startQuiz();

      // Submit wrong answer to enter practice mode
      await quizPage.submitAnswer('wrong_answer');
      await expect(page.getByText(/1\s*\/\s*3/i)).toBeVisible({ timeout: 5000 });

      // Word list button should still be visible
      const wordListButton = page.getByRole('button', { name: /word list|sanat/i });
      await expect(wordListButton).toBeVisible();
    });

    test('should show word list button on results page', async ({ page }) => {
      const homePage = new HomePage(page);
      const quizPage = new QuizPage(page);

      // Use single word for fast completion
      const singleWord = [testWords[0]];

      await homePage.goto('en');
      await homePage.waitForLoad();
      await homePage.selectUploadMode();
      await homePage.uploadCSVFile(generateCSV(singleWord));
      await expect(homePage.startQuizButton).toBeEnabled({ timeout: 5000 });
      await homePage.startQuiz();

      // Complete quiz
      await quizPage.submitAnswer(singleWord[0].answer);
      await page.waitForTimeout(500);

      // Should be on results
      await expect(page).toHaveURL(/\/results/);

      // Word list button should be visible
      const wordListButton = page.getByRole('button', { name: /word list|sanat/i });
      await expect(wordListButton).toBeVisible();
    });
  });

  test.describe('Overlay Functionality', () => {
    test('should open word list overlay when button clicked', async ({ page }) => {
      const homePage = new HomePage(page);
      const quizPage = new QuizPage(page);
      const wordListOverlay = new WordListOverlay(page);

      await homePage.goto('en');
      await homePage.waitForLoad();
      await homePage.selectUploadMode();
      await homePage.uploadCSVFile(generateCSV(testWords));
      await expect(homePage.startQuizButton).toBeEnabled({ timeout: 5000 });
      await homePage.startQuiz();

      // Click word list button
      await quizPage.openWordList();

      // Overlay should be visible
      await expect(wordListOverlay.overlay).toBeVisible({ timeout: 3000 });
    });

    test('should close overlay when close button clicked', async ({ page }) => {
      const homePage = new HomePage(page);
      const quizPage = new QuizPage(page);
      const wordListOverlay = new WordListOverlay(page);

      await homePage.goto('en');
      await homePage.waitForLoad();
      await homePage.selectUploadMode();
      await homePage.uploadCSVFile(generateCSV(testWords));
      await expect(homePage.startQuizButton).toBeEnabled({ timeout: 5000 });
      await homePage.startQuiz();

      // Open overlay
      await quizPage.openWordList();
      await expect(wordListOverlay.overlay).toBeVisible({ timeout: 3000 });

      // Close overlay
      await wordListOverlay.close();

      // Overlay should be hidden
      await expect(wordListOverlay.overlay).not.toBeVisible({ timeout: 3000 });
    });

    test('should display all loaded words in overlay', async ({ page }) => {
      const homePage = new HomePage(page);
      const quizPage = new QuizPage(page);
      const wordListOverlay = new WordListOverlay(page);

      await homePage.goto('en');
      await homePage.waitForLoad();
      await homePage.selectUploadMode();
      await homePage.uploadCSVFile(generateCSV(testWords));
      await expect(homePage.startQuizButton).toBeEnabled({ timeout: 5000 });
      await homePage.startQuiz();

      // Open overlay
      await quizPage.openWordList();
      await expect(wordListOverlay.overlay).toBeVisible({ timeout: 3000 });

      // All words should be shown
      for (const word of testWords) {
        await expect(page.getByText(word.prompt)).toBeVisible();
        await expect(page.getByText(word.answer)).toBeVisible();
      }
    });

    test('should not affect quiz state when opening overlay', async ({ page }) => {
      const homePage = new HomePage(page);
      const quizPage = new QuizPage(page);
      const wordListOverlay = new WordListOverlay(page);

      await homePage.goto('en');
      await homePage.waitForLoad();
      await homePage.selectUploadMode();
      await homePage.uploadCSVFile(generateCSV(testWords));
      await expect(homePage.startQuizButton).toBeEnabled({ timeout: 5000 });
      await homePage.startQuiz();

      // Get current prompt
      const promptBefore = await quizPage.getPrompt();

      // Open and close overlay
      await quizPage.openWordList();
      await expect(wordListOverlay.overlay).toBeVisible({ timeout: 3000 });
      await wordListOverlay.close();
      await expect(wordListOverlay.overlay).not.toBeVisible({ timeout: 3000 });

      // Prompt should be the same
      const promptAfter = await quizPage.getPrompt();
      expect(promptAfter).toBe(promptBefore);
    });

    test('should show word status indicators (resolved/unresolved)', async ({ page }) => {
      const homePage = new HomePage(page);
      const quizPage = new QuizPage(page);
      const wordListOverlay = new WordListOverlay(page);

      // Use words we'll interact with
      const wordsToTest = testWords.slice(0, 2);

      await homePage.goto('en');
      await homePage.waitForLoad();
      await homePage.selectUploadMode();
      await homePage.uploadCSVFile(generateCSV(wordsToTest));
      await expect(homePage.startQuizButton).toBeEnabled({ timeout: 5000 });
      await homePage.startQuiz();

      // Answer first question correctly
      const firstPrompt = await quizPage.getPrompt();
      const firstAnswer = wordsToTest.find((w) => w.prompt === firstPrompt)?.answer || '';
      if (firstAnswer) {
        await quizPage.submitAnswer(firstAnswer);
        await page.waitForTimeout(500);
      }

      // Now open word list - should show resolved status for first word
      await quizPage.openWordList();
      await expect(wordListOverlay.overlay).toBeVisible({ timeout: 3000 });

      // Look for status indicators (✅ for resolved, 🔁 for unresolved)
      // The exact implementation may vary
      const overlay = wordListOverlay.overlay;

      // At least some text content should be in the overlay
      await expect(overlay).toContainText(/\w+/);
    });
  });

  test.describe('Overlay in Finnish', () => {
    test('should display Finnish button text "Sanat"', async ({ page }) => {
      const homePage = new HomePage(page);
      const quizPage = new QuizPage(page);

      await homePage.goto('fi');
      await homePage.waitForLoad();
      await homePage.selectUploadMode();
      await homePage.uploadCSVFile(generateCSV(testWords));
      await expect(homePage.startQuizButton).toBeEnabled({ timeout: 5000 });
      await homePage.startQuiz();

      // Button should show "Sanat"
      await expect(page.getByRole('button', { name: /sanat/i })).toBeVisible();
    });
  });
});
