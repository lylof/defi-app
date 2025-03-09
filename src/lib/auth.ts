import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "./db";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { User } from "@prisma/client";

// Durée de session par défaut: 30 jours
const DEFAULT_SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 jours en secondes
// Durée de session courte: 1 jour
const SHORT_SESSION_MAX_AGE = 24 * 60 * 60; // 1 jour en secondes

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as any, // Cast pour éviter les erreurs de type
  session: {
    strategy: "jwt",
    maxAge: DEFAULT_SESSION_MAX_AGE,
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        rememberMe: { label: "Remember Me", type: "checkbox" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email et mot de passe requis");
        }

        const user = await db.user.findUnique({
          where: {
            email: credentials.email,
            isActive: true
          }
        });

        if (!user || !user.password) {
          throw new Error("Email ou mot de passe incorrect");
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValid) {
          throw new Error("Email ou mot de passe incorrect");
        }

        // Mettre à jour la date de dernière connexion
        await db.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() }
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          // Stocker l'option "Se souvenir de moi" dans un champ personnalisé
          rememberMe: credentials.rememberMe === "true"
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        
        // Définir la durée de session en fonction de l'option "Se souvenir de moi"
        // @ts-ignore - Nous savons que user.rememberMe existe car nous l'avons ajouté
        const rememberMe = user.rememberMe === true;
        
        if (!rememberMe) {
          token.sessionMaxAge = SHORT_SESSION_MAX_AGE;
        } else {
          token.sessionMaxAge = DEFAULT_SESSION_MAX_AGE;
        }
        
        // Ajouter l'heure d'expiration
        token.sessionExpiry = Date.now() + (token.sessionMaxAge as number) * 1000;
      }
      
      // Vérifier si la session a expiré
      if (token.sessionExpiry && Date.now() > (token.sessionExpiry as number)) {
        return { ...token, error: "SessionExpired" };
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.role = token.role as User["role"];
        
        // Corriger l'erreur de date en vérifiant que sessionExpiry est valide
        if (token.sessionExpiry && typeof token.sessionExpiry === 'number') {
          try {
            // Utiliser une date valide et vérifier qu'elle est dans les limites acceptables
            const expiryDate = new Date(token.sessionExpiry);
            // Vérifier que la date est valide (entre 1970 et 2100)
            if (expiryDate.getTime() > 0 && expiryDate.getTime() < 4102444800000) {
              session.expires = expiryDate.toISOString();
            } else {
              // Fallback à une expiration par défaut si la date est invalide
              session.expires = new Date(Date.now() + DEFAULT_SESSION_MAX_AGE * 1000).toISOString();
            }
          } catch (error) {
            // En cas d'erreur, utiliser une date d'expiration par défaut
            session.expires = new Date(Date.now() + DEFAULT_SESSION_MAX_AGE * 1000).toISOString();
          }
        } else {
          // Si sessionExpiry n'est pas défini, utiliser une date d'expiration par défaut
          session.expires = new Date(Date.now() + DEFAULT_SESSION_MAX_AGE * 1000).toISOString();
        }
      }
      return session;
    }
  },
  debug: process.env.NODE_ENV === "development",
}; 