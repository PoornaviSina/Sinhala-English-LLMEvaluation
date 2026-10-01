import type { LucideIcon } from 'lucide-react';
import type { DashboardMetric } from '../../types';

export function MetricCard({
  label,
  value,
  note,
  tone,
  icon: Icon,
}: DashboardMetric & { icon: LucideIcon }) {
  return (
    <article className={`metric-card metric-${tone}`}>
      <div className="metric-top">
        <span>{label}</span>
        <span className={`icon-tile ${tone}`}>
          <Icon size={17} strokeWidth={1.8} />
        </span>
      </div>
      <div className="metric-value">{value}</div>
      <p>{note}</p>
    </article>
  );
}
