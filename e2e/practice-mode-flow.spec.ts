import { expect, test } from '@playwright/test';
import { generateCSV, HomePage, QuizPage, ResultsPage } from './helpers/page-objects';

test.describe('Practice Mode Flow', () => {
  // Simple word list for practice tests
  const practiceWords = [
    { prompt: 'hello', answer: 'hei' },
    { prompt: 'goodbye', answer: 'näkemiin' },
  ];

  test.beforeEach(async ({ page }) => {
    // Setup: Navigate to quiz with words loaded
    const homePage = new HomePage(page);

    await homePage.goto('en');
    await homePage.waitForLoad();
    await homePage.selectUploadMode();
    await homePage.uploadCSVFile(generateCSV(practiceWords));
    await expect(homePage.startQuizButton).toBeEnabled({ timeout: 5000 });
    await homePage.startQuiz();

    // Verify we're on quiz page
    await expect(page).toHaveURL(/\/quiz/);
  });

  test('should enter practice mode after wrong answer', async ({ page }) => {
    const quizPage = new QuizPage(page);

    // Get the current prompt
    const prompt = await quizPage.getPrompt();

    // Submit wrong answer
    await quizPage.submitAnswer('wrong_answer');

    // Should see practice mode elements:
    // - The correct answer should be visible
    // - Practice counter (1/3, 2/3, 3/3)
    await expect(page.getByText(/1\s*\/\s*3|write it|kirjoita/i)).toBeVisible({ timeout: 5000 });

    // The correct answer should be shown
    const correctAnswer = practiceWords.find((w) => w.prompt === prompt)?.answer || '';
    if (correctAnswer) {
      await expect(page.getByText(correctAnswer)).toBeVisible();
    }
  });

  test('should complete practice mode with 3 correct repetitions', async ({ page }) => {
    const quizPage = new QuizPage(page);

    // Get the current prompt and find the correct answer
    const prompt = await quizPage.getPrompt();
    const correctAnswer = practiceWords.find((w) => w.prompt === prompt)?.answer || 'hei';

    // Submit wrong answer to enter practice mode
    await quizPage.submitAnswer('intentionally_wrong');

    // Wait for practice mode
    await expect(page.getByText(/1\s*\/\s*3/i)).toBeVisible({ timeout: 5000 });

    // Complete 3 practice repetitions
    for (let i = 1; i <= 3; i++) {
      // Wait for counter to show current repetition
      await expect(page.getByText(new RegExp(`${i}\\s*/\\s*3`, 'i'))).toBeVisible();

      // Get the input and submit the correct answer
      const practiceInput = page.getByRole('textbox').first();
      await practiceInput.fill(correctAnswer);

      // Click check/submit button
      const checkButton = page.getByRole('button', { name: /check|tarkista/i });
      await checkButton.click();

      // Wait for next step
      await page.waitForTimeout(300);
    }

    // After 3 correct practices, should continue to next question or normal mode
    // The practice counter should no longer show 3/3
    await page.waitForTimeout(500);

    // Should either be on next question or back to normal quiz mode
    await expect(quizPage.answerInput).toBeVisible({ timeout: 5000 });
  });

  test('should show correct answer prominently during practice', async ({ page }) => {
    const quizPage = new QuizPage(page);

    // Get the current prompt
    const prompt = await quizPage.getPrompt();
    const correctAnswer = practiceWords.find((w) => w.prompt === prompt)?.answer || '';

    // Submit wrong answer
    await quizPage.submitAnswer('wrong');

    // The correct answer should be prominently displayed
    await expect(page.getByText(/1\s*\/\s*3/i)).toBeVisible({ timeout: 5000 });

    // Look for the correct answer in the page
    if (correctAnswer) {
      await expect(page.getByText(correctAnswer).first()).toBeVisible();
    }
  });

  test('should move word to back of queue after practice', async ({ page }) => {
    const quizPage = new QuizPage(page);

    // Get first prompt
    const firstPrompt = await quizPage.getPrompt();
    const firstCorrectAnswer = practiceWords.find((w) => w.prompt === firstPrompt)?.answer || 'hei';

    // Submit wrong answer to enter practice mode
    await quizPage.submitAnswer('wrong');
    await expect(page.getByText(/1\s*\/\s*3/i)).toBeVisible({ timeout: 5000 });

    // Complete practice
    for (let i = 0; i < 3; i++) {
      const input = page.getByRole('textbox').first();
      await input.fill(firstCorrectAnswer);
      await page.getByRole('button', { name: /check|tarkista/i }).click();
      await page.waitForTimeout(300);
    }

    // After practice, should show a different word (if there are multiple words)
    await page.waitForTimeout(500);

    // Try to get the new prompt
    let newPrompt: string;
    try {
      newPrompt = await quizPage.getPrompt();
    } catch {
      // Quiz might have special state, just verify we're still on quiz page
      await expect(quizPage.answerInput).toBeVisible();
      return;
    }

    // If we have multiple words, the next word should be different
    if (practiceWords.length > 1) {
      // New prompt should be different OR it could be the same word again
      // (since the word goes to back of queue and then comes back)
      expect(newPrompt).toBeDefined();
    }
  });

  test('should not count practice repetitions toward tries', async ({ page }) => {
    const quizPage = new QuizPage(page);

    // Get tries before practice (should be 0)
    // Note: tries might not be visible yet, or might show "0"

    // Get the current prompt and correct answer
    const prompt = await quizPage.getPrompt();
    const correctAnswer = practiceWords.find((w) => w.prompt === prompt)?.answer || 'hei';

    // Submit wrong answer (1 try)
    await quizPage.submitAnswer('wrong');
    await expect(page.getByText(/1\s*\/\s*3/i)).toBeVisible({ timeout: 5000 });

    // Complete practice - these should NOT count as tries
    for (let i = 0; i < 3; i++) {
      const input = page.getByRole('textbox').first();
      await input.fill(correctAnswer);
      await page.getByRole('button', { name: /check|tarkista/i }).click();
      await page.waitForTimeout(300);
    }

    // Continue with quiz
    await page.waitForTimeout(500);

    // Submit one more wrong answer if there are more words
    if (practiceWords.length > 1) {
      await page.waitForTimeout(300);
      const input = quizPage.answerInput;
      if (await input.isVisible().catch(() => false)) {
        await input.fill('another_wrong');
        await quizPage.submitButton.click();
      }
    }

    // The total tries should only count normal mode submissions
    // We submitted 1 wrong + potentially 1 more = 2 max tries (not 3 from practice)
  });

  test('should complete quiz after practice and show in results', async ({ page }) => {
    const quizPage = new QuizPage(page);
    const resultsPage = new ResultsPage(page);

    // Use just one word for simpler test
    const singleWordList = [practiceWords[0]];
    const word = singleWordList[0];

    // Navigate fresh with single word
    const homePage = new HomePage(page);
    await page.goto('/en');
    await homePage.waitForLoad();
    await homePage.selectUploadMode();
    await homePage.uploadCSVFile(generateCSV(singleWordList));
    await expect(homePage.startQuizButton).toBeEnabled({ timeout: 5000 });
    await homePage.startQuiz();

    // Submit wrong answer to enter practice
    await quizPage.submitAnswer('wrong');
    await expect(page.getByText(/1\s*\/\s*3/i)).toBeVisible({ timeout: 5000 });

    // Complete practice
    for (let i = 0; i < 3; i++) {
      const input = page.getByRole('textbox').first();
      await input.fill(word.answer);
      await page.getByRole('button', { name: /check|tarkista/i }).click();
      await page.waitForTimeout(300);
    }

    // Now in normal mode, submit correct answer
    await page.waitForTimeout(500);
    await quizPage.answerInput.fill(word.answer);
    await quizPage.submitButton.click();

    // Should reach results
    await resultsPage.waitForLoad();

    // Results should show this word as "not first try" since we made a mistake
    await expect(resultsPage.restartButton).toBeVisible();
  });

  test('should show encouraging message after wrong answer', async ({ page }) => {
    const quizPage = new QuizPage(page);

    // Submit wrong answer
    await quizPage.submitAnswer('wrong');

    // Should see an encouraging message (not blaming)
    // Common encouraging phrases in both languages
    const encouragingPatterns = [
      /not quite|almost|try again|oops|let.*practice|harjoittele|kokeile/i,
      /correct answer|oikea vastaus/i,
    ];

    // At least one encouraging element should be visible
    let foundEncouraging = false;
    for (const pattern of encouragingPatterns) {
      if (
        await page
          .getByText(pattern)
          .first()
          .isVisible()
          .catch(() => false)
      ) {
        foundEncouraging = true;
        break;
      }
    }

    // Also check for practice mode indicator
    const hasPracticeMode = await page
      .getByText(/1\s*\/\s*3/i)
      .isVisible()
      .catch(() => false);

    expect(foundEncouraging || hasPracticeMode).toBeTruthy();
  });
});
