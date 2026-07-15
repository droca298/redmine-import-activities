import express, { Express } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { metaRouter } from './routes/meta.routes';
import { templateRouter } from './routes/template.routes';
import { importRouter } from './routes/import.routes';
import { timeEntriesRouter } from './routes/timeEntries.routes';
import { errorHandler } from './middleware/errorHandler';
import { API_BASE, NON_API_ROUTE } from './routes/paths';

// In production the client is pre-built into client/dist; when that folder is present
// (e.g. `npm run build` was run) this same server also serves the frontend, so the whole
// app lives behind a single port. In dev mode this folder never exists — Vite serves the
// frontend on its own port instead — so this block is a no-op then.
const clientDist = path.join(__dirname, '../../client/dist');
const hasClientBuild = fs.existsSync(clientDist);

export function createApp(): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get(API_BASE.health, (_req, res) => res.json({ ok: true }));

  app.use(API_BASE.meta, metaRouter);
  app.use(API_BASE.template, templateRouter);
  app.use(API_BASE.import, importRouter);
  app.use(API_BASE.timeEntries, timeEntriesRouter);

  if (hasClientBuild) {
    app.use(express.static(clientDist));
    app.get(NON_API_ROUTE, (_req, res) => {
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  }

  app.use(errorHandler);

  return app;
}
