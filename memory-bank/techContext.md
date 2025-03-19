# Contexte Technique

## Technologies principales

### Frontend
- Next.js 14
- TypeScript
- React
- TailwindCSS pour le styling

### Backend
- API Routes de Next.js
- PostgreSQL comme base de données
- Système de cache personnalisé

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