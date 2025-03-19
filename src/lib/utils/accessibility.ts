/**
 * Utilitaires pour améliorer l'accessibilité des composants
 * Ces fonctions aident à maintenir une cohérence dans les pratiques d'accessibilité
 */

import { ReactNode } from "react";

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
 * Crée un SVG accessible
 * Ajoute automatiquement aria-hidden="true" pour les icônes décoratives
 * ou un aria-label pour les icônes informatives
 */
export const AccessibleIcon = ({
  children,
  label,
  decorative = true,
  className,
  ...props
}: {
  children: ReactNode;
  label?: string;
  decorative?: boolean;
  className?: string;
  [key: string]: any;
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