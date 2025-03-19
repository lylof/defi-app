"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Bell, ChevronLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Sheet, 
  SheetTrigger, 
  SheetContent 
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";

// Définir le type des éléments de navigation
interface NavItem {
  title: string;
  description: string;
  href: string;
  icon: string;
}

// Définir les éléments de navigation ici puisqu'on ne peut pas les importer du layout
const navItems: NavItem[] = [
  {
    title: "Tableau de bord",
    description: "Vue d'ensemble et statistiques",
    href: "/admin",
    icon: "layout-dashboard"
  },
  {
    title: "Gestion Utilisateurs",
    description: "Gérer les comptes et les rôles",
    href: "/admin/users",
    icon: "users"
  },
  {
    title: "Gestion des Défis",
    description: "Créer et gérer les défis",
    href: "/admin/challenges",
    icon: "folder-kanban"
  },
  {
    title: "Catégories",
    description: "Organiser les défis par catégorie",
    href: "/admin/categories",
    icon: "tags"
  },
  {
    title: "Soumissions",
    description: "Évaluer les soumissions des participants",
    href: "/admin/submissions",
    icon: "clipboard-check"
  },
  {
    title: "Badges",
    description: "Gérer les badges et récompenses",
    href: "/admin/badges",
    icon: "award"
  },
  {
    title: "Logs d'activité",
    description: "Historique des actions administratives",
    href: "/admin/logs",
    icon: "history"
  },
  {
    title: "Santé du Système",
    description: "Surveiller l'état du système",
    href: "/admin/health",
    icon: "line-chart"
  }
];

export function PageHeader() {
  const pathname = usePathname();
  
  // Déterminer le titre de la page en fonction du chemin
  const getPageTitle = () => {
    // Page d'accueil admin
    if (pathname === "/admin") {
      return "Tableau de bord";
    }
    
    // Chercher un match dans les items de navigation
    const navItem = navItems.find(item => 
      pathname === item.href || pathname.startsWith(`${item.href}/`)
    );
    
    if (navItem) {
      // Si on est dans une sous-page, ajouter un indicateur
      if (pathname !== navItem.href) {
        const segments = pathname.split('/');
        const lastSegment = segments[segments.length - 1];
        
        // Transformer les identifiants en titres plus lisibles
        if (lastSegment === "new") {
          return `Nouveau ${navItem.title.toLowerCase()}`;
        } else if (lastSegment === "edit") {
          return `Modifier ${navItem.title.toLowerCase()}`;
        } else {
          return `${navItem.title} > Détails`;
        }
      }
      return navItem.title;
    }
    
    // Fallback
    return "Administration";
  };

  // Vérifier si on est sur une page détaillée (avec des segments de chemin supplémentaires)
  const isDetailPage = () => {
    const segments = pathname.split('/').filter(Boolean);
    return segments.length > 2; // /admin/section/detail
  };

  // Obtenir l'URL parente
  const getParentUrl = () => {
    const segments = pathname.split('/').filter(Boolean);
    return `/${segments.slice(0, 2).join('/')}`;
  };

  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex items-center gap-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <div className="flex flex-col h-full">
              <div className="px-4 py-6 border-b">
                <Link href="/admin" className="flex items-center gap-2 font-semibold text-xl">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
                    LPT
                  </div>
                  <span>Admin</span>
                </Link>
              </div>
              
              <nav className="flex-1 overflow-y-auto p-4">
                <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">Menu principal</p>
                <div className="space-y-1 mb-6">
                  {navItems.slice(0, 5).map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`admin-nav-item flex items-center px-3 py-2 rounded-md ${isActive ? "bg-primary/10 text-primary font-medium" : ""}`}
                      >
                        {item.title}
                      </Link>
                    );
                  })}
                </div>
                
                <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">Configuration</p>
                <div className="space-y-1">
                  {navItems.slice(5).map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`admin-nav-item flex items-center px-3 py-2 rounded-md ${isActive ? "bg-primary/10 text-primary font-medium" : ""}`}
                      >
                        {item.title}
                      </Link>
                    );
                  })}
                </div>
              </nav>
              
              <div className="p-4 border-t mt-auto">
                <Button variant="outline" size="sm" asChild className="w-full justify-center">
                  <Link href="/api/auth/signout">Déconnexion</Link>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        
        {isDetailPage() && (
          <Button 
            variant="ghost" 
            size="sm" 
            asChild 
            className="flex items-center text-muted-foreground hover:text-foreground mr-2"
          >
            <Link href={getParentUrl()}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              <span>Retour</span>
            </Link>
          </Button>
        )}
        
        <h1 className="text-xl font-semibold tracking-tight">{getPageTitle()}</h1>
      </div>
      
      <div className="hidden md:flex items-center gap-4 w-80">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Rechercher..." 
            className="pl-9 bg-background/50 focus:bg-background h-9" 
          />
        </div>
      </div>
    </div>
  );
} 