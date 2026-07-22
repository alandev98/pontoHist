import { format, differenceInMinutes, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, eachDayOfInterval, isWeekend } from 'date-fns';

/**
 * Retorna a data no formato YYYY-MM-DD
 */
export function getCurrentDateString(date = new Date()) {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Formata um timestamp para HH:mm
 */
export function formatTime(timestamp) {
  return format(new Date(timestamp), 'HH:mm');
}

/**
 * Calcula o tempo total trabalhado no dia baseado nas batidas
 * Assume que as batidas vêm em pares de (Entrada -> Saída)
 */
export function calculateWorkedMinutes(punches) {
  // Agrupar batidas por dia (dateString) para evitar deslocamentos caso algum dia tenha batidas ímpares
  const punchesByDay = {};
  for (const punch of punches) {
    const day = punch.dateString || format(new Date(punch.timestamp), 'yyyy-MM-dd');
    if (!punchesByDay[day]) {
      punchesByDay[day] = [];
    }
    punchesByDay[day].push(punch);
  }

  let totalMinutes = 0;

  for (const day in punchesByDay) {
    const dayPunches = punchesByDay[day];
    // Ordenar por horário para garantir a sequência
    const sortedPunches = [...dayPunches].sort((a, b) => a.timestamp - b.timestamp);

    for (let i = 0; i < sortedPunches.length; i += 2) {
      const start = sortedPunches[i];
      const end = sortedPunches[i + 1];

      if (start && end) {
        totalMinutes += differenceInMinutes(new Date(end.timestamp), new Date(start.timestamp));
      }
    }
  }

  return totalMinutes;
}

/**
 * Formata os minutos no formato HH:mm (ex: 130 min -> 02:10)
 */
export function formatMinutesAsHours(totalMinutes) {
  const hours = Math.floor(Math.abs(totalMinutes) / 60);
  const minutes = Math.abs(totalMinutes) % 60;
  
  const sign = totalMinutes < 0 ? '-' : '';
  
  return `${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Filtra batidas que ocorreram na semana atual
 */
export function getPunchesForCurrentWeek(punches, currentDate = new Date()) {
  const start = startOfWeek(currentDate, { weekStartsOn: 1 }); // Começa na segunda-feira
  const end = endOfWeek(currentDate, { weekStartsOn: 1 });
  
  return punches.filter(p => isWithinInterval(new Date(p.timestamp), { start, end }));
}

/**
 * Filtra batidas que ocorreram no mês atual
 */
export function getPunchesForCurrentMonth(punches, currentDate = new Date()) {
  const start = startOfMonth(currentDate);
  const end = endOfMonth(currentDate);
  
  return punches.filter(p => isWithinInterval(new Date(p.timestamp), { start, end }));
}

/**
 * Calcula a meta de minutos a trabalhar no mês (baseado em seg-sex)
 */
export function calculateMonthlyTarget(weeklyHours, currentDate = new Date()) {
  const start = startOfMonth(currentDate);
  const end = endOfMonth(currentDate);
  
  const daysInMonth = eachDayOfInterval({ start, end });
  const workingDays = daysInMonth.filter(day => !isWeekend(day)).length;
  
  const dailyHoursTarget = weeklyHours / 5;
  return Math.round(workingDays * dailyHoursTarget * 60);
}

