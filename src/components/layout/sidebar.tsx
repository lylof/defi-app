"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Trophy,
  User,
  Settings,
  BookOpen,
  History,
  Award,
  Medal,
  LineChart,
} from "lucide-react";

const menuItems = [
  {
    title: "Tableau de bord",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Défis",
    href: "/challenges",
    icon: Trophy,
  },
  {
    title: "Classement",
    href: "/leaderboard",
    icon: Medal,
  },
  {
    title: "Progression",
    href: "/progression",
    icon: LineChart,
  },
  {
    title: "Mon profil",
    href: "/profile",
    icon: User,
  },
  {
    title: "Badges",
    href: "/badges",
    icon: Award,
  },
  {
    title: "Historique",
    href: "/history",
    icon: History,
  },
  {
    title: "Tutoriels",
    href: "/tutorials",
    icon: BookOpen,
  },
  {
    title: "Paramètres",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden border-r bg-gray-100/40 lg:block dark:bg-gray-800/40">
      <div className="flex h-full flex-col gap-2">
        <div className="flex-1 py-4">
          <nav className="grid items-start px-4 text-sm font-medium">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <Link
                  key={index}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
                    pathname === item.href
                      ? "bg-gray-200 text-gray-900 dark:bg-gray-800 dark:text-gray-50"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
} 