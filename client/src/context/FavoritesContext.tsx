import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { FavoriteActivity } from '../types';
import { MESSAGES } from '../messages';

const STORAGE_KEY = 'redmineFavorites';

const DEFAULT_FAVORITES: FavoriteActivity[] = [
  { id: 'vacaciones', label: 'Vacaciones', issueId: 50952, project: '', activity: '' },
  { id: 'reuniones-dailys', label: 'Reuniones Dailys', issueId: 130782, project: '', activity: '' },
  { id: 'despliegue-staging', label: 'Despliegue Staging', issueId: 74570, project: '', activity: '' },
  { id: 'despliegues-general', label: 'Despliegues (General)', issueId: 131210, project: '', activity: '' },
  { id: 'desarrollo-city', label: 'Desarrollo City', issueId: 94792, project: 'Maddi City', activity: 'Desarrollo' },
  { id: 'desarrollo-care', label: 'Desarrollo Care', issueId: 67767, project: '', activity: '' },
  { id: 'test-unitarios', label: 'Test Unitarios', issueId: 133461, project: '', activity: '' },
];

interface FavoritesContextValue {
  favorites: FavoriteActivity[];
  addFavorite: (favorite: Omit<FavoriteActivity, 'id'>) => void;
  updateFavorite: (id: string, patch: Partial<Omit<FavoriteActivity, 'id'>>) => void;
  removeFavorite: (id: string) => void;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

function loadStored(): FavoriteActivity[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as FavoriteActivity[];
  } catch {
    // ignore corrupted storage
  }
  return DEFAULT_FAVORITES;
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteActivity[]>(loadStored);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  function addFavorite(favorite: Omit<FavoriteActivity, 'id'>) {
    setFavorites((prev) => [...prev, { ...favorite, id: crypto.randomUUID() }]);
  }

  function updateFavorite(id: string, patch: Partial<Omit<FavoriteActivity, 'id'>>) {
    setFavorites((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }

  function removeFavorite(id: string) {
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  }

  const value: FavoritesContextValue = { favorites, addFavorite, updateFavorite, removeFavorite };

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error(MESSAGES.contexts.favoritesOutsideProvider);
  return ctx;
}
