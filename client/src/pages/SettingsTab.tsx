import { useEffect, useRef, useState } from 'react';
import { useCredentials } from '../context/CredentialsContext';
import { useFavorites } from '../context/FavoritesContext';
import { useTrustedProjects } from '../context/TrustedProjectsContext';
import { testConnection, getActivities, getProjects, getIssue } from '../api/metaApi';
import { ApiError } from '../api/http';
import { RedmineActivity, RedmineProject } from '../types';
import { MESSAGES } from '../messages';

type SettingsSection = 'connection' | 'favorites' | 'trusted';

const SECTIONS: { key: SettingsSection; label: string }[] = [
  { key: 'connection', label: MESSAGES.settings.sections.connection },
  { key: 'favorites', label: MESSAGES.settings.sections.favorites },
  { key: 'trusted', label: MESSAGES.settings.sections.trusted },
];

export function SettingsTab() {
  const { baseUrl, apiKey, remember, setBaseUrl, setApiKey, setRemember, hasCredentials } =
    useCredentials();
  const { favorites, addFavorite, updateFavorite, removeFavorite } = useFavorites();
  const {
    enabled: trustEnabled,
    projects: trustedProjects,
    setEnabled: setTrustEnabled,
    addProject: addTrustedProject,
    removeProject: removeTrustedProject,
  } = useTrustedProjects();

  const [section, setSection] = useState<SettingsSection>('connection');

  const [newTrustedProject, setNewTrustedProject] = useState('');
  const [status, setStatus] = useState<{ type: 'ok' | 'error'; message: string } | null>(null);
  const [testing, setTesting] = useState(false);

  const [activities, setActivities] = useState<RedmineActivity[]>([]);
  const [redmineProjects, setRedmineProjects] = useState<RedmineProject[]>([]);
  const resolvingRef = useRef<Set<string>>(new Set());
  const [, forceRender] = useState(0);

  const [newLabel, setNewLabel] = useState('');
  const [newIssueId, setNewIssueId] = useState('');
  const [newProject, setNewProject] = useState('');
  const [newActivity, setNewActivity] = useState('');
  const [newSearching, setNewSearching] = useState(false);
  const [newError, setNewError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasCredentials) return;
    getActivities({ baseUrl, apiKey })
      .then((r) => setActivities(r.activities))
      .catch(() => {
        /* la sección de tareas frecuentes simplemente no tendrá desplegable de actividad */
      });
    getProjects({ baseUrl, apiKey })
      .then((r) => setRedmineProjects(r.projects))
      .catch(() => {
        /* la sección de proyectos de confianza simplemente no tendrá desplegable */
      });
  }, [hasCredentials, baseUrl, apiKey]);

  useEffect(() => {
    if (!hasCredentials) return;
    favorites.forEach((f) => {
      if (f.project || resolvingRef.current.has(f.id)) return;
      resolvingRef.current.add(f.id);
      getIssue({ baseUrl, apiKey }, f.issueId)
        .then((issue) => updateFavorite(f.id, { project: issue.projectName }))
        .catch(() => {
          /* el usuario puede pulsar "Actualizar" más tarde para reintentar */
        })
        .finally(() => {
          resolvingRef.current.delete(f.id);
          forceRender((n) => n + 1);
        });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasCredentials, baseUrl, apiKey, favorites]);

  async function handleTestConnection() {
    setStatus(null);
    setTesting(true);
    try {
      const result = await testConnection({ baseUrl, apiKey });
      setStatus({ type: 'ok', message: MESSAGES.settings.connection.success(result.userName) });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : MESSAGES.settings.connection.failed;
      setStatus({ type: 'error', message });
    } finally {
      setTesting(false);
    }
  }

  function resolveProject(id: string, issueId: number) {
    resolvingRef.current.add(id);
    forceRender((n) => n + 1);
    getIssue({ baseUrl, apiKey }, issueId)
      .then((issue) => updateFavorite(id, { project: issue.projectName }))
      .catch(() => {})
      .finally(() => {
        resolvingRef.current.delete(id);
        forceRender((n) => n + 1);
      });
  }

  async function handleSearchIssue() {
    const issueId = Number(newIssueId);
    if (!Number.isFinite(issueId) || issueId <= 0) {
      setNewError(MESSAGES.settings.favorites.errors.invalidIssueId);
      return;
    }
    setNewError(null);
    setNewSearching(true);
    try {
      const issue = await getIssue({ baseUrl, apiKey }, issueId);
      setNewProject(issue.projectName);
    } catch (err) {
      setNewError(
        err instanceof ApiError ? err.message : MESSAGES.settings.favorites.errors.searchFailed
      );
    } finally {
      setNewSearching(false);
    }
  }

  function handleAddFavorite() {
    const issueId = Number(newIssueId);
    if (!newLabel.trim()) {
      setNewError(MESSAGES.settings.favorites.errors.missingLabel);
      return;
    }
    if (!Number.isFinite(issueId) || issueId <= 0) {
      setNewError(MESSAGES.settings.favorites.errors.invalidIssueId);
      return;
    }
    if (!newActivity) {
      setNewError(MESSAGES.settings.favorites.errors.missingActivity);
      return;
    }
    addFavorite({ label: newLabel.trim(), issueId, project: newProject, activity: newActivity });
    setNewLabel('');
    setNewIssueId('');
    setNewProject('');
    setNewActivity('');
    setNewError(null);
  }

  const availableTrustedOptions = redmineProjects.filter(
    (p) => !trustedProjects.some((tp) => tp.toLowerCase() === p.name.toLowerCase())
  );

  return (
    <div className="panel">
      <h2>{MESSAGES.settings.heading}</h2>
      <div className="settings-layout">
        <aside className="settings-aside">
          {SECTIONS.map((s) => (
            <button
              key={s.key}
              type="button"
              className={section === s.key ? 'active' : ''}
              onClick={() => setSection(s.key)}
            >
              {s.label}
            </button>
          ))}
        </aside>

        <div className="settings-content">
          {section === 'connection' && (
            <>
              <div className="form-field">
                <label htmlFor="baseUrl">{MESSAGES.settings.connection.baseUrlLabel}</label>
                <input
                  id="baseUrl"
                  type="url"
                  placeholder={MESSAGES.settings.connection.baseUrlPlaceholder}
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                />
              </div>
              <div className="form-field">
                <label htmlFor="apiKey">{MESSAGES.settings.connection.apiKeyLabel}</label>
                <input
                  id="apiKey"
                  type="password"
                  placeholder={MESSAGES.settings.connection.apiKeyPlaceholder}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <p className="hint">{MESSAGES.settings.connection.apiKeyHint}</p>
              </div>
              <div className="form-field form-field--checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  {MESSAGES.settings.connection.remember}
                </label>
              </div>
              <button onClick={handleTestConnection} disabled={testing || !baseUrl || !apiKey}>
                {testing ? MESSAGES.settings.connection.testing : MESSAGES.settings.connection.test}
              </button>
              {status && (
                <p className={status.type === 'ok' ? 'status-ok' : 'status-error'}>
                  {status.message}
                </p>
              )}
            </>
          )}

          {section === 'favorites' && (
            <>
              <p className="hint">{MESSAGES.settings.favorites.hint}</p>

              <div className="table-scroll">
              <table className="favorites-table favorites-table--wide">
                <thead>
                  <tr>
                    <th>{MESSAGES.settings.favorites.columns.label}</th>
                    <th>{MESSAGES.settings.favorites.columns.issueId}</th>
                    <th>{MESSAGES.settings.favorites.columns.project}</th>
                    <th>{MESSAGES.settings.favorites.columns.activity}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {favorites.map((f) => (
                    <tr key={f.id}>
                      <td>{f.label}</td>
                      <td>{f.issueId}</td>
                      <td>
                        <div className="project-cell">
                          {resolvingRef.current.has(f.id)
                            ? MESSAGES.settings.favorites.resolving
                            : f.project || MESSAGES.common.empty}
                          {hasCredentials && (
                            <button
                              type="button"
                              className="button-secondary"
                              onClick={() => resolveProject(f.id, f.issueId)}
                              disabled={resolvingRef.current.has(f.id)}
                            >
                              {MESSAGES.common.refresh}
                            </button>
                          )}
                        </div>
                      </td>
                      <td>
                        <select
                          value={f.activity}
                          onChange={(e) => updateFavorite(f.id, { activity: e.target.value })}
                        >
                          <option value="">{MESSAGES.common.select}</option>
                          {activities.map((a) => (
                            <option key={a.id} value={a.name}>
                              {a.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="button-secondary"
                          onClick={() => removeFavorite(f.id)}
                        >
                          {MESSAGES.common.remove}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>

              <div className="add-favorite-form">
                <div className="form-field">
                  <label htmlFor="favLabel">{MESSAGES.settings.favorites.columns.label}</label>
                  <input
                    id="favLabel"
                    type="text"
                    placeholder={MESSAGES.settings.favorites.labelPlaceholder}
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="favIssue">{MESSAGES.settings.favorites.columns.issueId}</label>
                  <input
                    id="favIssue"
                    type="text"
                    placeholder={MESSAGES.settings.favorites.issueIdPlaceholder}
                    value={newIssueId}
                    onChange={(e) => setNewIssueId(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  className="button-secondary"
                  onClick={handleSearchIssue}
                  disabled={newSearching || !hasCredentials || !newIssueId}
                >
                  {newSearching ? MESSAGES.common.searching : MESSAGES.common.search}
                </button>
                <div className="form-field">
                  <label htmlFor="favProject">{MESSAGES.settings.favorites.columns.project}</label>
                  <input
                    id="favProject"
                    type="text"
                    value={newProject}
                    readOnly
                    placeholder={MESSAGES.common.empty}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="favActivity">{MESSAGES.settings.favorites.columns.activity}</label>
                  <select
                    id="favActivity"
                    value={newActivity}
                    onChange={(e) => setNewActivity(e.target.value)}
                  >
                    <option value="">{MESSAGES.common.select}</option>
                    {activities.map((a) => (
                      <option key={a.id} value={a.name}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button type="button" onClick={handleAddFavorite}>
                  {MESSAGES.common.add}
                </button>
              </div>
              {newError && <p className="status-error">{newError}</p>}
            </>
          )}

          {section === 'trusted' && (
            <>
              <p className="hint">{MESSAGES.settings.trusted.hint}</p>

              <div className="form-field form-field--checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={trustEnabled}
                    onChange={(e) => setTrustEnabled(e.target.checked)}
                  />
                  {MESSAGES.settings.trusted.toggle}
                </label>
              </div>

              <div className="table-scroll">
              <table className="favorites-table">
                <thead>
                  <tr>
                    <th>{MESSAGES.settings.trusted.column}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {trustedProjects.map((p) => (
                    <tr key={p}>
                      <td>{p}</td>
                      <td>
                        <button
                          type="button"
                          className="button-secondary"
                          onClick={() => removeTrustedProject(p)}
                        >
                          {MESSAGES.common.remove}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>

              <div className="add-favorite-form">
                <div className="form-field">
                  <label htmlFor="newTrustedProject">
                    {MESSAGES.settings.trusted.newProjectLabel}
                  </label>
                  <select
                    id="newTrustedProject"
                    value={newTrustedProject}
                    onChange={(e) => setNewTrustedProject(e.target.value)}
                    disabled={!hasCredentials || availableTrustedOptions.length === 0}
                  >
                    <option value="">
                      {hasCredentials
                        ? MESSAGES.common.select
                        : MESSAGES.settings.trusted.needsConnection}
                    </option>
                    {availableTrustedOptions.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    addTrustedProject(newTrustedProject);
                    setNewTrustedProject('');
                  }}
                  disabled={!newTrustedProject}
                >
                  {MESSAGES.common.add}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
