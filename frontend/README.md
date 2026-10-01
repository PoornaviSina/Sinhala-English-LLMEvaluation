# Sinhala-English LLM Evaluation Dashboard

A separate React + TypeScript visualization layer for the existing Go framework. All seven pages use the original dataset and completed evaluation artifacts. The frontend does not execute or alter the Go evaluation pipeline.

## Run locally

From the repository root (Node.js 22.12+ recommended):

```powershell
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite, normally `http://127.0.0.1:5173`.

```powershell
npm run build
npm run preview
```

The preview server normally uses `http://127.0.0.1:4173`. Production hosting must serve `index.html` for application routes such as `/test-cases` and `/failure-analysis` (SPA fallback). The Go `/api` routes should take precedence over that fallback.

## Data and provenance

`scripts/sync-data.mjs` runs before both development and build. It reads only:

- `../data/test_cases.json`
- `../results/evaluation_results_final.json`
- `../results/quality_reviews.json`

It validates field types, unique IDs, supported categories, score bounds, correct flags, and matching inputs/responses across files. Only known evaluation fields are copied into an ignored `src/data/evaluation.json` snapshot. It never edits the originals, reads environment files, or serves the repository root. Re-run `npm run sync-data` and rebuild after changing the source dataset. Failures are explicit; missing data is never replaced with sample data.

Metric summaries are calculated from the snapshot. The initial run remains preserved and is not mixed into the completed final evaluation. There are no per-case timestamps, so the dashboard labels its first five records as sample cases rather than claiming they are recent. The original text reports use UTF-16, while the JSON is UTF-8. Three current reviews have empty notes; the UI displays “No reviewer notes recorded.”

Failure detection reproduces the exact rules in `cmd/failureanalysis/main.go`. In particular, its malformed-output rule searches `hindi script`, not `hindi-script`; the availability rule requires `availability` and either `yes` or `inventory`. These existing heuristics can omit semantically similar notes. The frontend preserves the current report’s 4 malformed and 2 availability cases, without broadening the rules or changing reviews. Patterns overlap.

## Interactive evaluation

The existing repository has no Go REST evaluation endpoint. The form sends a same-origin request to `POST /api/evaluate` and displays an endpoint-required state for missing endpoints or an HTML SPA fallback. It never produces a simulated model response.

The proposed contract in `src/types/index.ts` is:

```ts
interface EvaluateRequest {
  input: string;
  language: string; // Auto Detect, Sinhala, English, Singlish, Code-Mixed, or Noisy
  expected_intent?: string;
}
interface EvaluateResponse {
  predicted_intent: string;
  actual_response: string;
  language: string; // Detected or selected language
  expected_intent?: string;
  correct?: boolean | null;
}
```

When the Go endpoint is implemented, serve it at the same origin or add a Vite development proxy for `/api`. Keep model credentials and provider calls on the Go server. No frontend environment variables are needed. The “Gemini API · Connected” header is explicitly a configuration display, not a live connectivity or credential check.

## Verification

```powershell
npm test
npm run test:e2e
```

Unit tests compare calculated metrics and every affected failure ID with the original reports, and exercise Unicode/combined search and incomplete evaluations. Browser tests cover all routes, navigation, charts, search, filters, pagination, case dialogs, unavailable API behavior, mobile and tablet layouts. They save screenshots under the ignored `test-results/` folder.

On Windows the browser checks use installed Google Chrome. On other platforms install Playwright Chromium first with `npx playwright install chromium`. Browser tests start their own development server.

Typography uses DM Sans and Noto Sans Sinhala from Google Fonts, with Nirmala UI and system fallbacks for offline use. No customer messages are sent to the font service.

## Structure

- `src/components/`: shared layout, cards, charts, tables, badges, panels, and accessible native case dialog
- `src/pages/`: Dashboard, Test Cases, Results, Response Quality, Failure Analysis, Evaluate, About
- `src/services/`: repository snapshot and future Go API adapter
- `src/types/`: actual JSON interfaces and proposed REST contract
- `src/utils/`: derived metrics, filters, and failure rules
- `scripts/`: allowlisted, read-only repository data import
- `tests/`: data regression and browser interaction checks

Technical references: [Vite setup](https://vite.dev/guide/), [React Router declarative routing](https://reactrouter.com/start/declarative/routing), and [Recharts responsive containers](https://recharts.github.io/api/ResponsiveContainer/).
