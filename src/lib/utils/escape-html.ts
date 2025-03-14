/**
 * Utilitaire pour échapper les caractères HTML dangereux dans les chaînes de caractères
 * 
 * @param unsafe Chaîne de caractères potentiellement non échappée
 * @returns Chaîne de caractères avec les caractères spéciaux échappés
 */
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Convertit toutes les apostrophes simples en entités HTML pour éviter 
 * les problèmes de compilation avec ESLint dans les composants JSX
 * 
 * @param text Texte contenant des apostrophes
 * @returns Texte avec apostrophes échappées
 */
export function safeApostrophe(text: string): string {
  return text.replace(/'/g, "&apos;");
} 