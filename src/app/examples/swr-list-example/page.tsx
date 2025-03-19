"use client";

import { useState } from 'react';
import { useSWRFetch } from '@/lib/hooks/useSWRFetch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Comment {
  id: number;
  name: string;
  email: string;
  body: string;
  postId: number;
}

export default function SWRListExamplePage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  // Débounce pour la recherche
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    clearTimeout((window as any).searchTimeout);
    (window as any).searchTimeout = setTimeout(() => {
      setDebouncedSearchTerm(value);
    }, 500);
  };

  // Utilisation de notre hook personnalisé avec pagination
  const { data, error, isLoading, mutate } = useSWRFetch<Comment[]>({
    url: `https://jsonplaceholder.typicode.com/comments?_page=${page}&_limit=${limit}${debouncedSearchTerm ? `&q=${debouncedSearchTerm}` : ''}`,
    // Revalider toutes les 60 secondes
    refreshInterval: 60000,
  });

  // Fonction pour aller à la page suivante
  const nextPage = () => {
    setPage(prev => prev + 1);
  };

  // Fonction pour aller à la page précédente
  const prevPage = () => {
    setPage(prev => Math.max(1, prev - 1));
  };

  // Fonction pour recharger manuellement les données
  const refreshData = () => {
    mutate();
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Liste avec SWR et Pagination</h1>
      
      <div className="mb-6">
        <p className="text-gray-600 mb-4">
          Cette page démontre l'utilisation de SWR pour gérer une liste de données avec pagination et recherche.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <Label htmlFor="search">Recherche</Label>
            <Input 
              id="search"
              type="text" 
              placeholder="Rechercher..." 
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div>
            <Label htmlFor="limit">Éléments par page</Label>
            <Input 
              id="limit"
              type="number" 
              min="1" 
              max="50" 
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div className="flex items-end">
            <Button variant="outline" onClick={refreshData} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Rafraîchir
            </Button>
          </div>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <div>
            <span className="text-sm text-gray-500">Page {page}</span>
          </div>
          <div className="flex gap-2">
            <Button onClick={prevPage} disabled={page <= 1} variant="outline" size="sm">
              Précédent
            </Button>
            <Button onClick={nextPage} disabled={!data || data.length < limit} variant="outline" size="sm">
              Suivant
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array(3).fill(0).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>
            Une erreur s'est produite lors du chargement des données: {error.message}
          </AlertDescription>
        </Alert>
      ) : data && data.length > 0 ? (
        <div className="space-y-4">
          {data.map(comment => (
            <Card key={comment.id}>
              <CardHeader>
                <CardTitle className="text-lg">{comment.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-blue-600 mb-2">{comment.email}</p>
                <p>{comment.body}</p>
                <p className="text-xs text-gray-500 mt-2">Post ID: {comment.postId}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Alert>
          <AlertTitle>Aucun résultat</AlertTitle>
          <AlertDescription>
            Aucun commentaire trouvé pour cette recherche.
          </AlertDescription>
        </Alert>
      )}
      
      {data && data.length > 0 && (
        <div className="mt-4 flex justify-between items-center">
          <div>
            <span className="text-sm text-gray-500">Page {page}</span>
          </div>
          <div className="flex gap-2">
            <Button onClick={prevPage} disabled={page <= 1} variant="outline" size="sm">
              Précédent
            </Button>
            <Button onClick={nextPage} disabled={data.length < limit} variant="outline" size="sm">
              Suivant
            </Button>
          </div>
        </div>
      )}

      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Fonctionnalités démontrées</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Pagination avec SWR</li>
          <li>Recherche avec debounce</li>
          <li>Gestion des états de chargement</li>
          <li>Gestion des erreurs</li>
          <li>Mise en cache des résultats par page</li>
          <li>Revalidation automatique</li>
        </ul>
      </div>
    </div>
  );
} 