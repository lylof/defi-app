"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon } from "lucide-react";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItemProps {
  href: string;
  title: string;
  description?: string;
  icon: string;
}

export function NavItem({ href, title, description, icon }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);
  
  // Créer dynamiquement l'icône à partir du nom fourni
  const Icon = Icons[icon as keyof typeof Icons] as LucideIcon || Icons.Circle;

  return (
    <Link
      href={href}
      className={cn(
        "admin-nav-item-enhanced group flex flex-col rounded-lg px-3 py-2 transition-colors",
        isActive
          ? "active bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "flex items-center justify-center w-8 h-8 rounded-lg transition-all",
          isActive 
            ? "bg-primary/15 text-primary" 
            : "text-muted-foreground bg-transparent group-hover:bg-primary/5 group-hover:text-primary"
        )}>
          <Icon className={cn(
            "h-4.5 w-4.5 transition-transform group-hover:scale-110",
            isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"
          )} />
        </div>
        <div>
          <div className={cn("font-medium text-sm", isActive ? "text-primary" : "text-foreground")}>
            {title}
          </div>
          {description && (
            <p className="text-xs text-muted-foreground line-clamp-1">
              {description}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
} 