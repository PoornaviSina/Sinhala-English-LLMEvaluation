import type {
  CaseRecord,
  EvaluationDataset,
  FailurePattern,
  IntentMetric,
  QualityReview,
} from '../types/index.ts';

export const languageOrder = ['Sinhala', 'English', 'Singlish', 'Code-Mixed', 'Noisy'];
export const difficultyOrder = ['easy', 'medium', 'hard'];
export const ratio = (value: number, total: number) => (total ? value / total : 0);
export const percent = (value: number, digits = 2) => `${value.toFixed(digits)}%`;
export const titleCase = (value: string) =>
  value.replaceAll('_', ' ').replace(/\b\w/g, (char) => char.toUpperCase());
export const classification = (row: CaseRecord) =>
  !row.evaluation
    ? 'Not evaluated'
    : row.evaluation.error
      ? 'API error'
      : row.evaluation.correct
        ? 'Correct'
        : 'Incorrect';

export function summarizeQuality(reviews: QualityReview[]) {
  const mean = (key: 'relevance_score' | 'helpfulness_score' | 'language_score') => {
    const scored = reviews.filter((review) => review[key] !== null);
    return ratio(
      scored.reduce((sum, review) => sum + (review[key] ?? 0), 0),
      scored.length,
    );
  };
  const complete = reviews.filter(
    (review) =>
      review.relevance_score !== null &&
      review.helpfulness_score !== null &&
      review.language_score !== null,
  );
  const overall =
    ratio(
      complete.reduce(
        (sum, review) =>
          sum +
          (review.relevance_score ?? 0) +
          (review.helpfulness_score ?? 0) +
          (review.language_score ?? 0),
        0,
      ),
      complete.length * 6,
    ) * 100;
  const claims = reviews.filter((review) => review.unsupported_claim === true).length;
  const claimReviewed = reviews.filter((review) => review.unsupported_claim !== null).length;
  return {
    relevance: mean('relevance_score'),
    helpfulness: mean('helpfulness_score'),
    language: mean('language_score'),
    overall,
    claims,
    claimReviewed,
    claimPercentage: ratio(claims, claimReviewed) * 100,
    count: reviews.length,
  };
}

export function getFailures(reviews: QualityReview[]): FailurePattern[] {
  // These rules intentionally match cmd/failureanalysis/main.go, including its exact note substrings.
  const definitions = [
    {
      name: 'Unsupported Capability Claims',
      shortName: 'Unsupported claims',
      color: '#ec6668',
      method: 'unsupported_claim is true',
      match: (r: QualityReview) => r.unsupported_claim === true,
    },
    {
      name: 'Language Appropriateness Issues',
      shortName: 'Language issues',
      color: '#8b72dd',
      method: 'language_score is below 2',
      match: (r: QualityReview) => r.language_score !== null && r.language_score < 2,
    },
    {
      name: 'Malformed / Mixed-Script Cases',
      shortName: 'Malformed / mixed-script',
      color: '#f3ab52',
      method: 'Existing Go keyword rule applied to reviewer notes',
      match: (r: QualityReview) =>
        [
          'malformed',
          'mixed-script',
          'mixed script',
          'unexpected non-sinhala',
          'hindi script',
        ].some((word) => r.notes.toLowerCase().includes(word)),
    },
    {
      name: 'Reduced Helpfulness',
      shortName: 'Reduced helpfulness',
      color: '#5b99e9',
      method: 'helpfulness_score is below 2',
      match: (r: QualityReview) => r.helpfulness_score !== null && r.helpfulness_score < 2,
    },
    {
      name: 'Product Availability Assumptions',
      shortName: 'Availability assumptions',
      color: '#a0aabd',
      method: 'Notes include availability and either yes or inventory (existing Go rule)',
      match: (r: QualityReview) =>
        r.notes.toLowerCase().includes('availability') &&
        ['yes', 'inventory'].some((word) => r.notes.toLowerCase().includes(word)),
    },
  ];
  return definitions.map(({ match, ...definition }) => {
    const ids = reviews
      .filter(match)
      .map((row) => row.id)
      .sort();
    return {
      ...definition,
      ids,
      count: ids.length,
      percentage: ratio(ids.length, reviews.length) * 100,
    };
  });
}

