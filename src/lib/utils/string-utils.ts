/**
 * Utilitaires pour travailler avec les chaînes de caractères
 */
 
/**
 * Mettre en majuscule la première lettre d'une chaîne
 * @param str La chaîne à capitaliser
 * @returns La chaîne avec la première lettre en majuscule
 */
export function capitalize(str: string): string {
  if (!str || typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Tronquer une chaîne à une longueur donnée
 * @param str La chaîne à tronquer
 * @param length La longueur maximale
 * @param suffix Le suffixe à ajouter (par défaut "...")
 * @returns La chaîne tronquée
 */
export function truncate(str: string, length: number, suffix: string = '...'): string {
  if (!str || typeof str !== 'string') return '';
  if (str.length <= length) return str;
  return str.substring(0, length) + suffix;
}

/**
 * Générer des initiales à partir d'un nom complet
 * @param name Le nom complet
 * @returns Les initiales (ex: "JD" pour "John Doe")
 */
export function getInitials(name: string): string {
  if (!name || typeof name !== 'string') return '';
  
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Slugifier une chaîne (pour les URLs)
 * @param str La chaîne à slugifier
 * @returns La chaîne slugifiée
 */
export function slugify(str: string): string {
  if (!str || typeof str !== 'string') return '';
  
  return str
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s-]+/g, '-');
} 