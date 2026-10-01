import { useEffect, useRef } from 'react';
import { CheckCircle2, MessageSquareText, X } from 'lucide-react';
import type { CaseRecord } from '../../types';
import { Badge, languageTone } from './Badge';
import { classification, titleCase } from '../../utils/analytics';

export function CaseDetail({
  record,
  onClose,
}: {
  record: CaseRecord | null;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!record || !dialog) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [record]);
  if (!record) return null;
  const result = classification(record);
  const review = record.review;
  return (
    <dialog
      ref={ref}
      className="case-dialog"
      aria-labelledby="case-detail-title"
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="dialog-content">
        <header className="dialog-heading">
          <div>
            <div className="eyebrow">Test case detail</div>
            <h2 id="case-detail-title">{record.id}</h2>
          </div>
          <button
            className="icon-button"
            aria-label="Close test case details"
            onClick={onClose}
            autoFocus
          >
            <X size={21} />
          </button>
        </header>
        <div className="badge-row">
          <Badge tone={languageTone(record.category)}>{record.category}</Badge>
          <Badge tone={record.difficulty === 'hard' ? 'orange' : 'slate'}>
            {titleCase(record.difficulty)}
          </Badge>
          <Badge tone={result === 'Correct' ? 'green' : 'red'}>
            {result === 'Correct' && <CheckCircle2 size={12} />}
            {result}
          </Badge>
        </div>
        <section className="detail-section">
          <h3>Customer Input</h3>
          <p className="quote-text" lang={record.category === 'Sinhala' ? 'si' : undefined}>
            {record.input}
          </p>
        </section>
        <div className="detail-meta">
          <div>
            <span>Expected Intent</span>
            <strong>{record.expected_intent}</strong>
          </div>
          <div>
            <span>Predicted Intent</span>
            <strong>{record.evaluation?.predicted_intent || 'Not available'}</strong>
          </div>
          <div>
            <span>Language</span>
            <strong>{record.category}</strong>
          </div>
          <div>
            <span>Classification Result</span>
            <strong>{result}</strong>
          </div>
        </div>
        <section className="detail-section">
          <h3>
            <MessageSquareText size={16} /> Generated LLM Response
          </h3>
          <p className="response-text">
            {record.evaluation?.actual_response || 'No generated response is available.'}
          </p>
          {record.evaluation?.error && <p className="error-text">{record.evaluation.error}</p>}
        </section>
        <section className="detail-section">
          <h3>Quality Scores</h3>
          {review ? (
            <>
              <div className="score-grid">
                {[
                  ['Relevance', review.relevance_score],
                  ['Helpfulness', review.helpfulness_score],
                  ['Language', review.language_score],
                ].map(([name, score]) => (
                  <div key={name}>
                    <span>{name}</span>
                    <strong>{score === null ? 'Not reviewed' : `${score} / 2`}</strong>
                  </div>
                ))}
              </div>
              <div className="claim-line">
                <span>Unsupported claim</span>
                <Badge tone={review.unsupported_claim ? 'red' : 'green'}>
                  {review.unsupported_claim === null
                    ? 'Not reviewed'
                    : review.unsupported_claim
                      ? 'Flagged'
                      : 'Not flagged'}
                </Badge>
              </div>
            </>
          ) : (
            <p className="muted">No quality review available.</p>
          )}
        </section>
        <section className="detail-section">
          <h3>Reviewer Notes</h3>
          <p className="notes-text">{review?.notes || 'No reviewer notes recorded.'}</p>
        </section>
        <footer className="dialog-footer">
          Source: final evaluation results and quality reviews · {record.id}
        </footer>
      </div>
    </dialog>
  );
}
