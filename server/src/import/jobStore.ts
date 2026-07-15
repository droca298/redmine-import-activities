import { Job } from '../types';

const JOB_TTL_MS = 10 * 60 * 1000; // 10 minutes
const jobs = new Map<string, Job>();
const timers = new Map<string, NodeJS.Timeout>();

export function createJob(job: Job): void {
  jobs.set(job.id, job);
  scheduleCleanup(job.id);
}

export function getJob(jobId: string): Job | undefined {
  return jobs.get(jobId);
}

export function deleteJob(jobId: string): void {
  jobs.delete(jobId);
  const timer = timers.get(jobId);
  if (timer) {
    clearTimeout(timer);
    timers.delete(jobId);
  }
}

function scheduleCleanup(jobId: string): void {
  const timer = setTimeout(() => deleteJob(jobId), JOB_TTL_MS);
  timers.set(jobId, timer);
}
