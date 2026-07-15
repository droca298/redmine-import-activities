import { apiUploadFile } from './http';
import { API_ROUTES } from './routes';
import { MESSAGES } from '../messages';
import { Credentials, FavoriteActivity, JobStatus, RowResult, TrustedProjectsSettings } from '../types';

export interface UploadResponse {
  jobId: string;
  totalRows: number;
}

export function uploadImportFile(
  creds: Credentials,
  file: File,
  favorites: FavoriteActivity[],
  trustedProjects: TrustedProjectsSettings
) {
  return apiUploadFile<UploadResponse>(API_ROUTES.import.upload, creds, file, {
    favorites: JSON.stringify(favorites),
    trustedProjects: JSON.stringify(trustedProjects),
  });
}

export function importStreamUrl(jobId: string): string {
  return API_ROUTES.import.stream(jobId);
}

export interface JobSummary {
  status: JobStatus;
  processed: number;
  total: number;
  results: RowResult[];
}

export async function getJobSummary(jobId: string): Promise<JobSummary> {
  const res = await fetch(API_ROUTES.import.job(jobId));
  if (!res.ok) throw new Error(MESSAGES.common.httpError(res.status));
  return res.json();
}
