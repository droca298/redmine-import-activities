import { redmineClient } from './client';
import { RedmineCreds, RedmineProject } from '../types';
import { MESSAGES } from '../messages';
import { REDMINE_ENDPOINTS } from '../routes/paths';

interface RedmineProjectsResponse {
  projects: { id: number; name: string; identifier: string }[];
  total_count: number;
  offset: number;
  limit: number;
}

export async function fetchAllProjects(creds: RedmineCreds): Promise<RedmineProject[]> {
  const client = redmineClient(creds);
  const limit = 100;
  let offset = 0;
  const all: RedmineProject[] = [];

  while (true) {
    const res = await client.get<RedmineProjectsResponse>(REDMINE_ENDPOINTS.projects, {
      params: { limit, offset },
    });
    if (res.status !== 200) {
      throw new Error(MESSAGES.redmine.projectsFailed(res.status));
    }
    const { projects, total_count } = res.data;
    all.push(...projects.map((p) => ({ id: p.id, name: p.name, identifier: p.identifier })));
    offset += limit;
    if (offset >= total_count || projects.length === 0) break;
  }

  return all;
}
