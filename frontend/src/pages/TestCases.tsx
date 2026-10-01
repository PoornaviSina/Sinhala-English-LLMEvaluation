import { useState } from 'react';
import { ListFilter, RotateCcw, Search } from 'lucide-react';
import { analytics } from '../services/data';
import {
  difficultyOrder,
  emptyFilters,
  filterCases,
  languageOrder,
  titleCase,
} from '../utils/analytics';
import type { CaseFilters } from '../utils/analytics';
import type { CaseRecord } from '../types';
import { PageHeading, Panel } from '../components/common/Panel';
import { Badge } from '../components/common/Badge';
import { CaseTable, Pagination } from '../components/tables/CaseTable';
import { CaseDetail } from '../components/common/CaseDetail';

export default function TestCases() {
  const [filters, setFilters] = useState<CaseFilters>(emptyFilters);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<CaseRecord | null>(null);
  const rows = filterCases(analytics.cases, filters);
  function update(key: keyof CaseFilters, value: string) {
    setFilters((previous) => ({ ...previous, [key]: value }));
    setPage(1);
  }
  const active = Object.values(filters).some(Boolean);
  return (
    <>
      <PageHeading
        eyebrow="DATASET EXPLORER"
        title="Test Cases"
        description="Explore the original messages, model responses, and individual quality reviews."
        action={<Badge tone="blue">{analytics.cases.length} original test cases</Badge>}
      />
      <Panel
        title="Explore the evaluation dataset"
        subtitle="Select a test case to inspect its complete evaluation."
        action={<ListFilter size={19} className="muted" />}
      >
        <div className="filter-bar">
          <label className="search-box">
            <Search size={17} />
            <input
              aria-label="Search test cases"
              placeholder="Search by ID, customer input, or intent…"
              value={filters.search}
              onChange={(event) => update('search', event.target.value)}
            />
          </label>
          <div className="filter-selects">
            <label>
              Language
              <select
                value={filters.language}
                onChange={(event) => update('language', event.target.value)}
              >
                <option value="">All languages</option>
                {languageOrder.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </label>
            <label>
              Intent
              <select
                value={filters.intent}
                onChange={(event) => update('intent', event.target.value)}
              >
                <option value="">All intents</option>
                {analytics.intents.map((value) => (
                  <option key={value} value={value}>
                    {titleCase(value)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Difficulty
              <select
                value={filters.difficulty}
                onChange={(event) => update('difficulty', event.target.value)}
              >
                <option value="">All difficulties</option>
                {difficultyOrder.map((value) => (
                  <option key={value} value={value}>
                    {titleCase(value)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Result
              <select
                value={filters.result}
                onChange={(event) => update('result', event.target.value)}
              >
                <option value="">All results</option>
                {['Correct', 'Incorrect'].map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </label>
            <button
              className="button button-quiet reset-button"
              disabled={!active}
              onClick={() => {
                setFilters(emptyFilters);
                setPage(1);
              }}
            >
              <RotateCcw size={14} /> Reset
            </button>
          </div>
        </div>
        <div className="results-count" role="status">
          {rows.length} matching test cases <span>Source: data/test_cases.json</span>
        </div>
        <CaseTable rows={rows.slice((page - 1) * 10, page * 10)} onSelect={setSelected} />
        <Pagination page={page} total={rows.length} size={10} onChange={setPage} />
      </Panel>
      <CaseDetail record={selected} onClose={() => setSelected(null)} />
    </>
  );
}
