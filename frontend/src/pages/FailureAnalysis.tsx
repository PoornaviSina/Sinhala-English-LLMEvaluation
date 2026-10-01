import { useState } from 'react';
import { ArrowUpRight, Flag, Info, Search, TriangleAlert } from 'lucide-react';
import { analytics } from '../services/data';
import type { CaseRecord, Tone } from '../types';
import { percent } from '../utils/analytics';
import { PageHeading, Panel } from '../components/common/Panel';
import { MetricCard } from '../components/cards/MetricCard';
import { Badge } from '../components/common/Badge';
import { FailureChart } from '../components/charts/EvaluationCharts';
import { Pagination } from '../components/tables/CaseTable';
import { CaseDetail } from '../components/common/CaseDetail';

export default function FailureAnalysis() {
  const [pattern, setPattern] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<CaseRecord | null>(null);
  const tones: Tone[] = ['red', 'purple', 'orange', 'blue', 'slate'];
  const affected = analytics.cases
    .map((row) => ({
      ...row,
      failures: analytics.failures.filter((failure) => failure.ids.includes(row.id)),
    }))
    .filter(
      (row) =>
        row.failures.length &&
        (!pattern || row.failures.some((failure) => failure.name === pattern)) &&
        [row.id, row.input, row.review?.notes ?? '', row.evaluation?.actual_response ?? ''].some(
          (value) => value.toLowerCase().includes(query.trim().toLowerCase()),
        ),
    );
  return (
    <>
      <PageHeading
        eyebrow="RELIABILITY & LANGUAGE"
        title="Failure Analysis"
        description="Understand where correct intent predictions still lead to imperfect responses."
        action={
          <Badge tone="orange">
            <Flag size={12} /> Findings from the final run
          </Badge>
        }
      />
      <section className="finding-banner">
        <div className="finding-icon">
          <TriangleAlert size={28} />
        </div>
        <div>
          <div className="eyebrow">THE CENTRAL FINDING</div>
          <h2>Perfect intent classification did not guarantee perfect response quality.</h2>
          <p>
            {analytics.correct} of {analytics.cases.length} intents were classified correctly.{' '}
            {analytics.quality.claims} responses still contained unsupported capability claims.
          </p>
        </div>
        <div className="finding-number">
          {percent(analytics.quality.claimPercentage)}
          <span>unsupported claims</span>
        </div>
      </section>
      <div className="metric-grid five-columns failure-metrics">
        {analytics.failures.map((row, i) => (
          <MetricCard
            key={row.name}
            label={row.name}
            value={String(row.count)}
            note={`${percent(row.percentage)} · ${row.count} / ${analytics.quality.count} responses`}
            tone={tones[i]}
            icon={TriangleAlert}
          />
        ))}
      </div>
      <div className="two-column-grid failure-overview">
        <Panel
          title="Failure frequency"
          subtitle="Share of reviewed responses in each failure category"
        >
          <FailureChart />
        </Panel>
        <Panel title="How to read these findings" subtitle="Evidence from existing quality reviews">
          <div className="methodology">
            <div>
              <span className="method-number">01</span>
              <p>
                <strong>Claims and quality scores</strong>Unsupported claims, language scores below
                2, and helpfulness scores below 2 identify the first set of issues.
              </p>
            </div>
            <div>
              <span className="method-number">02</span>
              <p>
                <strong>Rule-detected patterns</strong>Malformed output and availability assumptions
                use the exact reviewer-note keyword rules in the Go analysis.
              </p>
            </div>
            <div>
              <span className="method-number">03</span>
              <p>
                <strong>Patterns can overlap</strong>A single response can appear in multiple
                categories. Counts should not be added together.
              </p>
            </div>
          </div>
        </Panel>
      </div>
      <Panel
        title="Affected Test Cases"
        subtitle="Trace every finding back to its customer message, generated response, and reviewer notes."
        className="table-panel"
      >
        <div className="failure-filters">
          <label className="search-box">
            <Search size={17} />
            <input
              aria-label="Search affected test cases"
              placeholder="Search affected cases or reviewer notes…"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
            />
          </label>
          <label>
            Failure Type
            <select
              value={pattern}
              onChange={(event) => {
                setPattern(event.target.value);
                setPage(1);
              }}
            >
              <option value="">All failure patterns</option>
              {analytics.failures.map((row) => (
                <option key={row.name}>{row.name}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="table-scroll">
          <table className="data-table failure-table">
            <thead>
              <tr>
                <th>Test Case ID</th>
                <th>Customer Input</th>
                <th>Generated Response</th>
                <th>Failure Type</th>
                <th>Reviewer Notes</th>
              </tr>
            </thead>
            <tbody>
              {affected.slice((page - 1) * 8, page * 8).map((row) => (
                <tr key={row.id}>
                  <td>
                    <button className="case-link" onClick={() => setSelected(row)}>
                      {row.id}
                      <ArrowUpRight size={12} />
                    </button>
                  </td>
                  <td className="failure-input">{row.input}</td>
                  <td className="failure-response">
                    {row.evaluation?.actual_response || 'No response available.'}
                  </td>
                  <td>
                    <div className="failure-badges">
                      {row.failures.map((failure) => (
                        <Badge key={failure.name} tone={tones[analytics.failures.indexOf(failure)]}>
                          {failure.shortName}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="notes-cell">
                    {row.review?.notes || (
                      <span className="muted">
                        No reviewer notes recorded. Flag is based on the recorded score or claim
                        field.
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!affected.length && (
            <div className="empty-state">No affected cases match these filters.</div>
          )}
        </div>
        <Pagination page={page} total={affected.length} size={8} onChange={setPage} />
      </Panel>
      <div className="notice">
        <Info size={17} />
        <p>
          Rule-detected categories reproduce the existing report; they are not an exhaustive
          linguistic assessment. Open a case to inspect its full evidence.
        </p>
      </div>
      <CaseDetail record={selected} onClose={() => setSelected(null)} />
    </>
  );
}
