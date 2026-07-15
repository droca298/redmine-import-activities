/**
 * Único sitio donde viven los textos del frontal: rótulos, botones, avisos,
 * placeholders y mensajes de error propios.
 *
 * Ningún otro fichero debe llevar cadenas de texto en línea. Si hace falta un
 * texto nuevo, se añade aquí y se referencia desde el componente.
 */
export const MESSAGES = {
  app: {
    title: 'Redmine · Imputaciones',
    /** Texto alternativo y title del logo de la cabecera. */
    logoAlt: 'Parte de horas',
    tabs: {
      import: 'Importar',
      consulta: 'Consultar',
      settings: 'Ajustes',
    },
  },

  /** Textos comunes a varias pantallas */
  common: {
    empty: '—',
    select: 'Selecciona…',
    add: 'Añadir',
    remove: 'Eliminar',
    search: 'Buscar',
    searching: 'Buscando…',
    refresh: '↻',
    missingCredentials: 'Configura primero la URL de Redmine y tu API key en la pestaña Ajustes.',
    httpError: (status: number) => `Error HTTP ${status}`,
  },

  import: {
    heading: 'Importar imputaciones',
    downloadTemplate: 'Descargar plantilla',
    downloading: 'Descargando…',
    submit: 'Importar',
    uploading: 'Subiendo…',
    templateFileName: 'plantilla_imputaciones.xlsx',
    errors: {
      noFileSelected: 'Selecciona primero un fichero .xlsx',
      downloadFailed: 'No se pudo descargar la plantilla',
      uploadFailed: 'No se pudo iniciar la importación',
      streamLost: 'Se perdió la conexión con el servidor durante la importación.',
    },
    finished: 'Importación finalizada.',
    skippedSummary: (count: number) =>
      count === 1
        ? ' 1 fila omitida (ya marcada como Enviado).'
        : ` ${count} filas omitidas (ya marcadas como Enviado).`,
  },

  results: {
    columns: {
      row: 'Fila',
      status: 'Estado',
      detail: 'Detalle',
    },
    status: {
      success: 'OK',
      skipped: 'Omitida',
      error: 'Error',
    },
    issueFallback: 'Tarea',
    successDetail: (spentOn: string, target: string, hours: number, timeEntryId: number) =>
      `${spentOn} · ${target} · ${hours}h (id ${timeEntryId})`,
  },

  consulta: {
    heading: 'Consultar imputaciones',
    from: 'Desde',
    to: 'Hasta',
    errors: {
      queryFailed: 'No se pudieron obtener las imputaciones',
    },
    table: {
      empty: 'No hay imputaciones en el rango seleccionado.',
      columns: {
        date: 'Fecha',
        project: 'Proyecto',
        issue: 'Tarea',
        activity: 'Actividad',
        hours: 'Horas',
        comment: 'Comentario',
      },
      total: 'Total',
      totalHours: (hours: number) => `${hours}h`,
    },
  },

  settings: {
    heading: 'Ajustes',
    sections: {
      connection: 'Conexión',
      favorites: 'Tareas frecuentes',
      trusted: 'Proyectos de confianza',
    },

    connection: {
      baseUrlLabel: 'URL de Redmine',
      baseUrlPlaceholder: 'https://redmine.dominio.dorlet.com',
      apiKeyLabel: 'API key',
      apiKeyPlaceholder: 'Tu clave de acceso a la API',
      apiKeyHint: 'La encuentras en Redmine > Mi cuenta > Clave de acceso API.',
      remember: 'Recordar en este navegador',
      test: 'Probar conexión',
      testing: 'Probando…',
      success: (userName: string) => `Conexión correcta. Usuario: ${userName}`,
      failed: 'No se pudo conectar con Redmine',
    },

    favorites: {
      hint: 'Al elegir una de estas en el desplegable de "Nº Tarea" de la plantilla Excel, se rellenan solas el Proyecto y la Actividad.',
      columns: {
        label: 'Nombre',
        issueId: 'Nº Tarea',
        project: 'Proyecto',
        activity: 'Actividad',
      },
      resolving: 'Resolviendo…',
      labelPlaceholder: 'p. ej. Desarrollo City',
      issueIdPlaceholder: '94792',
      errors: {
        invalidIssueId: 'Introduce un Nº de tarea válido',
        searchFailed: 'No se pudo buscar la tarea',
        missingLabel: 'Ponle un nombre a la tarea frecuente',
        missingActivity: 'Selecciona una actividad',
      },
    },

    trusted: {
      hint: 'Si está activo, al importar se rechaza cualquier fila cuya tarea/proyecto resuelto en Redmine no pertenezca a esta lista (evita imputaciones accidentales a proyectos equivocados).',
      toggle: 'Validar que el proyecto de destino sea de confianza',
      column: 'Proyecto',
      newProjectLabel: 'Nombre del proyecto',
      needsConnection: 'Configura la conexión primero',
    },
  },

  contexts: {
    credentialsOutsideProvider: 'useCredentials debe usarse dentro de CredentialsProvider',
    favoritesOutsideProvider: 'useFavorites debe usarse dentro de FavoritesProvider',
    trustedProjectsOutsideProvider: 'useTrustedProjects debe usarse dentro de TrustedProjectsProvider',
  },
} as const;
