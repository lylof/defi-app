"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LucideIcon,
  LayoutDashboard,
  Users,
  FolderKanban,
  Tags,
  ClipboardCheck,
  Award,
  History,
  LineChart,
  Activity,
  BarChart,
  ServerCrash,
  Shield,
  FileSearch,
  Gauge
} from "lucide-react";

// Type pour les noms d'icônes supportées
type IconName = 
  | "layout-dashboard" 
  | "users" 
  | "folder-kanban" 
  | "tags" 
  | "clipboard-check" 
  | "award" 
  | "history"
  | "line-chart"
  | "activity"
  | "bar-chart"
  | "server-crash"
  | "shield"
  | "file-search"
  | "gauge";

// Mapping des noms d'icônes vers les composants
const iconMap: Record<IconName, LucideIcon> = {
  "layout-dashboard": LayoutDashboard,
  "users": Users,
  "folder-kanban": FolderKanban,
  "tags": Tags,
  "clipboard-check": ClipboardCheck,
  "award": Award,
  "history": History,
  "line-chart": LineChart,
  "activity": Activity,
  "bar-chart": BarChart,
  "server-crash": ServerCrash,
  "shield": Shield,
  "file-search": FileSearch,
  "gauge": Gauge
};

interface NavItemProps {
  href: string;
  title: string;
  description?: string;
  icon: IconName;
}

export function NavItem({ href, title, description, icon }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;
  
  // Récupérer le composant d'icône du mapping
  const Icon = iconMap[icon];

  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground",
        isActive ? "bg-accent text-accent-foreground" : "transparent"
      )}
    >
      <div className="flex items-center">
        <Icon className={cn("mr-2 h-4 w-4", 
          isActive ? "text-foreground" : "text-muted-foreground"
        )} />
        <span className="font-medium">{title}</span>
      </div>
      {description && (
        <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
          {description}
        </p>
      )}
    </Link>
  );
} 