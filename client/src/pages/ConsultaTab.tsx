import { useState } from 'react';
import { useCredentials } from '../context/CredentialsContext';
import { queryTimeEntries } from '../api/timeEntriesApi';
import { TimeEntriesTable } from '../components/TimeEntriesTable';
import { ApiError } from '../api/http';
import { TimeEntryDTO } from '../types';
import { MESSAGES } from '../messages';

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function firstOfMonthIso(): string {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

export function ConsultaTab() {
  const { baseUrl, apiKey, hasCredentials } = useCredentials();
  const [from, setFrom] = useState(firstOfMonthIso());
  const [to, setTo] = useState(todayIso());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [entries, setEntries] = useState<TimeEntryDTO[]>([]);
  const [totalHours, setTotalHours] = useState(0);
  const [searched, setSearched] = useState(false);

  async function handleSearch() {
    setError(null);
    setLoading(true);
    try {
      const result = await queryTimeEntries({ baseUrl, apiKey }, from, to);
      setEntries(result.entries);
      setTotalHours(result.totalHours);
      setSearched(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : MESSAGES.consulta.errors.queryFailed);
    } finally {
      setLoading(false);
    }
  }

  if (!hasCredentials) {
    return (
      <div className="panel">
        <p>{MESSAGES.common.missingCredentials}</p>
      </div>
    );
  }

  return (
    <div className="panel">
      <h2>{MESSAGES.consulta.heading}</h2>
      <div className="actions-row">
        <div className="form-field">
          <label htmlFor="from">{MESSAGES.consulta.from}</label>
          <input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="form-field">
          <label htmlFor="to">{MESSAGES.consulta.to}</label>
          <input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <button onClick={handleSearch} disabled={loading}>
          {loading ? MESSAGES.common.searching : MESSAGES.common.search}
        </button>
      </div>

      {error && <p className="status-error">{error}</p>}
      {searched && !error && <TimeEntriesTable entries={entries} totalHours={totalHours} />}
    </div>
  );
}
