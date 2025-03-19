"use client";

import { cn } from "@/lib/utils";

export function AdminFormContainer({ 
  children, 
  className 
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(
      "bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-100 dark:border-gray-700",
      "admin-card",
      className
    )}>
      {children}
    </div>
  );
}

export function AdminFormHeader({ 
  title, 
  description 
}: { 
  title: string;
  description?: string;
}) {
  return (
    <div className="p-6 border-b border-gray-100 dark:border-gray-700">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
      {description && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
      )}
    </div>
  );
}

export function AdminFormContent({ 
  children, 
  className 
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("p-6", className)}>
      {children}
    </div>
  );
}

export function AdminFormFooter({ 
  children, 
  className 
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(
      "flex justify-end items-center gap-3 p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50",
      className
    )}>
      {children}
    </div>
  );
}

export function AdminFormDivider() {
  return <div className="h-px bg-gray-100 dark:bg-gray-700 my-6" />;
}

export function AdminFormSection({ 
  title, 
  description, 
  children 
}: { 
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{title}</h3>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export function AdminFormGrid({ 
  children, 
  columns = 1
}: { 
  children: React.ReactNode;
  columns?: 1 | 2 | 3;
}) {
  return (
    <div className={cn(
      "grid gap-6",
      columns === 1 ? "grid-cols-1" : 
      columns === 2 ? "grid-cols-1 md:grid-cols-2" : 
      "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
    )}>
      {children}
    </div>
  );
} 