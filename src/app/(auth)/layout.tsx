import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | LPT Défis",
    default: "LPT Défis",
  },
  description: "Plateforme de défis de développement",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 