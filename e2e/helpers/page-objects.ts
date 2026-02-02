import type { Page } from '@playwright/test';

/**
 * Test fixture for a sample word list
 */
export const SAMPLE_WORDS = [
  { prompt: 'cat', answer: 'kissa' },
  { prompt: 'dog', answer: 'koira' },
  { prompt: 'house', answer: 'talo' },
  { prompt: 'car', answer: 'auto' },
  { prompt: 'book', answer: 'kirja' },
];

/**
 * Generate CSV content from word pairs
 */
export function generateCSV(
  words: Array<{ prompt: string; answer: string }>,
  separator: string = ',',
): string {
  return words.map((w) => `${w.prompt}${separator}${w.answer}`).join('\n');
}

/**
 * Page Object for the Home/Start page
 */
export class HomePage {
  constructor(private page: Page) {}

  async goto(locale: string = 'en') {
    // Navigate to the locale URL - Next.js may redirect from root
    await this.page.goto(`/${locale}`, { waitUntil: 'networkidle' });
    // If the locale route has issues, try root which redirects
    if (this.page.url().includes('error') || this.page.url().includes('404')) {
      await this.page.goto('/', { waitUntil: 'networkidle' });
    }
  }

  async waitForLoad() {
    // Wait for either English or Finnish title to appear
    await this.page
      .waitForSelector('text=Vocabulary Quiz', { timeout: 15000 })
      .catch(() => this.page.waitForSelector('text=Sanakoe', { timeout: 10000 }));
  }

  get uploadCSVButton() {
    return this.page.getByRole('button', { name: /upload csv|lataa csv/i });
  }

  get enterManuallyButton() {
    return this.page.getByRole('button', { name: /enter manually|syötä käsin/i });
  }

  get startQuizButton() {
    return this.page.getByRole('button', { name: /start quiz|aloita koe/i });
  }

  get backButton() {
    return this.page.getByRole('button', { name: /back|takaisin/i });
  }

  get chooseFileButton() {
    return this.page.getByRole('button', { name: /choose file|valitse tiedosto/i });
  }

  get fileInput() {
    return this.page.locator('input[type="file"]');
  }

  get wordCountText() {
    return this.page.getByText(/words? ready|sanaa valmiina/i);
  }

  get languageSelector() {
    return this.page.getByRole('combobox');
  }

  async selectUploadMode() {
    await this.uploadCSVButton.click();
  }

  async selectManualMode() {
    await this.enterManuallyButton.click();
  }

  async uploadCSVFile(csvContent: string, fileName: string = 'words.csv') {
    // Create a buffer from the CSV content
    const buffer = Buffer.from(csvContent, 'utf-8');

    // Set the file input
    await this.fileInput.setInputFiles({
      name: fileName,
      mimeType: 'text/csv',
      buffer,
    });
  }

  async enterWordsManually(words: Array<{ prompt: string; answer: string }>) {
    for (let i = 0; i < words.length; i++) {
      const row = this.page.locator(`[data-testid="manual-entry-row-${i}"]`);

      // If row doesn't exist, we might need to wait for it or add new row
      if (!(await row.isVisible().catch(() => false))) {
        // Type in the last available row to trigger new row creation
        await this.page.keyboard.press('Tab');
      }

      const promptInput = this.page
        .locator(`input[data-testid="prompt-input-${i}"]`)
        .or(row.locator('input').first());
      const answerInput = this.page
        .locator(`input[data-testid="answer-input-${i}"]`)
        .or(row.locator('input').last());

      await promptInput.fill(words[i].prompt);
      await answerInput.fill(words[i].answer);
    }
  }

  async startQuiz() {
    await this.startQuizButton.click();
  }

  async changeLanguage(locale: 'en' | 'fi') {
    await this.languageSelector.selectOption(locale);
  }
}

/**
 * Page Object for the Quiz page
 */
export class QuizPage {
  constructor(private page: Page) {}

  get promptText() {
    // The question prompt is shown prominently
    return this.page
      .locator('[data-testid="quiz-prompt"]')
      .or(this.page.locator('.text-4xl, .text-3xl').first());
  }

  get answerInput() {
    return this.page
      .getByRole('textbox', { name: /answer|vastaus|type your answer/i })
      .or(this.page.locator('input[type="text"]').first());
  }

  get submitButton() {
    return this.page.getByRole('button', { name: /check|submit|tarkista/i });
  }

