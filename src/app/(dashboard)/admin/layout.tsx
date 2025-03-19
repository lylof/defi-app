import { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { 
  LogOut,
  Settings,
  HelpCircle,
  Bell
} from "lucide-react";
import { NavItem } from "@/components/admin/nav-item";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { PageHeader } from "@/components/admin/page-header";
import "@/styles/admin.css";

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

  return (
    <div className="admin-interface flex h-screen bg-background">
      <aside className="admin-nav hidden md:flex md:flex-col md:w-80 p-6 border-r space-y-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-10">
          <Link 
            href="/admin" 
            className="flex items-center space-x-2 text-primary font-bold text-2xl transition-transform hover:scale-105"
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
              LPT
            </div>
            <span>Admin</span>
          </Link>
        </div>
        
        <div className="admin-profile-section mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="admin-profile-avatar w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-semibold">
              {session.user.name?.[0] || "A"}
            </div>
            <div>
              <p className="font-semibold text-base">{session.user.name}</p>
              <p className="text-sm text-muted-foreground">{session.user.email}</p>
              <span className="admin-badge admin-badge-success mt-1">Administrateur</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-1">
          <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wider mb-2 px-3">
            Menu principal
          </p>
          <nav className="space-y-1">
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
          <nav className="space-y-1">
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
            <Button variant="ghost" size="sm" className="admin-btn admin-btn-secondary justify-start">
              <HelpCircle className="mr-2 h-4 w-4" />
              Centre d'aide
            </Button>
            <Button variant="ghost" size="sm" className="admin-btn admin-btn-secondary justify-start">
              <Settings className="mr-2 h-4 w-4" />
              Paramètres
            </Button>
            <Button variant="outline" size="sm" asChild className="admin-btn admin-btn-secondary justify-start">
              <Link href="/api/auth/signout">
                <LogOut className="mr-2 h-4 w-4" />
                Déconnexion
              </Link>
            </Button>
          </div>
        </div>
      </aside>

      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="admin-header sticky top-0 z-30 flex h-16 items-center gap-4 border-b px-6">
          <PageHeader />
          
          <div className="ml-auto flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                3
              </span>
            </Button>
            
            <Button variant="ghost" size="sm" asChild className="hidden sm:flex gap-2 items-center">
              <Link href="/">
                Voir le site
              </Link>
            </Button>
          </div>
        </header>
        
        <main className="admin-main flex-1 overflow-y-auto p-6 md:p-8 bg-background">
          <div className="admin-fade-in mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
      
      <Toaster />
    </div>
  );
} 