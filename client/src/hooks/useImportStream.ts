import { useCallback, useRef, useState } from 'react';
import { importStreamUrl } from '../api/importApi';
import { RowResult } from '../types';

interface ImportStreamState {
  processed: number;
  total: number;
  results: RowResult[];
  status: 'idle' | 'running' | 'done' | 'error';
  skipped: number;
}

const initialState: ImportStreamState = {
  processed: 0,
  total: 0,
  results: [],
  status: 'idle',
  skipped: 0,
};

export function useImportStream() {
  const [state, setState] = useState<ImportStreamState>(initialState);
  const sourceRef = useRef<EventSource | null>(null);

  const start = useCallback((jobId: string, totalRows: number) => {
    sourceRef.current?.close();
    setState({ processed: 0, total: totalRows, results: [], status: 'running', skipped: 0 });

    const source = new EventSource(importStreamUrl(jobId));
    sourceRef.current = source;

    source.addEventListener('progress', (event) => {
      const data = JSON.parse((event as MessageEvent).data);
      setState((prev) => ({ ...prev, processed: data.processed, total: data.total }));
    });

    source.addEventListener('row-result', (event) => {
      const data: RowResult = JSON.parse((event as MessageEvent).data);
      setState((prev) => ({ ...prev, results: [...prev.results, data] }));
    });

    source.addEventListener('done', (event) => {
      const data = JSON.parse((event as MessageEvent).data);
      setState((prev) => ({ ...prev, status: 'done', skipped: data.skipped ?? 0 }));
      source.close();
    });

    source.onerror = () => {
      setState((prev) => (prev.status === 'done' ? prev : { ...prev, status: 'error' }));
      source.close();
    };
  }, []);

  const reset = useCallback(() => {
    sourceRef.current?.close();
    setState(initialState);
  }, []);

  return { ...state, start, reset };
}
