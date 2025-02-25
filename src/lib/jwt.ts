import jwt from "jsonwebtoken";
import { JwtPayload } from "jsonwebtoken";

// Définition du type pour le payload JWT
export interface CustomJwtPayload extends JwtPayload {
  id: string;
  email: string;
  role: string;
}

// Utilisation d'une variable d'environnement pour le secret JWT
const JWT_SECRET = process.env.NEXTAUTH_SECRET;
if (!JWT_SECRET) {
  throw new Error("La variable d'environnement NEXTAUTH_SECRET est requise");
}

/**
 * Génère un token JWT d'accès
 * @param payload - Les données à encoder dans le token
 * @returns Le token JWT signé
 */
export function signJwtAccessToken(payload: Partial<CustomJwtPayload>): string {
  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: "1h",
    algorithm: "HS256", // Spécification explicite de l'algorithme
  });
  return token;
}

/**
 * Vérifie et décode un token JWT
 * @param token - Le token JWT à vérifier
 * @returns Le payload décodé ou null si le token est invalide
 */
export function verifyJwtAccessToken(token: string): CustomJwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ["HS256"], // Restriction de l'algorithme accepté
    }) as CustomJwtPayload;
    return decoded;
  } catch (error) {
    console.error("Erreur de vérification JWT:", error);
    return null;
  }
}