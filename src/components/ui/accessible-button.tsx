/**
 * Composant de bouton accessible
 * Assure que tous les boutons ont des attributs d'accessibilité appropriés
 */

import React, { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AccessibleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Contenu du bouton */
  children: ReactNode;
  
  /** 
   * Description accessible du bouton
   * Obligatoire si le bouton ne contient pas de texte visible
   */
  ariaLabel?: string;
  
  /** Si vrai, le bouton sera masqué des lecteurs d'écran */
  ariaHidden?: boolean;
  
  /** Classes CSS additionnelles */
  className?: string;
  
  /** 
   * Si vrai, le bouton est considéré comme une icône ou un bouton sans texte visible 
   * et nécessitera obligatoirement un ariaLabel
   */
  isIconButton?: boolean;
}

export function AccessibleButton({
  children,
  ariaLabel,
  ariaHidden,
  className,
  isIconButton = false,
  type = "button",
  ...props
}: AccessibleButtonProps) {
  // Vérifier si le bouton contient du texte visible
  const containsVisibleText = React.Children.toArray(children).some(child => {
    if (typeof child === 'string') return true;
    if (typeof child === 'number') return true;
    return false;
  });
  
  // Si c'est un bouton d'icône sans texte visible et sans ariaLabel, afficher un avertissement en développement
  if (process.env.NODE_ENV === 'development' && isIconButton && !containsVisibleText && !ariaLabel) {
    console.warn('AccessibleButton: Les boutons avec uniquement des icônes doivent avoir un ariaLabel pour l\'accessibilité');
  }
  
  return (
    <button
      type={type}
      className={className}
      aria-label={ariaLabel}
      aria-hidden={ariaHidden}
      {...props}
    >
      {children}
    </button>
  );
} 