import { redirect } from "next/navigation";

export default function SignInPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Récupérer les paramètres de recherche
  const callbackUrl = searchParams.callbackUrl as string || "/";
  const error = searchParams.error as string || undefined;

  // Construire l'URL de redirection
  let redirectUrl = `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`;
  
  // Ajouter le paramètre d'erreur si présent
  if (error) {
    redirectUrl += `&error=${encodeURIComponent(error)}`;
  }

  // Rediriger vers la page de connexion
  redirect(redirectUrl);
} 