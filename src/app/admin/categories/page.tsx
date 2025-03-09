import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata = {
  title: "Gestion des Catégories | LPT Défis",
};

async function getCategories() {
  return await prisma.category.findMany({
    include: {
      challenges: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestion des Catégories</h1>
        <Link href="/admin/categories/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle Catégorie
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Catégories</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Nombre de défis</TableHead>
                <TableHead>Date de création</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    Aucune catégorie trouvée
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{category.description || "Aucune description"}</TableCell>
                    <TableCell>{category.challenges.length}</TableCell>
                    <TableCell>
                      {format(new Date(category.createdAt), "dd MMMM yyyy", { locale: fr })}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Link href={`/admin/categories/${category.id}/edit`}>
                          <Button variant="outline" size="sm">
                            Modifier
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 