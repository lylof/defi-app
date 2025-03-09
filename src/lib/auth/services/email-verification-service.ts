import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

export class EmailVerificationService {
  /**
   * Génère un token de vérification pour l'email spécifié
   * @param email Email de l'utilisateur
   * @returns Le token généré ou null si l'utilisateur n'existe pas
   */
  static async generateVerificationToken(email: string): Promise<string | null> {
    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    // Si l'email est déjà vérifié, ne pas générer de token
    if (user.emailVerified) {
      return null;
    }

    // Générer un token aléatoire
    const token = randomBytes(32).toString("hex");
    
    // Définir l'expiration (24 heures)
    const expires = new Date();
    expires.setHours(expires.getHours() + 24);

    // Supprimer les anciens tokens pour cet email
    await prisma.emailVerification.deleteMany({
      where: { email },
    });

    // Créer un nouveau token
    await prisma.emailVerification.create({
      data: {
        email,
        token,
        expires,
      },
    });

    return token;
  }

  /**
   * Vérifie si un token est valide
   * @param token Token à vérifier
   * @returns L'email associé au token ou null si le token est invalide
   */
  static async verifyToken(token: string): Promise<string | null> {
    const verificationRecord = await prisma.emailVerification.findUnique({
      where: { token },
    });

    if (!verificationRecord) {
      return null;
    }

    // Vérifier si le token a expiré
    if (verificationRecord.expires < new Date()) {
      // Supprimer le token expiré
      await prisma.emailVerification.delete({
        where: { id: verificationRecord.id },
      });
      return null;
    }

    return verificationRecord.email;
  }

  /**
   * Marque un email comme vérifié
   * @param token Token de vérification
   * @returns true si la vérification a réussi, false sinon
   */
  static async verifyEmail(token: string): Promise<boolean> {
    const email = await this.verifyToken(token);

    if (!email) {
      return false;
    }

    try {
      // Mettre à jour l'utilisateur pour marquer l'email comme vérifié
      await prisma.user.update({
        where: { email },
        data: { emailVerified: new Date() },
      });

      // Supprimer le token utilisé
      await prisma.emailVerification.deleteMany({
        where: { email },
      });

      return true;
    } catch (error) {
      console.error("Erreur lors de la vérification de l'email:", error);
      return false;
    }
  }
} 