"use client";

import { Suspense, ComponentType, lazy, ReactNode } from 'react';

interface LazyLoadProps {
  /** Composant de fallback à afficher pendant le chargement */
  fallback?: ReactNode;
  /** Fonction qui charge le composant dynamiquement */
  loader: () => Promise<{ default: ComponentType<any> }>;
  /** Props à passer au composant chargé */
  componentProps?: Record<string, any>;
}

/**
 * Composant pour charger paresseusement d'autres composants
 * Utilise React.lazy et Suspense pour optimiser le chargement initial
 * 
 * @example
 * <LazyLoad 
 *   loader={() => import('@/components/heavy-component')}
 *   fallback={<Skeleton />}
 *   componentProps={{ data: someData }}
 * />
 */
export function LazyLoad({ fallback, loader, componentProps = {} }: LazyLoadProps) {
  // Utiliser React.lazy pour charger dynamiquement le composant
  const LazyComponent = lazy(loader);
  
  return (
    <Suspense fallback={fallback || <DefaultSkeleton />}>
      <LazyComponent {...componentProps} />
    </Suspense>
  );
}

/**
 * Squelette par défaut à afficher pendant le chargement
 */
function DefaultSkeleton() {
  return (
    <div className="animate-pulse rounded-md bg-gray-200 dark:bg-gray-700 w-full h-32" />
  );
}

/**
 * HOC (Higher Order Component) pour faciliter la création de composants lazy-loadés
 * @param loader Fonction qui charge le composant
 * @returns Composant lazy-loadé
 * 
 * @example
 * const LazyHeavyComponent = withLazyLoading(() => import('@/components/heavy-component'));
 * // Puis utilisez comme un composant normal
 * <LazyHeavyComponent prop1="value" />
 */
export function withLazyLoading<T>(loader: () => Promise<{ default: ComponentType<T> }>) {
  return function LazyLoadedComponent(props: T & { fallback?: ReactNode }) {
    const { fallback, ...componentProps } = props as any;
    
    return (
      <LazyLoad 
        loader={loader}
        fallback={fallback}
        componentProps={componentProps}
      />
    );
  };
} 