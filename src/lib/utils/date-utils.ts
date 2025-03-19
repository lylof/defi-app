/**
 * Utilitaires pour travailler avec les dates
 */

/**
 * Formate la durée entre deux dates en jours
 * @param startDate Date de début
 * @param endDate Date de fin
 * @returns Une chaîne formatée (ex: "3 jours")
 */
export function formatDuration(startDate: Date, endDate: Date): string {
  const diffInDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  return `${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
}

/**
 * Vérifie si une date est aujourd'hui
 * @param date Date à vérifier
 * @returns Vrai si la date est aujourd'hui
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Vérifie si une date est dans le futur
 * @param date Date à vérifier
 * @returns Vrai si la date est dans le futur
 */
export function isFuture(date: Date): boolean {
  return date.getTime() > Date.now();
}

/**
 * Vérifie si une date est dans le passé
 * @param date Date à vérifier
 * @returns Vrai si la date est dans le passé
 */
export function isPast(date: Date): boolean {
  return date.getTime() < Date.now();
} 