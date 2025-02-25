const { prisma } = require('./prisma')

async function main() {
  try {
    // Test de connexion
    await prisma.$connect()
    console.log('✅ Connexion à la base de données réussie')

    // Création d'une catégorie de test
    const category = await prisma.category.create({
      data: {
        name: 'Test Category',
        description: 'Une catégorie de test'
      }
    })
    console.log('✅ Catégorie créée:', category)

    // Liste des catégories
    const categories = await prisma.category.findMany()
    console.log('📋 Liste des catégories:', categories)

  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main() 