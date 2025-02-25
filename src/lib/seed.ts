const { prisma } = require('./prisma');

async function main() {
  try {
    // Création des catégories
    const webCategory = await prisma.category.create({
      data: {
        name: "Développement Web",
        description: "Défis liés au développement web",
      },
    });

    const mobileCategory = await prisma.category.create({
      data: {
        name: "Développement Mobile",
        description: "Défis liés au développement mobile",
      },
    });

    // Création des défis
    const challenge1 = await prisma.challenge.create({
      data: {
        title: "Créer une API REST",
        description: "Développez une API REST complète avec Node.js et Express",
        brief: `Dans ce défi, vous devrez créer une API REST pour gérer une bibliothèque de livres.

Fonctionnalités requises :
- CRUD pour les livres
- Authentification JWT
- Validation des données
- Tests unitaires`,
        points: 100,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
        categoryId: webCategory.id,
      },
    });

    const challenge2 = await prisma.challenge.create({
      data: {
        title: "Application Mobile React Native",
        description: "Créez une application mobile de gestion de tâches avec React Native",
        brief: `Développez une application mobile de gestion de tâches avec les fonctionnalités suivantes :

- Liste des tâches
- Ajout/Modification/Suppression
- Catégorisation
- Notifications
- Stockage local`,
        points: 150,
        startDate: new Date(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 jours
        categoryId: mobileCategory.id,
      },
    });

    console.log("✅ Données de test créées avec succès");
  } catch (error) {
    console.error("❌ Erreur:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 