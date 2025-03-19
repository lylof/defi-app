"use client";

import { 
  Users, 
  Award, 
  FileText, 
  Calendar, 
  TrendingUp,
  CheckCircle,
  Clock,
  Medal
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "default" | "success" | "warning" | "error";
}

const StatCard = ({ 
  title, 
  value, 
  description, 
  icon, 
  trend,
  color = "default" 
}: StatCardProps) => {
  const getColorClass = () => {
    switch (color) {
      case "success": return "bg-gradient-to-r from-emerald-500 to-green-400";
      case "warning": return "bg-gradient-to-r from-amber-500 to-yellow-400";
      case "error": return "bg-gradient-to-r from-rose-500 to-red-400";
      default: return "bg-gradient-to-r from-blue-500 to-cyan-400";
    }
  };

  return (
    <div className="admin-stats-card group">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="admin-stats-label">{title}</div>
          <div className="admin-stats-value">{value}</div>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          {trend && (
            <div className={`flex items-center text-xs font-medium ${trend.isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
              <TrendingUp className={`h-3 w-3 mr-1 ${!trend.isPositive && 'rotate-180'}`} />
              <span>{trend.isPositive ? '+' : ''}{trend.value}% depuis le mois dernier</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${getColorClass()} text-white transition-transform group-hover:scale-110`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export function AdminStatsPanel({
  totalUsers = 0,
  activeUsers = 0,
  totalSubmissions = 0,
  pendingSubmissions = 0,
  completedChallenges = 0,
  badgesAwarded = 0,
  averageScore = 0,
  activeChallenges = 0,
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Vue d'ensemble</h2>
      
      <div className="admin-stats-grid">
        <StatCard
          title="Utilisateurs"
          value={totalUsers}
          description={`${activeUsers} utilisateurs actifs`}
          icon={<Users className="h-5 w-5" />}
          trend={{ value: 12, isPositive: true }}
        />
        
        <StatCard
          title="Soumissions"
          value={totalSubmissions}
          description={`${pendingSubmissions} en attente d'évaluation`}
          icon={<FileText className="h-5 w-5" />}
          color="warning"
          trend={{ value: 8, isPositive: true }}
        />
        
        <StatCard
          title="Défis complétés"
          value={completedChallenges}
          icon={<CheckCircle className="h-5 w-5" />}
          color="success"
        />
        
        <StatCard
          title="Badges attribués"
          value={badgesAwarded}
          icon={<Award className="h-5 w-5" />}
          color="warning"
          trend={{ value: 5, isPositive: true }}
        />
        
        <StatCard
          title="Score moyen"
          value={`${averageScore}/100`}
          icon={<Medal className="h-5 w-5" />}
          trend={{ value: 3, isPositive: true }}
        />
        
        <StatCard
          title="Défis actifs"
          value={activeChallenges}
          icon={<Calendar className="h-5 w-5" />}
          color="default"
        />
      </div>
      
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 mt-8">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="p-6">
              <h3 className="text-lg font-semibold">Activité récente</h3>
              <p className="text-sm text-muted-foreground">Dernières actions sur la plateforme</p>
            </div>
            <div className="px-6 pb-6">
              {/* Liste d'activités récentes ici */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 rounded-full p-2 mt-1">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Nouvel utilisateur inscrit</p>
                    <p className="text-sm text-muted-foreground">Marie Dupont a rejoint la plateforme</p>
                    <p className="text-xs text-muted-foreground flex items-center mt-1">
                      <Clock className="h-3 w-3 mr-1" /> Il y a 10 minutes
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 rounded-full p-2 mt-1">
                    <FileText className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Nouvelle soumission</p>
                    <p className="text-sm text-muted-foreground">Jean Martin a soumis une solution pour le défi "Landing Page"</p>
                    <p className="text-xs text-muted-foreground flex items-center mt-1">
                      <Clock className="h-3 w-3 mr-1" /> Il y a 45 minutes
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-amber-100 rounded-full p-2 mt-1">
                    <Award className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium">Badge attribué</p>
                    <p className="text-sm text-muted-foreground">Sophie Leroy a obtenu le badge "Expert Design"</p>
                    <p className="text-xs text-muted-foreground flex items-center mt-1">
                      <Clock className="h-3 w-3 mr-1" /> Il y a 2 heures
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Défis populaires</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b">
                <div>
                  <p className="font-medium">Design d'application mobile</p>
                  <p className="text-sm text-muted-foreground">48 participants</p>
                </div>
                <div className="admin-badge admin-badge-success">Actif</div>
              </div>
              
              <div className="flex items-center justify-between pb-2 border-b">
                <div>
                  <p className="font-medium">API REST avec Node.js</p>
                  <p className="text-sm text-muted-foreground">32 participants</p>
                </div>
                <div className="admin-badge admin-badge-success">Actif</div>
              </div>
              
              <div className="flex items-center justify-between pb-2 border-b">
                <div>
                  <p className="font-medium">Animation CSS avancée</p>
                  <p className="text-sm text-muted-foreground">27 participants</p>
                </div>
                <div className="admin-badge admin-badge-warning">À venir</div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Interface e-commerce</p>
                  <p className="text-sm text-muted-foreground">21 participants</p>
                </div>
                <div className="admin-badge admin-badge-error">Terminé</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 