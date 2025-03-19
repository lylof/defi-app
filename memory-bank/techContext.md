# Contexte Technique

## Stack Technologique

### Frontend
- **Framework** : Next.js 15
- **Langage** : TypeScript
- **Styling** : Tailwind CSS + shadcn/ui
- **Animation** : Framer Motion
- **State Management** : React Hooks, Context API
- **Rendering** : Utilisation hybride de Server Components et Client Components

### Backend
- **API Routes** : Next.js API Routes (serverless)
- **Authentication** : NextAuth.js
- **ORM** : Prisma (PostgreSQL), Mongoose (MongoDB)
- **Services** : Architecture orientée service

### Base de Données
- **Principale** : PostgreSQL (Neon - cloud serverless)
- **Secondaire** : MongoDB (pour certaines données non structurées)

### Infrastructure
- **Hébergement** : Vercel (Frontend), Render (Backend si séparé)
- **CI/CD** : GitHub Actions
- **Monitoring** : Vercel Analytics

## Outils de Développement

### IDE et Outils
- **IDE recommandé** : VS Code avec extensions Tailwind CSS, ESLint, Prettier
- **Gestion de Version** : Git + GitHub
- **Package Manager** : npm ou yarn

### Extensions VS Code Recommandées
- Tailwind CSS IntelliSense
- ESLint
- Prettier
- Git Lens
- Error Lens
- Auto Import

## Setup Local

1. **Installation des dépendances**
   ```bash
   npm install
   ```

2. **Configuration des variables d'environnement**
   - Créer un fichier `.env.local` à partir du modèle `.env.example`
   - Configurer les connexions aux bases de données et services

3. **Démarrage du serveur de développement**
   ```bash
   npm run dev
   ```

4. **URL de développement**
   - Frontend: http://localhost:3000
   - API: http://localhost:3000/api

## Contraintes Techniques

### Performance
- Optimisation des Core Web Vitals
- Lazy loading pour les composants non critiques
- Stratégie de cache efficace
- Gestion optimisée des images avec next/image

### Sécurité
- Validation des données via TypeScript et zod
- Protection CSRF via Next.js
- Authentification sécurisée via NextAuth.js
- Headers de sécurité automatiquement injectés

### Compatibilité
- Support des navigateurs modernes (Chrome, Firefox, Safari, Edge)
- Responsive design pour tous les appareils (mobile-first)
- Accessibilité WCAG 2.1

## Dépendances Principales

```json
{
  "dependencies": {
    "@hookform/resolvers": "^3.3.2",
    "@prisma/client": "^5.4.2",
    "@radix-ui/react-avatar": "^1.0.4",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-tabs": "^1.0.4",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "framer-motion": "^10.16.4",
    "lucide-react": "^0.288.0",
    "mongoose": "^7.6.3",
    "next": "15.0.0",
    "next-auth": "^4.24.4",
    "next-themes": "^0.2.1",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "tailwind-merge": "^1.14.0",
    "tailwindcss-animate": "^1.0.7",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/node": "^20.8.7",
    "@types/react": "^18.2.31",
    "@types/react-dom": "^18.2.14",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.52.0",
    "eslint-config-next": "13.5.5",
    "postcss": "^8.4.31",
    "prisma": "^5.4.2",
    "tailwindcss": "^3.3.3",
    "typescript": "^5.2.2"
  }
}
```

## Architecture des Fichiers

```
project/
├── app/                  # Next.js App Router
│   ├── api/              # API Routes
│   ├── auth/             # Pages d'authentification
│   ├── dashboard/        # Interface utilisateur
│   ├── admin/            # Interface administrateur
│   └── page.tsx          # Page d'accueil
├── components/           # Composants React
│   ├── admin/            # Composants spécifiques à l'admin
│   ├── home/             # Composants pour la page d'accueil
│   ├── dashboard/        # Composants pour le dashboard
│   └── ui/               # Composants UI réutilisables (shadcn)
├── lib/                  # Bibliothèques et utilitaires
│   ├── api/              # Client API
│   ├── auth/             # Configuration NextAuth
│   ├── services/         # Services métier
│   └── utils/            # Fonctions utilitaires
├── prisma/               # Modèles et migrations Prisma
│   ├── schema.prisma     # Schéma de base de données
│   └── migrations/       # Migrations de la base de données
├── public/               # Fichiers statiques
└── styles/               # Styles globaux
```

## Conventions de Code

### TypeScript
- Types stricts activés dans `tsconfig.json`
- Interfaces pour les props des composants
- Types pour les données métier

### React / Next.js
- Composants fonctionnels avec hooks
- `use client` uniquement quand nécessaire
- Lazy loading pour les composants lourds
- Patterns d'optimisation (memoization, virtualization, etc.)

### Styling
- Classes utilitaires Tailwind
- Composants UI personnalisés basés sur shadcn/ui
- Variables CSS pour les thèmes (light/dark)

## Architecture du système de cache

Le système de cache est implémenté dans `src/lib/cache/advanced-cache.ts` avec les composants suivants :

### Classes principales
- `AdvancedCacheManager`: Gère le cache avec des options avancées
- Décorateurs pour la mise en cache des méthodes

### Fonctionnalités clés
- Mise en cache avec expiration
- Options de configuration flexibles
- Gestion des erreurs robuste
- Logging intégré

## Structure du projet
```
src/
  ├── app/
  │   └── api/
  │       └── challenges/
  │           └── daily/
  ├── components/
  │   ├── admin/
  │   └── ui/
  └── lib/
      └── cache/
```

## Dépendances principales
- Next.js et React pour le framework
- TailwindCSS pour le styling
- TypeScript pour le typage statique
- PostgreSQL pour la persistance des données

## Configuration requise
- Node.js version 18+
- PostgreSQL 14+
- npm ou yarn comme gestionnaire de paquets

## Environnement de développement
- VS Code recommandé avec extensions:
  - ESLint
  - Prettier
  - TypeScript
- Configuration de débogage disponible 