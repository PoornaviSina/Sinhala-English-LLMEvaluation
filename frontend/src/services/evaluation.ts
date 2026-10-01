import type { EvaluateRequest, EvaluateResponse } from '../types';

export const endpointMessage = 'Interactive evaluation requires the Go API endpoint.';

export async function evaluateMessage(
  request: EvaluateRequest,
  signal?: AbortSignal,
): Promise<EvaluateResponse> {
  const response = await fetch('/api/evaluate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(request),
    signal,
  });
  if (
    [404, 405, 501].includes(response.status) ||
    !response.headers.get('content-type')?.includes('application/json')
  ) {
    throw new Error(endpointMessage);
  }
  if (!response.ok)
    throw new Error(
      `The evaluation could not be completed (HTTP ${response.status}). Please try again later.`,
    );
  const body: unknown = await response.json();
  if (
    !body ||
    typeof body !== 'object' ||
    !('predicted_intent' in body) ||
    typeof body.predicted_intent !== 'string' ||
    !('actual_response' in body) ||
    typeof body.actual_response !== 'string' ||
    !('language' in body) ||
    typeof body.language !== 'string' ||
    ('expected_intent' in body && typeof body.expected_intent !== 'string') ||
    ('correct' in body && body.correct !== null && typeof body.correct !== 'boolean')
  ) {
    throw new Error('The Go endpoint returned an unexpected response format.');
  }
  return body as EvaluateResponse;
}
