"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { IconName, getIconComponent } from "@/lib/icons";

interface NavItemProps {
  href: string;
  title: string;
  description: string;
  icon: IconName;
}

export function NavItem({ href, title, description, icon }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);
  const Icon = getIconComponent(icon);

  return (
    <Link 
      href={href}
      className={cn(
        "flex items-start space-x-2 p-3 rounded-md transition-colors",
        isActive 
          ? "bg-primary text-primary-foreground" 
          : "hover:bg-muted text-foreground hover:text-primary"
      )}
    >
      {Icon && (
        <Icon className={cn(
          "mt-px h-5 w-5",
          isActive ? "text-primary-foreground" : "text-muted-foreground"
        )} />
      )}
      <div className="space-y-1">
        <p className="text-sm font-medium leading-none">{title}</p>
        <p className={cn(
          "text-xs",
          isActive ? "text-primary-foreground/90" : "text-muted-foreground"
        )}>
          {description}
        </p>
      </div>
    </Link>
  );
} 