/**
 * Utilitaires et composants pour améliorer l'accessibilité
 * 
 * Ce module fournit des composants et des fonctions utilitaires
 * pour garantir que l'application respecte les standards d'accessibilité.
 */

import React, { ReactNode } from "react";

/**
 * Type d'interface pour les éléments avec attributs ARIA communs
 */
export interface AccessibilityProps {
  /**
   * Texte alternatif pour les éléments non-textuels
   */
  ariaLabel?: string;
  
  /**
   * Indique si l'élément doit être masqué des lecteurs d'écran
   */
  ariaHidden?: boolean;
  
  /**
   * ID de l'élément qui décrit cet élément
   */
  ariaDescribedby?: string;
  
  /**
   * ID de l'élément qui étiquette cet élément
   */
  ariaLabelledby?: string;
  
  /**
   * Rôle ARIA de l'élément
   */
  role?: string;
}

/**
 * Composant qui enveloppe des icônes/SVG pour les rendre accessibles
 * Ajoute automatiquement aria-hidden="true" pour les icônes décoratives
 * ou un aria-label pour les icônes informatives
 */
export const AccessibleIcon: React.FC<{
  children: ReactNode;
  label?: string;
  decorative?: boolean;
  className?: string;
  [key: string]: any;
}> = ({
  children,
  label,
  decorative = true,
  className,
  ...props
}) => {
  if (decorative) {
    return (
      <span 
        className={className} 
        aria-hidden="true"
        {...props}
      >
        {children}
      </span>
    );
  }
  
  return (
    <span 
      className={className} 
      role="img" 
      aria-label={label}
      {...props}
    >
      {children}
    </span>
  );
};

/**
 * Composant pour rendre les SVG accessibles
 */
export const AccessibleSvg: React.FC<{
  children: ReactNode;
  title?: string;
  description?: string;
  decorative?: boolean;
  className?: string;
  [key: string]: any;
}> = ({
  children,
  title,
  description,
  decorative = true,
  className,
  ...props
}) => {
  // Générer des IDs uniques pour title et description si fournis
  const titleId = title ? `svg-title-${Math.random().toString(36).substring(2, 9)}` : undefined;
  const descId = description ? `svg-desc-${Math.random().toString(36).substring(2, 9)}` : undefined;
  
  return (
    <svg 
      className={className}
      aria-hidden={decorative}
      role={!decorative ? "img" : undefined}
      aria-labelledby={titleId}
      aria-describedby={descId}
      {...props}
    >
      {title && <title id={titleId}>{title}</title>}
      {description && <desc id={descId}>{description}</desc>}
      {children}
    </svg>
  );
};

/**
 * Génère les attributs ARIA appropriés pour un élément
 * basé sur son état et son contexte
 */
export const getAriaAttributes = ({
  isRequired = false,
  isDisabled = false,
  isExpanded = false,
  isPressed = false,
  isSelected = false,
  hasError = false,
  errorId,
  labelId,
  descriptionId
}: {
  isRequired?: boolean;
  isDisabled?: boolean;
  isExpanded?: boolean;
  isPressed?: boolean;
  isSelected?: boolean;
  hasError?: boolean;
  errorId?: string;
  labelId?: string;
  descriptionId?: string;
}) => {
  return {
    "aria-required": isRequired || undefined,
    "aria-disabled": isDisabled || undefined,
    "aria-expanded": isExpanded || undefined,
    "aria-pressed": isPressed || undefined,
    "aria-selected": isSelected || undefined,
    "aria-invalid": hasError || undefined,
    "aria-errormessage": hasError && errorId ? errorId : undefined,
    "aria-labelledby": labelId || undefined,
    "aria-describedby": descriptionId || undefined
  };
}; 