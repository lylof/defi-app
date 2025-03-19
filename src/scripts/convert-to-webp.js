/**
 * Script pour convertir les images en format WebP
 * 
 * Exécution: node src/scripts/convert-to-webp.js
 * 
 * Ce script:
 * 1. Trouve toutes les images (jpg, png, jpeg) dans le répertoire public
 * 2. Convertit ces images en format WebP
 * 3. Les enregistre dans le même répertoire avec l'extension .webp
 * 
 * Prérequis: Installer sharp
 * npm install sharp
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const sharp = require('sharp');

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const writeFile = promisify(fs.writeFile);

// Répertoire racine des images
const PUBLIC_DIR = path.resolve(__dirname, '../../public');
// Extensions d'images à traiter
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png'];
// Répertoires à exclure
const EXCLUDED_DIRS = ['node_modules', '.next', 'out', 'build', 'dist'];

/**
 * Recherche récursivement toutes les images avec les extensions spécifiées
 */
async function findImages(dir, extensions) {
  const images = [];
  
  async function traverse(directory) {
    const entries = await readdir(directory);
    
    for (const entry of entries) {
      // Ignorer les répertoires exclus
      if (EXCLUDED_DIRS.includes(entry)) continue;
      
      const fullPath = path.join(directory, entry);
      const stats = await stat(fullPath);
      
      if (stats.isDirectory()) {
        await traverse(fullPath);
      } else if (stats.isFile() && extensions.includes(path.extname(entry).toLowerCase())) {
        images.push(fullPath);
      }
    }
  }
  
  await traverse(dir);
  return images;
}

/**
 * Convertit une image en WebP
 */
async function convertToWebP(imagePath) {
  try {
    // Générer le nouveau chemin avec extension .webp
    const dirName = path.dirname(imagePath);
    const baseName = path.basename(imagePath, path.extname(imagePath));
    const webpPath = path.join(dirName, `${baseName}.webp`);
    
    // Ne pas reconvertir si le fichier WebP existe déjà
    if (fs.existsSync(webpPath)) {
      console.log(`WebP existe déjà: ${webpPath}`);
      return { original: imagePath, webp: webpPath, skipped: true };
    }
    
    // Convertir l'image en WebP
    await sharp(imagePath)
      .webp({ quality: 80 }) // Qualité de 80%
      .toFile(webpPath);
    
    console.log(`Converti: ${imagePath} -> ${webpPath}`);
    return { original: imagePath, webp: webpPath, success: true };
  } catch (error) {
    console.error(`Erreur lors de la conversion de ${imagePath}:`, error);
    return { original: imagePath, error: error.message, success: false };
  }
}

/**
 * Fonction principale
 */
async function main() {
  try {
    console.log('Recherche d\'images à convertir...');
    const images = await findImages(PUBLIC_DIR, IMAGE_EXTENSIONS);
    console.log(`${images.length} images trouvées.`);
    
    const results = {
      total: images.length,
      success: 0,
      skipped: 0,
      failed: 0,
      details: []
    };
    
    for (const image of images) {
      const result = await convertToWebP(image);
      results.details.push(result);
      
      if (result.success) results.success++;
      else if (result.skipped) results.skipped++;
      else results.failed++;
    }
    
    console.log('\nRésumé:');
    console.log(`Total: ${results.total}`);
    console.log(`Succès: ${results.success}`);
    console.log(`Ignorés (déjà existants): ${results.skipped}`);
    console.log(`Échecs: ${results.failed}`);
    
    if (results.failed > 0) {
      console.log('\nÉchecs:');
      results.details
        .filter(d => !d.success && !d.skipped)
        .forEach(d => console.log(`- ${d.original}: ${d.error}`));
    }
    
  } catch (error) {
    console.error('Erreur:', error);
    process.exit(1);
  }
}

// Exécuter la fonction principale
main(); 