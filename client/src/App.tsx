import { useState } from 'react';
import { SettingsTab } from './pages/SettingsTab';
import { ImportTab } from './pages/ImportTab';
import { ConsultaTab } from './pages/ConsultaTab';
import { MESSAGES } from './messages';
import { ASSET_ROUTES } from './api/routes';

type Tab = 'settings' | 'import' | 'consulta';

export function App() {
  const [tab, setTab] = useState<Tab>('import');

  return (
    <div className="app">
      <header className="app__header">
        <h1>{MESSAGES.app.title}</h1>
        <img
          className="app__logo"
          src={ASSET_ROUTES.redmineLogo}
          alt={MESSAGES.app.logoAlt}
          title={MESSAGES.app.logoAlt}
        />
      </header>

      <nav className="tabs">
        <button className={tab === 'import' ? 'active' : ''} onClick={() => setTab('import')}>
          {MESSAGES.app.tabs.import}
        </button>
        <button className={tab === 'consulta' ? 'active' : ''} onClick={() => setTab('consulta')}>
          {MESSAGES.app.tabs.consulta}
        </button>
        <button className={tab === 'settings' ? 'active' : ''} onClick={() => setTab('settings')}>
          {MESSAGES.app.tabs.settings}
        </button>
      </nav>

      <main>
        {tab === 'import' && <ImportTab />}
        {tab === 'consulta' && <ConsultaTab />}
        {tab === 'settings' && <SettingsTab />}
      </main>
    </div>
  );
}
