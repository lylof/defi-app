"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, FileCheck, BarChart } from "lucide-react";

/**
 * Props du composant AdminStatsPanel
 * @interface AdminStatsPanelProps
 * @property {Object} adminStats - Statistiques d'administration
 */
export interface AdminStatsPanelProps {
  adminStats: {
    totalUsers: number;
    totalSubmissions: number;
    pendingSubmissions: number;
    activeChallenges: number;
    lastLogin?: string;
    lastAction?: string;
  };
}

/**
 * Composant qui affiche un tableau de bord avec les statistiques d'administration
 * Ce composant est utilisé dans le profil administrateur pour donner un aperçu
 * des principales métriques d'administration de la plateforme
 */
export function AdminStatsPanel({ adminStats }: AdminStatsPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Surveillance plateforme
        </CardTitle>
        <CardDescription>
          Statistiques et métriques clés de la plateforme
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Statistiques utilisateurs */}
          <div className="flex flex-col items-center justify-center p-3 bg-background/50 rounded-lg border">
            <Users className="h-8 w-8 text-primary mb-2" />
            <p className="text-2xl font-bold">{adminStats.totalUsers}</p>
            <p className="text-xs text-muted-foreground">Utilisateurs</p>
          </div>
          
          {/* Statistiques défis actifs */}
          <div className="flex flex-col items-center justify-center p-3 bg-background/50 rounded-lg border">
            <BarChart className="h-8 w-8 text-primary mb-2" />
            <p className="text-2xl font-bold">{adminStats.activeChallenges}</p>
            <p className="text-xs text-muted-foreground">Défis actifs</p>
          </div>
          
          {/* Statistiques soumissions */}
          <div className="flex flex-col items-center justify-center p-3 bg-background/50 rounded-lg border">
            <FileCheck className="h-8 w-8 text-primary mb-2" />
            <p className="text-2xl font-bold">{adminStats.totalSubmissions}</p>
            <p className="text-xs text-muted-foreground">Soumissions</p>
          </div>
          
          {/* Soumissions en attente */}
          <div className="flex flex-col items-center justify-center p-3 bg-background/50 rounded-lg border">
            <FileCheck className="h-8 w-8 text-amber-500 mb-2" />
            <p className="text-2xl font-bold">{adminStats.pendingSubmissions}</p>
            <p className="text-xs text-muted-foreground">En attente</p>
          </div>
        </div>
        
        {/* Dernières activités */}
        {(adminStats.lastLogin || adminStats.lastAction) && (
          <div className="mt-4 border-t pt-4">
            <p className="text-sm font-medium">Dernières activités</p>
            {adminStats.lastLogin && (
              <p className="text-xs text-muted-foreground">
                Dernière connexion: {new Date(adminStats.lastLogin).toLocaleString()}
              </p>
            )}
            {adminStats.lastAction && (
              <p className="text-xs text-muted-foreground">
                Dernière action: {adminStats.lastAction}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 