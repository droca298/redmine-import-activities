import { Credentials } from '../types';
import { MESSAGES } from '../messages';

export class ApiError extends Error {}

function credsHeaders(creds: Credentials): HeadersInit {
  return {
    'X-Redmine-Base-Url': creds.baseUrl,
    'X-Redmine-Api-Key': creds.apiKey,
  };
}

export async function apiGetJson<T>(path: string, creds: Credentials): Promise<T> {
  const res = await fetch(path, { headers: credsHeaders(creds) });
  return handleJson<T>(res);
}

export async function apiPostJson<T>(path: string, creds: Credentials, body?: unknown): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { ...credsHeaders(creds), 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  return handleJson<T>(res);
}

export async function apiUploadFile<T>(
  path: string,
  creds: Credentials,
  file: File,
  extraFields?: Record<string, string>
): Promise<T> {
  const formData = new FormData();
  formData.append('file', file);
  for (const [key, value] of Object.entries(extraFields ?? {})) {
    formData.append(key, value);
  }
  const res = await fetch(path, {
    method: 'POST',
    headers: credsHeaders(creds),
    body: formData,
  });
  return handleJson<T>(res);
}

export async function apiDownloadFile(path: string, creds: Credentials): Promise<Blob> {
  const res = await fetch(path, { headers: credsHeaders(creds) });
  if (!res.ok) {
    const message = await extractErrorMessage(res);
    throw new ApiError(message);
  }
  return res.blob();
}

export async function apiPostForBlob(path: string, creds: Credentials, body: unknown): Promise<Blob> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { ...credsHeaders(creds), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const message = await extractErrorMessage(res);
    throw new ApiError(message);
  }
  return res.blob();
}

async function handleJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const message = await extractErrorMessage(res);
    throw new ApiError(message);
  }
  return res.json() as Promise<T>;
}

async function extractErrorMessage(res: Response): Promise<string> {
  try {
    const data = await res.json();
    return data.message ?? MESSAGES.common.httpError(res.status);
  } catch {
    return MESSAGES.common.httpError(res.status);
  }
}
