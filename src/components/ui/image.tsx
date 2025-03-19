"use client";

import NextImage, { ImageProps as NextImageProps } from 'next/image';
import { cn } from '@/lib/utils';
import { useState } from 'react';

/**
 * Props pour le composant Image optimisé
 * @extends NextImageProps
 */
export interface OptimizedImageProps extends Omit<NextImageProps, 'onError'> {
  /** Classe CSS à appliquer au conteneur de l'image */
  containerClassName?: string;
  /** URL de l'image de fallback à utiliser en cas d'erreur */
  fallbackSrc?: string;
  /** Classe CSS à appliquer à l'image */
  className?: string;
  /** Fonction à appeler en cas d'erreur de chargement */
  onError?: () => void;
}

/**
 * Composant Image optimisé qui utilise le composant Image de Next.js
 * avec gestion des erreurs, fallback, et chargement progressif
 * 
 * @example
 * <OptimizedImage 
 *   src="/images/profile.jpg" 
 *   alt="Photo de profil" 
 *   width={200} 
 *   height={200} 
 *   fallbackSrc="/images/default-avatar.svg"
 * />
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  containerClassName,
  fallbackSrc = '/images/placeholder.svg',
  className,
  onError,
  ...props
}: OptimizedImageProps) {
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Gérer les erreurs de chargement d'image
  const handleError = () => {
    setError(true);
    setIsLoading(false);
    if (onError) onError();
  };

  return (
    <div className={cn('relative overflow-hidden', containerClassName)}>
      <NextImage
        src={error ? fallbackSrc : src}
        alt={alt}
        width={width}
        height={height}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          className
        )}
        onError={handleError}
        onLoad={() => setIsLoading(false)}
        {...props}
      />
      
      {/* Indicateur de chargement */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 animate-pulse">
          <span className="sr-only">Chargement...</span>
        </div>
      )}
    </div>
  );
}

/**
 * Composant Avatar optimisé basé sur le composant Image
 * avec une forme circulaire par défaut
 */
export function Avatar({
  src,
  alt = "Avatar utilisateur",
  className,
  containerClassName,
  ...props
}: OptimizedImageProps) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={40}
      height={40}
      className={cn('rounded-full object-cover', className)}
      containerClassName={cn('rounded-full', containerClassName)}
      fallbackSrc="/images/default-avatar.svg"
      {...props}
    />
  );
}

/**
 * Props pour le composant Image
 */
interface ImageProps extends NextImageProps {
  fallbackSrc?: string;
}

/**
 * Composant Image personnalisé avec gestion d'erreur
 * Affiche une image de fallback en cas de chargement échoué
 */
export function Image({ 
  alt, 
  src, 
  fallbackSrc = "/images/image-placeholder.svg", 
  ...props 
}: ImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [isError, setIsError] = useState(false);

  const handleError = () => {
    if (!isError) {
      setImgSrc(fallbackSrc);
      setIsError(true);
    }
  };

  return (
    <NextImage
      alt={alt}
      src={imgSrc}
      {...props}
      onError={handleError}
    />
  );
} 