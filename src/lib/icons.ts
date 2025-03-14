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
export type IconName = 
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

/**
 * Récupère le composant d'icône correspondant au nom fourni
 * @param name Nom de l'icône à récupérer
 * @returns Composant d'icône Lucide
 */
export function getIconComponent(name: IconName): LucideIcon {
  return iconMap[name];
} 