import { Inter } from "next/font/google";
import "./globals.css";
import { Metadata } from "next";
import Providers from "@/components/providers";
import { initializeServer } from "@/lib/server-init";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LPT Défis",
  description: "Plateforme de défis de développement",
};

// Initialiser les données serveur au démarrage de l'application
// Cette fonction est exécutée une seule fois au démarrage du serveur
initializeServer().catch(error => {
  console.error("Erreur d'initialisation:", error);
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head />
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
