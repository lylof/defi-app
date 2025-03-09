import React from "react";
import { AlertCircle } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const errorAlertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4",
  {
    variants: {
      variant: {
        default: "border-red-200 bg-red-50 text-red-800 [&>svg]:text-red-600",
        warning: "border-amber-200 bg-amber-50 text-amber-800 [&>svg]:text-amber-600",
        info: "border-blue-200 bg-blue-50 text-blue-800 [&>svg]:text-blue-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface ErrorAlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof errorAlertVariants> {
  title?: string;
  message: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export function ErrorAlert({
  className,
  title,
  message,
  variant,
  icon = <AlertCircle className="h-5 w-5" />,
  children,
  ...props
}: ErrorAlertProps) {
  return (
    <div
      className={cn(errorAlertVariants({ variant }), className)}
      {...props}
    >
      {icon}
      <div className="space-y-2">
        {title && <h5 className="font-medium leading-none tracking-tight">{title}</h5>}
        <p className="text-sm">{message}</p>
        {children && <div className="mt-3">{children}</div>}
      </div>
    </div>
  );
} 