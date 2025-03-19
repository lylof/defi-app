"use client";

import { useState } from 'react';
import { useWorker } from '@/lib/hooks/useWorker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { AlertCircle, Calculator, Clock } from 'lucide-react';

/**
 * Page d'exemple pour démontrer l'utilisation du Web Worker pour les calculs intensifs
 */
export default function WorkerExamplePage() {
  // Données utilisateur simulées
  const [userData, setUserData] = useState({
    completedChallenges: Array(10).fill(0).map((_, i) => ({ id: i, name: `Défi ${i + 1}` })),
    totalPoints: 500,
    level: 2,
    submissions: Array(5).fill(0).map((_, i) => ({ id: i, score: 70 + Math.floor(Math.random() * 30) }))
  });
  
  // Paramètres du calcul
  const [params, setParams] = useState({
    weightCompletedChallenges: 0.5,
    weightTotalPoints: 0.3,
    weightSubmissionsQuality: 0.2,
    baseMultiplier: 100
  });
  
  // État pour le blocage du thread principal
  const [isMainThreadBlocked, setIsMainThreadBlocked] = useState(false);
  const [mainThreadBlockTime, setMainThreadBlockTime] = useState<number | null>(null);
  
  // Utiliser le hook useWorker
  const { 
    result: progressionResult, 
    isLoading, 
    error, 
    executionTime,
    execute: calculateProgression 
  } = useWorker({
    operation: 'calculate-progression',
    initialData: userData,
    params
  });
  
  // Fonction pour bloquer le thread principal volontairement afin de démontrer la différence
  const blockMainThread = () => {
    setIsMainThreadBlocked(true);
    const startTime = Date.now();
    
    // Simuler un calcul long dans le thread principal
    const { 
      completedChallenges, 
      totalPoints,
      level,
      submissions
    } = userData;
    
    // Calcul de la qualité moyenne des soumissions (entre 0 et 1)
    let submissionsQuality = 0;
    if (submissions.length > 0) {
      const totalQuality = submissions.reduce((sum, sub) => sum + (sub.score || 0), 0);
      submissionsQuality = totalQuality / (submissions.length * 100); // Normaliser entre 0 et 1
    }
    
    // Calcul pondéré de la progression
    const challengesFactor = completedChallenges.length * params.weightCompletedChallenges;
    const pointsFactor = totalPoints / 1000 * params.weightTotalPoints; // Normaliser les points
    const qualityFactor = submissionsQuality * params.weightSubmissionsQuality;
    
    // Bloquer délibérément le thread pendant un moment
    const blockUntil = Date.now() + 2000;
    while (Date.now() < blockUntil) {
      // Boucle vide pour bloquer le thread
    }
    
    // Calculer le temps pris
    const endTime = Date.now();
    setMainThreadBlockTime(endTime - startTime);
    setIsMainThreadBlocked(false);
  };
  
  // Fonction pour recalculer la progression suite à un changement
  const handleParamChange = (param: keyof typeof params, value: number) => {
    const newParams = { ...params, [param]: value };
    setParams(newParams);
    calculateProgression(userData, newParams);
  };
  
  // Fonction pour ajouter un défi complété pour simuler un changement d'état
  const addCompletedChallenge = () => {
    const newUserData = { 
      ...userData,
      completedChallenges: [
        ...userData.completedChallenges,
        { 
          id: userData.completedChallenges.length, 
          name: `Défi ${userData.completedChallenges.length + 1}` 
        }
      ]
    };
    
    setUserData(newUserData);
    calculateProgression(newUserData, params);
  };
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Démonstration de Web Worker</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="h-5 w-5 mr-2" />
              Calcul avec Web Worker
            </CardTitle>
            <CardDescription>
              Les calculs sont effectués dans un thread séparé sans bloquer l'interface utilisateur
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erreur</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">Progression calculée:</span>
                  <span className="text-xl">{progressionResult || 0}</span>
                </div>
                
                <Progress value={progressionResult || 0} max={500} className="h-3" />
                
                {executionTime !== null && (
                  <div className="text-sm text-muted-foreground flex items-center mt-2">
                    <Clock className="h-4 w-4 mr-1" />
                    Temps d'exécution: {executionTime} ms
                  </div>
                )}
                
                <Button 
                  onClick={() => calculateProgression()} 
                  className="mt-4"
                  variant="outline"
                >
                  Recalculer avec Web Worker
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="h-5 w-5 mr-2" />
              Calcul dans le Thread Principal
            </CardTitle>
            <CardDescription>
              Les calculs effectués dans le thread principal bloquent l'interface utilisateur
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">État de l'interface:</span>
                <span className={isMainThreadBlocked ? "text-red-500" : "text-green-500"}>
                  {isMainThreadBlocked ? "Bloquée" : "Réactive"}
                </span>
              </div>
              
              {isMainThreadBlocked ? (
                <div className="py-4 text-center">
                  <span className="animate-pulse">Traitement en cours...</span>
                </div>
              ) : mainThreadBlockTime !== null ? (
                <div className="text-sm text-muted-foreground flex items-center mt-2">
                  <Clock className="h-4 w-4 mr-1" />
                  Temps de blocage: {mainThreadBlockTime} ms
                </div>
              ) : null}
              
              <Button 
                onClick={blockMainThread} 
                className="mt-4"
                variant="outline"
                disabled={isMainThreadBlocked}
              >
                Bloquer le Thread Principal
              </Button>
              
              <div className="text-sm">
                <p>
                  Note: Pendant l'exécution dans le thread principal, essayez d'interagir avec 
                  l'interface (boutons, sliders). Vous remarquerez qu'elle est complètement bloquée.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Paramètres de calcul</CardTitle>
          <CardDescription>
            Ajustez les paramètres pour voir comment ils affectent le calcul de progression
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Poids des défis complétés: {params.weightCompletedChallenges}</Label>
                </div>
                <Slider 
                  value={[params.weightCompletedChallenges]} 
                  min={0} 
                  max={1} 
                  step={0.05}
                  onValueChange={(value) => handleParamChange('weightCompletedChallenges', value[0])}
                  disabled={isLoading || isMainThreadBlocked}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Poids des points totaux: {params.weightTotalPoints}</Label>
                </div>
                <Slider 
                  value={[params.weightTotalPoints]} 
                  min={0} 
                  max={1} 
                  step={0.05}
                  onValueChange={(value) => handleParamChange('weightTotalPoints', value[0])}
                  disabled={isLoading || isMainThreadBlocked}
                />
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Poids de la qualité des soumissions: {params.weightSubmissionsQuality}</Label>
                </div>
                <Slider 
                  value={[params.weightSubmissionsQuality]} 
                  min={0} 
                  max={1} 
                  step={0.05}
                  onValueChange={(value) => handleParamChange('weightSubmissionsQuality', value[0])}
                  disabled={isLoading || isMainThreadBlocked}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Multiplicateur de base: {params.baseMultiplier}</Label>
                </div>
                <Slider 
                  value={[params.baseMultiplier]} 
                  min={10} 
                  max={200} 
                  step={10}
                  onValueChange={(value) => handleParamChange('baseMultiplier', value[0])}
                  disabled={isLoading || isMainThreadBlocked}
                />
              </div>
            </div>
          </div>
          
          <Button 
            onClick={addCompletedChallenge} 
            className="mt-6"
            disabled={isLoading || isMainThreadBlocked}
          >
            Ajouter un défi complété
          </Button>
          
          <div className="mt-4 text-sm text-muted-foreground">
            <p>
              Note: Lorsque vous ajustez les paramètres, le calcul est effectué en temps réel par le Web Worker.
              L'interface reste réactive, même lorsque les calculs sont intensifs.
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Quand utiliser les Web Workers ?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>
              Les Web Workers sont particulièrement utiles pour :
            </p>
            
            <ul className="list-disc pl-5 space-y-2">
              <li>Calculs intensifs qui prendraient plus de 50ms sur le thread principal</li>
              <li>Traitement de grandes quantités de données (filtrage, tri, transformation)</li>
              <li>Opérations répétitives qui pourraient bloquer l'interface utilisateur</li>
              <li>Calculs complexes comme les statistiques, les algorithmes d'analyse, etc.</li>
              <li>Téléchargement et traitement d'images ou de fichiers volumineux</li>
            </ul>
            
            <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950 rounded-md">
              <h3 className="font-semibold mb-2">Limitations</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Pas d'accès direct au DOM (impossible de manipuler l'interface)</li>
                <li>Communication avec le thread principal uniquement par messages</li>
                <li>Coût de sérialisation/désérialisation des données lors des transferts</li>
                <li>Pas disponible dans certains environnements (SSR)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 