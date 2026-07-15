import { apiGetJson, apiPostJson } from './http';
import { API_ROUTES } from './routes';
import { Credentials, RedmineActivity, RedmineIssueInfo, RedmineProject } from '../types';

export function testConnection(creds: Credentials) {
  return apiPostJson<{ ok: true; userName: string }>(API_ROUTES.meta.testConnection, creds);
}

export function getProjects(creds: Credentials) {
  return apiGetJson<{ projects: RedmineProject[] }>(API_ROUTES.meta.projects, creds);
}

export function getActivities(creds: Credentials) {
  return apiGetJson<{ activities: RedmineActivity[] }>(API_ROUTES.meta.activities, creds);
}

export async function getIssue(creds: Credentials, issueId: number): Promise<RedmineIssueInfo> {
  const { issue } = await apiGetJson<{ issue: RedmineIssueInfo }>(
    API_ROUTES.meta.issue(issueId),
    creds
  );
  return issue;
}
