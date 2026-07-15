import { NextFunction, Request, Response } from 'express';
import { MESSAGES } from '../messages';

const TLS_ERROR_CODES = new Set([
  'UNABLE_TO_VERIFY_LEAF_SIGNATURE',
  'DEPTH_ZERO_SELF_SIGNED_CERT',
  'SELF_SIGNED_CERT_IN_CHAIN',
  'CERT_HAS_EXPIRED',
]);

function friendlyMessage(err: unknown): string {
  const code = (err as { code?: string } | undefined)?.code
    ?? (err as { cause?: { code?: string } } | undefined)?.cause?.code;

  if (code === 'ENOTFOUND' || code === 'EAI_AGAIN') {
    return MESSAGES.network.unresolvedHost;
  }
  if (code === 'ECONNREFUSED') {
    return MESSAGES.network.connectionRefused;
  }
  if (code === 'ETIMEDOUT' || code === 'ECONNABORTED') {
    return MESSAGES.network.timeout;
  }
  if (code && TLS_ERROR_CODES.has(code)) {
    return MESSAGES.network.tlsChain;
  }
  return err instanceof Error ? err.message : MESSAGES.network.unexpected;
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  console.error(err);
  res.status(500).json({ ok: false, message: friendlyMessage(err) });
}
