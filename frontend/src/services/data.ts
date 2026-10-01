import snapshot from '../data/evaluation.json';
import type { EvaluationDataset } from '../types';
import { analyzeDataset } from '../utils/analytics';

// The build-time script validates the real repository files before generating this snapshot.
export const dataset: EvaluationDataset = snapshot;
export const analytics = analyzeDataset(dataset);
