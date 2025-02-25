import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Erreur | Défi App",
  description: "Une erreur est survenue",
};

export default function AuthErrorPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-[400px]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Erreur</CardTitle>
          <CardDescription className="text-center">
            Une erreur est survenue lors de l'authentification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground">
            Veuillez réessayer ou contacter le support si le problème persiste.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link href="/auth/login">Retour à la connexion</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 