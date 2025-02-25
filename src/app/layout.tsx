import { Inter } from "next/font/google";
import "./globals.css";
import { Metadata } from "next";
import Providers from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LPT Défis",
  description: "Plateforme de défis de développement",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
