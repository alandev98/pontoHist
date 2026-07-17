import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { getCurrentDateString, formatTime, calculateWorkedMinutes, formatMinutesAsHours } from '../utils/time';
import { Fingerprint, CheckCircle2 } from 'lucide-react';
import './Home.css';

function Home() {
  const [cycleConfig, setCycleConfig] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  const todayString = getCurrentDateString();

  // Buscar as configurações
  useEffect(() => {
    db.settings.get('punchCycle').then(res => {
      if (res && res.value) setCycleConfig(res.value);
    });
  }, []);

  // Atualizar relógio
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const triggerMonthlyBackup = async () => {
    const rawPunches = await db.punches.toArray();
    const settings = await db.settings.toArray();
    const monthlyPunches = getPunchesForCurrentMonth(rawPunches);
    
    const backupData = { punches: monthlyPunches, settings };
    const blob = new Blob([JSON.stringify(backupData)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    // Formato: ponto_backup_mes_YYYY-MM.json
    link.setAttribute('download', `ponto_backup_mes_${new Date().toISOString().slice(0,7)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Buscar os pontos de hoje
  const todaysPunches = useLiveQuery(
    () => db.punches.where('dateString').equals(todayString).sortBy('timestamp'),
    [todayString]
  );

  const handlePunch = async () => {
    if (!cycleConfig.length) return;

    const currentPunchCount = todaysPunches ? todaysPunches.length : 0;
    
    // Se já completou o ciclo, não deixa registrar mais
    if (currentPunchCount >= cycleConfig.length) return;

    const nextPunchIndex = currentPunchCount;
    const nextPunchDef = cycleConfig[nextPunchIndex];

    await db.punches.add({
      timestamp: Date.now(),
      type: nextPunchDef.type,
      dateString: todayString,
      label: nextPunchDef.label
    });

    // Se essa foi a última batida do dia, aciona o backup mensal
    if (currentPunchCount + 1 === cycleConfig.length) {
      setTimeout(() => {
        triggerMonthlyBackup();
      }, 500);
    }
  };

  if (!todaysPunches) return <div className="p-4">Carregando...</div>;

  const currentPunchCount = todaysPunches.length;
  const isCycleComplete = currentPunchCount >= cycleConfig.length;
  
  const nextPunchDef = isCycleComplete 
    ? { label: 'Jornada Completa' } 
    : cycleConfig[currentPunchCount] || { label: 'Registrar' };

  // Calculo simples do dia
  const workedMinutesToday = calculateWorkedMinutes(todaysPunches);

  return (
    <div className="home-container animate-fade-in">
      <header className="home-header">
        <h1 className="time-display">{formatTime(currentTime.getTime())}</h1>
        <p className="date-display">{currentTime.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      </header>

      <section className="punch-section">
        <button 
          className={`punch-button glass-card ${isCycleComplete ? 'disabled' : ''}`}
          onClick={handlePunch}
          disabled={isCycleComplete}
        >
          <div className="punch-icon-wrapper">
            {isCycleComplete ? (
              <CheckCircle2 size={48} strokeWidth={1.5} />
            ) : (
              <Fingerprint size={48} strokeWidth={1.5} />
            )}
          </div>
          <span className="punch-action-label">{nextPunchDef.label}</span>
        </button>

        {isCycleComplete && (
          <div className="cycle-complete-message">
            <CheckCircle2 size={20} className="success-icon" />
            <span>Todos os pontos de hoje foram registrados.</span>
          </div>
        )}
      </section>

      <section className="dashboard-summary glass-card">
        <h2>Resumo de Hoje</h2>
        <div className="summary-stats">
          <div className="stat-box">
            <span className="stat-label">Horas Trabalhadas</span>
            <span className="stat-value">{formatMinutesAsHours(workedMinutesToday)}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Batidas Hoje</span>
            <span className="stat-value">{currentPunchCount}</span>
          </div>
        </div>

        <div className="todays-punches-list">
          {todaysPunches.map((punch, idx) => (
            <div key={punch.id} className="punch-item">
              <span className="punch-number">{idx + 1}</span>
              <span className="punch-label">{punch.label}</span>
              <span className="punch-time">{formatTime(punch.timestamp)}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
