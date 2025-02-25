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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata: Metadata = {
  title: "Connexion | Défi App",
  description: "Connectez-vous à votre compte",
};

export default function LoginPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-[400px]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Connexion</CardTitle>
          <CardDescription className="text-center">
            Entrez vos identifiants pour vous connecter
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="exemple@email.com"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full">Se connecter</Button>
          <p className="text-center text-sm text-muted-foreground">
            Pas encore de compte ?{" "}
            <Link
              href="/auth/register"
              className="text-primary underline-offset-4 hover:underline"
            >
              Créer un compte
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
} 