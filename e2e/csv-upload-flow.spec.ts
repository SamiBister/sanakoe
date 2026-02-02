import { expect, test } from '@playwright/test';
import { generateCSV, HomePage, QuizPage, ResultsPage, SAMPLE_WORDS } from './helpers/page-objects';

test.describe('CSV Upload → Quiz → Results Flow', () => {
  test.describe('CSV Upload Journey', () => {
    test('should complete full journey: upload CSV → complete quiz → view results → restart', async ({
      page,
    }) => {
      const homePage = new HomePage(page);
      const quizPage = new QuizPage(page);
      const resultsPage = new ResultsPage(page);

      // 1. Navigate to home page
      await homePage.goto('en');
      await homePage.waitForLoad();

      // 2. Select upload mode
      await homePage.selectUploadMode();
      await expect(homePage.chooseFileButton).toBeVisible();

      // 3. Upload CSV file with sample words
      const csvContent = generateCSV(SAMPLE_WORDS);
      await homePage.uploadCSVFile(csvContent);

      // 4. Wait for words to be parsed and shown
      await expect(homePage.wordCountText).toBeVisible({ timeout: 5000 });
      await expect(homePage.startQuizButton).toBeEnabled();

      // 5. Start the quiz
      await homePage.startQuiz();

      // 6. Should be on quiz page
      await expect(page).toHaveURL(/\/quiz/);
      await expect(quizPage.answerInput).toBeVisible();

      // 7. Complete the quiz with all correct answers
      const wordsToAnswer = new Map(SAMPLE_WORDS.map((w) => [w.prompt, w.answer]));

      for (let i = 0; i < SAMPLE_WORDS.length; i++) {
        // Get the current prompt
        const prompt = await quizPage.getPrompt();
        const correctAnswer = wordsToAnswer.get(prompt);

        if (!correctAnswer) {
          // Prompt might be in the answer column, try reverse lookup
          const reverseEntry = SAMPLE_WORDS.find((w) => w.answer === prompt);
          if (reverseEntry) {
            await quizPage.submitAnswer(reverseEntry.prompt);
          } else {
            throw new Error(`Unknown prompt: ${prompt}`);
          }
        } else {
          await quizPage.submitAnswer(correctAnswer);
        }

        // Wait for next question or results
        await page.waitForTimeout(500);
      }

      // 8. Should be on results page
      await resultsPage.waitForLoad();
      await expect(page).toHaveURL(/\/results/);

      // 9. Verify results are shown
      await expect(resultsPage.totalTries).toBeVisible();
      await expect(resultsPage.restartButton).toBeVisible();
      await expect(resultsPage.newListButton).toBeVisible();

      // 10. Restart the quiz
      await resultsPage.restart();

      // 11. Should be back on quiz page
      await expect(page).toHaveURL(/\/quiz/);
      await expect(quizPage.answerInput).toBeVisible();
    });

    test('should upload CSV and start quiz from Finnish locale', async ({ page }) => {
      const homePage = new HomePage(page);

      // Navigate to Finnish locale
      await homePage.goto('fi');
      await homePage.waitForLoad();

      // Page should show Finnish text
      await expect(page.getByText('Sanakoe')).toBeVisible();

      // Select upload mode (Finnish button)
      await homePage.selectUploadMode();

      // Upload CSV
      const csvContent = generateCSV(SAMPLE_WORDS.slice(0, 2));
      await homePage.uploadCSVFile(csvContent);

      // Wait for words and start quiz
      await expect(homePage.startQuizButton).toBeEnabled({ timeout: 5000 });
      await homePage.startQuiz();

      // Should navigate to quiz
      await expect(page).toHaveURL(/\/fi\/quiz/);
    });

    test('should handle CSV with semicolon separator', async ({ page }) => {
      const homePage = new HomePage(page);

      await homePage.goto('en');
      await homePage.waitForLoad();
      await homePage.selectUploadMode();

      // Upload CSV with semicolon separator
      const csvContent = generateCSV(SAMPLE_WORDS.slice(0, 3), ';');
      await homePage.uploadCSVFile(csvContent, 'words-semicolon.csv');

      // Should parse successfully
      await expect(homePage.wordCountText).toBeVisible({ timeout: 5000 });
      await expect(homePage.startQuizButton).toBeEnabled();
    });

    test('should show word count after upload', async ({ page }) => {
      const homePage = new HomePage(page);

      await homePage.goto('en');
      await homePage.waitForLoad();
      await homePage.selectUploadMode();

      // Upload 5 words
      const csvContent = generateCSV(SAMPLE_WORDS);
      await homePage.uploadCSVFile(csvContent);

      // Should show correct word count
      await expect(homePage.wordCountText).toContainText(/5/);
    });

    test('should go back to mode selection', async ({ page }) => {
      const homePage = new HomePage(page);

      await homePage.goto('en');
      await homePage.waitForLoad();
      await homePage.selectUploadMode();

      // Should see upload interface
      await expect(homePage.chooseFileButton).toBeVisible();

      // Click back
      await homePage.backButton.click();

      // Should see mode selection again
      await expect(homePage.uploadCSVButton).toBeVisible();
      await expect(homePage.enterManuallyButton).toBeVisible();
    });
  });

  test.describe('Results Page Actions', () => {
    test.beforeEach(async ({ page }) => {
      // Setup: Upload words and complete a simple quiz
      const homePage = new HomePage(page);
      const quizPage = new QuizPage(page);

      await homePage.goto('en');
      await homePage.waitForLoad();
      await homePage.selectUploadMode();

      // Just 2 words for faster test
      const simpleWords = SAMPLE_WORDS.slice(0, 2);
      await homePage.uploadCSVFile(generateCSV(simpleWords));
      await expect(homePage.startQuizButton).toBeEnabled({ timeout: 5000 });
      await homePage.startQuiz();

      // Complete quiz
      const wordsMap = new Map(simpleWords.map((w) => [w.prompt, w.answer]));
      for (let i = 0; i < simpleWords.length; i++) {
        const prompt = await quizPage.getPrompt();
        const answer = wordsMap.get(prompt);
        if (answer) {
          await quizPage.submitAnswer(answer);
        }
        await page.waitForTimeout(300);
      }

      // Wait for results
      const resultsPage = new ResultsPage(page);
      await resultsPage.waitForLoad();
    });

    test('should restart quiz with same words', async ({ page }) => {
      const resultsPage = new ResultsPage(page);
      const quizPage = new QuizPage(page);

      await resultsPage.restart();

      // Should be on quiz page
      await expect(page).toHaveURL(/\/quiz/);
      await expect(quizPage.answerInput).toBeVisible();
    });

    test('should start new list from results', async ({ page }) => {
      const resultsPage = new ResultsPage(page);
      const homePage = new HomePage(page);

      await resultsPage.startNewList();

      // Should be back on home page
      await expect(page).toHaveURL(/\/(en|fi)?$/);
      await expect(homePage.uploadCSVButton).toBeVisible();
    });
  });
});
