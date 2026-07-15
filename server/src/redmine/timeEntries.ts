import { redmineClient, extractRedmineErrorMessage } from './client';
import { RedmineCreds, ValidatedRow } from '../types';
import { REDMINE_ENDPOINTS } from '../routes/paths';

interface CreateTimeEntryResult {
  ok: true;
  id: number;
}

interface CreateTimeEntryError {
  ok: false;
  reason: string;
}

export async function createTimeEntry(
  creds: RedmineCreds,
  row: ValidatedRow
): Promise<CreateTimeEntryResult | CreateTimeEntryError> {
  const client = redmineClient(creds);

  const time_entry: Record<string, unknown> = {
    spent_on: row.spentOn,
    hours: row.horas,
    activity_id: row.activityId,
    comments: row.comentario ?? '',
  };

  if (row.issueId) {
    time_entry.issue_id = row.issueId;
  } else {
    time_entry.project_id = row.projectId;
  }

  const res = await client.post(REDMINE_ENDPOINTS.timeEntries, { time_entry });

  if (res.status === 201) {
    return { ok: true, id: res.data?.time_entry?.id };
  }
  return { ok: false, reason: extractRedmineErrorMessage(res.status, res.data) };
}

export interface RedmineTimeEntryDTO {
  id: number;
  spentOn: string;
  project?: string;
  issueId?: number;
  activity: string;
  hours: number;
  comments: string;
}

export async function listTimeEntries(
  creds: RedmineCreds,
  from: string,
  to: string
): Promise<{ entries: RedmineTimeEntryDTO[]; totalHours: number }> {
  const client = redmineClient(creds);

  const entries: RedmineTimeEntryDTO[] = [];
  const limit = 100;
  let offset = 0;
  let totalCount = Infinity;

  while (offset < totalCount) {
    const res = await client.get(REDMINE_ENDPOINTS.timeEntries, {
      params: {
        user_id: 'me',
        spent_on: `><${from}|${to}`,
        limit,
        offset,
      },
    });

    if (res.status !== 200) {
      throw new Error(extractRedmineErrorMessage(res.status, res.data));
    }

    totalCount = res.data.total_count ?? 0;
    const pageEntries = res.data.time_entries ?? [];

    for (const e of pageEntries) {
      entries.push({
        id: e.id,
        spentOn: e.spent_on,
        project: e.project?.name,
        issueId: e.issue?.id,
        activity: e.activity?.name ?? '',
        hours: e.hours,
        comments: e.comments ?? '',
      });
    }

    offset += limit;
    if (pageEntries.length === 0) break;
  }

  const totalHours = entries.reduce((sum, e) => sum + e.hours, 0);
  return { entries, totalHours };
}
