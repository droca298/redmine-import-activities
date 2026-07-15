import axios, { AxiosInstance } from 'axios';
import https from 'https';
import { RedmineCreds } from '../types';
import { MESSAGES } from '../messages';

// Some internal Redmine deployments serve an incomplete certificate chain (missing
// intermediate). Browsers tolerate this via cached/AIA-fetched intermediates; Node does
// not, and fails with UNABLE_TO_VERIFY_LEAF_SIGNATURE. Setting REDMINE_ALLOW_INSECURE_TLS=true
// works around it by skipping certificate verification for calls to Redmine only — the
// proper fix is completing the server's certificate chain (see README).
const allowInsecureTls = process.env.REDMINE_ALLOW_INSECURE_TLS === 'true';

export function redmineClient(creds: RedmineCreds): AxiosInstance {
  const baseURL = creds.baseUrl.replace(/\/+$/, '');
  return axios.create({
    baseURL,
    headers: {
      'X-Redmine-API-Key': creds.apiKey,
      'Content-Type': 'application/json',
    },
    timeout: 20000,
    validateStatus: () => true,
    httpsAgent: allowInsecureTls ? new https.Agent({ rejectUnauthorized: false }) : undefined,
  });
}

export function extractRedmineErrorMessage(status: number, data: unknown): string {
  if (data && typeof data === 'object' && 'errors' in data) {
    const errors = (data as { errors?: unknown }).errors;
    if (Array.isArray(errors)) {
      return errors.join(', ');
    }
  }
  if (status === 401) return MESSAGES.redmine.invalidApiKey;
  if (status === 404) return MESSAGES.redmine.notFound;
  return MESSAGES.redmine.genericHttp(status);
}
