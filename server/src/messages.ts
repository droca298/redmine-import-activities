/**
 * Único sitio donde viven los textos del backend: mensajes de error, motivos de
 * rechazo de filas, literales de la plantilla Excel y trazas de arranque.
 *
 * Ningún otro fichero debe llevar cadenas de texto en línea. Si hace falta un
 * mensaje nuevo, se añade aquí y se referencia desde donde toque.
 */

export const MESSAGES = {
  creds: {
    missing: 'Faltan las credenciales de Redmine (URL y/o API key). Configúralas en Ajustes.',
    invalidUrl: 'La URL de Redmine no es válida.',
  },

  network: {
    unresolvedHost:
      'No se pudo resolver la URL de Redmine. Revisa que la URL sea correcta y que tengas acceso de red.',
    connectionRefused:
      'Redmine rechazó la conexión. Revisa la URL y que el servicio esté accesible desde esta máquina.',
    timeout: 'La conexión con Redmine ha tardado demasiado (timeout). Revisa la red o VPN.',
    tlsChain:
      'No se pudo verificar el certificado TLS de Redmine (cadena de certificados incompleta). Consulta el README (REDMINE_ALLOW_INSECURE_TLS) para solucionarlo.',
    unexpected: 'Error interno inesperado',
  },

  redmine: {
    invalidApiKey: 'API key inválida o sin permisos',
    notFound: 'Recurso no encontrado en Redmine',
    genericHttp: (status: number) => `Error de Redmine (HTTP ${status})`,
    projectsFailed: (status: number) => `No se pudieron obtener los proyectos (HTTP ${status})`,
    activitiesFailed: (status: number) => `No se pudieron obtener las actividades (HTTP ${status})`,
    issueFailed: (issueId: number, status: number) =>
      `No se pudo obtener la tarea #${issueId} (HTTP ${status})`,
  },

  meta: {
    invalidIssueId: 'Nº de tarea no válido',
    issueNotFound: (issueId: number) => `No se encontró la tarea #${issueId}`,
  },

  timeEntries: {
    invalidDateRange:
      'Rango de fechas inválido. Usa el formato YYYY-MM-DD y asegúrate de que "desde" no sea posterior a "hasta".',
  },

  import: {
    noFile: 'No se ha recibido ningún fichero.',
    emptyTemplate: 'La plantilla no contiene filas de datos.',
    jobNotFound: 'Job no encontrado o expirado.',
    rowAlreadySent: 'Fila marcada como Enviado, se omite',
  },

  excel: {
    noDataSheet: 'El fichero no contiene ninguna hoja de datos.',
  },

  validation: {
    missingDate: 'Falta la fecha',
    unrecognizedDate: (raw: string) => `Fecha no reconocida: "${raw}"`,
    invalidHours: 'Las horas deben ser un número mayor que 0',
    missingActivity: 'Falta la actividad',
    unrecognizedActivity: (name: string) =>
      `Actividad "${name}" no reconocida (revisa la hoja Referencia)`,
    unrecognizedIssue: (raw: string) =>
      `Nº Tarea "${raw}" no reconocido (ni número ni tarea frecuente)`,
    missingProjectOrIssue: 'Debes indicar un Proyecto o un Nº de Tarea',
    unrecognizedProject: (name: string) =>
      `Proyecto "${name}" no reconocido (revisa la hoja Referencia)`,
    issueProjectUnverifiable: (issueId: number) =>
      `No se pudo verificar en Redmine el proyecto de la tarea #${issueId} para comprobar la lista de proyectos de confianza`,
    issueProjectUntrusted: (issueId: number, project: string) =>
      `Rechazada: la tarea #${issueId} pertenece al proyecto "${project}", que no está en la lista de proyectos de confianza`,
    projectUntrusted: (project: string) =>
      `Rechazada: el proyecto "${project}" no está en la lista de proyectos de confianza`,
  },

  /**
   * Literales de la plantilla Excel. templateBuilder.ts escribe con ellos e
   * importParser.ts lee con los mismos, así que cambiar algo aquí mantiene
   * ambos lados sincronizados: no se puede renombrar la hoja o una cabecera y
   * dejar el parser mirando al nombre antiguo.
   */
  template: {
    fileName: 'plantilla_imputaciones',
    sheets: {
      data: 'Datos',
      reference: 'Referencia',
    },
    /** El orden define el mapeo de columnas A–G. No reordenar sin tocar el parser. */
    headers: ['Fecha', 'Proyecto', 'Nº Tarea', 'Actividad', 'Horas', 'Comentario', 'Enviado'],
    referenceHeaders: [
      'Proyectos',
      'Actividades',
      '',
      'Tareas frecuentes',
      'Nº Tarea',
      'Proyecto',
      'Actividad',
    ],
    dateValidation: {
      title: 'Fecha no válida',
      error: 'Introduce una fecha válida.',
    },
    sentColumn: {
      /** Desplegable que ve el usuario en la columna «Enviado». */
      options: '"Sí,No"',
      /** Lo que el parser acepta como «sí» (ya normalizado: minúsculas y sin acentos). */
      truthyValues: ['si', 'true', 'x', 'yes'],
    },
  },

  /** Trazas de consola */
  server: {
    listening: (host: string, port: number) =>
      `Servidor backend escuchando en http://${host}:${port}`,
  },
} as const;
