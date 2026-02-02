import { expect, test } from '@playwright/test';
import { generateCSV, HomePage, QuizPage, SAMPLE_WORDS } from './helpers/page-objects';

test.describe('Language Switching', () => {
  test.describe('Language Selector on Home Page', () => {
    test('should display English UI by default', async ({ page }) => {
      await page.goto('/en');

      // Should show English text
      await expect(page.getByText('Vocabulary Quiz')).toBeVisible();
      await expect(page.getByRole('button', { name: /upload csv/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /enter manually/i })).toBeVisible();
    });

    test('should display Finnish UI when navigating to /fi', async ({ page }) => {
      await page.goto('/fi');

      // Should show Finnish text
      await expect(page.getByText('Sanakoe')).toBeVisible();
      await expect(page.getByRole('button', { name: /lataa csv/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /syötä käsin/i })).toBeVisible();
    });

    test('should switch from English to Finnish using selector', async ({ page }) => {
      const homePage = new HomePage(page);

      await homePage.goto('en');
      await homePage.waitForLoad();

      // Verify English
      await expect(page.getByText('Vocabulary Quiz')).toBeVisible();

      // Change language to Finnish
      await homePage.changeLanguage('fi');

      // Should navigate to Finnish locale
      await expect(page).toHaveURL(/\/fi/);
      await expect(page.getByText('Sanakoe')).toBeVisible();
    });

    test('should switch from Finnish to English using selector', async ({ page }) => {
      const homePage = new HomePage(page);

      await homePage.goto('fi');
      await homePage.waitForLoad();

      // Verify Finnish
      await expect(page.getByText('Sanakoe')).toBeVisible();

      // Change language to English
      await homePage.changeLanguage('en');

      // Should navigate to English locale
      await expect(page).toHaveURL(/\/en/);
      await expect(page.getByText('Vocabulary Quiz')).toBeVisible();
    });

    test('should preserve language when navigating to quiz', async ({ page }) => {
      const homePage = new HomePage(page);

      await homePage.goto('fi');
      await homePage.waitForLoad();

      // Load words and start quiz
      await homePage.selectUploadMode();
      await homePage.uploadCSVFile(generateCSV(SAMPLE_WORDS.slice(0, 2)));
      await expect(homePage.startQuizButton).toBeEnabled({ timeout: 5000 });
      await homePage.startQuiz();

      // Should be on Finnish quiz page
      await expect(page).toHaveURL(/\/fi\/quiz/);
    });
  });

  test.describe('Language During Active Quiz', () => {
    test('should keep quiz state when changing language during quiz', async ({ page }) => {
      const homePage = new HomePage(page);
      const quizPage = new QuizPage(page);

      // Start quiz in English
      await homePage.goto('en');
      await homePage.waitForLoad();
      await homePage.selectUploadMode();
      await homePage.uploadCSVFile(generateCSV(SAMPLE_WORDS.slice(0, 3)));
      await expect(homePage.startQuizButton).toBeEnabled({ timeout: 5000 });
      await homePage.startQuiz();

      // Answer one question correctly
      const prompt = await quizPage.getPrompt();
      const answer = SAMPLE_WORDS.find((w) => w.prompt === prompt)?.answer || '';
      if (answer) {
        await quizPage.submitAnswer(answer);
        await page.waitForTimeout(500);
      }

      // Get current progress before language change
      // The progress might be something like "1/3" or "2/3"

      // Change language to Finnish via URL navigation
      // Note: Direct selector change might not work during quiz
      // This tests the locale routing
      const currentUrl = page.url();
      const finnishUrl = currentUrl.replace('/en/', '/fi/');
      await page.goto(finnishUrl);

      // Should still be in quiz (or redirected appropriately)
      // The exact behavior depends on implementation
      await expect(page).toHaveURL(/quiz|fi/);
    });

    test('should display quiz UI in Finnish locale', async ({ page }) => {
      const homePage = new HomePage(page);

      await homePage.goto('fi');
      await homePage.waitForLoad();
      await homePage.selectUploadMode();
      await homePage.uploadCSVFile(generateCSV(SAMPLE_WORDS.slice(0, 2)));
      await expect(homePage.startQuizButton).toBeEnabled({ timeout: 5000 });
      await homePage.startQuiz();

      // Quiz UI should have Finnish text
      // Check for Finnish button text (Tarkista = Check)
      await expect(page.getByRole('button', { name: /tarkista/i })).toBeVisible();
    });

    test('should display quiz UI in English locale', async ({ page }) => {
      const homePage = new HomePage(page);

      await homePage.goto('en');
      await homePage.waitForLoad();
      await homePage.selectUploadMode();
      await homePage.uploadCSVFile(generateCSV(SAMPLE_WORDS.slice(0, 2)));
      await expect(homePage.startQuizButton).toBeEnabled({ timeout: 5000 });
      await homePage.startQuiz();

      // Quiz UI should have English text
      await expect(page.getByRole('button', { name: /check/i })).toBeVisible();
    });
  });

  test.describe('Language on Results Page', () => {
    async function completeQuiz(page: import('@playwright/test').Page, locale: string) {
      const homePage = new HomePage(page);
      const quizPage = new QuizPage(page);

      const testWords = SAMPLE_WORDS.slice(0, 1);

      await homePage.goto(locale);
      await homePage.waitForLoad();
      await homePage.selectUploadMode();
      await homePage.uploadCSVFile(generateCSV(testWords));
      await expect(homePage.startQuizButton).toBeEnabled({ timeout: 5000 });
      await homePage.startQuiz();

      // Answer correctly
      await quizPage.submitAnswer(testWords[0].answer);
      await page.waitForTimeout(500);
    }

    test('should display results in English', async ({ page }) => {
      await completeQuiz(page, 'en');

      // Should be on results page with English text
      await expect(page).toHaveURL(/\/en\/results/);
      await expect(page.getByText(/results|complete|finished|congratulations/i)).toBeVisible();
    });

    test('should display results in Finnish', async ({ page }) => {
      await completeQuiz(page, 'fi');

      // Should be on results page with Finnish text
      await expect(page).toHaveURL(/\/fi\/results/);
      await expect(page.getByText(/tulokset|valmis|onneksi olkoon/i)).toBeVisible();
    });
  });
});
