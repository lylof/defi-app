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
  title: "Inscription | Défi App",
  description: "Créez votre compte",
};

export default function RegisterPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-[400px]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Inscription</CardTitle>
          <CardDescription className="text-center">
            Créez votre compte pour participer aux défis
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nom</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
            />
          </div>
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
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
            <Input
              id="confirmPassword"
              type="password"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full">S'inscrire</Button>
          <p className="text-center text-sm text-muted-foreground">
            Déjà un compte ?{" "}
            <Link
              href="/auth/login"
              className="text-primary underline-offset-4 hover:underline"
            >
              Se connecter
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
} 