export function analyzeDataset(data: EvaluationDataset) {
  const evaluations = new Map(data.evaluations.map((row) => [row.id, row]));
  const reviews = new Map(data.reviews.map((row) => [row.id, row]));
  const cases: CaseRecord[] = data.testCases.map((row) => ({
    ...row,
    evaluation: evaluations.get(row.id),
    review: reviews.get(row.id),
  }));
  const intents = [...new Set(cases.map((row) => row.expected_intent))];
  const metrics: IntentMetric[] = intents.map((intent) => {
    const tp = data.evaluations.filter(
      (row) => row.expected_intent === intent && row.predicted_intent === intent,
    ).length;
    const fp = data.evaluations.filter(
      (row) => row.expected_intent !== intent && row.predicted_intent === intent,
    ).length;
    const fn = cases.filter(
      (row) => row.expected_intent === intent && row.evaluation?.predicted_intent !== intent,
    ).length;
    const precision = ratio(tp, tp + fp);
    const recall = ratio(tp, tp + fn);
    return {
      intent,
      tp,
      fp,
      fn,
      precision,
      recall,
      f1: ratio(2 * precision * recall, precision + recall),
    };
  });
  const group = (key: 'category' | 'difficulty', order: string[]) =>
    order.map((name) => {
      const rows = cases.filter((row) => row[key] === name);
      const correct = rows.filter((row) => row.evaluation?.correct && !row.evaluation.error).length;
      return {
        name,
        value: rows.length,
        total: rows.length,
        correct,
        accuracy: ratio(correct, rows.length) * 100,
      };
    });
  const correct = cases.filter((row) => row.evaluation?.correct && !row.evaluation.error).length;
  const completed = cases.filter((row) => row.evaluation && !row.evaluation.error).length;
  return {
    cases,
    intents,
    metrics,
    correct,
    completed,
    accuracy: ratio(correct, cases.length) * 100,
    completion: ratio(completed, cases.length) * 100,
    macroPrecision: ratio(
      metrics.reduce((sum, metric) => sum + metric.precision, 0),
      metrics.length,
    ),
    macroRecall: ratio(
      metrics.reduce((sum, metric) => sum + metric.recall, 0),
      metrics.length,
    ),
    macroF1: ratio(
      metrics.reduce((sum, metric) => sum + metric.f1, 0),
      metrics.length,
    ),
    languages: group('category', languageOrder),
    difficulties: group('difficulty', difficultyOrder),
    quality: summarizeQuality(data.reviews),
    qualityByLanguage: languageOrder.map((name) => ({
      name,
      ...summarizeQuality(data.reviews.filter((row) => row.category === name)),
    })),
    failures: getFailures(data.reviews),
  };
}

export interface CaseFilters {
  search: string;
  language: string;
  intent: string;
  difficulty: string;
  result: string;
}
export const emptyFilters: CaseFilters = {
  search: '',
  language: '',
  intent: '',
  difficulty: '',
  result: '',
};
export function filterCases(cases: CaseRecord[], filters: CaseFilters) {
  const search = filters.search.normalize('NFC').toLocaleLowerCase().trim();
  return cases.filter(
    (row) =>
      (!filters.language || row.category === filters.language) &&
      (!filters.intent || row.expected_intent === filters.intent) &&
      (!filters.difficulty || row.difficulty === filters.difficulty) &&
      (!filters.result || classification(row) === filters.result) &&
      (!search ||
        [row.id, row.input, row.expected_intent, titleCase(row.expected_intent), row.category].some(
          (value) => value.normalize('NFC').toLocaleLowerCase().includes(search),
        )),
  );
}
