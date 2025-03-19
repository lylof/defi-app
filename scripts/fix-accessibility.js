#!/usr/bin/env node

/**
 * Script de correction automatique des problèmes d'accessibilité basiques
 * 
 * Ce script parcourt les fichiers du projet et applique automatiquement
 * des corrections pour les problèmes d'accessibilité les plus courants.
 * 
 * Usage:
 *   node scripts/fix-accessibility.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const chalk = require('chalk');

// Configuration
const CONFIG = {
  componentDirs: ['src/components', 'src/app'],
  fileExtensions: ['tsx', 'jsx'],
  ignorePatterns: ['node_modules', '.next', 'public'],
  fixPatterns: {
    // Ajouter aria-hidden="true" aux SVG
    svgWithoutAriaHidden: {
      pattern: /<svg(?![^>]*aria-hidden)[^>]*>/g,
      replacement: (match) => match.replace('<svg', '<svg aria-hidden="true"')
    },
    // Ajouter aria-label aux boutons qui contiennent des icônes Lucide
    buttonWithIconWithoutAriaLabel: {
      pattern: /<button(?![^>]*aria-label)[^>]*>[^<]*(?:<[^>]+>[^<]*)*<(?:X|Search|Trash|Edit|Plus|Minus|ChevronDown|ChevronUp|ChevronLeft|ChevronRight|Menu|Settings|User|Bell|Calendar|Clock|ArrowRight|ArrowLeft|ArrowUp|ArrowDown)[^>]*>[^<]*(?:<\/[^>]+>[^<]*)*<\/button>/g,
      replacement: (match, filename) => {
        // Détecter l'icône pour générer un aria-label approprié
        const iconMatch = match.match(/<(X|Search|Trash|Edit|Plus|Minus|ChevronDown|ChevronUp|ChevronLeft|ChevronRight|Menu|Settings|User|Bell|Calendar|Clock|ArrowRight|ArrowLeft|ArrowUp|ArrowDown)[^>]*>/);
        let iconName = iconMatch ? iconMatch[1] : 'action';
        let ariaLabel = '';
        
        // Mapper les icônes aux actions
        const iconToAction = {
          X: 'Fermer',
          Search: 'Rechercher',
          Trash: 'Supprimer',
          Edit: 'Modifier',
          Plus: 'Ajouter',
          Minus: 'Réduire',
          ChevronDown: 'Développer',
          ChevronUp: 'Réduire',
          ChevronLeft: 'Précédent',
          ChevronRight: 'Suivant',
          Menu: 'Menu',
          Settings: 'Paramètres',
          User: 'Profil utilisateur',
          Bell: 'Notifications',
          Calendar: 'Calendrier',
          Clock: 'Horloge',
          ArrowRight: 'Suivant',
          ArrowLeft: 'Précédent',
          ArrowUp: 'Haut',
          ArrowDown: 'Bas'
        };
        
        ariaLabel = iconToAction[iconName] || `Action ${iconName}`;
        
        // Ajouter aria-label à la balise button
        return match.replace('<button', `<button aria-label="${ariaLabel}"`);
      }
    },
    // Ajouter id pour les champs de formulaire sans id
    formFieldWithoutId: {
      pattern: /<(?:input|select|textarea)(?![^>]*id=)[^>]*>/g,
      replacement: (match, filename) => {
        // Générer un ID basé sur le type et le nom du fichier
        const typeMatch = match.match(/type=["']([^"']+)["']/);
        const nameMatch = match.match(/name=["']([^"']+)["']/);
        const placeholderMatch = match.match(/placeholder=["']([^"']+)["']/);
        
        const type = typeMatch ? typeMatch[1] : 'field';
        const name = nameMatch ? nameMatch[1] : '';
        const placeholder = placeholderMatch ? placeholderMatch[1] : '';
        
        const fieldName = name || placeholder || type;
        const id = `${fieldName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Math.random().toString(36).substring(2, 7)}`;
        
        // Ajouter id à la balise
        return match.replace('<', `<id="${id}" `);
      }
    }
  }
};

// Globaux
let filesModified = 0;
let fixesApplied = 0;

/**
 * Récupère la liste des fichiers à analyser
 */
