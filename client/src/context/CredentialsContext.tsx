import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Credentials } from '../types';
import { MESSAGES } from '../messages';

const STORAGE_KEY = 'redmineCreds';

interface StoredCreds extends Credentials {
  remember: boolean;
}

interface CredentialsContextValue {
  baseUrl: string;
  apiKey: string;
  remember: boolean;
  setBaseUrl: (v: string) => void;
  setApiKey: (v: string) => void;
  setRemember: (v: boolean) => void;
  hasCredentials: boolean;
}

const CredentialsContext = createContext<CredentialsContextValue | undefined>(undefined);

function loadStored(): StoredCreds {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as StoredCreds;
  } catch {
    // ignore corrupted storage
  }
  return { baseUrl: '', apiKey: '', remember: false };
}

export function CredentialsProvider({ children }: { children: ReactNode }) {
  const initial = loadStored();
  const [baseUrl, setBaseUrl] = useState(initial.baseUrl);
  const [apiKey, setApiKey] = useState(initial.apiKey);
  const [remember, setRemember] = useState(initial.remember);

  useEffect(() => {
    if (remember) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ baseUrl, apiKey, remember }));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [baseUrl, apiKey, remember]);

  const value: CredentialsContextValue = {
    baseUrl,
    apiKey,
    remember,
    setBaseUrl,
    setApiKey,
    setRemember,
    hasCredentials: baseUrl.trim() !== '' && apiKey.trim() !== '',
  };

  return <CredentialsContext.Provider value={value}>{children}</CredentialsContext.Provider>;
}

export function useCredentials(): CredentialsContextValue {
  const ctx = useContext(CredentialsContext);
  if (!ctx) throw new Error(MESSAGES.contexts.credentialsOutsideProvider);
  return ctx;
}
