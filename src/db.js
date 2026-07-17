import Dexie from 'dexie';

export const db = new Dexie('PontoPWA');

db.version(1).stores({
  punches: '++id, timestamp, type, dateString', // dateString: YYYY-MM-DD para agrupar fácil
  settings: 'key, value'
});

// Valores padrão de configurações
export const defaultSettings = {
  weeklyHours: 44,
  punchCycle: [
    { label: 'Registrar Entrada', type: 'entrada' },
    { label: 'Saída para Almoço', type: 'almoco_ida' },
    { label: 'Retorno do Almoço', type: 'almoco_volta' },
    { label: 'Registrar Saída', type: 'saida' }
  ]
};

// Função helper para inicializar as configs padrão
export async function initSettings() {
  const currentWeeklyHours = await db.settings.get('weeklyHours');
  if (!currentWeeklyHours) {
    await db.settings.put({ key: 'weeklyHours', value: defaultSettings.weeklyHours });
  }

  const currentPunchCycle = await db.settings.get('punchCycle');
  if (!currentPunchCycle) {
    await db.settings.put({ key: 'punchCycle', value: defaultSettings.punchCycle });
  }
}
