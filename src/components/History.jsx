import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { formatTime, calculateWorkedMinutes, formatMinutesAsHours } from '../utils/time';
import { Download, ChevronDown, ChevronUp, Pencil, Trash2, X } from 'lucide-react';
import { format } from 'date-fns';
import './History.css';

function History() {
  const [expandedDays, setExpandedDays] = useState({});
  const [editModal, setEditModal] = useState({ isOpen: false, punch: null, newTime: '' });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, day: null });

  // Buscar todos os pontos, ordenados por data (mais recente primeiro)
  const allPunches = useLiveQuery(() => db.punches.orderBy('timestamp').reverse().toArray());

  if (!allPunches) return <div className="p-4">Carregando histórico...</div>;

  // Agrupar por dia
  const grouped = allPunches.reduce((acc, punch) => {
    if (!acc[punch.dateString]) {
      acc[punch.dateString] = [];
    }
    acc[punch.dateString].push(punch);
    return acc;
  }, {});

  // Ordenar os dias do mais recente pro mais antigo
  const sortedDays = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  const toggleDay = (day) => {
    setExpandedDays(prev => ({ ...prev, [day]: !prev[day] }));
  };

  const handleDeleteDay = async (e, day) => {
    e.stopPropagation();
    setConfirmModal({ isOpen: true, day });
  };

  const confirmDeleteDay = async () => {
    if (confirmModal.day) {
      await db.punches.where('dateString').equals(confirmModal.day).delete();
      setConfirmModal({ isOpen: false, day: null });
    }
  };

  const openEditModal = (punch) => {
    setEditModal({ 
      isOpen: true, 
      punch, 
      newTime: format(new Date(punch.timestamp), 'HH:mm') 
    });
  };

  const saveEdit = async () => {
    const { punch, newTime } = editModal;
    if (!newTime) return;

    const [hours, minutes] = newTime.split(':');
    const date = new Date(punch.timestamp);
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    date.setSeconds(0);
    
    await db.punches.update(punch.id, { timestamp: date.getTime() });
    setEditModal({ isOpen: false, punch: null, newTime: '' });
  };

  const handleExportCSV = () => {
    if (!allPunches.length) return;

    const headers = ['Data', 'Hora', 'Tipo', 'Label'];
    const rows = allPunches.map(p => [
      p.dateString,
      formatTime(p.timestamp),
      p.type,
      p.label
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `historico_ponto_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="history-container animate-fade-in">
      <header className="history-header">
        <h1>Histórico</h1>
        <button className="btn btn-outline" onClick={handleExportCSV}>
          <Download size={18} />
          Exportar CSV
        </button>
      </header>

      <div className="days-list">
        {sortedDays.length === 0 && (
          <div className="empty-state">Nenhum registro encontrado.</div>
        )}

        {sortedDays.map(day => {
          // Os pontos de um dia específico vêm invertidos (por causa do .reverse() inicial),
          // então precisamos reverter para calcular corretamente as horas e mostrar em ordem cronológica
          const dayPunches = [...grouped[day]].reverse();
          const workedMins = calculateWorkedMinutes(dayPunches);
          const isExpanded = expandedDays[day];

          // Formatar data para exibição (ex: 25/10/2023)
          const [year, month, d] = day.split('-');
          const displayDate = `${d}/${month}/${year}`;

          return (
            <div key={day} className="day-card glass-card">
              <div className="day-header" onClick={() => toggleDay(day)}>
                <div className="day-info">
                  <span className="day-title">{displayDate}</span>
                  <span className="day-hours">{formatMinutesAsHours(workedMins)} trab.</span>
                </div>
                <div className="day-actions">
                  <button className="expand-btn" onClick={(e) => handleDeleteDay(e, day)}>
                    <Trash2 size={18} className="text-danger" />
                  </button>
                  <button className="expand-btn">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="day-punches">
                  {dayPunches.map((punch, idx) => (
                    <div key={punch.id} className="history-punch-item">
                      <span className="hp-number">{idx + 1}</span>
                      <span className="hp-label">{punch.label}</span>
                      <span className="hp-time">{formatTime(punch.timestamp)}</span>
                      <button className="expand-btn hp-edit" onClick={() => openEditModal(punch)}>
                        <Pencil size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {editModal.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-card animate-fade-in">
            <header className="modal-header">
              <h3>Editar Horário</h3>
              <button className="expand-btn" onClick={() => setEditModal({ isOpen: false, punch: null, newTime: '' })}>
                <X size={20} />
              </button>
            </header>
            <div className="modal-body">
              <p className="text-secondary">{editModal.punch?.label}</p>
              <input 
                type="time" 
                className="input-field mt-3" 
                value={editModal.newTime} 
                onChange={(e) => setEditModal({ ...editModal, newTime: e.target.value })} 
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={saveEdit}>
                Salvar Alteração
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmModal.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-card animate-fade-in">
            <header className="modal-header">
              <h3>Apagar Dia</h3>
              <button className="expand-btn" onClick={() => setConfirmModal({ isOpen: false, day: null })}>
                <X size={20} />
              </button>
            </header>
            <div className="modal-body text-center" style={{ textAlign: 'center' }}>
              <Trash2 size={48} className="text-danger" style={{ marginBottom: '15px', opacity: 0.8 }} />
              <p>Tem certeza que deseja apagar permanentemente todos os registros do dia <strong>{confirmModal.day.split('-').reverse().join('/')}</strong>?</p>
            </div>
            <div className="modal-footer" style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setConfirmModal({ isOpen: false, day: null })}>
                Cancelar
              </button>
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={confirmDeleteDay}>
                Apagar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default History;
