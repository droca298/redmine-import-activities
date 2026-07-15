import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { TrustedProjectsSettings } from '../types';
import { MESSAGES } from '../messages';

const STORAGE_KEY = 'redmineTrustedProjects';

const DEFAULT_TRUSTED_PROJECTS: string[] = [
  'Maddi',
  'SW',
  'Soporte Infraestructura',
  'Maddi City',
  'Maddi Care (Admin)',
];

const DEFAULT_SETTINGS: TrustedProjectsSettings = {
  enabled: true,
  projects: DEFAULT_TRUSTED_PROJECTS,
};

interface TrustedProjectsContextValue {
  enabled: boolean;
  projects: string[];
  setEnabled: (enabled: boolean) => void;
  addProject: (name: string) => void;
  removeProject: (name: string) => void;
}

const TrustedProjectsContext = createContext<TrustedProjectsContextValue | undefined>(undefined);

function loadStored(): TrustedProjectsSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<TrustedProjectsSettings>;
      return {
        enabled: parsed.enabled ?? true,
        projects: Array.isArray(parsed.projects) ? parsed.projects : DEFAULT_TRUSTED_PROJECTS,
      };
    }
  } catch {
    // ignore corrupted storage
  }
  return DEFAULT_SETTINGS;
}

export function TrustedProjectsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<TrustedProjectsSettings>(loadStored);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  function setEnabled(enabled: boolean) {
    setSettings((prev) => ({ ...prev, enabled }));
  }

  function addProject(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSettings((prev) =>
      prev.projects.some((p) => p.toLowerCase() === trimmed.toLowerCase())
        ? prev
        : { ...prev, projects: [...prev.projects, trimmed] }
    );
  }

  function removeProject(name: string) {
    setSettings((prev) => ({ ...prev, projects: prev.projects.filter((p) => p !== name) }));
  }

  const value: TrustedProjectsContextValue = {
    enabled: settings.enabled,
    projects: settings.projects,
    setEnabled,
    addProject,
    removeProject,
  };

  return (
    <TrustedProjectsContext.Provider value={value}>{children}</TrustedProjectsContext.Provider>
  );
}

export function useTrustedProjects(): TrustedProjectsContextValue {
  const ctx = useContext(TrustedProjectsContext);
  if (!ctx) throw new Error(MESSAGES.contexts.trustedProjectsOutsideProvider);
  return ctx;
}
