/**
 * Script pour remplacer les balises <img> par le composant OptimizedImage
 * 
 * Exécution: node src/scripts/replace-img-tags.js
 * 
 * Ce script:
 * 1. Trouve tous les fichiers .tsx et .jsx dans le projet
 * 2. Recherche les balises <img> et les remplace par <OptimizedImage>
 * 3. Ajoute l'import du composant OptimizedImage si nécessaire
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
 * Remplace les balises <img> par <OptimizedImage>
 */
function replaceImgTags(content) {
  // Vérifier si le fichier contient des balises <img>
  if (!content.includes('<img')) {
    return { content, modified: false };
  }
  
  // Regex pour détecter les balises <img>
  const imgRegex = /<img\s+([^>]*)>/g;
  
  // Remplacer les balises <img> par <OptimizedImage>
  let modifiedContent = content.replace(imgRegex, (match, attributes) => {
    // Extraire les attributs
    const srcMatch = attributes.match(/src=["']([^"']*)["']/);
    const altMatch = attributes.match(/alt=["']([^"']*)["']/);
    const widthMatch = attributes.match(/width=["']?(\d+)["']?/);
    const heightMatch = attributes.match(/height=["']?(\d+)["']?/);
    const classNameMatch = attributes.match(/className=["']([^"']*)["']/);
    
    // Vérifier si src existe
    if (!srcMatch) {
      return match; // Conserver la balise originale si pas de src
    }
    
    // Construire les attributs pour OptimizedImage
    const src = srcMatch[1];
    const alt = altMatch ? altMatch[1] : 'Image';
    const width = widthMatch ? widthMatch[1] : '500';
    const height = heightMatch ? heightMatch[1] : '300';
    const className = classNameMatch ? ` className="${classNameMatch[1]}"` : '';
    
    // Autres attributs à conserver
    const otherAttributes = attributes
      .replace(/src=["'][^"']*["']/, '')
      .replace(/alt=["'][^"']*["']/, '')
      .replace(/width=["']?\d+["']?/, '')
      .replace(/height=["']?\d+["']?/, '')
      .replace(/className=["'][^"']*["']/, '')
      .trim();
    
    // Construire la nouvelle balise
    return `<OptimizedImage
      src="${src}"
      alt="${alt}"
      width={${width}}
      height={${height}}${className}
      ${otherAttributes}
    />`;
  });
  
  // Ajouter l'import si nécessaire et si des modifications ont été faites
  if (modifiedContent !== content && !modifiedContent.includes("import { OptimizedImage }")) {
    modifiedContent = `import { OptimizedImage } from '@/components/ui/image';\n${modifiedContent}`;
  }
  
  return { content: modifiedContent, modified: modifiedContent !== content };
}

/**
 * Fonction principale
 */
async function main() {
  try {
    console.log('Recherche de fichiers à modifier...');
    const files = await findFiles(ROOT_DIR, EXTENSIONS);
    console.log(`${files.length} fichiers trouvés.`);
    
    let modifiedFiles = 0;
    
    for (const file of files) {
      // Lire le contenu du fichier
      const content = await readFile(file, 'utf8');
      // Remplacer les balises <img>
      const { content: modifiedContent, modified } = replaceImgTags(content);
      
      // Si des modifications ont été apportées, sauvegarder le fichier
      if (modified) {
        await writeFile(file, modifiedContent, 'utf8');
        modifiedFiles++;
        console.log(`Modifié: ${file}`);
      }
    }
    
    console.log(`\nTerminé! ${modifiedFiles} fichiers modifiés.`);
    
  } catch (error) {
    console.error('Erreur:', error);
    process.exit(1);
  }
}

// Exécuter le script
main(); 