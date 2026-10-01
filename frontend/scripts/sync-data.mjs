import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = new URL('../../', import.meta.url);
// Deliberate allowlist: never scan the repository or load environment files.
const sources = {
  testCases: 'data/test_cases.json',
  evaluations: 'results/evaluation_results_final.json',
  reviews: 'results/quality_reviews.json',
};
const snapshot = {};
const strings = {
  testCases: ['id', 'category', 'input', 'expected_intent', 'expected_response', 'difficulty'],
  evaluations: [
    'id',
    'category',
    'input',
    'expected_intent',
    'expected_response',
    'difficulty',
    'predicted_intent',
    'actual_response',
  ],
  reviews: [
    'id',
    'category',
    'input',
    'expected_intent',
    'expected_response',
    'difficulty',
    'predicted_intent',
    'actual_response',
    'notes',
  ],
};
const languages = ['Sinhala', 'English', 'Singlish', 'Code-Mixed', 'Noisy'];
for (const [key, path] of Object.entries(sources)) {
  const rows = JSON.parse(await readFile(new URL(path, root), 'utf8'));
  if (!Array.isArray(rows) || !rows.length) throw new Error(`${path}: expected a nonempty array`);
  const ids = new Set();
  for (const row of rows) {
    for (const field of strings[key]) {
      if (typeof row[field] !== 'string') throw new Error(`${path}: invalid ${field} on ${row.id}`);
    }
    if (!row.id || ids.has(row.id)) throw new Error(`${path}: empty or duplicate ID ${row.id}`);
    ids.add(row.id);
    if (!languages.includes(row.category) || !['easy', 'medium', 'hard'].includes(row.difficulty)) {
      throw new Error(`${path}: unknown category or difficulty on ${row.id}`);
    }
    if (
      key === 'evaluations' &&
      (typeof row.correct !== 'boolean' ||
        (row.error !== undefined && typeof row.error !== 'string'))
    ) {
      throw new Error(`${path}: invalid classification result on ${row.id}`);
    }
    if (
      key === 'evaluations' &&
      row.correct !== (!row.error && row.predicted_intent === row.expected_intent)
    ) {
      throw new Error(`${path}: inconsistent correct flag on ${row.id}`);
    }
    if (key === 'reviews') {
      for (const field of ['relevance_score', 'helpfulness_score', 'language_score']) {
        if (row[field] !== null && ![0, 1, 2].includes(row[field]))
          throw new Error(`${path}: invalid ${field} on ${row.id}`);
      }
      if (row.unsupported_claim !== null && typeof row.unsupported_claim !== 'boolean')
        throw new Error(`${path}: invalid unsupported_claim on ${row.id}`);
    }
  }
  // Copy only known public evaluation fields; future unrelated fields cannot leak into the bundle.
  const fields = [
    ...strings[key],
    ...(key === 'evaluations' ? ['correct', 'error'] : []),
    ...(key === 'reviews'
      ? ['relevance_score', 'helpfulness_score', 'language_score', 'unsupported_claim']
      : []),
  ];
  snapshot[key] = rows.map((row) =>
    Object.fromEntries(
      fields.filter((field) => row[field] !== undefined).map((field) => [field, row[field]]),
    ),
  );
}
const cases = new Map(snapshot.testCases.map((row) => [row.id, row]));
const results = new Map(snapshot.evaluations.map((row) => [row.id, row]));
for (const key of ['evaluations', 'reviews']) {
  for (const row of snapshot[key]) {
    const original = cases.get(row.id);
    if (!original) throw new Error(`${sources[key]}: unknown test case ${row.id}`);
    for (const field of strings.testCases) {
      if (row[field] !== original[field])
        throw new Error(`${sources[key]}: ${field} differs from dataset on ${row.id}`);
    }
    if (key === 'reviews') {
      const result = results.get(row.id);
      if (
        !result ||
        row.actual_response !== result.actual_response ||
        row.predicted_intent !== result.predicted_intent
      ) {
        throw new Error(`${sources[key]}: review does not match final response on ${row.id}`);
      }
    }
  }
}
snapshot.sources = sources;
const target = new URL('../src/data/evaluation.json', import.meta.url);
await mkdir(new URL('.', target), { recursive: true });
await writeFile(target, JSON.stringify(snapshot, null, 2) + '\n', 'utf8');
console.log(
  `Validated ${snapshot.testCases.length} cases, ${snapshot.evaluations.length} final results, and ${snapshot.reviews.length} reviews.\nFrontend snapshot: ${fileURLToPath(target)}`,
);
