#!/usr/bin/env node

/**
 * Script d'analyse d'accessibilité pour LPT Défis
 * 
 * Ce script parcourt les fichiers de composants React pour identifier
 * les problèmes d'accessibilité courants et suggérer des corrections.
 * 
 * Usage:
 *   node scripts/accessibility-checker.js
 *   node scripts/accessibility-checker.js --fix
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
  rules: {
    imgMissingAlt: {
      pattern: /<img(?![^>]*alt=)[^>]*>/g,
      message: 'Image sans attribut alt',
      suggestion: 'Ajouter alt="description de l\'image" ou alt="" si décorative'
    },
    buttonWithoutAriaLabel: {
      pattern: /<button(?![^>]*aria-label)[^>]*>[^<]*(?:<[^>]+>[^<]*)*<\/button>/g,
      message: 'Bouton sans texte visible ou aria-label',
      suggestion: 'Ajouter aria-label="description de l\'action"'
    },
    svgWithoutAriaHidden: {
      pattern: /<svg(?![^>]*aria-hidden)[^>]*>/g,
      message: 'SVG décoratif sans aria-hidden',
      suggestion: 'Ajouter aria-hidden="true" pour les icônes décoratives'
    },
    divWithClickHandler: {
      pattern: /<div[^>]*onClick[^>]*>[^<]*(?:<[^>]+>[^<]*)*<\/div>/g,
      message: 'Div avec gestionnaire de clic sans rôle',
      suggestion: 'Utiliser <button> ou ajouter role="button" tabIndex={0} et gérer les événements clavier'
    },
    formWithoutLabels: {
      pattern: /<(?:input|select|textarea)(?![^>]*id=)[^>]*>/g,
      message: 'Champ de formulaire sans id pour association avec label',
      suggestion: 'Ajouter id="nom-unique" et <label htmlFor="nom-unique">'
    },
    nonSemanticHeader: {
      pattern: /<div[^>]*className="[^"]*(?:header|title|heading)[^"]*"[^>]*>[^<]*(?:<[^>]+>[^<]*)*<\/div>/g,
      message: 'Titre potentiel sans balise de titre sémantique',
      suggestion: 'Utiliser <h1>-<h6> selon le niveau hiérarchique'
    },
    colorOnlyInfo: {
      pattern: /(?:danger|success|warning|error|valid)Color/g,
      message: 'Information transmise uniquement par la couleur',
      suggestion: 'Ajouter un texte ou une icône pour compléter l\'information visuelle'
    },
    positiveTabindex: {
      pattern: /tabIndex=["']\d+["']/g,
      message: 'Indice de tabulation positif',
      suggestion: 'Éviter tabIndex positif, réorganiser le DOM pour un ordre logique'
    }
  }
};

// Globaux
let issuesFound = 0;
let filesChecked = 0;
let filesFlagged = 0;
const fixMode = process.argv.includes('--fix');

/**
 * Récupère la liste des fichiers à analyser
 */
function getFilesToAnalyze() {
  // Liste directement tous les fichiers .tsx et .jsx dans les répertoires src/components et src/app
  let files = [];
  
  // Pour chaque répertoire de composants à vérifier
  CONFIG.componentDirs.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    
    // Vérifier si le répertoire existe avant de continuer
    if (fs.existsSync(fullPath)) {
      // Recherche récursive pour trouver tous les fichiers correspondants
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
 * Analyse un fichier pour trouver des problèmes d'accessibilité
 */
function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.relative(process.cwd(), filePath);
    let fileHasIssues = false;
    
    console.log(chalk.cyan(`\nAnalyse de ${fileName}`));
    
    Object.entries(CONFIG.rules).forEach(([ruleName, rule]) => {
      const matches = [...content.matchAll(rule.pattern)];
      
      if (matches.length > 0) {
        if (!fileHasIssues) {
          fileHasIssues = true;
          filesFlagged++;
        }
        
        console.log(chalk.yellow(`  ❗ ${rule.message} (${matches.length} occurrences)`));
        console.log(chalk.gray(`    📝 Suggestion: ${rule.suggestion}`));
        
        matches.forEach(match => {
          const lineNumber = content.substring(0, match.index).split('\n').length;
          const context = match[0].length > 100 
            ? match[0].substring(0, 97) + '...' 
            : match[0];
          
          console.log(chalk.gray(`    📍 Ligne ${lineNumber}: ${context}`));
          issuesFound++;
        });
      }
    });
    
    if (!fileHasIssues) {
      console.log(chalk.green('  ✅ Aucun problème détecté'));
    }
    
    filesChecked++;
  } catch (error) {
    console.log(chalk.red(`  ❌ Erreur lors de l'analyse de ${filePath}: ${error.message}`));
  }
}

/**
 * Programme principal
 */
function main() {
  console.log(chalk.blue.bold('=== Analyseur d\'accessibilité LPT Défis ==='));
  console.log(chalk.blue(`Mode: ${fixMode ? 'Analyse et suggestion de corrections' : 'Analyse uniquement'}\n`));
  
  const files = getFilesToAnalyze();
  console.log(chalk.blue(`${files.length} fichiers à analyser...\n`));
  
  if (files.length === 0) {
    console.log(chalk.yellow('⚠️ Aucun fichier trouvé à analyser. Vérifiez les chemins et les patterns.'));
    console.log(chalk.gray('Répertoires recherchés:'));
    CONFIG.componentDirs.forEach(dir => {
      console.log(chalk.gray(`- ${path.join(process.cwd(), dir)}`));
    });
    console.log(chalk.gray('Extensions ciblées:'));
    CONFIG.fileExtensions.forEach(ext => {
      console.log(chalk.gray(`- .${ext}`));
    });
    return;
  }
  
  files.forEach(analyzeFile);
  
  // Rapport final
  console.log(chalk.blue.bold('\n=== Rapport d\'analyse ==='));
  console.log(chalk.blue(`Fichiers analysés: ${filesChecked}`));
  console.log(`Fichiers avec problèmes: ${filesFlagged}`);
  console.log(`Problèmes détectés: ${issuesFound}`);
  
  if (issuesFound > 0) {
    console.log(chalk.yellow('\n📚 Ressources utiles:'));
    console.log(chalk.gray('- https://www.w3.org/WAI/WCAG21/quickref/'));
    console.log(chalk.gray('- https://www.w3.org/TR/wai-aria-practices-1.1/'));
    console.log(chalk.gray('- https://developer.mozilla.org/fr/docs/Web/Accessibility'));
    
    if (!fixMode) {
      console.log(chalk.yellow('\nConseil: Utilisez --fix pour obtenir des suggestions de correction détaillées.'));
    }
  } else {
    console.log(chalk.green('\n✨ Félicitations ! Aucun problème détecté.'));
  }
}

// Exécution du programme
main(); 