import { Metadata } from "next";
import { fontSans } from "@/lib/fonts/font-sans";
import { cn } from "@/lib/utils";
import "./globals.css";
import { SkipLink } from "@/components/ui/skip-link";
import { initializeServer } from "@/lib/server-init";
import { NotificationContainer } from "@/components/ui/notification-container";
import { SWRProvider } from "@/lib/providers/SWRProvider";
import Providers from "@/components/providers";

export const metadata: Metadata = {
  title: "LPT Défis",
  description: "Plateforme de défis de développement",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
};

// Initialiser les données du serveur
initializeServer();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head />
      <body className={cn(
        "font-sans antialiased",
        fontSans.variable
      )}>
        <SkipLink />
        <main id="main-content">
          <SWRProvider>
            <Providers>
              {children}
              <NotificationContainer />
            </Providers>
          </SWRProvider>
        </main>
      </body>
    </html>
  );
}