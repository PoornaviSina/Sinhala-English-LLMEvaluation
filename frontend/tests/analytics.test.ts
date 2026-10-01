import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { analyzeDataset, emptyFilters, filterCases, getFailures } from '../src/utils/analytics.ts';
import type { EvaluationDataset } from '../src/types/index.ts';

const read = (path: string) =>
  JSON.parse(readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8'));
const dataset: EvaluationDataset = {
  testCases: read('data/test_cases.json'),
  evaluations: read('results/evaluation_results_final.json'),
  reviews: read('results/quality_reviews.json'),
  sources: {
    testCases: 'data/test_cases.json',
    evaluations: 'results/evaluation_results_final.json',
    reviews: 'results/quality_reviews.json',
  },
};
const analytics = analyzeDataset(dataset);

test('computed results agree with the committed classification and quality reports', () => {
  assert.equal(analytics.cases.length, 60);
  assert.equal(analytics.intents.length, 12);
  assert.equal(analytics.accuracy, 100);
  assert.equal(analytics.completion, 100);
  assert.equal(analytics.macroPrecision, 1);
  assert.equal(analytics.macroRecall, 1);
  assert.equal(analytics.macroF1, 1);
  for (const metric of analytics.metrics)
    assert.deepEqual([metric.tp, metric.fp, metric.fn], [5, 0, 0]);
  assert.deepEqual(
    analytics.languages.map((row) => row.total),
    [12, 12, 12, 12, 12],
  );
  assert.deepEqual(
    analytics.difficulties.map((row) => row.total),
    [24, 24, 12],
  );
  assert.equal((analytics.quality.relevance * 50).toFixed(2), '100.00');
  assert.equal((analytics.quality.helpfulness * 50).toFixed(2), '97.50');
  assert.equal((analytics.quality.language * 50).toFixed(2), '75.83');
  assert.equal(analytics.quality.overall.toFixed(2), '91.11');
  assert.equal(analytics.quality.claims, 31);
  assert.deepEqual(
    analytics.qualityByLanguage.map((row) => [row.name, row.overall.toFixed(2), row.claims]),
    [
      ['Sinhala', '91.67', 5],
      ['English', '98.61', 8],
      ['Singlish', '84.72', 6],
      ['Code-Mixed', '81.94', 6],
      ['Noisy', '98.61', 6],
    ],
  );
});

test('all failure IDs and counts agree with the existing Go report', () => {
  const bytes = readFileSync(new URL('../../results/failure_analysis_report.txt', import.meta.url));
  const report = bytes.toString(bytes[0] === 0xff && bytes[1] === 0xfe ? 'utf16le' : 'utf8');
  const names: Record<string, string> = {
    'Malformed / Mixed-Script Cases': 'Malformed or Mixed-Script Output',
    'Product Availability Assumptions': 'Premature Product Availability Assumptions',
  };
  for (const failure of getFailures(dataset.reviews)) {
    const heading = names[failure.name] ?? failure.name;
    const block = report
      .slice(report.indexOf(heading))
      .split('Test Case IDs: ')[1]
      .split(/\r?\n/)[0];
    assert.deepEqual(failure.ids, block.split(', '));
  }
  assert.deepEqual(
    analytics.failures.map((row) => row.count),
    [31, 29, 4, 3, 2],
  );
});

test('search handles Sinhala, case IDs, combined filters, and empty results', () => {
  assert.equal(filterCases(analytics.cases, { ...emptyFilters, search: 'tc001' })[0].id, 'TC001');
  assert.ok(filterCases(analytics.cases, { ...emptyFilters, search: 'මගේ' }).length > 0);
  assert.equal(filterCases(analytics.cases, { ...emptyFilters, language: 'English' }).length, 12);
  const combined = filterCases(analytics.cases, {
    ...emptyFilters,
    language: 'English',
    intent: 'order_status',
    difficulty: 'easy',
    result: 'Correct',
  });
  assert.deepEqual(
    combined.map((row) => row.id),
    ['TC002'],
  );
  assert.equal(filterCases(analytics.cases, { ...emptyFilters, result: 'Incorrect' }).length, 0);
});

test('missing and failed evaluations remain incomplete instead of becoming successful', () => {
  const partial = analyzeDataset({ ...dataset, evaluations: [] });
  assert.equal(partial.completion, 0);
  assert.equal(partial.accuracy, 0);
  assert.equal(partial.macroRecall, 0);
  assert.ok(partial.cases.every((row) => !row.evaluation));
});
