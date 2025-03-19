# Guide d'utilisation de SWR dans le projet LPT Défis

## Introduction

SWR (stale-while-revalidate) est une bibliothèque de gestion de données pour React qui permet de récupérer, mettre en cache et revalider automatiquement les données. Ce guide explique comment utiliser SWR dans le projet LPT Défis.

## Table des matières

1. [Installation et configuration](#installation-et-configuration)
2. [Hook personnalisé useSWRFetch](#hook-personnalisé-useswr-fetch)
3. [Exemples d'utilisation](#exemples-dutilisation)
4. [Gestion des erreurs](#gestion-des-erreurs)
5. [Bonnes pratiques](#bonnes-pratiques)
6. [Ressources](#ressources)

## Installation et configuration

SWR est déjà installé dans le projet. La configuration globale se trouve dans le fichier `src/lib/services/SWRService.ts`.

```bash
# Si vous avez besoin de réinstaller SWR
npm install swr
```

## Hook personnalisé useSWRFetch

Nous avons créé un hook personnalisé `useSWRFetch` qui simplifie l'utilisation de SWR avec fetch. Ce hook se trouve dans le fichier `src/lib/hooks/useSWRFetch.ts`.

### Fonctionnalités principales

- Gestion automatique du cache
- Revalidation automatique
- Gestion des erreurs
- Support pour différentes méthodes HTTP
- Transformation des données

### Signature du hook

```typescript
function useSWRFetch<T = any>({
  url,
  method = 'GET',
  body,
  headers,
  transform,
  ...config
}: UseSWRFetchOptions<T>): SWRResponse<T, Error>
```

### Options

- `url` (obligatoire) : URL de l'API à appeler
- `method` (optionnel) : Méthode HTTP à utiliser (GET par défaut)
- `body` (optionnel) : Corps de la requête (pour POST, PUT, PATCH)
- `headers` (optionnel) : En-têtes de la requête
- `transform` (optionnel) : Fonction de transformation des données
- `...config` : Autres options de configuration SWR

## Exemples d'utilisation

### Exemple simple

```tsx
import { useSWRFetch } from '@/lib/hooks/useSWRFetch';

function UserProfile({ userId }) {
  const { data, error, isLoading } = useSWRFetch({
    url: `/api/users/${userId}`,
  });

  if (isLoading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error.message}</div>;
  
  return (
    <div>
      <h1>{data.name}</h1>
      <p>{data.email}</p>
    </div>
  );
}
```

### Exemple avec transformation des données

```tsx
import { useSWRFetch } from '@/lib/hooks/useSWRFetch';

function PostList() {
  const { data, error, isLoading } = useSWRFetch({
    url: '/api/posts',
    transform: (data) => data.posts.map(post => ({
      ...post,
      title: post.title.toUpperCase(),
    })),
  });

  if (isLoading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error.message}</div>;
  
  return (
    <ul>
      {data.map(post => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

### Exemple avec mutation

```tsx
import { useSWRFetch } from '@/lib/hooks/useSWRFetch';

function TodoItem({ id, initialText }) {
  const { data, error, isLoading, mutate } = useSWRFetch({
    url: `/api/todos/${id}`,
  });

  const updateTodo = async (newText) => {
    // Optimistic update
    mutate({ ...data, text: newText }, false);
    
    // Send the update to the server
    await fetch(`/api/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: newText }),
    });
    
    // Trigger revalidation
    mutate();
  };

  if (isLoading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error.message}</div>;
  
  return (
    <div>
      <p>{data.text}</p>
      <button onClick={() => updateTodo('Nouveau texte')}>Mettre à jour</button>
    </div>
  );
}
```

### Exemple avec pagination

```tsx
import { useState } from 'react';
import { useSWRFetch } from '@/lib/hooks/useSWRFetch';

function CommentList() {
  const [page, setPage] = useState(1);
  
  const { data, error, isLoading } = useSWRFetch({
    url: `/api/comments?page=${page}&limit=10`,
  });

  if (isLoading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error.message}</div>;
  
  return (
    <div>
      <ul>
        {data.map(comment => (
          <li key={comment.id}>{comment.text}</li>
        ))}
      </ul>
      
      <div>
        <button 
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Précédent
        </button>
        
        <span>Page {page}</span>
        
        <button 
          onClick={() => setPage(p => p + 1)}
          disabled={!data || data.length < 10}
        >
          Suivant
        </button>
      </div>
    </div>
  );
}
```

## Gestion des erreurs

Le hook `useSWRFetch` gère automatiquement les erreurs HTTP. Vous pouvez utiliser la classe `SWRErrorHandler` pour obtenir des messages d'erreur conviviaux.

```tsx
import { useSWRFetch } from '@/lib/hooks/useSWRFetch';
import { SWRErrorHandler } from '@/lib/services/SWRService';

function UserData() {
  const { data, error, isLoading } = useSWRFetch({
    url: '/api/user-data',
  });

  if (isLoading) return <div>Chargement...</div>;
  
  if (error) {
    const errorMessage = SWRErrorHandler.getErrorMessage(error);
    return <div className="error">{errorMessage}</div>;
  }
  
  return <div>{/* Afficher les données */}</div>;
}
```

## Bonnes pratiques

1. **Utilisez des clés cohérentes** : Pour les requêtes complexes, utilisez la classe `SWRKeyBuilder` pour générer des clés cohérentes.

2. **Optimistic UI** : Utilisez `mutate` pour mettre à jour l'interface avant que la requête ne soit terminée.

3. **Revalidation conditionnelle** : Configurez `revalidateOnFocus`, `revalidateOnReconnect` et `refreshInterval` selon vos besoins.

4. **Transformation des données** : Utilisez l'option `transform` pour formater les données avant de les utiliser dans vos composants.

5. **Gestion des erreurs** : Utilisez la classe `SWRErrorHandler` pour obtenir des messages d'erreur conviviaux.

## Ressources

- [Documentation officielle de SWR](https://swr.vercel.app/fr)
- [Exemples d'utilisation](src/app/examples/swr-example/page.tsx)
- [Exemple de liste avec pagination](src/app/examples/swr-list-example/page.tsx)
- [Configuration globale](src/lib/services/SWRService.ts)
- [Hook personnalisé](src/lib/hooks/useSWRFetch.ts) 