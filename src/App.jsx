import { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import History from './components/History';
import Settings from './components/Settings';
import { initSettings } from './db';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Inicializa as configurações padrão se for o primeiro uso
    initSettings().then(() => setIsReady(true));
  }, []);

  if (!isReady) return null; // loading state

  return (
    <>
      <main className="content-area">
        {activeTab === 'home' && <Home />}
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'history' && <History />}
        {activeTab === 'settings' && <Settings />}
      </main>
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </>
  );
}

export default App;