  get progressText() {
    return this.page.getByText(/\d+\s*\/\s*\d+/);
  }

  get triesText() {
    return this.page.getByText(/tries|yritykset/i);
  }

  get timer() {
    return this.page.getByText(/\d+:\d+/);
  }

  get wordListButton() {
    return this.page.getByRole('button', { name: /word list|sanat/i });
  }

  async getPrompt(): Promise<string> {
    // Try various selectors for the prompt
    const promptSelectors = [
      '[data-testid="quiz-prompt"]',
      '[data-testid="prompt-text"]',
      '.quiz-prompt',
      'h2',
      '.text-4xl',
      '.text-3xl',
    ];

    for (const selector of promptSelectors) {
      const element = this.page.locator(selector).first();
      if (await element.isVisible().catch(() => false)) {
        const text = await element.textContent();
        if (text && text.length > 0 && text.length < 100) {
          return text.trim();
        }
      }
    }

    throw new Error('Could not find quiz prompt');
  }

  async submitAnswer(answer: string) {
    await this.answerInput.fill(answer);
    await this.submitButton.click();
  }

  async waitForNextQuestion() {
    // Wait for the answer input to be cleared or for new prompt
    await this.page.waitForTimeout(500);
    await this.answerInput.waitFor({ state: 'visible' });
  }

  async openWordList() {
    await this.wordListButton.click();
  }
}

/**
 * Page Object for Practice Mode
 */
export class PracticePage {
  constructor(private page: Page) {}

  get correctAnswerDisplay() {
    return this.page.getByTestId('correct-answer').or(this.page.locator('.correct-answer'));
  }

  get practiceCounter() {
    return this.page.getByText(/\d+\s*\/\s*3/);
  }

  get practiceInput() {
    return this.page.getByRole('textbox').first();
  }

  get checkButton() {
    return this.page.getByRole('button', { name: /check|tarkista/i });
  }

  async getCorrectAnswer(): Promise<string> {
    // Look for the correct answer in various places
    const selectors = [
      '[data-testid="correct-answer"]',
      '.correct-answer',
      '[aria-label*="correct"]',
    ];

    for (const selector of selectors) {
      const element = this.page.locator(selector);
      if (await element.isVisible().catch(() => false)) {
        return (await element.textContent()) || '';
      }
    }

    // Look for the answer in any visible text that looks like the answer
    return '';
  }

  async submitPractice(answer: string) {
    await this.practiceInput.fill(answer);
    await this.checkButton.click();
  }

  async completePractice(correctAnswer: string) {
    for (let i = 0; i < 3; i++) {
      await this.submitPractice(correctAnswer);
      await this.page.waitForTimeout(300);
    }
  }
}

/**
 * Page Object for Results page
 */
export class ResultsPage {
  constructor(private page: Page) {}

  async waitForLoad() {
    await this.page.waitForSelector('text=/results|tulokset|complete|valmis/i', { timeout: 10000 });
  }

  get totalWords() {
    return this.page.getByText(/total words|sanoja yhteensä/i);
  }

  get totalTries() {
    return this.page.getByText(/tries|yritykset/i);
  }

  get totalTime() {
    return this.page.getByText(/time|aika/i);
  }

  get newRecordBadge() {
    return this.page.getByText(/new record|uusi ennätys|🎉/i);
  }

  get mistakesList() {
    return this.page
      .locator('[data-testid="mistakes-list"]')
      .or(this.page.getByText(/not first try|ei ensimmäisellä/i));
  }

  get restartButton() {
    return this.page.getByRole('button', { name: /restart|try again|uudestaan|kokeile/i });
  }

  get newListButton() {
    return this.page.getByRole('button', { name: /new list|new words|uusi lista|uudet sanat/i });
  }

  async restart() {
    await this.restartButton.click();
  }

  async startNewList() {
    await this.newListButton.click();
  }
}

/**
 * Page Object for Word List Overlay
 */
export class WordListOverlay {
  constructor(private page: Page) {}

  get overlay() {
    return this.page.locator('[role="dialog"]').or(this.page.locator('.word-list-overlay'));
  }

  get closeButton() {
    return this.page.getByRole('button', { name: /close|sulje|×/i });
  }

  get wordItems() {
    return this.page.locator('[data-testid="word-item"]').or(this.overlay.locator('li, tr'));
  }

  async close() {
    await this.closeButton.click();
  }

  async isVisible(): Promise<boolean> {
    return await this.overlay.isVisible().catch(() => false);
  }
}
