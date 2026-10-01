import { ArrowUpRight, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import type { CaseRecord } from '../../types';
import { Badge, languageTone } from '../common/Badge';
import { classification, titleCase } from '../../utils/analytics';

export function CaseTable({
  rows,
  onSelect,
}: {
  rows: CaseRecord[];
  onSelect: (row: CaseRecord) => void;
}) {
  return (
    <div className="table-scroll">
      <table className="data-table case-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Language</th>
            <th>Customer Input</th>
            <th>Expected Intent</th>
            <th>Difficulty</th>
            <th>Result</th>
            <th>
              <span className="sr-only">Details</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} onClick={() => onSelect(row)} className="clickable-row">
              <td>
                <button
                  className="case-link"
                  onClick={(event) => {
                    event.stopPropagation();
                    onSelect(row);
                  }}
                >
                  {row.id}
                </button>
              </td>
              <td>
                <Badge tone={languageTone(row.category)}>{row.category}</Badge>
              </td>
              <td className="input-cell">
                <span lang={row.category === 'Sinhala' ? 'si' : undefined}>{row.input}</span>
              </td>
              <td>
                <span className="intent-label">{row.expected_intent}</span>
              </td>
              <td>
                <Badge
                  tone={
                    row.difficulty === 'easy'
                      ? 'green'
                      : row.difficulty === 'medium'
                        ? 'orange'
                        : 'red'
                  }
                >
                  {titleCase(row.difficulty)}
                </Badge>
              </td>
              <td>
                <Badge tone={classification(row) === 'Correct' ? 'green' : 'red'}>
                  {classification(row) === 'Correct' && <Check size={12} />}
                  {classification(row)}
                </Badge>
              </td>
              <td>
                <ArrowUpRight size={15} className="muted" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length && (
        <div className="empty-state">
          <strong>No matching test cases</strong>
          <p>Try a different search or clear your filters.</p>
        </div>
      )}
    </div>
  );
}

export function Pagination({
  page,
  total,
  size,
  onChange,
}: {
  page: number;
  total: number;
  size: number;
  onChange: (page: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / size));
  return (
    <div className="pagination">
      <span>
        {total ? `${(page - 1) * size + 1}–${Math.min(page * size, total)}` : '0'} of {total} cases
      </span>
      <div>
        <button
          className="icon-button"
          disabled={page <= 1}
          aria-label="Previous page"
          onClick={() => onChange(page - 1)}
        >
          <ChevronLeft size={17} />
        </button>
        <span>
          Page {page} of {pages}
        </span>
        <button
          className="icon-button"
          disabled={page >= pages}
          aria-label="Next page"
          onClick={() => onChange(page + 1)}
        >
          <ChevronRight size={17} />
        </button>
      </div>
    </div>
  );
}
