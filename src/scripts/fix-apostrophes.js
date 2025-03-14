/**
 * Script pour corriger automatiquement les apostrophes non échappées dans les fichiers JSX/TSX
 * 
 * Exécution: node src/scripts/fix-apostrophes.js
 * 
 * Ce script:
 * 1. Trouve tous les fichiers .tsx dans le projet
 * 2. Recherche les apostrophes non échappées dans les attributs JSX et le texte entre balises
 * 3. Les remplace par &apos;
 * 4. Enregistre les modifications
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// Répertoire racine du projet
const ROOT_DIR = path.resolve(__dirname, '../..');
// Extensions de fichiers à traiter
const EXTENSIONS = ['.tsx', '.jsx'];
// Répertoires à exclure
const EXCLUDED_DIRS = ['node_modules', '.next', 'out', 'build', 'dist'];

/**
 * Recherche récursivement tous les fichiers avec les extensions spécifiées
 */
async function findFiles(dir, extensions) {
  const files = [];
  
  async function traverse(directory) {
    const entries = await readdir(directory);
    
    for (const entry of entries) {
      // Ignorer les répertoires exclus
      if (EXCLUDED_DIRS.includes(entry)) continue;
      
      const fullPath = path.join(directory, entry);
      const stats = await stat(fullPath);
      
      if (stats.isDirectory()) {
        await traverse(fullPath);
      } else if (stats.isFile() && extensions.includes(path.extname(entry))) {
        files.push(fullPath);
      }
    }
  }
  
  await traverse(dir);
  return files;
}

/**
 * Détecte et corrige les apostrophes non échappées dans le contenu JSX
 */
function fixApostrophes(content) {
  // Regex pour détecter les balises JSX
  const jsxRegex = /<[^>]+>([^<]+)<\/[^>]+>/g;
  // Regex pour détecter les attributs JSX
  const attrRegex = /(\w+)=["']([^"']+)["']/g;
  
  // Remplacer les apostrophes dans le texte entre balises JSX
  let fixedContent = content.replace(jsxRegex, (match, text) => {
    // Remplacer les apostrophes par &apos; dans le texte
    const fixedText = text.replace(/'/g, '&apos;');
    // Reconstruire la balise
    return match.replace(text, fixedText);
  });
  
  // Remplacer les apostrophes dans les attributs
  fixedContent = fixedContent.replace(attrRegex, (match, attr, value) => {
    // Remplacer les apostrophes par &apos; dans la valeur
    const fixedValue = value.replace(/'/g, '&apos;');
    // Reconstruire l'attribut
    return `${attr}="${fixedValue}"`;
  });
  
  return fixedContent;
}

/**
 * Fonction principale
 */
async function main() {
  try {
    console.log('Recherche de fichiers à corriger...');
    const files = await findFiles(ROOT_DIR, EXTENSIONS);
    console.log(`${files.length} fichiers trouvés.`);
    
    let correctedFiles = 0;
    
    for (const file of files) {
      // Lire le contenu du fichier
      const content = await readFile(file, 'utf8');
      // Corriger les apostrophes
      const fixedContent = fixApostrophes(content);
      
      // Si des modifications ont été apportées, sauvegarder le fichier
      if (content !== fixedContent) {
        await writeFile(file, fixedContent, 'utf8');
        correctedFiles++;
        console.log(`Corrigé: ${file}`);
      }
    }
    
    console.log(`\nTerminé! ${correctedFiles} fichiers corrigés.`);
    
  } catch (error) {
    console.error('Erreur:', error);
    process.exit(1);
  }
}

// Exécuter le script
main();
