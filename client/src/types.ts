export interface RedmineProject {
  id: number;
  name: string;
  identifier: string;
}

export interface RedmineActivity {
  id: number;
  name: string;
}

export type RowResult =
  | {
      rowIndex: number;
      status: 'success';
      spentOn: string;
      project?: string;
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

export interface TimeEntryDTO {
  id: number;
  spentOn: string;
  project?: string;
  issueId?: number;
  activity: string;
  hours: number;
  comments: string;
}

export interface Credentials {
  baseUrl: string;
  apiKey: string;
}

export interface FavoriteActivity {
  id: string;
  label: string;
  issueId: number;
  project: string;
  activity: string;
}

export interface RedmineIssueInfo {
  id: number;
  subject: string;
  projectId: number;
  projectName: string;
}

export interface TrustedProjectsSettings {
  enabled: boolean;
  projects: string[];
}
