import { redmineClient } from './client';
import { RedmineCreds } from '../types';
import { MESSAGES } from '../messages';
import { REDMINE_ENDPOINTS } from '../routes/paths';

export interface RedmineIssueDTO {
  id: number;
  subject: string;
  projectId: number;
  projectName: string;
}

export async function fetchIssue(
  creds: RedmineCreds,
  issueId: number
): Promise<RedmineIssueDTO | undefined> {
  const client = redmineClient(creds);
  const res = await client.get(REDMINE_ENDPOINTS.issue(issueId));
  if (res.status === 404) return undefined;
  if (res.status !== 200) {
    throw new Error(MESSAGES.redmine.issueFailed(issueId, res.status));
  }
  const issue = res.data.issue;
  return {
    id: issue.id,
    subject: issue.subject,
    projectId: issue.project.id,
    projectName: issue.project.name,
  };
}
