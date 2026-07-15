import { redmineClient } from './client';
import { RedmineActivity, RedmineCreds } from '../types';
import { MESSAGES } from '../messages';
import { REDMINE_ENDPOINTS } from '../routes/paths';

interface RedmineActivitiesResponse {
  time_entry_activities: { id: number; name: string }[];
}

export async function fetchActivities(creds: RedmineCreds): Promise<RedmineActivity[]> {
  const client = redmineClient(creds);
  const res = await client.get<RedmineActivitiesResponse>(REDMINE_ENDPOINTS.activities);
  if (res.status !== 200) {
    throw new Error(MESSAGES.redmine.activitiesFailed(res.status));
  }
  return res.data.time_entry_activities.map((a) => ({ id: a.id, name: a.name }));
}
