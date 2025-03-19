"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Bell, ChevronLeft, Search, HelpCircle, Settings, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Sheet, 
  SheetTrigger, 
  SheetContent 
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import * as Icons from "lucide-react";
import { NavItem } from "./nav-item";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import React from "react";

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
    icon: "LayoutDashboard"
  },
  {
    title: "Gestion Utilisateurs",
    description: "Gérer les comptes et les rôles",
    href: "/admin/users",
    icon: "Users"
  },
  {
    title: "Gestion des Défis",
    description: "Créer et gérer les défis",
    href: "/admin/challenges",
    icon: "Trophy"
  },
  {
    title: "Catégories",
    description: "Organiser les défis par catégorie",
    href: "/admin/categories",
    icon: "Tags"
  },
  {
    title: "Soumissions",
    description: "Évaluer les soumissions des participants",
    href: "/admin/submissions",
    icon: "ClipboardCheck"
  },
  {
    title: "Badges",
    description: "Gérer les badges et récompenses",
    href: "/admin/badges",
    icon: "Award"
  },
  {
    title: "Logs d'activité",
    description: "Historique des actions administratives",
    href: "/admin/logs",
    icon: "History"
  },
  {
    title: "Santé du Système",
    description: "Surveiller l'état du système",
    href: "/admin/health",
    icon: "LineChart"
  }
];

// Function to get user's initial letters for avatar
const getInitials = (name: string = "Admin User") => {
  const nameParts = name.split(' ');
  if (nameParts.length >= 2) {
    return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

// Ajouter une interface pour les props d'icône
interface IconProps {
  className?: string;
}

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

  const fadeInAnimationVariants = {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <motion.div 
      className="flex w-full items-center justify-between"
      initial="initial"
      animate="animate"
      variants={fadeInAnimationVariants}
    >
      <div className="flex items-center gap-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden admin-btn-enhanced">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0 admin-sidebar-enhanced">
            <div className="flex flex-col h-full">
              <div className="px-6 py-6 border-b">
                <Link href="/admin" className="flex items-center gap-2 font-semibold text-xl">
                  <div className="w-9 h-9 bg-gradient-to-br from-primary to-blue-400 rounded-xl flex items-center justify-center text-white">
                    <span className="text-sm font-bold">LPT</span>
                  </div>
                  <span className="ml-2">Admin</span>
                </Link>
              </div>
              
              <div className="admin-profile-section mx-6 my-5 admin-card-enhanced p-4 group">
                <div className="flex items-center gap-3 mb-2">
                  <Avatar className="h-10 w-10 border border-primary/10 group-hover:border-primary/30 transition-all">
                    <AvatarImage src="/placeholder-user.jpg" />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">{getInitials()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">Admin User</p>
                    <p className="text-xs text-muted-foreground">admin@example.com</p>
                  </div>
                </div>
                <div className="relative w-full mt-3">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="search" 
                    placeholder="Rechercher..." 
                    className="pl-9 bg-background/50 focus:bg-background h-9 w-full admin-input-enhanced text-sm" 
                  />
                </div>
              </div>
              
              <nav className="flex-1 px-4 pb-4 overflow-y-auto">
                <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider px-4">Menu principal</p>
                <div className="space-y-1">
                  {navItems.slice(0, 5).map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    const IconComponent = item.icon && Icons[item.icon as keyof typeof Icons] as React.ComponentType<IconProps>;
                    
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`admin-nav-item-enhanced group flex items-center px-4 py-2 rounded-lg ${
                          isActive 
                            ? "active bg-primary/10 text-primary" 
                            : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                        }`}
                      >
                        <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all ${
                          isActive 
                            ? "bg-primary/15 text-primary" 
                            : "text-muted-foreground bg-transparent group-hover:bg-primary/5 group-hover:text-primary"
                        }`}>
                          {IconComponent && <IconComponent className="h-4.5 w-4.5 transition-transform group-hover:scale-110" />}
                        </div>
                        <span className="ml-3 font-medium">{item.title}</span>
                      </Link>
                    );
                  })}
                </div>
                
                <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider px-4 mt-6">Configuration</p>
                <div className="space-y-1">
                  {navItems.slice(5).map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    const IconComponent = item.icon && Icons[item.icon as keyof typeof Icons] as React.ComponentType<IconProps>;
                    
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`admin-nav-item-enhanced group flex items-center px-4 py-2 rounded-lg ${
                          isActive 
                            ? "active bg-primary/10 text-primary" 
                            : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                        }`}
                      >
                        <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all ${
                          isActive 
                            ? "bg-primary/15 text-primary" 
                            : "text-muted-foreground bg-transparent group-hover:bg-primary/5 group-hover:text-primary"
                        }`}>
                          {IconComponent && <IconComponent className="h-4.5 w-4.5 transition-transform group-hover:scale-110" />}
                        </div>
                        <span className="ml-3 font-medium">{item.title}</span>
                      </Link>
                    );
                  })}
                </div>
              </nav>
              
              <div className="px-4 pt-4 pb-6 border-t mt-auto">
                <div className="space-y-2">
                  <Button variant="ghost" size="sm" className="admin-btn-enhanced secondary justify-start w-full">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Centre d'aide
                  </Button>
                  <Button variant="ghost" size="sm" className="admin-btn-enhanced secondary justify-start w-full">
                    <Settings className="mr-2 h-4 w-4" />
                    Paramètres
                  </Button>
                  <Button variant="outline" size="sm" asChild className="admin-btn-enhanced secondary justify-start w-full hover:text-red-500">
                    <Link href="/api/auth/signout">
                      <LogOut className="mr-2 h-4 w-4" />
                      Déconnexion
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        
        {isDetailPage() && (
          <Button 
            variant="ghost" 
            size="sm" 
            asChild 
            className="flex items-center text-muted-foreground hover:text-foreground mr-2 admin-btn-enhanced secondary"
          >
            <Link href={getParentUrl()}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              <span>Retour</span>
            </Link>
          </Button>
        )}
        
        <motion.h1 
          className="text-xl font-semibold tracking-tight"
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {getPageTitle()}
        </motion.h1>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative w-64 hidden md:block admin-scale-in">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Rechercher..." 
            className="pl-9 bg-background/50 focus:bg-background h-9 admin-input-enhanced" 
          />
        </div>
        
        <Button variant="ghost" size="icon" className="admin-btn-enhanced rounded-full">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary flex items-center justify-center text-[10px] text-white font-semibold">3</span>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full admin-btn-enhanced p-0">
              <Avatar className="h-9 w-9 border border-primary/10">
                <AvatarImage src="/placeholder-user.jpg" />
                <AvatarFallback className="bg-primary/10 text-primary font-medium">{getInitials()}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 admin-card-enhanced">
            <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profil</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Paramètres</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-500">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Déconnexion</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
} 