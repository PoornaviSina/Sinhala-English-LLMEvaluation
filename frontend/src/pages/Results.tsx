import { CheckCheck, CircleCheck, Crosshair, Gauge, Info, Target } from 'lucide-react';
import { analytics } from '../services/data';
import { percent, titleCase } from '../utils/analytics';
import { PageHeading, Panel } from '../components/common/Panel';
import { MetricCard } from '../components/cards/MetricCard';
import { LanguagePerformance } from '../components/charts/EvaluationCharts';
import { Badge } from '../components/common/Badge';

export default function Results() {
  return (
    <>
      <PageHeading
        eyebrow="INTENT CLASSIFICATION"
        title="Classification Results"
        description="Precision, recall, and F1 across the completed evaluation dataset."
        action={
          <Badge tone="green" dot>
            Final run · Complete
          </Badge>
        }
      />
      <div className="metric-grid five-columns">
        <MetricCard
          label="Overall Accuracy"
          value={percent(analytics.accuracy)}
          note={`${analytics.correct} correct predictions`}
          tone="green"
          icon={Target}
        />
        <MetricCard
          label="Macro Precision"
          value={analytics.macroPrecision.toFixed(4)}
          note="Average across 12 intents"
          tone="blue"
          icon={Crosshair}
        />
        <MetricCard
          label="Macro Recall"
          value={analytics.macroRecall.toFixed(4)}
          note="Average across 12 intents"
          tone="blue"
          icon={Gauge}
        />
        <MetricCard
          label="Macro F1"
          value={analytics.macroF1.toFixed(4)}
          note="Balanced precision and recall"
          tone="purple"
          icon={CheckCheck}
        />
        <MetricCard
          label="Evaluation Completion Rate"
          value={percent(analytics.completion)}
          note={`${analytics.completed} / ${analytics.cases.length} cases completed`}
          tone="green"
          icon={CircleCheck}
        />
      </div>
      <div className="notice">
        <Info size={18} />
        <p>
          Performance on the <strong>60-case evaluation dataset</strong>. These results do not
          establish universal model accuracy or guarantee response quality.
        </p>
      </div>
      <Panel
        title="Per-intent metrics"
        subtitle="One classification task, evaluated across all five language categories"
        action={<Badge tone="blue">{analytics.intents.length} intents</Badge>}
        className="table-panel"
      >
        <div className="table-scroll">
          <table className="data-table numeric-table">
            <thead>
              <tr>
                <th>Intent</th>
                <th>TP</th>
                <th>FP</th>
                <th>FN</th>
                <th>Precision</th>
                <th>Recall</th>
                <th>F1 Score</th>
              </tr>
            </thead>
            <tbody>
              {analytics.metrics.map((row) => (
                <tr key={row.intent}>
                  <td>
                    <span className="intent-label">{row.intent}</span>
                  </td>
                  <td>{row.tp}</td>
                  <td className="muted">{row.fp}</td>
                  <td className="muted">{row.fn}</td>
                  <td>{row.precision.toFixed(4)}</td>
                  <td>{row.recall.toFixed(4)}</td>
                  <td>
                    <Badge tone="green">{row.f1.toFixed(4)}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <div className="two-column-grid">
        <Panel title="Performance by language" subtitle="Correct predictions / total cases">
          <LanguagePerformance />
          <div className="group-summary">
            {analytics.languages.map((row) => (
              <div key={row.name}>
                <span>{row.name}</span>
                <strong>
                  {row.correct}/{row.total}
                </strong>
              </div>
            ))}
          </div>
        </Panel>
        <Panel
          title="Performance by difficulty"
          subtitle="Accuracy across the dataset’s three difficulty levels"
        >
          <div className="difficulty-performance">
            {analytics.difficulties.map((row, index) => (
              <div key={row.name}>
                <div>
                  <span>
                    <span className={`difficulty-dot difficulty-${index}`} />
                    {titleCase(row.name)}
                  </span>
                  <strong>
                    {row.correct}/{row.total} <small>correct</small>
                  </strong>
                  <Badge tone="green">{percent(row.accuracy, 0)}</Badge>
                </div>
                <div className="progress-track">
                  <span
                    style={{
                      width: `${row.accuracy}%`,
                      background: ['#49b79d', '#5b8dee', '#9a7be6'][index],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="chart-note">Source: results/evaluation_results_final.json</p>
        </Panel>
      </div>
    </>
  );
}
