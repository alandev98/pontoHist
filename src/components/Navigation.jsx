import React from 'react';
import { Home, Clock, Settings as SettingsIcon, LayoutDashboard } from 'lucide-react';
import './Navigation.css';

function Navigation({ activeTab, setActiveTab }) {
  return (
    <nav className="bottom-nav glass-card">
      <button 
        className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
        onClick={() => setActiveTab('home')}
      >
        <Home size={24} />
        <span>Início</span>
      </button>
      
      <button 
        className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
        onClick={() => setActiveTab('dashboard')}
      >
        <LayoutDashboard size={24} />
        <span>Dashboard</span>
      </button>
      
      <button 
        className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
        onClick={() => setActiveTab('history')}
      >
        <Clock size={24} />
        <span>Histórico</span>
      </button>
      
      <button 
        className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
        onClick={() => setActiveTab('settings')}
      >
        <SettingsIcon size={24} />
        <span>Ajustes</span>
      </button>
    </nav>
  );
}

export default Navigation;
