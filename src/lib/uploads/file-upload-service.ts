import { writeFile, mkdir } from "fs/promises";
import { join, extname } from "path";
import { existsSync } from "fs";
import crypto from "crypto";

// Types de fichiers autorisés par catégorie
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
  "text/plain",
  "text/markdown",
];
const ALLOWED_ARCHIVE_TYPES = [
  "application/zip",
  "application/x-rar-compressed",
  "application/x-7z-compressed",
  "application/gzip",
];
const ALLOWED_CODE_TYPES = [
  "text/plain",
  "text/html",
  "text/css",
  "text/javascript",
  "application/json",
  "application/xml",
  "text/markdown",
];

// Tailles maximales par catégorie (en octets)
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_ARCHIVE_SIZE = 20 * 1024 * 1024; // 20MB
const MAX_CODE_SIZE = 2 * 1024 * 1024; // 2MB

// Extensions de fichiers dangereuses
const DANGEROUS_EXTENSIONS = [
  ".exe", ".dll", ".bat", ".cmd", ".sh", ".php", ".phtml", ".asp", ".aspx", ".jsp", ".cgi",
  ".com", ".scr", ".vbs", ".vbe", ".js", ".jse", ".wsf", ".wsh", ".msc", ".msi", ".msp",
  ".hta", ".jar", ".py", ".rb", ".pl"
];

interface FileValidationOptions {
  maxSize?: number;
  allowedTypes?: string[];
  category?: "image" | "document" | "archive" | "code" | "any";
}

interface UploadResult {
  success: boolean;
  filePath?: string;
  publicUrl?: string;
  error?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
}

export class FileUploadService {
  /**
   * Valide un fichier selon les options spécifiées
   * @param file Fichier à valider
   * @param options Options de validation
   * @returns Résultat de la validation
   */
  static validateFile(file: File, options: FileValidationOptions = {}): { valid: boolean; error?: string } {
    // Déterminer les types autorisés et la taille maximale en fonction de la catégorie
    let allowedTypes = options.allowedTypes || [];
    let maxSize = options.maxSize || 0;

    if (options.category) {
      switch (options.category) {
        case "image":
          allowedTypes = allowedTypes.length ? allowedTypes : ALLOWED_IMAGE_TYPES;
          maxSize = maxSize || MAX_IMAGE_SIZE;
          break;
        case "document":
          allowedTypes = allowedTypes.length ? allowedTypes : ALLOWED_DOCUMENT_TYPES;
          maxSize = maxSize || MAX_DOCUMENT_SIZE;
          break;
        case "archive":
          allowedTypes = allowedTypes.length ? allowedTypes : ALLOWED_ARCHIVE_TYPES;
          maxSize = maxSize || MAX_ARCHIVE_SIZE;
          break;
        case "code":
          allowedTypes = allowedTypes.length ? allowedTypes : ALLOWED_CODE_TYPES;
          maxSize = maxSize || MAX_CODE_SIZE;
          break;
        case "any":
          // Pas de restriction de type, mais toujours une taille maximale
          maxSize = maxSize || MAX_DOCUMENT_SIZE;
          break;
      }
    }

    // Vérifier la taille du fichier
    if (maxSize > 0 && file.size > maxSize) {
      return {
        valid: false,
        error: `Le fichier est trop volumineux. Taille maximale: ${Math.round(maxSize / 1024 / 1024)}MB`
      };
    }

    // Vérifier le type du fichier si des types sont spécifiés
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Type de fichier non autorisé. Types autorisés: ${allowedTypes.join(", ")}`
      };
    }

    // Vérifier l'extension du fichier
    const extension = extname(file.name).toLowerCase();
    if (DANGEROUS_EXTENSIONS.includes(extension)) {
      return {
        valid: false,
        error: `Extension de fichier non autorisée: ${extension}`
      };
    }

    return { valid: true };
  }

  /**
   * Génère un nom de fichier sécurisé
   * @param originalName Nom original du fichier
   * @param userId ID de l'utilisateur
   * @returns Nom de fichier sécurisé
   */
  static generateSecureFileName(originalName: string, userId: string): string {
    const extension = extname(originalName);
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString("hex");
    const sanitizedUserId = userId.replace(/[^a-zA-Z0-9]/g, "");
    
    return `${sanitizedUserId}-${timestamp}-${randomString}${extension}`;
  }

  /**
   * Télécharge un fichier
   * @param file Fichier à télécharger
   * @param userId ID de l'utilisateur
   * @param directory Répertoire de destination
   * @param options Options de validation
   * @returns Résultat du téléchargement
   */
  static async uploadFile(
    file: File,
    userId: string,
    directory: string,
    options: FileValidationOptions = {}
  ): Promise<UploadResult> {
    try {
      // Valider le fichier
      const validation = this.validateFile(file, options);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error
        };
      }

      // Générer un nom de fichier sécurisé
      const secureFileName = this.generateSecureFileName(file.name, userId);
      
      // Créer le répertoire de destination s'il n'existe pas
      const uploadDir = join(process.cwd(), "public", directory);
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }
      
      // Chemin complet du fichier
      const filePath = join(uploadDir, secureFileName);
      
      // Convertir le fichier en buffer et l'écrire sur le disque
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);
      
      // URL publique du fichier
      const publicUrl = `/${directory}/${secureFileName}`;
      
      return {
        success: true,
        filePath,
        publicUrl,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      };
    } catch (error) {
      console.error("Erreur lors de l'upload du fichier:", error);
      return {
        success: false,
        error: "Une erreur est survenue lors de l'upload du fichier"
      };
    }
  }

  /**
   * Télécharge plusieurs fichiers
   * @param files Fichiers à télécharger
   * @param userId ID de l'utilisateur
   * @param directory Répertoire de destination
   * @param options Options de validation
   * @returns Résultats des téléchargements
   */
  static async uploadMultipleFiles(
    files: File[],
    userId: string,
    directory: string,
    options: FileValidationOptions = {}
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];
    
    for (const file of files) {
      const result = await this.uploadFile(file, userId, directory, options);
      results.push(result);
    }
    
    return results;
  }
} 