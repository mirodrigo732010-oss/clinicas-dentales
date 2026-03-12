// Helper para manejar zona horaria de México en frontend y backend

/**
 * Obtiene la fecha actual en zona horaria de México City
 * Retorna formato YYYY-MM-DD
 */
export function getMexicoDate(): string {
  const now = new Date();
  const mexicoTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Mexico_City' }));
  const year = mexicoTime.getFullYear();
  const month = String(mexicoTime.getMonth() + 1).padStart(2, '0');
  const day = String(mexicoTime.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Obtiene la hora actual en zona horaria de México City
 * Retorna formato HH:MM
 */
export function getMexicoTime(): string {
  const now = new Date();
  const mexicoTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Mexico_City' }));
  const hours = String(mexicoTime.getHours()).padStart(2, '0');
  const minutes = String(mexicoTime.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Obtiene los minutos totales desde medianoche en hora de México
 */
export function getMexicoMinutes(): number {
  const now = new Date();
  const mexicoTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Mexico_City' }));
  return mexicoTime.getHours() * 60 + mexicoTime.getMinutes();
}

/**
 * Convierte una fecha string YYYY-MM-DD a formato legible en español
 */
export function formatDateSpanish(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  // Crear fecha a mediodía para evitar problemas de zona horaria
  const date = new Date(year, month - 1, day, 12, 0, 0);
  return date.toLocaleDateString('es-ES', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long',
    year: 'numeric'
  });
}

/**
 * Formatea fecha corta
 */
export function formatDateShort(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day, 12, 0, 0);
  return date.toLocaleDateString('es-ES', { 
    day: 'numeric', 
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Obtiene el día de la semana (0 = Domingo, 1 = Lunes, etc.)
 */
export function getDayOfWeek(dateStr: string): number {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day, 12, 0, 0);
  return date.getDay();
}

/**
 * Nombres de días en español
 */
export const dayNames: Record<number, string> = {
  0: 'Domingo',
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado'
};

/**
 * Nombres cortos de días en español
 */
export const dayNamesShort: Record<number, string> = {
  0: 'Dom',
  1: 'Lun',
  2: 'Mar',
  3: 'Mié',
  4: 'Jue',
  5: 'Vie',
  6: 'Sáb'
};
