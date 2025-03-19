"use client";

import { useState } from 'react';
import { useSWRFetch } from '@/lib/hooks/useSWRFetch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

export default function SWRExamplePage() {
  const [postId, setPostId] = useState(1);
  
  // Utilisation de notre hook personnalisé
  const { data: post, error, isLoading, mutate } = useSWRFetch<Post>({
    url: `https://jsonplaceholder.typicode.com/posts/${postId}`,
    // Revalider toutes les 30 secondes
    refreshInterval: 30000,
  });

  // Fonction pour charger le post suivant
  const loadNextPost = () => {
    setPostId(prev => prev + 1);
  };

  // Fonction pour charger le post précédent
  const loadPreviousPost = () => {
    setPostId(prev => Math.max(1, prev - 1));
  };

  // Fonction pour recharger manuellement les données
  const refreshData = () => {
    mutate();
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Exemple d'utilisation de SWR</h1>
      
      <div className="mb-6">
        <p className="text-gray-600 mb-4">
          Cette page démontre l'utilisation du hook personnalisé <code>useSWRFetch</code> pour récupérer et mettre en cache des données.
          Les données sont automatiquement revalidées toutes les 30 secondes.
        </p>
        
        <div className="flex gap-4 mb-6">
          <Button onClick={loadPreviousPost} disabled={postId <= 1}>Post précédent</Button>
          <Button onClick={loadNextPost}>Post suivant</Button>
          <Button variant="outline" onClick={refreshData} className="ml-auto">
            <RefreshCw className="h-4 w-4 mr-2" />
            Rafraîchir
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>
            Une erreur s'est produite lors du chargement des données: {error.message}
          </AlertDescription>
        </Alert>
      ) : post ? (
        <Card>
          <CardHeader>
            <CardTitle>{post.title}</CardTitle>
            <CardDescription>Post ID: {post.id}</CardDescription>
          </CardHeader>
          <CardContent>
            <p>{post.body}</p>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-gray-500">Utilisateur ID: {post.userId}</p>
          </CardFooter>
        </Card>
      ) : null}

      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Avantages de SWR</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Mise en cache automatique des données</li>
          <li>Revalidation automatique (stale-while-revalidate)</li>
          <li>Gestion des erreurs simplifiée</li>
          <li>Revalidation à l'intervalle, au focus, à la reconnexion</li>
          <li>Déduplication des requêtes</li>
          <li>Pagination et chargement infini facilités</li>
        </ul>
      </div>
    </div>
  );
} 