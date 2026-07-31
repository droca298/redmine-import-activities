export interface RedmineCreds {
  baseUrl: string;
  apiKey: string;
}

export interface RedmineProject {
  id: number;
  name: string;
  identifier: string;
}

export interface RedmineActivity {
  id: number;
  name: string;
}

export interface FavoriteActivity {
  label: string;
  issueId: number;
  project?: string;
  activity?: string;
}

export interface ImportRow {
  rowIndex: number;
  fecha: string;
  proyecto?: string;
  tareaRaw?: string;
  actividad: string;
  horas: number;
  comentario?: string;
  enviado?: boolean;
}

export interface ValidatedRow extends ImportRow {
  issueId?: number;
  issueSubject?: string;
  projectId?: number;
  activityId: number;
  spentOn: string;
}

export type RowResult =
  | {
      rowIndex: number;
      status: 'success';
      spentOn: string;
      project?: string;
      issueId?: number;
      issueSubject?: string;
      hours: number;
      timeEntryId: number;
    }
  | {
      rowIndex: number;
      status: 'error';
      reason: string;
    }
  | {
      rowIndex: number;
      status: 'skipped';
      reason: string;
    };

export type JobStatus = 'validating' | 'processing' | 'done' | 'failed';

export interface Job {
  id: string;
  status: JobStatus;
  total: number;
  processed: number;
  rows: ValidatedRow[];
  results: RowResult[];
  redmine: RedmineCreds;
  createdAt: number;
}
