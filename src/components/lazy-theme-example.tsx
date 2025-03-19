"use client";

import React from 'react';
import { withLazyLoading } from './lazy-load';
import type { ComponentType } from 'react';

/**
 * Version lazy loaded du composant ThemeExample
 * Utilise le HOC withLazyLoading pour charger le composant à la demande
 * 
 * @example
 * <LazyThemeExample />
 */
export const LazyThemeExample = withLazyLoading<{}>(() => 
  import('./ThemeExample').then(mod => ({ 
    default: mod.ThemeExample as ComponentType<{}>
  }))
); 