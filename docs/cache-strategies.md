# Stratégies de cache et ISR dans notre application Next.js

Ce document présente les différentes stratégies de mise en cache implémentées dans notre application Next.js pour optimiser les performances.

## Table des matières

- [Principes fondamentaux](#principes-fondamentaux)
- [Cache côté client](#cache-côté-client)
- [Cache côté serveur](#cache-côté-serveur)
- [ISR (Incremental Static Regeneration)](#isr-incremental-static-regeneration)
- [Politique d'en-têtes de cache](#politique-den-têtes-de-cache)
- [Exemples pratiques](#exemples-pratiques)
- [Exemples d'implémentation dans le projet](#exemples-d'implémentation-dans-le-projet)
- [Dépannage](#dépannage)

## Principes fondamentaux

Notre stratégie de cache repose sur plusieurs niveaux pour optimiser les performances :

1. **Cache de navigateur** : Utilisation des en-têtes HTTP `Cache-Control` pour contrôler le comportement du cache navigateur
2. **Cache côté serveur** : Utilisation de SWR pour la gestion des données côté client
3. **ISR (Incremental Static Regeneration)** : Génération statique avec revalidation à intervalle régulier
4. **En-têtes de cache CDN** : Configuration spécifique des en-têtes pour optimiser le cache sur les CDN

## Cache côté client

### SWR (Stale-While-Revalidate)

Nous utilisons la bibliothèque [SWR](https://swr.vercel.app/) pour gérer le cache côté client :

```typescript
import useSWR from 'swr';

function ProfilePage() {
  const { data, error, isLoading } = useSWR('/api/user', fetcher);
  
  if (isLoading) return <div>Chargement...</div>;
  if (error) return <div>Erreur lors du chargement</div>;
  
  return <div>Bonjour {data.name}!</div>;
}
```

Avantages du SWR :
- Affichage des données en cache immédiatement
- Revalidation automatique en arrière-plan
- Actualisation automatique lors de la reconnexion
- Mise en cache des requêtes
- Dédoublonnage des requêtes

## Cache côté serveur

### Options de fetch Next.js

Next.js 14 propose des options avancées pour contrôler le comportement de cache des requêtes `fetch` :

```typescript
// Données statiques (équivalent à getStaticProps)
const data = await fetch('https://...', { cache: 'force-cache' });

// Données dynamiques (équivalent à getServerSideProps)
const data = await fetch('https://...', { cache: 'no-store' });

// ISR avec revalidation
const data = await fetch('https://...', { next: { revalidate: 60 } });
```

## ISR (Incremental Static Regeneration)

L'ISR nous permet de générer des pages statiques avec une revalidation à intervalle régulier :

```typescript
// Dans une Route Handler
export const dynamic = 'force-dynamic';
export const revalidate = 60; // revalider toutes les 60 secondes
```

```typescript
// Dans un composant page
export default async function Page() {
  // Avec revalidation automatique
  const data = await fetch('https://...', { next: { revalidate: 60 } });
  
  // ...
}
```

### Revalidation manuelle

Nous pouvons également déclencher une revalidation manuelle via une action serveur :

```typescript
'use server';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function revalidateData() {
  // Revalider une page spécifique
  revalidatePath('/blog/123');
  
  // Revalider toutes les données avec un tag spécifique
  revalidateTag('blogs');
}
```

## Politique d'en-têtes de cache

Notre middleware définit automatiquement des en-têtes de cache appropriés en fonction du type de contenu :

| Type de contenu | En-tête Cache-Control | Explication |
|-----------------|------------------------|-------------|
| API Routes (générales) | `no-store` | Pas de mise en cache pour les données dynamiques |
| Images | `public, max-age=31536000, immutable` | Cache d'un an sans revalidation |
| JS/CSS | `public, max-age=31536000, immutable` | Cache d'un an sans revalidation |
| Pages d'exemples | `public, max-age=60, s-maxage=120, stale-while-revalidate=30` | Cache court avec revalidation |
| Pages normales | `public, max-age=300, s-maxage=600, stale-while-revalidate=60` | Cache modéré avec revalidation |

## Exemples pratiques

### Exemple d'API avec contrôle de cache personnalisé

Voir l'implémentation dans `/api/cache-control` qui montre comment configurer différentes stratégies de cache :

- `?strategy=no-store` - Pas de mise en cache
- `?strategy=no-cache` - Validation avec le serveur avant utilisation du cache
- `?strategy=force-cache` - Utilisation du cache si disponible
- Par défaut - Stratégie stale-while-revalidate

### Page d'exemple ISR

Voir `/examples/isr-example` pour une démonstration de l'ISR avec différentes stratégies de cache et revalidation manuelle.

## Exemples d'implémentation dans le projet

### Client-side caching avec SWR

Le projet inclut plusieurs exemples d'utilisation de SWR pour le cache côté client :

1. **Hook personnalisé `useSWRFetch`** (`src/lib/hooks/useSWRFetch.ts`) :
   - Wrapper autour de SWR qui simplifie l'utilisation avec fetch
   - Gestion automatique des erreurs HTTP
   - Support pour la transformation des données
   - Configuration flexible des options de revalidation

2. **Exemple basique SWR** (`src/app/examples/swr-example/page.tsx`) :
   - Démonstration de la récupération d'un élément unique
   - Revalidation automatique toutes les 30 secondes
   - Gestion des états de chargement et d'erreur
   - Revalidation manuelle via un bouton

3. **Exemple de liste avec SWR** (`src/app/examples/swr-list-example/page.tsx`) :
   - Pagination avec SWR
   - Recherche avec debounce
   - Mise en cache des résultats par page
   - Gestion des états de chargement et d'erreur

### Incremental Static Regeneration (ISR)

L'exemple ISR (`src/app/examples/isr-example/page.tsx`) démontre :
- Différentes stratégies de cache côté serveur
- Revalidation manuelle via l'API `revalidatePath`
- Comparaison des performances entre différentes stratégies

### API avec contrôle du cache

L'API de contrôle du cache (`src/app/api/cache-control/route.ts`) permet de tester :
- Différentes stratégies de cache via des paramètres d'URL
- Configuration des en-têtes `Cache-Control` appropriés
- Validation conditionnelle avec `ETag`

## Dépannage

### Problèmes courants

1. **Les données ne sont pas mises à jour** : Vérifiez les en-têtes de cache dans le navigateur (DevTools > Network)
2. **Différences entre développement et production** : En mode développement, le cache côté serveur est désactivé par défaut
3. **Cache persistant après déploiement** : Utilisez les tags ou revalidatePath pour forcer une revalidation

### Vérification des en-têtes

Pour diagnostiquer les problèmes liés au cache, utilisez l'outil Network des DevTools pour vérifier les en-têtes de cache :

1. Ouvrez les DevTools (F12)
2. Allez dans l'onglet Network
3. Rechargez la page
4. Sélectionnez une requête et examinez les en-têtes dans la section "Response Headers"
5. Vérifiez la présence et la valeur de l'en-tête "Cache-Control"

### Test de performances

Pour mesurer l'impact du cache sur les performances :

1. Utilisez Lighthouse pour analyser les performances
2. Vérifiez la métrique "Time to First Byte" (TTFB)
3. Comparez les temps de chargement entre la première visite et les visites ultérieures 