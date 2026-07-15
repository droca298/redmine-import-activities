import { Router } from 'express';
import { redmineCreds } from '../middleware/redmineCreds';
import { fetchAllProjects } from '../redmine/projects';
import { fetchActivities } from '../redmine/activities';
import { buildTemplate } from '../excel/templateBuilder';
import { FavoriteActivity } from '../types';
import { MESSAGES } from '../messages';
import { TEMPLATE_PATHS } from './paths';

export const templateRouter = Router();

templateRouter.post(TEMPLATE_PATHS.build, redmineCreds, async (req, res, next) => {
  try {
    const favorites: FavoriteActivity[] = Array.isArray(req.body?.favorites)
      ? req.body.favorites
      : [];

    const [projects, activities] = await Promise.all([
      fetchAllProjects(req.redmine!),
      fetchActivities(req.redmine!),
    ]);

    const buffer = await buildTemplate(projects, activities, favorites);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${MESSAGES.template.fileName}.xlsx"`
    );
    res.send(Buffer.from(buffer));
  } catch (err) {
    next(err);
  }
});
