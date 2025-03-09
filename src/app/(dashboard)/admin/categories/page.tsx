import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Plus, Edit, Trash } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Gestion des Catégories | Administration",
  description: "Gérer les catégories de défis",
};

export default async function CategoriesPage() {
  // Récupérer les catégories avec le nombre de défis associés
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: {
          challenges: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestion des Catégories</h1>
        <Button asChild>
          <Link href="/admin/categories/new">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle Catégorie
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Card key={category.id}>
            <CardHeader>
              <CardTitle>{category.name}</CardTitle>
              <CardDescription>
                {category._count.challenges} défis dans cette catégorie
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {category.description || "Aucune description"}
              </p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/categories/${category.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Modifier
                </Link>
              </Button>
              {category._count.challenges === 0 && (
                <Button variant="destructive" size="sm">
                  <Trash className="mr-2 h-4 w-4" />
                  Supprimer
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-10">
          <p className="text-muted-foreground">Aucune catégorie trouvée. Créez votre première catégorie.</p>
        </div>
      )}
    </div>
  );
} 