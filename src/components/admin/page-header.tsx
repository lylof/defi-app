"use client";

import { usePathname } from "next/navigation";

const routes = {
  "/admin": "Tableau de bord",
  "/admin/users": "Gestion Utilisateurs",
  "/admin/challenges": "Gestion des Défis",
  "/admin/categories": "Catégories"
};

export function PageHeader() {
  const pathname = usePathname();
  const title = routes[pathname as keyof typeof routes] || "Dashboard";

  return (
    <div className="border-b bg-background/50 px-8 py-3">
      <h1 className="text-lg font-medium">{title}</h1>
    </div>
  );
} 