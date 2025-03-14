/**
 * Script pour exécuter les corrections avant le build
 * 
 * Exécution: node src/scripts/build-with-fixes.js
 * 
 * Ce script:
 * 1. Exécute le script de correction des apostrophes
 * 2. Exécute le script de remplacement des balises img
 * 3. Lance le build de production
 */

const { spawn } = require('child_process');
const path = require('path');

// Chemin vers les scripts
const APOSTROPHES_SCRIPT = path.resolve(__dirname, 'fix-apostrophes.js');
const IMG_TAGS_SCRIPT = path.resolve(__dirname, 'replace-img-tags.js');

/**
 * Exécute une commande et retourne une promesse
 */
function executeCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`\n> Exécution de: ${command} ${args.join(' ')}\n`);
    
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`La commande a échoué avec le code ${code}`));
      }
    });
    
    child.on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Fonction principale
 */
async function main() {
  try {
    console.log('=== Démarrage du processus de build avec corrections automatiques ===');
    
    // Étape 1: Corriger les apostrophes non échappées
    console.log('\n=== Étape 1: Correction des apostrophes non échappées ===');
    await executeCommand('node', [APOSTROPHES_SCRIPT]);
    
    // Étape 2: Remplacer les balises img par OptimizedImage
    console.log('\n=== Étape 2: Remplacement des balises img ===');
    await executeCommand('node', [IMG_TAGS_SCRIPT]);
    
    // Étape 3: Lancer le build de production
    console.log('\n=== Étape 3: Build de production ===');
    await executeCommand('npm', ['run', 'build']);
    
    console.log('\n=== Build avec corrections terminé avec succès! ===');
    
  } catch (error) {
    console.error('\n❌ Erreur lors du processus de build:', error);
    process.exit(1);
  }
}

// Exécuter le script
main(); 