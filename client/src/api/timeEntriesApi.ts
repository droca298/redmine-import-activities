import { apiGetJson } from './http';
import { API_ROUTES } from './routes';
import { Credentials, TimeEntryDTO } from '../types';

export function queryTimeEntries(creds: Credentials, from: string, to: string) {
  return apiGetJson<{ entries: TimeEntryDTO[]; totalHours: number }>(
    API_ROUTES.timeEntries.list(from, to),
    creds
  );
}
