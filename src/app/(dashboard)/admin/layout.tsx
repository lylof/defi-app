import { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { 
  LogOut,
  Settings,
  HelpCircle,
  Bell,
  ChevronDown,
  Search
} from "lucide-react";
import { NavItem } from "@/components/admin/nav-item";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { PageHeader } from "@/components/admin/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import "@/styles/admin.css";
import "@/styles/admin-enhanced.css";

export const metadata: Metadata = {
  title: "Administration | LPT Défis",
  description: "Interface d'administration de la plateforme LPT Défis",
};

const navItems = [
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
] as const;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  // Récupérer les initiales de l'utilisateur pour l'avatar
  const getInitials = (name: string | null | undefined): string => {
    if (!name) return "A";
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const userInitials = getInitials(session.user.name);

  return (
    <div className="admin-interface flex h-screen bg-background">
      {/* Sidebar avec effet glassmorphism */}
      <aside className="admin-sidebar-enhanced hidden md:flex md:flex-col md:w-80 p-6 border-r space-y-6 overflow-y-auto admin-custom-scrollbar">
        <div className="flex items-center justify-between mb-10">
          <Link 
            href="/admin" 
            className="flex items-center space-x-2 text-primary font-bold text-2xl transition-all hover:scale-105"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-400 rounded-xl flex items-center justify-center text-white">
              <span className="text-sm font-bold">LPT</span>
            </div>
            <span className="ml-2">Admin</span>
          </Link>
        </div>
        
        <div className="admin-profile-section mb-8 admin-card-enhanced p-4 group">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-14 w-14 border-2 border-primary/10 group-hover:border-primary/30 transition-all">
              <AvatarImage src={session.user.image || ""} alt={session.user.name || "Avatar"} />
              <AvatarFallback className="bg-primary/10 text-primary">{userInitials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-base">{session.user.name}</p>
              <p className="text-sm text-muted-foreground">{session.user.email}</p>
              <span className="admin-badge-enhanced success inline-flex items-center mt-1 text-xs px-2 py-0.5">Administrateur</span>
            </div>
          </div>
          
          <div className="bg-muted/30 rounded-lg p-3 text-sm group-hover:bg-muted/50 transition-all">
            <div className="flex justify-between text-muted-foreground">
              <span>Dernière connexion:</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        
        <div className="relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/0 rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-1000"></div>
          <div className="relative w-full p-2 flex items-center rounded-lg border border-input bg-background">
            <Search className="h-4 w-4 text-muted-foreground mr-2" />
            <input 
              type="search" 
              placeholder="Rechercher..." 
              className="flex-1 bg-transparent border-0 outline-none text-sm" 
            />
          </div>
        </div>
        
        <div className="space-y-1">
          <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wider mb-2 px-3">
            Menu principal
          </p>
          <nav className="space-y-1.5">
            {navItems.slice(0, 5).map((item) => (
              <NavItem
                key={item.href}
                title={item.title}
                description={item.description}
                href={item.href}
                icon={item.icon}
              />
            ))}
          </nav>
        </div>
        
        <div className="space-y-1 pt-4">
          <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wider mb-2 px-3">
            Configuration
          </p>
          <nav className="space-y-1.5">
            {navItems.slice(5).map((item) => (
              <NavItem
                key={item.href}
                title={item.title}
                description={item.description}
                href={item.href}
                icon={item.icon}
              />
            ))}
          </nav>
        </div>
        
        <div className="mt-auto pt-6 border-t">
          <div className="flex flex-col gap-2">
            <Button variant="ghost" size="sm" className="admin-btn-enhanced secondary justify-start">
              <HelpCircle className="mr-2 h-4 w-4" />
              Centre d'aide
            </Button>
            <Button variant="ghost" size="sm" className="admin-btn-enhanced secondary justify-start">
              <Settings className="mr-2 h-4 w-4" />
              Paramètres
            </Button>
            <Button variant="outline" size="sm" asChild className="admin-btn-enhanced secondary justify-start hover:text-red-500 hover:border-red-200">
              <Link href="/api/auth/signout">
                <LogOut className="mr-2 h-4 w-4" />
                Déconnexion
              </Link>
            </Button>
          </div>
        </div>
      </aside>

      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="admin-header-enhanced sticky top-0 z-30 flex h-16 items-center gap-4 border-b px-6">
          <PageHeader />
          
          <div className="ml-auto flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-r from-primary to-blue-400 text-[10px] font-medium text-white flex items-center justify-center shadow-sm animate-pulse">
                3
              </span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8 border border-primary/10">
                    <AvatarImage src={session.user.image || ""} alt={session.user.name || "Avatar"} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">{userInitials}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium hidden md:inline-block">{session.user.name?.split(' ')[0]}</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/profile">Profil</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/settings">Paramètres</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="text-red-500">
                  <Link href="/api/auth/signout">Déconnexion</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button variant="ghost" size="sm" asChild className="hidden sm:flex gap-2 items-center admin-btn-enhanced secondary">
              <Link href="/">
                Voir le site
              </Link>
            </Button>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-6 admin-custom-scrollbar">
          <div className="mx-auto container admin-fade-in-up">
            {children}
          </div>
        </main>
        
        <Toaster />
      </div>
    </div>
  );
} 