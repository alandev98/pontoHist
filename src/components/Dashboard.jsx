import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { 
  formatMinutesAsHours, 
  getPunchesForCurrentWeek, 
  getPunchesForCurrentMonth, 
  calculateWorkedMinutes,
  calculateMonthlyTarget 
} from '../utils/time';
import { Target, Calendar, BarChart3, TrendingUp } from 'lucide-react';
import './Dashboard.css';

function Dashboard() {
  const [weeklyHoursTarget, setWeeklyHoursTarget] = useState(44);

  useEffect(() => {
    db.settings.get('weeklyHours').then(res => {
      if (res && res.value) setWeeklyHoursTarget(res.value);
    });
  }, []);

  const allPunches = useLiveQuery(() => db.punches.toArray());

  if (!allPunches) return <div className="p-4">Carregando dashboard...</div>;

  // Semana
  const weeklyPunches = getPunchesForCurrentWeek(allPunches);
  const workedMinutesWeek = calculateWorkedMinutes(weeklyPunches);
  const targetMinutesWeek = weeklyHoursTarget * 60;
  const balanceMinutesWeek = workedMinutesWeek - targetMinutesWeek;
  const weekProgress = Math.min((workedMinutesWeek / targetMinutesWeek) * 100, 100);

  // Mês
  const monthlyPunches = getPunchesForCurrentMonth(allPunches);
  const workedMinutesMonth = calculateWorkedMinutes(monthlyPunches);
  const targetMinutesMonth = calculateMonthlyTarget(weeklyHoursTarget);
  const balanceMinutesMonth = workedMinutesMonth - targetMinutesMonth;
  const monthProgress = Math.min((workedMinutesMonth / targetMinutesMonth) * 100, 100);

  const getBalanceClass = (balance) => balance >= 0 ? 'text-success' : 'text-danger';
  const getBalanceSign = (balance) => balance > 0 ? '+' : '';

  return (
    <div className="dashboard-container animate-fade-in">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
      </header>

      <section className="dashboard-section glass-card">
        <div className="section-title">
          <Calendar size={20} className="text-primary" />
          <h2>Semana Atual</h2>
        </div>
        
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">Trabalhado</span>
            <span className="stat-value">{formatMinutesAsHours(workedMinutesWeek)}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Meta</span>
            <span className="stat-value">{weeklyHoursTarget}h</span>
          </div>
          <div className="stat-card stat-full">
            <span className="stat-label">Saldo da Semana</span>
            <span className={`stat-value ${getBalanceClass(balanceMinutesWeek)}`}>
              {getBalanceSign(balanceMinutesWeek)}{formatMinutesAsHours(balanceMinutesWeek)}
            </span>
          </div>
        </div>

        <div className="progress-container">
          <div className="progress-bar-bg">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${weekProgress}%`, backgroundColor: 'var(--primary-color)' }}
            ></div>
          </div>
          <span className="progress-text">{Math.round(weekProgress)}% da meta</span>
        </div>
      </section>

      <section className="dashboard-section glass-card">
        <div className="section-title">
          <BarChart3 size={20} className="text-primary" />
          <h2>Mês Atual</h2>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">Acumulado</span>
            <span className="stat-value">{formatMinutesAsHours(workedMinutesMonth)}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Meta do Mês</span>
            <span className="stat-value">{formatMinutesAsHours(targetMinutesMonth)}</span>
          </div>
          <div className="stat-card stat-full">
            <span className="stat-label">Saldo do Mês</span>
            <span className={`stat-value ${getBalanceClass(balanceMinutesMonth)}`}>
              {getBalanceSign(balanceMinutesMonth)}{formatMinutesAsHours(balanceMinutesMonth)}
            </span>
          </div>
        </div>

        <div className="progress-container">
          <div className="progress-bar-bg">
            <div 
              className="progress-bar-fill" 
              style={{ 
                width: `${monthProgress}%`, 
                backgroundColor: balanceMinutesMonth >= 0 ? 'var(--success-color)' : 'var(--warning-color)' 
              }}
            ></div>
          </div>
          <span className="progress-text">{Math.round(monthProgress)}% da meta</span>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
