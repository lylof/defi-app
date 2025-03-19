import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { revalidatePath } from "next/cache";

/**
 * Type pour les données d'exemple
 */
type CacheData = {
  timestamp: string;
  strategy: string;
  maxAge: number;
  staleWhileRevalidate: number;
  message: string;
};

/**
 * Exemple de page statique avec régénération incrémentale
 */
export default async function ISRExamplePage() {
  // Fonction pour récupérer les données avec différentes stratégies de cache
  async function fetchWithCacheStrategy(strategy: string, maxAge: number = 60, staleWhileRevalidate: number = 30) {
    const url = new URL('/api/cache-control', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
    url.searchParams.set('strategy', strategy);
    url.searchParams.set('maxAge', maxAge.toString());
    url.searchParams.set('staleWhileRevalidate', staleWhileRevalidate.toString());
    
    const res = await fetch(url.toString(), {
      next: {
        // Configurer la durée de mise en cache selon la stratégie
        revalidate: strategy === 'no-store' ? 0 : strategy === 'force-cache' ? false : 10
      }
    });
    
    if (!res.ok) {
      throw new Error('Erreur lors de la récupération des données');
    }
    
    return res.json() as Promise<CacheData>;
  }
  
  // Récupérer les données avec différentes stratégies de cache
  const defaultData = await fetchWithCacheStrategy('default');
  const noStoreData = await fetchWithCacheStrategy('no-store');
  const forceCacheData = await fetchWithCacheStrategy('force-cache');
  
  // Fonction d'action du serveur pour revalider manuellement
  async function revalidate() {
    'use server';
    revalidatePath('/examples/isr-example');
  }
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Exemple d'ISR et d'en-têtes de cache</h1>
      
      <p className="mb-6">
        Cette page démontre différentes stratégies de mise en cache avec Next.js 14, 
        y compris l'utilisation d'ISR (Incremental Static Regeneration) et
        les en-têtes de contrôle du cache.
      </p>
      
      <form action={revalidate} className="mb-8">
        <Button type="submit">Revalider manuellement la page</Button>
      </form>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CacheStrategyCard data={defaultData} title="Cache par défaut (stale-while-revalidate)" />
        <CacheStrategyCard data={noStoreData} title="Sans mise en cache (no-store)" />
        <CacheStrategyCard data={forceCacheData} title="Cache forcé (force-cache)" />
      </div>
      
      <div className="mt-8 p-6 border rounded-lg bg-gray-50 dark:bg-gray-800">
        <h2 className="text-xl font-semibold mb-4">Comment fonctionne cette page ?</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>ISR :</strong> Cette page utilise la régénération statique incrémentale avec l'option 
            <code className="mx-1 p-1 bg-gray-200 dark:bg-gray-700 rounded">revalidate: 10</code>
            pour la stratégie par défaut, ce qui signifie qu'elle sera régénérée au maximum toutes les 10 secondes.
          </li>
          <li>
            <strong>Contrôle du cache :</strong> L'API définit des en-têtes <code className="mx-1 p-1 bg-gray-200 dark:bg-gray-700 rounded">Cache-Control</code> 
            pour indiquer aux navigateurs et CDN comment mettre en cache les réponses.
          </li>
          <li>
            <strong>Revalidation manuelle :</strong> Le bouton ci-dessus utilise <code className="mx-1 p-1 bg-gray-200 dark:bg-gray-700 rounded">revalidatePath()</code> 
            pour forcer la régénération de la page.
          </li>
        </ul>
      </div>
    </div>
  );
}

/**
 * Composant pour afficher les informations de cache
 */
function CacheStrategyCard({ data, title }: { data: CacheData; title: string }) {
  // Extraire la date et l'heure de l'horodatage
  const timestamp = new Date(data.timestamp);
  const formattedTime = timestamp.toLocaleTimeString('fr-FR');
  const formattedDate = timestamp.toLocaleDateString('fr-FR');
  
  return (
    <Card className="p-4">
      <h2 className="text-xl font-semibold mb-3">{title}</h2>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">Récupéré le :</span>
          <span>{formattedDate}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">À :</span>
          <span>{formattedTime}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 dark:text-gray-400">Stratégie :</span>
          <span>{data.strategy}</span>
        </div>
        {data.strategy === 'default' && (
          <>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Max-Age :</span>
              <span>{data.maxAge}s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Stale-While-Revalidate :</span>
              <span>{data.staleWhileRevalidate}s</span>
            </div>
          </>
        )}
      </div>
    </Card>
  );
} 