import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { getCurrentDateString, formatTime, calculateWorkedMinutes, formatMinutesAsHours, getPunchesForCurrentWeek, getPunchesForCurrentMonth } from '../utils/time';
import { Fingerprint, CheckCircle2 } from 'lucide-react';
import './Home.css';

function Home() {
  const [cycleConfig, setCycleConfig] = useState([]);
  const [weeklyHoursTarget, setWeeklyHoursTarget] = useState(40);
  const [currentTime, setCurrentTime] = useState(new Date());

  const todayString = getCurrentDateString();

  // Buscar as configurações
  useEffect(() => {
    db.settings.get('punchCycle').then(res => {
      if (res && res.value) setCycleConfig(res.value);
    });
    db.settings.get('weeklyHours').then(res => {
      if (res && res.value) setWeeklyHoursTarget(res.value);
    });
  }, []);

  // Atualizar relógio
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Buscar os pontos de hoje e todos os pontos para os cálculos globais
  const todaysPunches = useLiveQuery(
    () => db.punches.where('dateString').equals(todayString).sortBy('timestamp'),
    [todayString]
  );

  const allPunches = useLiveQuery(() => db.punches.toArray());

  const handlePunch = async () => {
    if (!cycleConfig.length) return;

    const currentPunchCount = todaysPunches ? todaysPunches.length : 0;
    
    // Calcula qual é o tipo do próximo ponto baseado no ciclo
    // Se passar do ciclo, repete a lógica (para dias com hora extra ou saídas extras)
    const nextPunchIndex = currentPunchCount % cycleConfig.length;
    const nextPunchDef = cycleConfig[nextPunchIndex];

    await db.punches.add({
      timestamp: Date.now(),
      type: nextPunchDef.type,
      dateString: todayString,
      label: nextPunchDef.label
    });
  };

  if (!todaysPunches || !allPunches) return <div className="p-4">Carregando...</div>;

  const currentPunchCount = todaysPunches.length;
  const nextPunchIndex = currentPunchCount % cycleConfig.length;
  const nextPunchDef = cycleConfig[nextPunchIndex] || { label: 'Registrar' };

  const isCycleComplete = currentPunchCount > 0 && currentPunchCount % cycleConfig.length === 0;

  // Calculo simples do dia
  const workedMinutesToday = calculateWorkedMinutes(todaysPunches);

  // Cálculos da semana e mês
  const weeklyPunches = getPunchesForCurrentWeek(allPunches);
  const monthlyPunches = getPunchesForCurrentMonth(allPunches);

  const workedMinutesWeek = calculateWorkedMinutes(weeklyPunches);
  const workedMinutesMonth = calculateWorkedMinutes(monthlyPunches);

  // Meta da semana em minutos
  const targetMinutesWeek = weeklyHoursTarget * 60;
  const balanceMinutesWeek = workedMinutesWeek - targetMinutesWeek;
  
  // Classe condicional pro saldo
  const balanceClass = balanceMinutesWeek >= 0 ? 'text-success' : 'text-danger';

  return (
    <div className="home-container animate-fade-in">
      <header className="home-header">
        <h1 className="time-display">{formatTime(currentTime.getTime())}</h1>
        <p className="date-display">{currentTime.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      </header>

      <section className="punch-section">
        <button 
          className="punch-button glass-card"
          onClick={handlePunch}
        >
          <div className="punch-icon-wrapper">
            <Fingerprint size={48} strokeWidth={1.5} />
          </div>
          <span className="punch-action-label">{nextPunchDef.label}</span>
        </button>

        {isCycleComplete && (
          <div className="cycle-complete-message">
            <CheckCircle2 size={20} className="success-icon" />
            <span>Ciclo diário concluído</span>
          </div>
        )}
      </section>

      <section className="dashboard-summary glass-card">
        <h2>Resumo Geral</h2>
        <div className="summary-stats" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: '15px' }}>
          <div className="stat-box">
            <span className="stat-label">Semana Atual</span>
            <span className="stat-value">{formatMinutesAsHours(workedMinutesWeek)}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Saldo Semanal</span>
            <span className={`stat-value ${balanceClass}`}>
              {balanceMinutesWeek > 0 ? '+' : ''}{formatMinutesAsHours(balanceMinutesWeek)}
            </span>
          </div>
          <div className="stat-box" style={{ gridColumn: 'span 2' }}>
            <span className="stat-label">Acumulado do Mês</span>
            <span className="stat-value">{formatMinutesAsHours(workedMinutesMonth)}</span>
          </div>
        </div>

        <h2>Registros de Hoje</h2>
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
