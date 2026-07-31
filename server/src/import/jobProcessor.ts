import { EventEmitter } from 'events';
import { Job, RowResult } from '../types';
import { createTimeEntry } from '../redmine/timeEntries';

const emitters = new Map<string, EventEmitter>();
const started = new Set<string>();

export function getJobEmitter(jobId: string): EventEmitter {
  let emitter = emitters.get(jobId);
  if (!emitter) {
    emitter = new EventEmitter();
    emitters.set(jobId, emitter);
  }
  return emitter;
}

export function releaseJobEmitter(jobId: string): void {
  emitters.delete(jobId);
  started.delete(jobId);
}

export async function startProcessing(job: Job): Promise<void> {
  if (started.has(job.id)) return;
  started.add(job.id);

  const emitter = getJobEmitter(job.id);
  job.status = 'processing';

  for (const row of job.rows) {
    const outcome = await createTimeEntry(job.redmine, row);
    const result: RowResult = outcome.ok
      ? {
          rowIndex: row.rowIndex,
          status: 'success',
          spentOn: row.spentOn,
          project: row.proyecto,
          issueId: row.issueId,
          issueSubject: row.issueSubject,
          hours: row.horas,
          timeEntryId: outcome.id,
        }
      : { rowIndex: row.rowIndex, status: 'error', reason: outcome.reason };

    job.results.push(result);
    job.processed += 1;

    emitter.emit('progress', { processed: job.processed, total: job.total });
    emitter.emit('row-result', result);
  }

  job.status = 'done';
  const succeeded = job.results.filter((r) => r.status === 'success').length;
  const skipped = job.results.filter((r) => r.status === 'skipped').length;
  const failed = job.results.length - succeeded - skipped;
  emitter.emit('done', { processed: job.processed, total: job.total, succeeded, failed, skipped });
}
