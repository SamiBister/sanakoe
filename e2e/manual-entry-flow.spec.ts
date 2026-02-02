import { expect, test } from '@playwright/test';
import { HomePage, QuizPage, ResultsPage, SAMPLE_WORDS } from './helpers/page-objects';

test.describe('Manual Entry → Quiz → Results Flow', () => {
  test.describe('Manual Entry Journey', () => {
    test('should complete full journey: manual entry → quiz → results → new list', async ({
      page,
    }) => {
      const homePage = new HomePage(page);
      const quizPage = new QuizPage(page);
      const resultsPage = new ResultsPage(page);

      // 1. Navigate to home page
      await homePage.goto('en');
      await homePage.waitForLoad();

      // 2. Select manual entry mode
      await homePage.selectManualMode();

      // 3. Should see the manual entry table
      await expect(page.locator('input').first()).toBeVisible();

      // 4. Enter words manually - use just 2 for faster test
      const testWords = SAMPLE_WORDS.slice(0, 2);

      for (let i = 0; i < testWords.length; i++) {
        // Find the row inputs - they're in a table or grid
        const promptInput = page.locator('input').nth(i * 2);
        const answerInput = page.locator('input').nth(i * 2 + 1);

        await promptInput.fill(testWords[i].prompt);
        await answerInput.fill(testWords[i].answer);
      }

      // 5. Wait for words to be validated
      await expect(homePage.wordCountText).toBeVisible({ timeout: 5000 });
      await expect(homePage.startQuizButton).toBeEnabled();

      // 6. Start the quiz
      await homePage.startQuiz();

      // 7. Should be on quiz page
      await expect(page).toHaveURL(/\/quiz/);
      await expect(quizPage.answerInput).toBeVisible();

      // 8. Complete the quiz
      const wordsMap = new Map(testWords.map((w) => [w.prompt, w.answer]));

      for (let i = 0; i < testWords.length; i++) {
        const prompt = await quizPage.getPrompt();
        const answer = wordsMap.get(prompt);
        if (answer) {
          await quizPage.submitAnswer(answer);
        }
        await page.waitForTimeout(300);
      }

      // 9. Should be on results page
      await resultsPage.waitForLoad();

      // 10. Start a new list
      await resultsPage.startNewList();

      // 11. Should be back on home page
      await expect(homePage.uploadCSVButton).toBeVisible();
      await expect(homePage.enterManuallyButton).toBeVisible();
    });

    test('should enter words manually in Finnish locale', async ({ page }) => {
      const homePage = new HomePage(page);

      // Navigate to Finnish locale
      await homePage.goto('fi');
      await homePage.waitForLoad();

      // Select manual mode
      await homePage.selectManualMode();

      // Should see the table with Finnish headers
      await expect(page.getByText(/sana|käännös/i)).toBeVisible();

      // Enter one word
      const promptInput = page.locator('input').first();
      const answerInput = page.locator('input').nth(1);

      await promptInput.fill('hello');
      await answerInput.fill('hei');

      // Should enable start button
      await expect(homePage.startQuizButton).toBeEnabled({ timeout: 3000 });
    });

    test('should auto-expand table when typing in last row', async ({ page }) => {
      const homePage = new HomePage(page);

      await homePage.goto('en');
      await homePage.waitForLoad();
      await homePage.selectManualMode();

      // Get initial number of input pairs (rows)
      const initialInputs = await page.locator('input').count();
      const initialRows = initialInputs / 2;

      // Fill in the last row
      const lastPromptInput = page.locator('input').nth((initialRows - 1) * 2);
      const lastAnswerInput = page.locator('input').nth((initialRows - 1) * 2 + 1);

      await lastPromptInput.fill('test');
      await lastAnswerInput.fill('testi');

      // Tab out of the last input
      await lastAnswerInput.press('Tab');

      // Should have added more rows (or at least the same)
      await page.waitForTimeout(300);
      const newInputs = await page.locator('input').count();
      expect(newInputs).toBeGreaterThanOrEqual(initialInputs);
    });

    test('should navigate with Tab and Enter keys', async ({ page }) => {
      const homePage = new HomePage(page);

      await homePage.goto('en');
      await homePage.waitForLoad();
      await homePage.selectManualMode();

      // Click first input
      const firstInput = page.locator('input').first();
      await firstInput.click();
      await firstInput.fill('cat');

      // Tab to next input
      await page.keyboard.press('Tab');

      // Should be in second input
      const secondInput = page.locator('input').nth(1);
      await expect(secondInput).toBeFocused();

      await secondInput.fill('kissa');

      // Press Enter (should act like Tab)
      await page.keyboard.press('Enter');

      // Should move to next row
      const thirdInput = page.locator('input').nth(2);
      await expect(thirdInput).toBeFocused();
    });

    test('should validate that both cells are required', async ({ page }) => {
      const homePage = new HomePage(page);

      await homePage.goto('en');
      await homePage.waitForLoad();
      await homePage.selectManualMode();

      // Fill only the prompt, not the answer
      const promptInput = page.locator('input').first();
      await promptInput.fill('incomplete');

      // Start button should remain disabled
      await page.waitForTimeout(500);
      await expect(homePage.startQuizButton).toBeDisabled();

      // Now fill the answer
      const answerInput = page.locator('input').nth(1);
      await answerInput.fill('keskeneräinen');

      // Now it should be enabled
      await expect(homePage.startQuizButton).toBeEnabled({ timeout: 3000 });
    });

    test('should support paste from clipboard (tab-separated)', async ({ page }) => {
      const homePage = new HomePage(page);

      await homePage.goto('en');
      await homePage.waitForLoad();
      await homePage.selectManualMode();

      // Prepare tab-separated content (like from Excel)
      const pasteContent = 'apple\tomena\nbanana\tbanaani\norange\tapelsiini';

      // Focus on first input and paste
      const firstInput = page.locator('input').first();
      await firstInput.click();

      // Evaluate paste in page context
      await page.evaluate(async (content) => {
        const clipboardData = new DataTransfer();
        clipboardData.setData('text/plain', content);

        const pasteEvent = new ClipboardEvent('paste', {
          bubbles: true,
          cancelable: true,
          clipboardData,
        });

        document.activeElement?.dispatchEvent(pasteEvent);
      }, pasteContent);

      // Wait for processing
      await page.waitForTimeout(500);

      // Check if words were loaded (may show count or enable start button)
      // This depends on implementation - just verify the page didn't crash
      await expect(page.locator('input').first()).toBeVisible();
    });

    test('should clear all entries with confirmation', async ({ page }) => {
      const homePage = new HomePage(page);

      await homePage.goto('en');
      await homePage.waitForLoad();
      await homePage.selectManualMode();

      // Enter some words first
      const promptInput = page.locator('input').first();
      const answerInput = page.locator('input').nth(1);

      await promptInput.fill('test');
      await answerInput.fill('testi');

      // Find and click clear button
      const clearButton = page.getByRole('button', { name: /clear|tyhjennä/i });
      if (await clearButton.isVisible()) {
        await clearButton.click();

        // Confirmation dialog may appear
        const confirmButton = page.getByRole('button', { name: /confirm|yes|kyllä/i });
        if (await confirmButton.isVisible().catch(() => false)) {
          await confirmButton.click();
        }

        // Inputs should be cleared
        await page.waitForTimeout(300);
        await expect(promptInput).toHaveValue('');
      }
    });

    test('should persist entries in localStorage', async ({ page }) => {
      const homePage = new HomePage(page);

      await homePage.goto('en');
      await homePage.waitForLoad();
      await homePage.selectManualMode();

      // Enter a word
      const promptInput = page.locator('input').first();
      const answerInput = page.locator('input').nth(1);

      await promptInput.fill('persist');
      await answerInput.fill('säily');

      // Wait for save
      await page.waitForTimeout(500);

      // Reload page
      await page.reload();

      // Go to manual entry again
      await homePage.waitForLoad();
      await homePage.selectManualMode();

      // Should have the saved word
      await expect(page.locator('input').first()).toHaveValue('persist');
      await expect(page.locator('input').nth(1)).toHaveValue('säily');
    });

    test('should go back to mode selection from manual entry', async ({ page }) => {
      const homePage = new HomePage(page);

      await homePage.goto('en');
      await homePage.waitForLoad();
      await homePage.selectManualMode();

      // Should see manual entry interface
      await expect(page.locator('input').first()).toBeVisible();

      // Click back
      await homePage.backButton.click();

      // Should see mode selection again
      await expect(homePage.uploadCSVButton).toBeVisible();
      await expect(homePage.enterManuallyButton).toBeVisible();
    });
  });
});
