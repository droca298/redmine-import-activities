import { Router } from 'express';
import { redmineCreds } from '../middleware/redmineCreds';
import { listTimeEntries } from '../redmine/timeEntries';
import { isValidDateRange } from '../utils/dates';
import { MESSAGES } from '../messages';
import { TIME_ENTRIES_PATHS } from './paths';

export const timeEntriesRouter = Router();

timeEntriesRouter.get(TIME_ENTRIES_PATHS.list, redmineCreds, async (req, res, next) => {
  try {
    const from = String(req.query.from ?? '');
    const to = String(req.query.to ?? '');

    if (!isValidDateRange(from, to)) {
      res.status(400).json({ ok: false, message: MESSAGES.timeEntries.invalidDateRange });
      return;
    }

    const { entries, totalHours } = await listTimeEntries(req.redmine!, from, to);
    res.json({ entries, totalHours });
  } catch (err) {
    next(err);
  }
});
