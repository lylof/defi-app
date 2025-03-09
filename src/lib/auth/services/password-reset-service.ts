import { db } from "@/lib/db";
import { randomBytes } from "crypto";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

export class PasswordResetService {
  /**
   * Génère un token de réinitialisation pour l'email spécifié
   * @param email Email de l'utilisateur
   * @returns Le token généré ou null si l'utilisateur n'existe pas
   */
  static async generateResetToken(email: string): Promise<string | null> {
    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    // Générer un token aléatoire
    const token = randomBytes(32).toString("hex");
    
    // Définir l'expiration (24 heures)
    const expires = new Date();
    expires.setHours(expires.getHours() + 24);

    // Supprimer les anciens tokens pour cet email
    await prisma.passwordReset.deleteMany({
      where: { email },
    });

    // Créer un nouveau token
    await prisma.passwordReset.create({
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
    const resetRecord = await prisma.passwordReset.findUnique({
      where: { token },
    });

    if (!resetRecord) {
      return null;
    }

    // Vérifier si le token a expiré
    if (resetRecord.expires < new Date()) {
      // Supprimer le token expiré
      await prisma.passwordReset.delete({
        where: { id: resetRecord.id },
      });
      return null;
    }

    return resetRecord.email;
  }

  /**
   * Réinitialise le mot de passe d'un utilisateur
   * @param token Token de réinitialisation
   * @param newPassword Nouveau mot de passe
   * @returns true si la réinitialisation a réussi, false sinon
   */
  static async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const email = await this.verifyToken(token);

    if (!email) {
      return false;
    }

    try {
      // Hacher le nouveau mot de passe
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Mettre à jour le mot de passe de l'utilisateur
      await prisma.user.update({
        where: { email },
        data: { password: hashedPassword },
      });

      // Supprimer le token utilisé
      await prisma.passwordReset.deleteMany({
        where: { email },
      });

      return true;
    } catch (error) {
      console.error("Erreur lors de la réinitialisation du mot de passe:", error);
      return false;
    }
  }
} 