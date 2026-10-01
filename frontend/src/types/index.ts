export interface TestCase {
  id: string;
  category: string;
  input: string;
  expected_intent: string;
  expected_response: string;
  difficulty: string;
}

export interface EvaluationResult extends TestCase {
  predicted_intent: string;
  actual_response: string;
  correct: boolean;
  error?: string;
}

export interface QualityReview extends TestCase {
  predicted_intent: string;
  actual_response: string;
  relevance_score: number | null;
  helpfulness_score: number | null;
  language_score: number | null;
  unsupported_claim: boolean | null;
  notes: string;
}

export interface EvaluationDataset {
  testCases: TestCase[];
  evaluations: EvaluationResult[];
  reviews: QualityReview[];
  sources: { testCases: string; evaluations: string; reviews: string };
}

export interface CaseRecord extends TestCase {
  evaluation?: EvaluationResult;
  review?: QualityReview;
}

export interface IntentMetric {
  intent: string;
  tp: number;
  fp: number;
  fn: number;
  precision: number;
  recall: number;
  f1: number;
}

export type Tone = 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'slate';
export interface FailurePattern {
  name: string;
  shortName: string;
  ids: string[];
  count: number;
  percentage: number;
  color: string;
  method: string;
}

export interface DashboardMetric {
  label: string;
  value: string;
  note: string;
  tone: Tone;
}

export interface EvaluateRequest {
  input: string;
  language: string;
  expected_intent?: string;
}

// Proposed REST contract, independent of the existing command-line Go framework.
export interface EvaluateResponse {
  predicted_intent: string;
  actual_response: string;
  language: string;
  expected_intent?: string;
  correct?: boolean | null;
}
