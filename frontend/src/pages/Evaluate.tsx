import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import {
  ArrowRight,
  Braces,
  CheckCircle2,
  CircleDashed,
  Info,
  LoaderCircle,
  MessageSquareText,
  Play,
  Server,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { analytics } from '../services/data';
import { endpointMessage, evaluateMessage } from '../services/evaluation';
import { languageOrder, titleCase } from '../utils/analytics';
import type { EvaluateResponse } from '../types';
import { PageHeading, Panel } from '../components/common/Panel';
import { Badge } from '../components/common/Badge';

export default function Evaluate() {
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState('Auto Detect');
  const [intent, setIntent] = useState('');
  const [status, setStatus] = useState<
    'idle' | 'processing' | 'complete' | 'unavailable' | 'error'
  >('idle');
  const [error, setError] = useState('');
  const [result, setResult] = useState<EvaluateResponse | null>(null);
  const [submittedIntent, setSubmittedIntent] = useState('');
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!input.trim() || status === 'processing') return;
    controller.current?.abort();
    const abortController = new AbortController();
    controller.current = abortController;
    setStatus('processing');
    setError('');
    setResult(null);
    setSubmittedIntent(intent);
    const timeout = window.setTimeout(() => abortController.abort('timeout'), 30000);
    try {
      const response = await evaluateMessage(
        { input: input.trim(), language, ...(intent ? { expected_intent: intent } : {}) },
        abortController.signal,
      );
      setResult(response);
      setStatus('complete');
    } catch (cause) {
      if (abortController.signal.aborted && abortController.signal.reason !== 'timeout') return;
      const message =
        abortController.signal.reason === 'timeout'
          ? 'The Go API did not respond within 30 seconds. Please try again.'
          : cause instanceof TypeError
            ? 'Unable to reach the Go API. Interactive evaluation requires the Go API endpoint.'
            : cause instanceof Error
              ? cause.message
              : 'Evaluation could not be completed.';
      setError(message);
      setStatus(message.includes(endpointMessage) ? 'unavailable' : 'error');
    } finally {
      window.clearTimeout(timeout);
    }
  }
  const expected = result?.expected_intent || submittedIntent;
  const correct = result
    ? (result.correct ?? (expected ? result.predicted_intent === expected : null))
    : null;
  return (
    <>
      <PageHeading
        eyebrow="INTERACTIVE EVALUATION"
        title="Evaluate a Message"
        description="Explore how the model interprets a multilingual customer-support request."
        action={
          <Badge tone="blue">
            <Braces size={13} /> Go API integration
          </Badge>
        }
      />
      <div className="notice">
        <Info size={18} />
        <p>
          <strong>{endpointMessage}</strong> The current dashboard displays saved evaluation
          results. New responses will appear when the backend endpoint is available.
        </p>
      </div>
      <div className="two-column-grid evaluate-grid">
        <Panel
          title="Customer message"
          subtitle="Write naturally, in any of the supported language styles."
        >
          <form className="evaluate-form" onSubmit={submit}>
            <label htmlFor="customer-message">Customer Message</label>
            <textarea
              id="customer-message"
              required
              maxLength={5000}
              rows={8}
              placeholder="Enter a customer-support message…"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              disabled={status === 'processing'}
            />
            <div className="textarea-meta">
              <span>Sinhala · English · Singlish · Code-Mixed · Noisy</span>
              <span>{input.length} / 5,000</span>
            </div>
            <div className="form-selects">
              <label>
                Language
                <select
                  value={language}
                  onChange={(event) => setLanguage(event.target.value)}
                  disabled={status === 'processing'}
                >
                  <option>Auto Detect</option>
                  {languageOrder.map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </label>
              <label>
                Expected Intent <span className="muted">(optional)</span>
                <select
                  value={intent}
                  onChange={(event) => setIntent(event.target.value)}
                  disabled={status === 'processing'}
                >
                  <option value="">No expected intent</option>
                  {analytics.intents.map((value) => (
                    <option key={value} value={value}>
                      {titleCase(value)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <button
              className="button button-primary evaluate-button"
              disabled={!input.trim() || status === 'processing'}
              type="submit"
            >
              {status === 'processing' ? (
                <LoaderCircle size={17} className="spin" />
              ) : (
                <Play size={16} />
              )}
              {status === 'processing' ? 'Evaluating message…' : 'Evaluate Message'}
              <ArrowRight size={16} />
            </button>
            <p className="form-footnote">
              <ShieldCheck size={14} /> Evaluation is processed by the Go backend.
            </p>
          </form>
        </Panel>
        <Panel
          title="Evaluation result"
          subtitle="Intent prediction and generated response"
          action={
            <Badge
              tone={status === 'complete' ? 'green' : status === 'processing' ? 'blue' : 'slate'}
            >
              {status === 'idle' ? 'Awaiting input' : titleCase(status)}
            </Badge>
          }
        >
          <div className="evaluation-output" aria-live="polite">
            {!result ? (
              <>
                <div className="output-empty">
                  <span className="output-icon">
                    {status === 'processing' ? (
                      <LoaderCircle size={31} className="spin" />
                    ) : status === 'unavailable' || status === 'error' ? (
                      <Server size={31} />
                    ) : (
                      <MessageSquareText size={31} />
                    )}
                  </span>
                  <h3>
                    {status === 'processing'
                      ? 'Evaluating your message'
                      : status === 'unavailable'
                        ? 'Go API endpoint required'
                        : status === 'error'
                          ? 'Evaluation unavailable'
                          : 'Your evaluation will appear here'}
                  </h3>
                  <p>
                    {error ||
                      (status === 'processing'
                        ? 'Waiting for the Go backend to return a response.'
                        : 'Enter a customer message and select Evaluate Message to get started.')}
                  </p>
                </div>
                <dl className="pending-fields">
                  <div>
                    <dt>Predicted Intent</dt>
                    <dd>—</dd>
                  </div>
                  <div>
                    <dt>Generated Response</dt>
                    <dd>—</dd>
                  </div>
                  <div>
                    <dt>Detected/Selected Language</dt>
                    <dd>{language}</dd>
                  </div>
                  <div>
                    <dt>Expected Intent</dt>
                    <dd>{intent || 'Not provided'}</dd>
                  </div>
                  <div>
                    <dt>Correct / Incorrect</dt>
                    <dd>Not evaluated</dd>
                  </div>
                </dl>
              </>
            ) : (
              <>
                <div className="result-success">
                  <CheckCircle2 size={19} /> Evaluation complete
                </div>
                <dl className="pending-fields">
                  <div>
                    <dt>Predicted Intent</dt>
                    <dd>{result.predicted_intent}</dd>
                  </div>
                  <div>
                    <dt>Detected/Selected Language</dt>
                    <dd>{result.language}</dd>
                  </div>
                  <div>
                    <dt>Expected Intent</dt>
                    <dd>{expected || 'Not provided'}</dd>
                  </div>
                  <div>
                    <dt>Correct / Incorrect</dt>
                    <dd>
                      <Badge tone={correct === null ? 'slate' : correct ? 'green' : 'red'}>
                        {correct === null ? 'Not assessed' : correct ? 'Correct' : 'Incorrect'}
                      </Badge>
                    </dd>
                  </div>
                </dl>
                <h3>Generated Response</h3>
                <p className="response-text">{result.actual_response}</p>
              </>
            )}
            <div className="processing-status">
              <CircleDashed size={14} />
              <span>
                Processing Status:{' '}
                {status === 'idle'
                  ? 'Ready for input'
                  : status === 'unavailable'
                    ? 'Endpoint unavailable'
                    : titleCase(status)}
              </span>
            </div>
          </div>
        </Panel>
      </div>
      <div className="evaluate-note">
        <Sparkles size={17} />
        <p>
          Explore the <strong>Test Cases</strong> page to inspect the 60 real messages and responses
          from the completed evaluation.
        </p>
      </div>
    </>
  );
}
