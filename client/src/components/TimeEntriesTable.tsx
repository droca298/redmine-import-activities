import { TimeEntryDTO } from '../types';
import { MESSAGES } from '../messages';

export function TimeEntriesTable({
  entries,
  totalHours,
}: {
  entries: TimeEntryDTO[];
  totalHours: number;
}) {
  if (entries.length === 0) return <p>{MESSAGES.consulta.table.empty}</p>;

  const columns = MESSAGES.consulta.table.columns;

  return (
    <table className="results-table">
      <thead>
        <tr>
          <th>{columns.date}</th>
          <th>{columns.project}</th>
          <th>{columns.issue}</th>
          <th>{columns.activity}</th>
          <th>{columns.hours}</th>
          <th>{columns.comment}</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((e) => (
          <tr key={e.id}>
            <td>{e.spentOn}</td>
            <td>{e.project ?? MESSAGES.common.empty}</td>
            <td>{e.issueId ?? MESSAGES.common.empty}</td>
            <td>{e.activity}</td>
            <td>{e.hours}</td>
            <td>{e.comments}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td colSpan={4}>{MESSAGES.consulta.table.total}</td>
          <td colSpan={2}>{MESSAGES.consulta.table.totalHours(totalHours)}</td>
        </tr>
      </tfoot>
    </table>
  );
}
