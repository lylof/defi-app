"use client";

import * as React from "react";
import { toast as sonnerToast, Toaster as Sonner } from "sonner";
import { cn } from "@/lib/utils";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className={cn(
        "toaster group",
        "[&_li:has([role=status])]:bg-background [&_li:has([role=status])]:text-foreground [&_li:has([role=status])]:border-border",
        "[&_li:has([role=alert])]:bg-destructive [&_li:has([role=alert])]:text-destructive-foreground [&_li:has([role=alert])]:border-destructive"
      )}
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };

export function toast(options: { title: string; description?: string; type?: "success" | "error" }) {
  const { title, description, type = "success" } = options;
  
  if (type === "error") {
    sonnerToast.error(title, {
      description,
    });
  } else {
    sonnerToast.success(title, {
      description,
    });
  }
} 