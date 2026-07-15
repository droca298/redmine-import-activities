import { Router } from 'express';
import multer from 'multer';
import { v4 as uuid } from 'uuid';
import { redmineCreds } from '../middleware/redmineCreds';
import { fetchAllProjects } from '../redmine/projects';
import { fetchActivities } from '../redmine/activities';
import { parseImportFile } from '../excel/importParser';
import { validateRow, TrustedProjectsSettings } from '../import/rowValidator';
import { createJob, getJob, deleteJob } from '../import/jobStore';
import { startProcessing, getJobEmitter, releaseJobEmitter } from '../import/jobProcessor';
import { initSse, sendSseEvent } from '../utils/sse';
import { FavoriteActivity, Job, RowResult, ValidatedRow } from '../types';
import { MESSAGES } from '../messages';
import { IMPORT_PATHS } from './paths';

const upload = multer({ storage: multer.memoryStorage() });

export const importRouter = Router();

importRouter.post(IMPORT_PATHS.upload, redmineCreds, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400).json({ ok: false, message: MESSAGES.import.noFile });
      return;
    }

    const rawRows = await parseImportFile(req.file.buffer);
    if (rawRows.length === 0) {
      res.status(400).json({ ok: false, message: MESSAGES.import.emptyTemplate });
      return;
    }

    let favorites: FavoriteActivity[] = [];
    if (typeof req.body?.favorites === 'string') {
      try {
        favorites = JSON.parse(req.body.favorites);
      } catch {
        favorites = [];
      }
    }

    let trust: TrustedProjectsSettings | undefined;
    if (typeof req.body?.trustedProjects === 'string') {
      try {
        trust = JSON.parse(req.body.trustedProjects);
      } catch {
        trust = undefined;
      }
    }

    const [projects, activities] = await Promise.all([
      fetchAllProjects(req.redmine!),
      fetchActivities(req.redmine!),
    ]);

    const validRows: ValidatedRow[] = [];
    const preErrors: RowResult[] = [];
    const issueProjectCache = new Map<number, string | undefined>();

    for (const row of rawRows) {
      if (row.enviado) {
        preErrors.push({
          rowIndex: row.rowIndex,
          status: 'skipped',
          reason: MESSAGES.import.rowAlreadySent,
        });
        continue;
      }
      const outcome = await validateRow(
        row,
        projects,
        activities,
        favorites,
        trust,
        req.redmine!,
        issueProjectCache
      );
      if ('status' in outcome) {
        preErrors.push(outcome);
      } else {
        validRows.push(outcome);
      }
    }

    const job: Job = {
      id: uuid(),
      status: 'validating',
      total: rawRows.length,
      processed: preErrors.length,
      rows: validRows,
      results: [...preErrors],
      redmine: req.redmine!,
      createdAt: Date.now(),
    };

    createJob(job);

    res.status(202).json({ jobId: job.id, totalRows: job.total });
  } catch (err) {
    next(err);
  }
});

importRouter.get(IMPORT_PATHS.stream, (req, res) => {
  const job = getJob(req.params.jobId);
  if (!job) {
    res.status(404).end();
    return;
  }

  initSse(res);

  sendSseEvent(res, 'progress', { processed: job.processed, total: job.total });
  for (const result of job.results) {
    sendSseEvent(res, 'row-result', result);
  }

  if (job.status === 'done') {
    const succeeded = job.results.filter((r) => r.status === 'success').length;
    const skipped = job.results.filter((r) => r.status === 'skipped').length;
    sendSseEvent(res, 'done', {
      processed: job.processed,
      total: job.total,
      succeeded,
      failed: job.results.length - succeeded - skipped,
      skipped,
    });
    res.end();
    return;
  }

  const emitter = getJobEmitter(job.id);
  const onProgress = (payload: unknown) => sendSseEvent(res, 'progress', payload);
  const onRowResult = (payload: unknown) => sendSseEvent(res, 'row-result', payload);
  const onDone = (payload: unknown) => {
    sendSseEvent(res, 'done', payload);
    cleanup();
    res.end();
  };

  const cleanup = () => {
    emitter.off('progress', onProgress);
    emitter.off('row-result', onRowResult);
    emitter.off('done', onDone);
  };

  emitter.on('progress', onProgress);
  emitter.on('row-result', onRowResult);
  emitter.on('done', onDone);

  req.on('close', cleanup);

  void startProcessing(job).then(() => {
    releaseJobEmitter(job.id);
  });
});

importRouter.get(IMPORT_PATHS.job, (req, res) => {
  const job = getJob(req.params.jobId);
  if (!job) {
    res.status(404).json({ ok: false, message: MESSAGES.import.jobNotFound });
    return;
  }
  res.json({
    status: job.status,
    processed: job.processed,
    total: job.total,
    results: job.results,
  });
  if (job.status === 'done') {
    deleteJob(job.id);
  }
});
