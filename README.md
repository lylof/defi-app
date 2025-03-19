# LPT Défis

Plateforme de défis quotidiens de développement pour la communauté LPT, permettant aux développeurs de tous niveaux de s'améliorer à travers des challenges variés et collaboratifs.

## 📋 Fonctionnalités

- 🏆 Défis quotidiens avec objectifs clairs et progressifs
- 📊 Tableau de classement et système de points
- 👥 Profils utilisateurs et suivi de progression
- 🌐 Interface responsive et moderne
- 🔐 Système d'authentification sécurisé

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18+ et npm
- Base de données PostgreSQL
- Variables d'environnement configurées (voir `.env.example`)

### Installation

```bash
# Cloner le dépôt
git clone https://github.com/votre-organisation/lpt-defis.git
cd lpt-defis

# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env
# Modifier les variables dans .env selon votre configuration

# Initialiser la base de données
npx prisma migrate dev

# Lancer l'application en développement
npm run dev
```

L'application sera disponible à l'adresse [http://localhost:3000](http://localhost:3000).

## 🧪 Tests

```bash
# Exécuter tous les tests
npm test

# Tests unitaires
npm run test:unit

# Tests d'intégration
npm run test:integration

# Tests end-to-end
npm run test:e2e
```

## ♿ Accessibilité

L'application LPT Défis est conçue pour être accessible à tous les utilisateurs, y compris ceux utilisant des technologies d'assistance.

### Fonctionnalités d'accessibilité

- Navigation au clavier complète
- Support des lecteurs d'écran
- Composants UI accessibles avec attributs ARIA appropriés
- Contrastes optimisés

### Outils d'analyse d'accessibilité

Le projet intègre des outils d'analyse et de correction automatique des problèmes d'accessibilité :

```bash
# Analyser le code pour trouver des problèmes d'accessibilité
npm run a11y

# Analyser avec suggestions de correction détaillées
npm run a11y:fix

# Appliquer des corrections automatiques pour les problèmes courants
node scripts/fix-accessibility.js
```

### Documentation

Pour plus d'informations sur l'implémentation de l'accessibilité, consultez :

- [Guide d'implémentation](docs/GUIDE_ACCESSIBILITE.md)
- [Récapitulatif des améliorations](docs/ACCESSIBILITE_RECAP.md)

## 🛠️ Stack technique

- **Frontend** : Next.js, React, TypeScript, Tailwind CSS
- **Backend** : Next.js API Routes, Prisma ORM
- **Base de données** : PostgreSQL
- **Authentification** : NextAuth.js
- **Tests** : Jest, React Testing Library, Playwright
- **CI/CD** : GitHub Actions

## 📚 Documentation

- [Guide du développeur](docs/DEVELOPER.md)
- [Architecture du projet](docs/ARCHITECTURE.md)
- [Guide de contribution](CONTRIBUTING.md)
- [Optimisations](OPTIMISATIONS.md)
- [Accessibilité](ACCESSIBILITE.md)

## 📝 Licence

Ce projet est sous licence [MIT](LICENSE).
