import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';

const cases = JSON.parse(
  readFileSync(new URL('../../data/test_cases.json', import.meta.url), 'utf8'),
);

test('all seven routes, real data, charts, filters, pagination, and case details', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible();
  await expect(page.getByText('91.11%', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('51.67%', { exact: true }).first()).toBeVisible();
  await expect(page.locator('.recharts-surface')).toHaveCount(4);
  for (const chart of await page.locator('.recharts-surface').all()) {
    const box = await chart.boundingBox();
    expect(box?.width).toBeGreaterThan(50);
    expect(box?.height).toBeGreaterThan(50);
  }
  await page.screenshot({ path: 'test-results/dashboard-desktop.png', fullPage: true });
  await page.getByRole('link', { name: 'View All Test Cases' }).click();
  await expect(page.getByRole('heading', { name: 'Test Cases', exact: true })).toBeVisible();
  await expect(page.locator('tbody tr')).toHaveCount(10);
  await page.getByRole('button', { name: 'Next page' }).click();
  await expect(page.getByRole('button', { name: 'TC011', exact: true })).toBeVisible();
  await page.getByRole('textbox', { name: 'Search test cases' }).fill('TC001');
  await expect(page.locator('tbody tr')).toHaveCount(1);
  await expect(page.getByText(cases[0].input, { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'TC001', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Generated LLM Response' })).toBeVisible();
  await expect(page.getByText('No reviewer notes recorded.', { exact: true })).toBeVisible();
  await page.screenshot({ path: 'test-results/test-case-detail.png', fullPage: true });
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'TC001', exact: true })).toBeFocused();
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await page.getByRole('combobox', { name: 'Language', exact: true }).selectOption('English');
  await page.getByRole('combobox', { name: 'Intent', exact: true }).selectOption('order_status');
  await page.getByRole('combobox', { name: 'Difficulty', exact: true }).selectOption('easy');
  await page.getByRole('combobox', { name: 'Result', exact: true }).selectOption('Correct');
  await expect(page.locator('tbody tr')).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'TC002', exact: true })).toBeVisible();
  await page.getByRole('combobox', { name: 'Result', exact: true }).selectOption('Incorrect');
  await expect(page.getByText('No matching test cases', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await page.getByRole('textbox', { name: 'Search test cases' }).fill('මගේ');
  await expect(page.locator('tbody tr').first()).toBeVisible();
  await page.getByRole('link', { name: 'Results', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Classification Results', exact: true }),
  ).toBeVisible();
  await expect(page.locator('tbody tr')).toHaveCount(12);
  await expect(page.locator('a.active')).toHaveText('Results');
  await page.getByRole('link', { name: 'Response Quality', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Response Quality', exact: true })).toBeVisible();
  await page.getByRole('textbox', { name: 'Search quality reviews' }).fill('TC016');
  await expect(page.locator('.review-table tbody tr')).toHaveCount(1);
  await expect(page.getByText(/contains malformed mixed-script wording/)).toBeVisible();
  await page.getByRole('link', { name: 'Failure Analysis', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Failure Analysis', exact: true })).toBeVisible();
  await page
    .getByRole('combobox', { name: 'Failure Type' })
    .selectOption('Malformed / Mixed-Script Cases');
  await expect(page.locator('.failure-table tbody tr')).toHaveCount(4);
  await expect(page.getByRole('button', { name: 'TC016' })).toBeVisible();
  await page.screenshot({ path: 'test-results/failure-analysis-desktop.png', fullPage: true });
  await page.getByRole('link', { name: 'Evaluate', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Evaluate Message', exact: true })).toBeDisabled();
  await page.getByLabel('Customer Message', { exact: true }).fill(cases[0].input);
  await page.getByRole('button', { name: 'Evaluate Message', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Go API endpoint required' })).toBeVisible();
  await expect(page.getByText('Processing Status: Endpoint unavailable')).toBeVisible();
  await page.getByRole('link', { name: 'About', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'About the Framework' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'View on GitHub' })).toHaveAttribute(
    'href',
    'https://github.com/PoornaviSina/Sinhala-English-LLMEvaluation',
  );
  for (const path of [
    '/test-cases',
    '/results',
    '/response-quality',
    '/failure-analysis',
    '/evaluate',
    '/about',
  ]) {
    await page.goto(path);
    await expect(page.locator('main h1')).toBeVisible();
    await expect(page.locator('a.active')).toHaveCount(1);
  }
  await page.goto('/unknown-page');
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('mobile and tablet layouts, navigation drawer, scrollable tables, and Sinhala detail', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).not.toBeVisible();
  await page.getByRole('button', { name: 'Open menu' }).click();
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Open menu' })).toBeFocused();
  await page.getByRole('button', { name: 'Open menu' }).click();
  await page.getByRole('navigation').getByRole('link', { name: 'Test Cases' }).click();
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).not.toBeVisible();
  await page.getByRole('button', { name: 'TC001', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog').getByText(cases[0].input, { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Close test case details' }).click();
  for (const path of [
    '/',
    '/test-cases',
    '/results',
    '/response-quality',
    '/failure-analysis',
    '/evaluate',
    '/about',
  ]) {
    await page.goto(path);
    await expect(page.locator('main h1')).toBeVisible();
    if (await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)) {
      console.log(
        'Overflow at',
        path,
        await page.evaluate(() =>
          [...document.querySelectorAll('*')]
            .filter(
              (element) =>
                element.getBoundingClientRect().right > window.innerWidth &&
                !element.closest('.table-scroll'),
            )
            .map((element) => ({
              tag: element.tagName,
              class: element.getAttribute('class'),
              width: element.getBoundingClientRect().width,
              right: element.getBoundingClientRect().right,
            })),
        ),
      );
      await page.screenshot({ path: 'test-results/mobile-overflow.png', fullPage: true });
    }
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
  }
  await page.goto('/');
  await page.screenshot({ path: 'test-results/dashboard-mobile.png', fullPage: true });
  await page.setViewportSize({ width: 820, height: 1180 });
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.screenshot({ path: 'test-results/dashboard-tablet.png', fullPage: true });
});