function getFilesToAnalyze() {
  let files = [];
  
  // Pour chaque répertoire de composants à vérifier
  CONFIG.componentDirs.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    
    if (fs.existsSync(fullPath)) {
      const pattern = `${fullPath}/**/*.{${CONFIG.fileExtensions.join(',')}}`;
      const matches = glob.sync(pattern, { 
        ignore: CONFIG.ignorePatterns.map(p => `**/${p}/**`)
      });
      
      files = [...files, ...matches];
    } else {
      console.log(chalk.yellow(`⚠️ Le répertoire ${fullPath} n'existe pas et sera ignoré.`));
    }
  });
  
  return files;
}

/**
 * Applique les corrections automatiques à un fichier
 */
function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.relative(process.cwd(), filePath);
    let fileModified = false;
    
    console.log(chalk.cyan(`\nTraitement de ${fileName}`));
    
    // Pour chaque pattern de correction
    Object.entries(CONFIG.fixPatterns).forEach(([fixName, { pattern, replacement }]) => {
      const originalContent = content;
      
      // Appliquer le remplacement
      content = content.replace(pattern, (match) => {
        fixesApplied++;
        return typeof replacement === 'function' 
          ? replacement(match, fileName) 
          : replacement;
      });
      
      // Vérifier si des modifications ont été apportées
      if (content !== originalContent) {
        console.log(chalk.green(`  ✓ Correction appliquée: ${fixName}`));
        fileModified = true;
      }
    });
    
    // Enregistrer le fichier si des modifications ont été effectuées
    if (fileModified) {
      fs.writeFileSync(filePath, content, 'utf8');
      filesModified++;
      console.log(chalk.green(`  💾 Fichier ${fileName} enregistré avec les corrections`));
    } else {
      console.log(chalk.gray(`  ℹ️ Aucune correction nécessaire`));
    }
  } catch (error) {
    console.log(chalk.red(`  ❌ Erreur lors du traitement de ${filePath}: ${error.message}`));
  }
}

/**
 * Programme principal
 */
function main() {
  console.log(chalk.blue.bold('=== Correction automatique d\'accessibilité LPT Défis ==='));
  
  const files = getFilesToAnalyze();
  console.log(chalk.blue(`${files.length} fichiers à traiter...\n`));
  
  if (files.length === 0) {
    console.log(chalk.yellow('⚠️ Aucun fichier trouvé à traiter. Vérifiez les chemins et les patterns.'));
    return;
  }
  
  files.forEach(fixFile);
  
  // Rapport final
  console.log(chalk.blue.bold('\n=== Rapport de correction ==='));
  console.log(chalk.blue(`Fichiers traités: ${files.length}`));
  console.log(`Fichiers modifiés: ${filesModified}`);
  console.log(`Corrections appliquées: ${fixesApplied}`);
  
  if (filesModified > 0) {
    console.log(chalk.green('\n✨ Corrections d\'accessibilité terminées avec succès !'));
    console.log(chalk.yellow('\nProchaines étapes recommandées:'));
    console.log(chalk.gray('1. Exécutez à nouveau l\'analyse d\'accessibilité pour vérifier les améliorations'));
    console.log(chalk.gray('2. Examinez manuellement les modifications pour vous assurer qu\'elles sont appropriées'));
    console.log(chalk.gray('3. Complétez les corrections qui nécessitent une intervention manuelle'));
  } else {
    console.log(chalk.yellow('\nAucune modification n\'a été effectuée. Cela peut indiquer:'));
    console.log(chalk.gray('- Les problèmes d\'accessibilité ont déjà été corrigés'));
    console.log(chalk.gray('- Les problèmes présents ne correspondent pas aux modèles de correction automatique'));
    console.log(chalk.gray('- Il y a une erreur dans les expressions régulières utilisées'));
  }
}

// Exécution du programme
main(); 