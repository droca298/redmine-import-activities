/**
 * Único sitio donde viven las rutas de la API que consume el frontal.
 *
 * Ningún otro fichero debe llevar rutas en línea. El backend tiene su propio
 * equivalente en server/src/routes/paths.ts: si cambias una ruta allí, hay que
 * cambiarla también aquí.
 */

/**
 * Ficheros estáticos servidos desde client/public. Vite los publica en la raíz
 * en desarrollo y los copia a dist/ al compilar, así que la misma ruta vale en
 * los dos entornos.
 */
export const ASSET_ROUTES = {
  redmineLogo: '/redmine-logo.png',
} as const;

export const API_ROUTES = {
  health: '/api/health',

  meta: {
    testConnection: '/api/meta/test-connection',
    projects: '/api/meta/projects',
    activities: '/api/meta/activities',
    issue: (issueId: number) => `/api/meta/issues/${issueId}`,
  },

  template: '/api/template',

  import: {
    upload: '/api/import',
    stream: (jobId: string) => `/api/import/${jobId}/stream`,
    job: (jobId: string) => `/api/import/${jobId}`,
  },

  timeEntries: {
    list: (from: string, to: string) =>
      `/api/time-entries?${new URLSearchParams({ from, to }).toString()}`,
  },
} as const;
