import {
  ArrowUpRight,
  Braces,
  Check,
  FlaskConical,
  Github,
  Globe2,
  Layers3,
  ShieldCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeading, Panel } from '../components/common/Panel';
import { Badge } from '../components/common/Badge';

export default function About() {
  return (
    <>
      <PageHeading
        eyebrow="THE PROJECT"
        title="About the Framework"
        description="A focused study of multilingual understanding, quality, and reliability."
        action={
          <a
            className="button button-primary"
            href="https://github.com/PoornaviSina/Sinhala-English-LLMEvaluation"
            target="_blank"
            rel="noreferrer"
          >
            <Github size={17} /> View on GitHub <ArrowUpRight size={15} />
          </a>
        }
      />
      <section className="about-hero">
        <div className="about-hero-icon">
          <FlaskConical size={34} />
        </div>
        <div>
          <Badge tone="blue">MULTILINGUAL AI EVALUATION</Badge>
          <h2>
            Sinhala-English LLM
            <br />
            Evaluation Framework
          </h2>
          <p>
            Evaluate how an LLM handles multilingual and code-mixed customer-support messages, from
            recognizing intent to generating useful and reliable responses.
          </p>
          <div className="about-stats">
            <div>
              <strong>60</strong>
              <span>Test cases</span>
            </div>
            <div>
              <strong>5</strong>
              <span>Language styles</span>
            </div>
            <div>
              <strong>12</strong>
              <span>Support intents</span>
            </div>
          </div>
        </div>
        <div className="language-art" aria-hidden="true">
          <span>ආයුබෝවන්</span>
          <span>Hello.</span>
          <span>kohomada?</span>
          <small>
            Different expressions.
            <br />
            Shared understanding.
          </small>
        </div>
      </section>
      <div className="two-column-grid">
        <Panel
          title="Input categories"
          subtitle="Five ways customers communicate"
          action={<Globe2 size={20} className="blue-text" />}
        >
          <div className="about-list">
            {['Sinhala', 'English', 'Singlish', 'Sinhala-English Code-Mixed', 'Noisy Input'].map(
              (name, index) => (
                <div key={name}>
                  <span className="list-number">0{index + 1}</span>
                  <strong>{name}</strong>
                </div>
              ),
            )}
          </div>
        </Panel>
        <Panel
          title="Evaluation dimensions"
          subtitle="A broader view of model performance"
          action={<Layers3 size={20} className="purple-text" />}
        >
          <div className="dimension-grid">
            {[
              'Intent Classification',
              'Relevance',
              'Helpfulness',
              'Language Appropriateness',
              'Unsupported Claims',
              'Failure Patterns',
            ].map((name) => (
              <div key={name}>
                <Check size={15} />
                {name}
              </div>
            ))}
          </div>
          <p className="about-copy">
            Response quality is scored using a 0–2 rubric for relevance, helpfulness, and language
            appropriateness. Unsupported claims are tracked separately.
          </p>
        </Panel>
      </div>
      <Panel
        title="Built with"
        subtitle="An existing Go evaluation engine with a separate visualization layer"
        action={<Braces size={20} className="muted" />}
      >
        <div className="technology-list">
          {[
            'Go',
            'Gemini API',
            'React',
            'TypeScript',
            'Vite',
            'Recharts',
            'JSON',
            'Git',
            'GitHub',
          ].map((name) => (
            <span key={name}>{name}</span>
          ))}
        </div>
        <div className="architecture-line">
          <span>React dashboard</span>
          <span className="architecture-arrow">→</span>
          <span>Go evaluation framework</span>
          <span className="architecture-arrow">→</span>
          <span>Gemini API</span>
          <Badge tone="slate">REST connection planned</Badge>
        </div>
      </Panel>
      <div className="two-column-grid">
        <Panel title="Data & reproducibility" subtitle="Every number has a source">
          <div className="source-list">
            <p>
              <code>data/test_cases.json</code>
              <span>Original customer messages and expected intents</span>
            </p>
            <p>
              <code>results/evaluation_results_final.json</code>
              <span>Completed predictions and generated responses</span>
            </p>
            <p>
              <code>results/quality_reviews.json</code>
              <span>Quality scores, unsupported claims, and reviewer notes</span>
            </p>
          </div>
        </Panel>
        <Panel
          title="Scope & limitations"
          subtitle="Research findings in context"
          action={<ShieldCheck size={20} className="green-text" />}
        >
          <p className="about-copy">
            The evaluation covers 60 intentionally designed cases. Its 100% classification accuracy
            applies to this dataset and does not demonstrate universal performance.
          </p>
          <p className="about-copy">
            The assistant had no order, payment, or inventory backend during the experiment. Human
            judgments and rule-based note matching inform the quality and failure findings.
          </p>
          <Link className="text-link" to="/failure-analysis">
            See what classification metrics miss <ArrowUpRight size={14} />
          </Link>
        </Panel>
      </div>
    </>
  );
}
