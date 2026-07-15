import { Router } from 'express';
import { redmineCreds } from '../middleware/redmineCreds';
import { redmineClient, extractRedmineErrorMessage } from '../redmine/client';
import { fetchAllProjects } from '../redmine/projects';
import { fetchActivities } from '../redmine/activities';
import { fetchIssue } from '../redmine/issues';
import { MESSAGES } from '../messages';
import { META_PATHS, REDMINE_ENDPOINTS } from './paths';

export const metaRouter = Router();

metaRouter.post(META_PATHS.testConnection, redmineCreds, async (req, res, next) => {
  try {
    const client = redmineClient(req.redmine!);
    const response = await client.get(REDMINE_ENDPOINTS.currentUser);
    if (response.status !== 200) {
      res.status(response.status === 401 ? 401 : 502).json({
        ok: false,
        message: extractRedmineErrorMessage(response.status, response.data),
      });
      return;
    }
    const user = response.data.user;
    res.json({ ok: true, userName: `${user.firstname} ${user.lastname}` });
  } catch (err) {
    next(err);
  }
});

metaRouter.get(META_PATHS.projects, redmineCreds, async (req, res, next) => {
  try {
    const projects = await fetchAllProjects(req.redmine!);
    res.json({ projects });
  } catch (err) {
    next(err);
  }
});

metaRouter.get(META_PATHS.activities, redmineCreds, async (req, res, next) => {
  try {
    const activities = await fetchActivities(req.redmine!);
    res.json({ activities });
  } catch (err) {
    next(err);
  }
});

metaRouter.get(META_PATHS.issue, redmineCreds, async (req, res, next) => {
  try {
    const issueId = Number(req.params.id);
    if (!Number.isFinite(issueId)) {
      res.status(400).json({ ok: false, message: MESSAGES.meta.invalidIssueId });
      return;
    }
    const issue = await fetchIssue(req.redmine!, issueId);
    if (!issue) {
      res.status(404).json({ ok: false, message: MESSAGES.meta.issueNotFound(issueId) });
      return;
    }
    res.json({ issue });
  } catch (err) {
    next(err);
  }
});
