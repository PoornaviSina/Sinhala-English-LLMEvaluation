import { useState } from 'react';
import { HeartHandshake, Languages, Search, ShieldAlert, Sparkles, Target } from 'lucide-react';
import { analytics, dataset } from '../services/data';
import type { CaseRecord } from '../types';
import { percent } from '../utils/analytics';
import { PageHeading, Panel } from '../components/common/Panel';
import { MetricCard } from '../components/cards/MetricCard';
import { LanguageQualityChart } from '../components/charts/EvaluationCharts';
import { Badge, languageTone } from '../components/common/Badge';
import { Pagination } from '../components/tables/CaseTable';
import { CaseDetail } from '../components/common/CaseDetail';

export default function ResponseQuality() {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<CaseRecord | null>(null);
  const quality = analytics.quality;
  const reviews = dataset.reviews.filter((row) =>
    [row.id, row.category, row.notes, row.input].some((value) =>
      value.toLowerCase().includes(query.trim().toLowerCase()),
    ),
  );
  return (
    <>
      <PageHeading
        eyebrow="BEYOND CLASSIFICATION"
        title="Response Quality"
        description="Measure how relevant, helpful, and linguistically appropriate each response is."
        action={<Badge tone="purple">{quality.count} reviewed responses</Badge>}
      />
      <div className="metric-grid five-columns">
        <MetricCard
          label="Relevance"
          value={percent(quality.relevance * 50)}
          note={`${quality.relevance.toFixed(2)} / 2 average score`}
          tone="green"
          icon={Target}
        />
        <MetricCard
          label="Helpfulness"
          value={percent(quality.helpfulness * 50)}
          note={`${quality.helpfulness.toFixed(2)} / 2 average score`}
          tone="blue"
          icon={HeartHandshake}
        />
        <MetricCard
          label="Language Quality"
          value={percent(quality.language * 50)}
          note={`${quality.language.toFixed(2)} / 2 average score`}
          tone="purple"
          icon={Languages}
        />
        <MetricCard
          label="Overall Quality"
          value={percent(quality.overall)}
          note="Combined score out of 6"
          tone="purple"
          icon={Sparkles}
        />
        <MetricCard
          label="Unsupported Claims"
          value={`${quality.claims} / ${quality.claimReviewed}`}
          note={`${percent(quality.claimPercentage)} of reviewed responses`}
          tone="orange"
          icon={ShieldAlert}
        />
      </div>
      <div className="two-column-grid quality-comparison">
        <Panel
          title="Quality by language"
          subtitle="Average rubric scores · 0 = lowest, 2 = highest"
        >
          <LanguageQualityChart />
        </Panel>
        <Panel
          title="Language breakdown"
          subtitle="Exact means and overall quality from the reviews"
        >
          <div className="table-scroll">
            <table className="data-table compact-table numeric-table">
              <thead>
                <tr>
                  <th>Language</th>
                  <th>Relevance</th>
                  <th>Helpful.</th>
                  <th>Language</th>
                  <th>Overall</th>
                  <th>Claims</th>
                </tr>
              </thead>
              <tbody>
                {analytics.qualityByLanguage.map((row) => (
                  <tr key={row.name}>
                    <td>
                      <Badge tone={languageTone(row.name)}>{row.name}</Badge>
                    </td>
                    <td>{row.relevance.toFixed(2)}</td>
                    <td>{row.helpfulness.toFixed(2)}</td>
                    <td>{row.language.toFixed(2)}</td>
                    <td className="purple-text">{percent(row.overall)}</td>
                    <td>
                      {row.claims}/{row.claimReviewed}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="chart-note">
            Unsupported claims are measured separately and are not deducted from the overall quality
            score.
          </p>
        </Panel>
      </div>
      <Panel
        title="Quality reviews"
        subtitle="Original scores and reviewer notes. Select an ID for the full input and response."
        action={<Badge tone="slate">0–2 scoring rubric</Badge>}
        className="table-panel"
      >
        <div className="table-search">
          <label className="search-box">
            <Search size={17} />
            <input
              aria-label="Search quality reviews"
              placeholder="Search IDs, languages, messages, or notes…"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
            />
          </label>
        </div>
        <div className="table-scroll">
          <table className="data-table review-table">
            <thead>
              <tr>
                <th>Test Case</th>
                <th>Language</th>
                <th>Relevance</th>
                <th>Helpfulness</th>
                <th>Language Score</th>
                <th>Unsupported Claim</th>
                <th>Reviewer Notes</th>
              </tr>
            </thead>
            <tbody>
              {reviews.slice((page - 1) * 10, page * 10).map((row) => (
                <tr key={row.id}>
                  <td>
                    <button
                      className="case-link"
                      onClick={() =>
                        setSelected(analytics.cases.find((item) => item.id === row.id) ?? null)
                      }
                    >
                      {row.id}
                    </button>
                  </td>
                  <td>
                    <Badge tone={languageTone(row.category)}>{row.category}</Badge>
                  </td>
                  <td>{row.relevance_score ?? '—'} / 2</td>
                  <td>{row.helpfulness_score ?? '—'} / 2</td>
                  <td>
                    <Badge tone={row.language_score === 2 ? 'green' : 'orange'}>
                      {row.language_score ?? '—'} / 2
                    </Badge>
                  </td>
                  <td>
                    <Badge tone={row.unsupported_claim ? 'red' : 'green'}>
                      {row.unsupported_claim === null
                        ? 'Not reviewed'
                        : row.unsupported_claim
                          ? 'Flagged'
                          : 'Not flagged'}
                    </Badge>
                  </td>
                  <td className="notes-cell">
                    {row.notes || <span className="muted">No reviewer notes recorded.</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!reviews.length && <div className="empty-state">No matching quality reviews.</div>}
        </div>
        <Pagination page={page} total={reviews.length} size={10} onChange={setPage} />
      </Panel>
      <CaseDetail record={selected} onClose={() => setSelected(null)} />
    </>
  );
}
