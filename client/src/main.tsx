import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { CredentialsProvider } from './context/CredentialsContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { TrustedProjectsProvider } from './context/TrustedProjectsContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CredentialsProvider>
      <FavoritesProvider>
        <TrustedProjectsProvider>
          <App />
        </TrustedProjectsProvider>
      </FavoritesProvider>
    </CredentialsProvider>
  </StrictMode>
);
