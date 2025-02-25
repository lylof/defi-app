"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { User, Upload } from "lucide-react";

interface AvatarUploadProps {
  currentImage?: string | null;
  onUpload: (file: File) => Promise<void>;
}

export function AvatarUpload({ currentImage, onUpload }: AvatarUploadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérification du type de fichier
    if (!file.type.startsWith("image/")) {
      setError("Le fichier doit être une image");
      return;
    }

    // Vérification de la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("L'image ne doit pas dépasser 5MB");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Créer une URL pour la prévisualisation
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // Upload du fichier
      await onUpload(file);
    } catch (err) {
      setError("Une erreur est survenue lors de l'upload");
      setPreviewUrl(currentImage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative h-20 w-20">
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt="Avatar"
              fill
              className="rounded-full object-cover"
            />
          ) : (
            <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center">
              <User className="h-10 w-10 text-gray-400" />
            </div>
          )}
          {isLoading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
            </div>
          )}
        </div>

        <div className="space-y-1">
          <button
            type="button"
            onClick={handleButtonClick}
            disabled={isLoading}
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline focus:outline-none disabled:opacity-50"
          >
            <Upload className="h-4 w-4" />
            Changer l'avatar
          </button>
          <p className="text-xs text-gray-500">
            JPG, PNG ou GIF. 5MB maximum.
          </p>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
} 