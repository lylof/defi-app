"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon } from "lucide-react";

interface NavLinkProps {
  href: string;
  icon: LucideIcon;
  children: React.ReactNode;
}

export function NavLink({ href, icon: Icon, children }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`group flex items-center px-2 py-2 text-base font-medium rounded-md transition-colors ${
        isActive 
          ? "bg-blue-50 text-blue-700" 
          : "text-gray-900 hover:bg-gray-50"
      }`}
    >
      <Icon 
        className={`mr-3 h-6 w-6 ${
          isActive ? "text-blue-700" : "text-gray-500"
        }`} 
      />
      {children}
    </Link>
  );
} 