/**
 * Client Prisma pour l'environnement Edge Runtime
 * 
 * Ce fichier fournit une version simplifiée du client Prisma compatible avec Edge Runtime
 * Il est utilisé dans le middleware et autres contextes Edge
 */

// Vérifier si nous sommes dans un environnement Edge
export const isEdgeRuntime = () => {
  return (
    typeof process === 'undefined' ||
    process.env.NEXT_RUNTIME === 'edge' ||
    process.env.EDGE_RUNTIME === '1'
  );
};

// Fonction pour initialiser les comptes sans utiliser Prisma directement
export async function initializeAccountsFromEdge(): Promise<void> {
  try {
    // Appeler l'API d'initialisation des comptes
    const response = await fetch('/api/init-accounts', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de l'initialisation des comptes: ${response.status}`);
    }

    const data = await response.json();
    console.log('Résultat de l\'initialisation des comptes:', data);
  } catch (error) {
    console.error('Erreur lors de l\'initialisation des comptes depuis Edge:', error);
  }
}

// Exporter un objet vide pour les imports dans le middleware
// Cela évite les erreurs lorsque le middleware tente d'importer prisma
export const prismaEdge = {
  // Méthodes factices qui ne font rien en environnement Edge
  user: {
    findUnique: async () => null,
    findMany: async () => [],
    create: async () => ({}),
    update: async () => ({}),
  },
  // Autres modèles peuvent être ajoutés selon les besoins
}; 