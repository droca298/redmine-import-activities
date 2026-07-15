import { RowResult } from '../types';
import { MESSAGES } from '../messages';

export function ImportResultsTable({ results }: { results: RowResult[] }) {
  if (results.length === 0) return null;

  const sorted = [...results].sort((a, b) => a.rowIndex - b.rowIndex);

  return (
    <table className="results-table">
      <thead>
        <tr>
          <th>{MESSAGES.results.columns.row}</th>
          <th>{MESSAGES.results.columns.status}</th>
          <th>{MESSAGES.results.columns.detail}</th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((r) => (
          <tr
            key={r.rowIndex}
            className={
              r.status === 'success' ? 'row-success' : r.status === 'skipped' ? 'row-skipped' : 'row-error'
            }
          >
            <td>{r.rowIndex}</td>
            <td>
              {r.status === 'success'
                ? MESSAGES.results.status.success
                : r.status === 'skipped'
                  ? MESSAGES.results.status.skipped
                  : MESSAGES.results.status.error}
            </td>
            <td>
              {r.status === 'success'
                ? MESSAGES.results.successDetail(
                    r.spentOn,
                    r.project ?? MESSAGES.results.issueFallback,
                    r.hours,
                    r.timeEntryId
                  )
                : r.reason}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
