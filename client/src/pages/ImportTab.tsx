import { useRef, useState } from 'react';
import { useCredentials } from '../context/CredentialsContext';
import { useFavorites } from '../context/FavoritesContext';
import { useTrustedProjects } from '../context/TrustedProjectsContext';
import { downloadTemplate } from '../api/templateApi';
import { uploadImportFile } from '../api/importApi';
import { useImportStream } from '../hooks/useImportStream';
import { ProgressBar } from '../components/ProgressBar';
import { ImportResultsTable } from '../components/ImportResultsTable';
import { ApiError } from '../api/http';
import { MESSAGES } from '../messages';

export function ImportTab() {
  const { baseUrl, apiKey, hasCredentials } = useCredentials();
  const { favorites } = useFavorites();
  const { enabled: trustEnabled, projects: trustedProjectsList } = useTrustedProjects();
  const [downloading, setDownloading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stream = useImportStream();

  async function handleDownloadTemplate() {
    setError(null);
    setDownloading(true);
    try {
      await downloadTemplate({ baseUrl, apiKey }, favorites);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : MESSAGES.import.errors.downloadFailed);
    } finally {
      setDownloading(false);
    }
  }

  async function handleImport() {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setError(MESSAGES.import.errors.noFileSelected);
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const { jobId, totalRows } = await uploadImportFile({ baseUrl, apiKey }, file, favorites, {
        enabled: trustEnabled,
        projects: trustedProjectsList,
      });
      stream.start(jobId, totalRows);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : MESSAGES.import.errors.uploadFailed);
    } finally {
      setUploading(false);
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
      <h2>{MESSAGES.import.heading}</h2>

      <div className="actions-row">
        <button onClick={handleDownloadTemplate} disabled={downloading}>
          {downloading ? MESSAGES.import.downloading : MESSAGES.import.downloadTemplate}
        </button>
      </div>

      <div className="actions-row">
        <input ref={fileInputRef} type="file" accept=".xlsx" />
        <button onClick={handleImport} disabled={uploading || stream.status === 'running'}>
          {uploading ? MESSAGES.import.uploading : MESSAGES.import.submit}
        </button>
      </div>

      {error && <p className="status-error">{error}</p>}

      {stream.status !== 'idle' && <ProgressBar processed={stream.processed} total={stream.total} />}

      {stream.status === 'error' && (
        <p className="status-error">{MESSAGES.import.errors.streamLost}</p>
      )}
      {stream.status === 'done' && (
        <p className="status-ok">
          {MESSAGES.import.finished}
          {stream.skipped > 0 && MESSAGES.import.skippedSummary(stream.skipped)}
        </p>
      )}

      <ImportResultsTable results={stream.results} />
    </div>
  );
}
