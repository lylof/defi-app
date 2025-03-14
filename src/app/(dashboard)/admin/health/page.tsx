"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Database, Server, Shield, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Metadata } from "next";

// Types pour les données de santé
interface HealthData {
  status: 'healthy' | 'degraded' | 'critical';
  timestamp: string;
  database: {
    isConnected: boolean;
    lastCheckTime: string;
    connectionErrors: number;
    averageQueryTime: number | null;
    status: 'healthy' | 'degraded' | 'critical';
    counts: {
      users: number | null;
      challenges: number | null;
      submissions: number | null;
    }
  };
  system: {
    nodeVersion: string;
    platform: string;
    memory: {
      rss: number;
      heapTotal: number;
      heapUsed: number;
      external: number;
    };
    uptime: number;
    env: string;
  };
  auth: {
    provider: string;
    session: {
      exists: boolean;
      userId: string | null;
      role: string | null;
    }
  }
}

/**
 * Page d'administration pour surveiller la santé du système
 */
export default function SystemHealthPage() {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // Fonction pour récupérer les données de santé
  const fetchHealthData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Inclure les cookies de session pour l'authentification
        credentials: 'include'
      });
      
      if (response.status === 403) {
        throw new Error('Vous n\'avez pas les autorisations nécessaires pour accéder à ces informations.');
      }
      
      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération des données de santé: ${response.status}`);
      }
      
      const data = await response.json();
      setHealthData(data);
      setLastRefresh(new Date());
    } catch (err) {
      console.error("Erreur lors de la récupération des données de santé:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les données au chargement de la page
  useEffect(() => {
    fetchHealthData();
    
    // Rafraîchir les données toutes les 30 secondes
    const interval = setInterval(() => {
      fetchHealthData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Fonction pour formater la taille en Mo
  const formatSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' Mo';
  };

  // Fonction pour formater la durée
  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    return `${days}j ${hours}h ${minutes}m`;
  };

  // Fonction pour obtenir la couleur en fonction du statut
  const getStatusColor = (status: 'healthy' | 'degraded' | 'critical') => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'degraded':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Fonction pour obtenir l'icône en fonction du statut
  const getStatusIcon = (status: 'healthy' | 'degraded' | 'critical') => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-amber-600" />;
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Santé du Système</h1>
        <Button 
          onClick={fetchHealthData} 
          disabled={loading}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Rafraîchir
        </Button>
      </div>
      
      {lastRefresh && (
        <p className="text-sm text-gray-500 mb-6">
          Dernière mise à jour: {lastRefresh.toLocaleTimeString()}
        </p>
      )}
      
      {error && (
        <div className="mb-6 p-4 border border-red-200 rounded-md bg-red-50 text-red-800">
          <h2 className="font-semibold mb-2 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Erreur
          </h2>
          <p>{error}</p>
        </div>
      )}
      
      {loading && !healthData ? (
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full md:col-span-3" />
        </div>
      ) : healthData ? (
        <>
          {/* Cartes de statut */}
          <div className="grid gap-6 md:grid-cols-3 mb-6">
            {/* Statut global */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Statut Global</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className={`px-3 py-1 rounded-full border ${getStatusColor(healthData.status)}`}>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(healthData.status)}
                      <span className="font-medium capitalize">
                        {healthData.status === 'healthy' && 'Opérationnel'}
                        {healthData.status === 'degraded' && 'Dégradé'}
                        {healthData.status === 'critical' && 'Critique'}
                      </span>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(healthData.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </CardContent>
            </Card>
            
            {/* Statut base de données */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Base de Données</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className={`px-3 py-1 rounded-full border ${getStatusColor(healthData.database.status)}`}>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(healthData.database.status)}
                      <span className="font-medium">
                        {healthData.database.isConnected ? 'Connecté' : 'Déconnecté'}
                      </span>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {healthData.database.connectionErrors} erreur(s)
                  </span>
                </div>
                {healthData.database.averageQueryTime && (
                  <p className="mt-2 text-sm text-gray-600">
                    Temps moyen: {healthData.database.averageQueryTime.toFixed(2)} ms
                  </p>
                )}
              </CardContent>
            </Card>
            
            {/* Statut authentification */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Authentification</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className={`px-3 py-1 rounded-full border ${healthData.auth.session.exists ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}`}>
                    <div className="flex items-center gap-2">
                      {healthData.auth.session.exists ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <span className="font-medium">
                        {healthData.auth.session.exists ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {healthData.auth.provider}
                  </span>
                </div>
                {healthData.auth.session.exists && (
                  <p className="mt-2 text-sm text-gray-600">
                    Rôle: {healthData.auth.session.role}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Onglets détaillés */}
          <Tabs defaultValue="database" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="database" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Base de Données
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center gap-2">
                <Server className="h-4 w-4" />
                Système
              </TabsTrigger>
              <TabsTrigger value="auth" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Authentification
              </TabsTrigger>
            </TabsList>
            
            {/* Onglet Base de Données */}
            <TabsContent value="database">
              <Card>
                <CardHeader>
                  <CardTitle>Informations de la Base de Données</CardTitle>
                  <CardDescription>
                    Statistiques et état de la connexion à la base de données
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h3 className="font-semibold mb-2">État de la Connexion</h3>
                      <ul className="space-y-2">
                        <li className="flex justify-between">
                          <span className="text-gray-600">Statut:</span>
                          <Badge variant={healthData.database.isConnected ? "success" : "destructive"}>
                            {healthData.database.isConnected ? 'Connecté' : 'Déconnecté'}
                          </Badge>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-600">Dernière vérification:</span>
                          <span>{new Date(healthData.database.lastCheckTime).toLocaleString()}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-600">Erreurs de connexion:</span>
                          <span>{healthData.database.connectionErrors}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-600">Temps moyen de requête:</span>
                          <span>{healthData.database.averageQueryTime ? `${healthData.database.averageQueryTime.toFixed(2)} ms` : 'N/A'}</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-2">Statistiques</h3>
                      <ul className="space-y-2">
                        <li className="flex justify-between">
                          <span className="text-gray-600">Utilisateurs:</span>
                          <span>{healthData.database.counts.users ?? 'N/A'}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-600">Défis:</span>
                          <span>{healthData.database.counts.challenges ?? 'N/A'}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-600">Soumissions:</span>
                          <span>{healthData.database.counts.submissions ?? 'N/A'}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Onglet Système */}
            <TabsContent value="system">
              <Card>
                <CardHeader>
                  <CardTitle>Informations Système</CardTitle>
                  <CardDescription>
                    Détails sur l&apos;environnement d'exécution et les ressources
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h3 className="font-semibold mb-2">Environnement</h3>
                      <ul className="space-y-2">
                        <li className="flex justify-between">
                          <span className="text-gray-600">Node.js:</span>
                          <span>{healthData.system.nodeVersion}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-600">Plateforme:</span>
                          <span>{healthData.system.platform}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-600">Environnement:</span>
                          <Badge variant={healthData.system.env === 'production' ? "default" : "secondary"}>
                            {healthData.system.env}
                          </Badge>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-600">Uptime:</span>
                          <span>{formatUptime(healthData.system.uptime)}</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-2">Mémoire</h3>
                      <ul className="space-y-2">
                        <li className="flex justify-between">
                          <span className="text-gray-600">RSS:</span>
                          <span>{formatSize(healthData.system.memory.rss)}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-600">Heap Total:</span>
                          <span>{formatSize(healthData.system.memory.heapTotal)}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-600">Heap Used:</span>
                          <span>{formatSize(healthData.system.memory.heapUsed)}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-600">External:</span>
                          <span>{formatSize(healthData.system.memory.external)}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Onglet Authentification */}
            <TabsContent value="auth">
              <Card>
                <CardHeader>
                  <CardTitle>Informations d&apos;Authentification</CardTitle>
                  <CardDescription>
                    Détails sur le système d&apos;authentification et la session actuelle
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div>
                      <h3 className="font-semibold mb-2">Fournisseur</h3>
                      <p className="text-gray-600">{healthData.auth.provider}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-2">Session Actuelle</h3>
                      <ul className="space-y-2">
                        <li className="flex justify-between">
                          <span className="text-gray-600">Statut:</span>
                          <Badge variant={healthData.auth.session.exists ? "success" : "destructive"}>
                            {healthData.auth.session.exists ? 'Active' : 'Inactive'}
                          </Badge>
                        </li>
                        {healthData.auth.session.exists && (
                          <>
                            <li className="flex justify-between">
                              <span className="text-gray-600">ID Utilisateur:</span>
                              <span className="font-mono text-sm">{healthData.auth.session.userId}</span>
                            </li>
                            <li className="flex justify-between">
                              <span className="text-gray-600">Rôle:</span>
                              <Badge variant="outline">{healthData.auth.session.role}</Badge>
                            </li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      ) : null}
    </div>
  );
} 