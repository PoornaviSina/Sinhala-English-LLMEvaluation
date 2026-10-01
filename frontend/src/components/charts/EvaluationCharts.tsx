import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  LabelList,
  Legend,
} from 'recharts';
import { analytics } from '../../services/data';
import { percent, titleCase } from '../../utils/analytics';

const palette = ['#426feb', '#8b72dd', '#48bda5', '#f3b85b', '#8cabc9'];
const tooltipStyle = {
  border: '1px solid #e7eaf1',
  borderRadius: 10,
  boxShadow: '0 8px 28px #1c2c4410',
  fontSize: 12,
};
const axisStyle = { fontSize: 11, fill: '#7c879b' };

export function LanguagePerformance() {
  return (
    <div
      className="chart chart-language"
      role="img"
      aria-label={analytics.languages
        .map(
          (row) => `${row.name}: ${percent(row.accuracy)}, ${row.correct} of ${row.total} correct`,
        )
        .join('; ')}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={analytics.languages}
          margin={{ top: 26, right: 5, left: -27, bottom: 0 }}
          barSize={38}
        >
          <CartesianGrid strokeDasharray="3 4" vertical={false} stroke="#e9edf5" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={axisStyle} dy={9} />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            axisLine={false}
            tickLine={false}
            tick={axisStyle}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip
            cursor={{ fill: '#f4f7fd' }}
            contentStyle={tooltipStyle}
            formatter={(value) => [`${value}%`, 'Accuracy']}
          />
          <Bar dataKey="accuracy" radius={[5, 5, 0, 0]} isAnimationActive={false}>
            {analytics.languages.map((row, i) => (
              <Cell
                key={row.name}
                fill={i === 0 ? '#366bed' : ['#5987ee', '#789df2', '#92b0f6', '#b0c6f8'][i - 1]}
              />
            ))}
            <LabelList
              dataKey="accuracy"
              position="top"
              formatter={(value) => `${value}%`}
              fill="#4c5f7b"
              fontSize={11}
              offset={9}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function QualityProgress() {
  const quality = analytics.quality;
  const rows = [
    { label: 'Relevance', value: quality.relevance * 50, color: '#40b59a' },
    { label: 'Helpfulness', value: quality.helpfulness * 50, color: '#5a8cef' },
    { label: 'Language Quality', value: quality.language * 50, color: '#9a7be6' },
    { label: 'Overall Quality', value: quality.overall, color: '#7455cb' },
  ];
  return (
    <div className="quality-progress">
      {rows.map((row) => (
        <div className="progress-row" key={row.label}>
          <div>
            <span>{row.label}</span>
            <strong>{percent(row.value)}</strong>
          </div>
          <div
            className="progress-track"
            role="progressbar"
            aria-label={row.label}
            aria-valuenow={row.value}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <span style={{ width: `${row.value}%`, background: row.color }} />
          </div>
        </div>
      ))}
      <p className="chart-note">Rubric-based review · 0–2 points per dimension</p>
    </div>
  );
}

export function DistributionChart({ kind }: { kind: 'language' | 'difficulty' }) {
  const rows = (kind === 'language' ? analytics.languages : analytics.difficulties).map((row) => ({
    ...row,
    name: titleCase(row.name),
  }));
  return (
    <div className="distribution">
      <h3>By {kind}</h3>
      <div
        className="donut-wrap"
        role="img"
        aria-label={rows.map((row) => `${row.name}: ${row.value} test cases`).join('; ')}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={rows}
              dataKey="value"
              nameKey="name"
              innerRadius={48}
              outerRadius={65}
              paddingAngle={3}
              stroke="none"
              isAnimationActive={false}
            >
              {rows.map((row, index) => (
                <Cell key={row.name} fill={palette[index]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} formatter={(value) => [value, 'Test cases']} />
          </PieChart>
        </ResponsiveContainer>
        <div className="donut-center">
          <strong>{analytics.cases.length}</strong>
          <span>test cases</span>
        </div>
      </div>
      <div className="donut-legend">
        {rows.map((row, index) => (
          <div key={row.name}>
            <span className="legend-dot" style={{ background: palette[index] }} />
            <span>{row.name}</span>
            <strong>{row.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FailureChart() {
  return (
    <div
      className="failure-chart"
      role="img"
      aria-label={analytics.failures
        .map(
          (row) =>
            `${row.name}: ${row.count} of ${analytics.quality.count}, ${percent(row.percentage)}`,
        )
        .join('; ')}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={analytics.failures}
          margin={{ top: 2, left: 0, right: 45, bottom: 0 }}
          barSize={15}
        >
          <CartesianGrid strokeDasharray="3 4" horizontal={false} stroke="#edf0f5" />
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={axisStyle}
            ticks={[0, 25, 50, 75, 100]}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => `${value}%`}
          />
          <YAxis
            type="category"
            dataKey="shortName"
            width={155}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#647087' }}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value, _name, item) => [
              `${item.payload.count} / ${analytics.quality.count} responses (${Number(value).toFixed(2)}%)`,
              'Frequency',
            ]}
          />
          <Bar dataKey="percentage" radius={[0, 4, 4, 0]} isAnimationActive={false}>
            {analytics.failures.map((row) => (
              <Cell key={row.name} fill={row.color} />
            ))}
            <LabelList
              dataKey="percentage"
              position="right"
              fontSize={10}
              fill="#66758d"
              formatter={(value) => `${Number(value).toFixed(2)}%`}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function LanguageQualityChart() {
  return (
    <div
      className="chart quality-language-chart"
      role="img"
      aria-label="Response quality by language, with each dimension scored from zero to two. Exact values are in the table below."
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={analytics.qualityByLanguage}
          margin={{ top: 12, right: 10, left: -25, bottom: 8 }}
          barGap={5}
        >
          <CartesianGrid strokeDasharray="3 4" vertical={false} stroke="#e9edf5" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={axisStyle} />
          <YAxis
            domain={[0, 2]}
            ticks={[0, 0.5, 1, 1.5, 2]}
            axisLine={false}
            tickLine={false}
            tick={axisStyle}
          />
          <Tooltip contentStyle={tooltipStyle} formatter={(value) => Number(value).toFixed(2)} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 16 }} />
          <Bar
            dataKey="relevance"
            name="Relevance"
            fill="#48bda5"
            radius={[4, 4, 0, 0]}
            maxBarSize={30}
            isAnimationActive={false}
          />
          <Bar
            dataKey="helpfulness"
            name="Helpfulness"
            fill="#5a8cef"
            radius={[4, 4, 0, 0]}
            maxBarSize={30}
            isAnimationActive={false}
          />
          <Bar
            dataKey="language"
            name="Language quality"
            fill="#9a7be6"
            radius={[4, 4, 0, 0]}
            maxBarSize={30}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
