import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  CheckCheck,
  ClipboardList,
  Database,
  Flag,
  Languages,
  Layers3,
  ShieldAlert,
  Sparkles,
  Target,
} from 'lucide-react';
import { analytics } from '../services/data';
import { percent } from '../utils/analytics';
import type { CaseRecord } from '../types';
import { PageHeading, Panel } from '../components/common/Panel';
import { Badge } from '../components/common/Badge';
import { MetricCard } from '../components/cards/MetricCard';
import {
  DistributionChart,
  FailureChart,
  LanguagePerformance,
  QualityProgress,
} from '../components/charts/EvaluationCharts';
import { CaseTable } from '../components/tables/CaseTable';
import { CaseDetail } from '../components/common/CaseDetail';

export default function Dashboard() {
  const [selected, setSelected] = useState<CaseRecord | null>(null);
  const { quality } = analytics;
  return (
    <>
      <PageHeading
        eyebrow="EVALUATION OVERVIEW"
        title="Dashboard"
        description="A closer look at multilingual understanding and response quality."
        action={
          <Link className="button button-primary" to="/evaluate">
            <PlayIcon /> Evaluate a Message <ArrowUpRight size={15} />
          </Link>
        }
      />
      <div className="dataset-banner">
        <div className="banner-icon">
          <Database size={21} />
        </div>
        <div>
          <strong>One model. Five language styles. A more complete picture.</strong>
          <p>
            Explore the completed evaluation across {analytics.cases.length} test cases and{' '}
            {analytics.intents.length} customer-support intents.
          </p>
        </div>
        <Badge tone="green" dot>
          Evaluation complete
        </Badge>
      </div>
      <div className="metric-grid dashboard-metrics">
        <MetricCard
          label="Test Cases"
          value={String(analytics.cases.length)}
          note="Across 5 language categories"
          tone="blue"
          icon={ClipboardList}
        />
        <MetricCard
          label="Intents"
          value={String(analytics.intents.length)}
          note="Customer-support categories"
          tone="blue"
          icon={Layers3}
        />
        <MetricCard
          label="Classification Accuracy"
          value={percent(analytics.accuracy, 0)}
          note="Performance on the 60-case evaluation dataset"
          tone="green"
          icon={Target}
        />
        <MetricCard
          label="Overall Response Quality"
          value={percent(quality.overall)}
          note="Combined rubric-based score"
          tone="purple"
          icon={Sparkles}
        />
        <MetricCard
          label="Language Quality"
          value={percent(quality.language * 50)}
          note="Language appropriateness"
          tone="purple"
          icon={Languages}
        />
        <MetricCard
          label="Unsupported Claims"
          value={percent(quality.claimPercentage)}
          note={`${quality.claims} / ${quality.claimReviewed} responses`}
          tone="orange"
          icon={ShieldAlert}
        />
      </div>
      <div className="dashboard-top-grid">
        <Panel
          title="Classification by language"
          subtitle="Intent accuracy on the evaluation dataset"
          action={
            <Badge tone="green">
              <CheckCheck size={12} /> {analytics.correct}/{analytics.cases.length} correct
            </Badge>
          }
        >
          <LanguagePerformance />
        </Panel>
        <Panel
          title="Response quality"
          subtitle="Beyond getting the intent right"
          action={
            <span className="icon-tile purple">
              <Sparkles size={16} />
            </span>
          }
        >
          <QualityProgress />
        </Panel>
        <Panel title="Test case distribution" subtitle="A balanced multilingual dataset">
          <div className="distribution-grid">
            <DistributionChart kind="language" />
            <DistributionChart kind="difficulty" />
          </div>
        </Panel>
      </div>
      <div className="dashboard-bottom-grid">
        <Panel
          title="Failure patterns"
          subtitle="Frequency across 60 reviewed responses; patterns may overlap"
          action={
            <Link className="text-link" to="/failure-analysis">
              Full analysis <ArrowUpRight size={14} />
            </Link>
          }
        >
          <FailureChart />
        </Panel>
        <section className="insight-card">
          <div className="insight-kicker">
            <span className="icon-tile orange">
              <Flag size={18} />
            </span>{' '}
            THE KEY FINDING
          </div>
          <h2>
            Correct intent.
            <br /> Imperfect response.
          </h2>
          <p>Perfect intent classification did not guarantee perfect response quality.</p>
          <div className="insight-stat">
            <strong>
              {quality.claims}
              <span> / {quality.count}</span>
            </strong>
            <span>
              responses contained
              <br />
              unsupported capability claims
            </span>
          </div>
          <Link to="/failure-analysis">
            Explore failure analysis <ArrowRight size={16} />
          </Link>
        </section>
      </div>
      <Panel
        title="Sample test cases"
        subtitle="The first five cases from the original evaluation dataset"
        action={
          <Link className="text-link" to="/test-cases">
            View All Test Cases <ArrowRight size={14} />
          </Link>
        }
        className="table-panel"
      >
        <CaseTable rows={analytics.cases.slice(0, 5)} onSelect={setSelected} />
        <div className="table-footnote">
          Showing 5 of {analytics.cases.length} test cases{' '}
          <span>
            <span className="status-dot" /> Final evaluation results
          </span>
        </div>
      </Panel>
      <CaseDetail record={selected} onClose={() => setSelected(null)} />
    </>
  );
}

function PlayIcon() {
  return <span className="play-triangle" aria-hidden="true" />;
}
