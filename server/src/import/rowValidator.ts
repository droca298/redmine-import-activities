import {
  FavoriteActivity,
  ImportRow,
  RedmineActivity,
  RedmineCreds,
  RedmineProject,
  RowResult,
  ValidatedRow,
} from '../types';
import { normalizeSpentOn } from '../utils/dates';
import { fetchIssue, RedmineIssueDTO } from '../redmine/issues';
import { MESSAGES } from '../messages';

const normalize = (s: string) => s.trim().toLowerCase();

export interface TrustedProjectsSettings {
  enabled: boolean;
  projects: string[];
}

export async function validateRow(
  row: ImportRow,
  projects: RedmineProject[],
  activities: RedmineActivity[],
  favorites: FavoriteActivity[],
  trust: TrustedProjectsSettings | undefined,
  redmine: RedmineCreds,
  issueCache: Map<number, RedmineIssueDTO | undefined>
): Promise<ValidatedRow | RowResult> {
  if (!row.fecha) {
    return { rowIndex: row.rowIndex, status: 'error', reason: MESSAGES.validation.missingDate };
  }
  const spentOn = normalizeSpentOn(row.fecha);
  if (!spentOn) {
    return {
      rowIndex: row.rowIndex,
      status: 'error',
      reason: MESSAGES.validation.unrecognizedDate(row.fecha),
    };
  }

  if (!Number.isFinite(row.horas) || row.horas <= 0) {
    return { rowIndex: row.rowIndex, status: 'error', reason: MESSAGES.validation.invalidHours };
  }

  if (!row.actividad) {
    return { rowIndex: row.rowIndex, status: 'error', reason: MESSAGES.validation.missingActivity };
  }
  const activity = activities.find((a) => normalize(a.name) === normalize(row.actividad));
  if (!activity) {
    return {
      rowIndex: row.rowIndex,
      status: 'error',
      reason: MESSAGES.validation.unrecognizedActivity(row.actividad),
    };
  }

  let issueId: number | undefined;
  if (row.tareaRaw) {
    const favorite = favorites.find((f) => normalize(f.label) === normalize(row.tareaRaw ?? ''));
    if (favorite) {
      issueId = favorite.issueId;
    } else {
      const num = Number(row.tareaRaw);
      if (!Number.isFinite(num)) {
        return {
          rowIndex: row.rowIndex,
          status: 'error',
          reason: MESSAGES.validation.unrecognizedIssue(row.tareaRaw),
        };
      }
      issueId = num;
    }
  }

  let projectId: number | undefined;
  if (!issueId) {
    if (!row.proyecto) {
      return {
        rowIndex: row.rowIndex,
        status: 'error',
        reason: MESSAGES.validation.missingProjectOrIssue,
      };
    }
    const project = projects.find((p) => normalize(p.name) === normalize(row.proyecto ?? ''));
    if (!project) {
      return {
        rowIndex: row.rowIndex,
        status: 'error',
        reason: MESSAGES.validation.unrecognizedProject(row.proyecto),
      };
    }
    projectId = project.id;
  }

  let issue: RedmineIssueDTO | undefined;
  if (issueId) {
    if (!issueCache.has(issueId)) {
      try {
        issueCache.set(issueId, await fetchIssue(redmine, issueId));
      } catch {
        issueCache.set(issueId, undefined);
      }
    }
    issue = issueCache.get(issueId);
  }

  if (trust?.enabled) {
    const normalizedTrusted = trust.projects.map(normalize);
    let actualProject: string | undefined;

    if (issueId) {
      actualProject = issue?.projectName;

      if (!actualProject) {
        return {
          rowIndex: row.rowIndex,
          status: 'error',
          reason: MESSAGES.validation.issueProjectUnverifiable(issueId),
        };
      }
    } else {
      actualProject = row.proyecto;
    }

    if (actualProject && !normalizedTrusted.includes(normalize(actualProject))) {
      return {
        rowIndex: row.rowIndex,
        status: 'error',
        reason: issueId
          ? MESSAGES.validation.issueProjectUntrusted(issueId, actualProject)
          : MESSAGES.validation.projectUntrusted(actualProject),
      };
    }
  }

  return {
    ...row,
    spentOn,
    activityId: activity.id,
    issueId,
    issueSubject: issue?.subject,
    projectId,
  };
}
