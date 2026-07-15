/**
 * Único sitio donde viven las rutas del backend y los endpoints de Redmine.
 *
 * Ningún otro fichero debe llevar rutas en línea. El frontal tiene su propio
 * equivalente en client/src/api/routes.ts: si cambias una ruta pública aquí,
 * hay que cambiarla también allí.
 */
export const API_BASE = {
  health: '/api/health',
  meta: '/api/meta',
  template: '/api/template',
  import: '/api/import',
  timeEntries: '/api/time-entries',
} as const;

export const META_PATHS = {
  testConnection: '/test-connection',
  projects: '/projects',
  activities: '/activities',
  issue: '/issues/:id',
} as const;

export const TEMPLATE_PATHS = {
  build: '/',
} as const;

export const IMPORT_PATHS = {
  upload: '/',
  stream: '/:jobId/stream',
  job: '/:jobId',
} as const;

export const TIME_ENTRIES_PATHS = {
  list: '/',
} as const;

/**
 * Todo lo que no empiece por /api se resuelve con el index.html del frontal,
 * para que el enrutado del lado del cliente funcione al recargar la página.
 */
export const NON_API_ROUTE = /^(?!\/api).*/;

/** Endpoints de la API REST de Redmine, relativos a la URL base del usuario. */
export const REDMINE_ENDPOINTS = {
  currentUser: '/users/current.json',
  projects: '/projects.json',
  activities: '/enumerations/time_entry_activities.json',
  issue: (issueId: number) => `/issues/${issueId}.json`,
  timeEntries: '/time_entries.json',
} as const;
