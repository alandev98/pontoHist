import React, { useState, useEffect } from 'react';
import { db, defaultSettings } from '../db';
import { Save, Upload, Download, Trash2, Plus } from 'lucide-react';
import './Settings.css';

function Settings() {
  const [weeklyHours, setWeeklyHours] = useState(44);
  const [punchCycle, setPunchCycle] = useState([]);
  const [saveStatus, setSaveStatus] = useState('');

  // Carregar dados
  useEffect(() => {
    db.settings.get('weeklyHours').then(res => setWeeklyHours(res?.value || 44));
    db.settings.get('punchCycle').then(res => setPunchCycle(res?.value || defaultSettings.punchCycle));
  }, []);

  const handleSave = async () => {
    await db.settings.put({ key: 'weeklyHours', value: Number(weeklyHours) });
    await db.settings.put({ key: 'punchCycle', value: punchCycle });
    setSaveStatus('Salvo com sucesso!');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const handleCycleChange = (index, value) => {
    const newCycle = [...punchCycle];
    newCycle[index].label = value;
    setPunchCycle(newCycle);
  };

  const removeCycleItem = (index) => {
    const newCycle = [...punchCycle];
    newCycle.splice(index, 1);
    setPunchCycle(newCycle);
  };

  const addCycleItem = () => {
    setPunchCycle([...punchCycle, { label: 'Novo Ponto', type: 'extra' }]);
  };

  // Backup e Restauração
  const exportBackup = async () => {
    const punches = await db.punches.toArray();
    const settings = await db.settings.toArray();
    
    const backupData = { punches, settings };
    const blob = new Blob([JSON.stringify(backupData)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ponto_backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importBackup = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.punches) await db.punches.bulkPut(data.punches);
        if (data.settings) await db.settings.bulkPut(data.settings);
        
        alert('Backup restaurado com sucesso! O aplicativo será recarregado.');
        window.location.reload();
      } catch (err) {
        alert('Erro ao restaurar backup. Verifique o arquivo.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="settings-container animate-fade-in">
      <header className="settings-header">
        <h1>Configurações</h1>
        <button className="btn btn-primary btn-save" onClick={handleSave}>
          <Save size={18} /> Salvar
        </button>
      </header>

      {saveStatus && <div className="save-toast">{saveStatus}</div>}

      <section className="settings-section glass-card">
        <h2>Geral</h2>
        <div className="form-group">
          <label>Meta de Horas Semanais</label>
          <input 
            type="number" 
            className="input-field" 
            value={weeklyHours} 
            onChange={(e) => setWeeklyHours(e.target.value)} 
            min="1" max="168"
          />
        </div>
      </section>

      <section className="settings-section glass-card">
        <h2>Ciclo de Pontos no Dia</h2>
        <p className="section-desc">Defina as batidas que aparecem em sequência. Você pode adicionar quantas quiser.</p>
        
        <div className="cycle-list">
          {punchCycle.map((item, index) => (
            <div key={index} className="cycle-item">
              <span className="cycle-number">{index + 1}</span>
              <input 
                type="text" 
                className="input-field cycle-input" 
                value={item.label}
                onChange={(e) => handleCycleChange(index, e.target.value)}
              />
              <button className="btn-icon btn-danger" onClick={() => removeCycleItem(index)}>
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        <button className="btn btn-outline btn-add" onClick={addCycleItem}>
          <Plus size={18} /> Adicionar Ponto ao Ciclo
        </button>
      </section>

      <section className="settings-section glass-card">
        <h2>Backup e Dados</h2>
        <div className="backup-actions">
          <button className="btn btn-outline" onClick={exportBackup}>
            <Download size={18} /> Exportar Backup (.json)
          </button>
          
          <label className="btn btn-outline btn-upload">
            <Upload size={18} /> Restaurar Backup
            <input type="file" accept=".json" onChange={importBackup} hidden />
          </label>
        </div>
      </section>
    </div>
  );
}

export default Settings;
