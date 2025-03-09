import { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { 
  LayoutDashboard, 
  Users, 
  FolderKanban,
  Tags,
  LogOut
} from "lucide-react";
import { NavItem } from "@/components/admin/nav-item";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toast";
import { PageHeader } from "@/components/admin/page-header";

export const metadata: Metadata = {
  title: "Administration",
  description: "Interface d'administration",
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
    <div className="min-h-screen bg-background">
      {/* Header avec distinction visuelle */}
      <header className="border-b bg-primary/5">
        <div className="flex h-16 items-center px-4">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold">LPT Défis</span>
            </Link>
            <span className="text-sm px-2 py-1 rounded-md bg-primary text-white font-medium">
              Mode Administration
            </span>
          </div>
          
          <div className="ml-auto flex items-center space-x-4">
            <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-background">
              <span className="text-sm font-medium">
                {session.user.name}
              </span>
              <Button variant="ghost" size="sm" asChild>
                <Link 
                  href="/api/auth/signout" 
                  className="flex items-center gap-2 text-destructive hover:text-destructive/90"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Déconnexion</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar avec distinction visuelle renforcée */}
        <aside className="w-64 border-r bg-primary/5">
          <div className="p-4 border-b bg-primary/10">
            <h2 className="font-semibold text-primary">Menu Administration</h2>
          </div>
          <nav className="space-y-1 p-4">
            {navItems.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                title={item.title}
                description={item.description}
                icon={item.icon}
              />
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto bg-background">
          <PageHeader />
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>

      <Toaster />
    </div>
  );
} 