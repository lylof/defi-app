"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { IconName, getIconComponent } from "@/lib/icons";

type RouteInfo = {
  title: string;
  description: string;
  icon: IconName;
};

const routes: Record<string, RouteInfo> = {
  "/admin": {
    title: "Tableau de bord",
    description: "Vue d'ensemble et statistiques du système",
    icon: "layout-dashboard"
  },
  "/admin/users": {
    title: "Gestion Utilisateurs",
    description: "Gérer les comptes utilisateurs et les rôles",
    icon: "users"
  },
  "/admin/challenges": {
    title: "Gestion des Défis",
    description: "Créer et gérer les défis de la plateforme",
    icon: "folder-kanban"
  },
  "/admin/categories": {
    title: "Catégories",
    description: "Organiser les défis par catégorie",
    icon: "tags"
  },
  "/admin/submissions": {
    title: "Soumissions",
    description: "Évaluer les soumissions des participants",
    icon: "clipboard-check"
  },
  "/admin/badges": {
    title: "Badges",
    description: "Gérer les badges et récompenses",
    icon: "award"
  },
  "/admin/logs": {
    title: "Logs d'activité",
    description: "Historique des actions administratives",
    icon: "history"
  },
  "/admin/health": {
    title: "Santé du Système",
    description: "Surveiller l'état du système",
    icon: "line-chart"
  }
};

export function PageHeader() {
  const pathname = usePathname();
  const defaultRouteInfo: RouteInfo = {
    title: "Administration",
    description: "Interface d'administration",
    icon: "layout-dashboard"
  };
  
  const routeInfo = pathname ? (routes[pathname] || defaultRouteInfo) : defaultRouteInfo;
  const Icon = getIconComponent(routeInfo.icon);

  return (
    <div className="border-b bg-background/50 px-8 py-4">
      <div className="flex items-center gap-3">
        {Icon && <Icon className="h-5 w-5 text-primary" />}
        <div>
          <h1 className="text-xl font-medium text-primary">{routeInfo.title}</h1>
          <p className="text-sm text-muted-foreground">{routeInfo.description}</p>
        </div>
      </div>
    </div>
  );
} 