import { NextFunction, Request, Response } from 'express';
import { RedmineCreds } from '../types';
import { MESSAGES } from '../messages';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      redmine?: RedmineCreds;
    }
  }
}

export function redmineCreds(req: Request, res: Response, next: NextFunction): void {
  const baseUrl = req.header('X-Redmine-Base-Url');
  const apiKey = req.header('X-Redmine-Api-Key');

  if (!baseUrl || !apiKey) {
    res.status(400).json({ ok: false, message: MESSAGES.creds.missing });
    return;
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(baseUrl);
  } catch {
    res.status(400).json({ ok: false, message: MESSAGES.creds.invalidUrl });
    return;
  }

  req.redmine = { baseUrl: parsedUrl.toString(), apiKey };
  next();
}
