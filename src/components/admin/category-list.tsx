"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CategoryWithChallenges } from "@/app/admin/categories/page";

interface CategoryListProps {
  initialCategories: CategoryWithChallenges[];
}

export function CategoryList({ initialCategories }: CategoryListProps) {
  const [categories, setCategories] = useState<CategoryWithChallenges[]>(initialCategories);
  const [isLoading, setIsLoading] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryWithChallenges | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  // Fonction pour supprimer une catégorie
  async function deleteCategory(id: string) {
    if (!id) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erreur lors de la suppression');
      }
      
      // Mettre à jour la liste des catégories
      setCategories(categories.filter(cat => cat.id !== id));
      toast.success("Catégorie supprimée avec succès");
      router.refresh(); // Rafraîchir la page pour mettre à jour les données côté serveur
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error instanceof Error ? error.message : "Impossible de supprimer la catégorie");
    } finally {
      setIsDeleting(false);
      setIsDialogOpen(false);
      setCategoryToDelete(null);
    }
  }

  return (
    <>
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
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
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
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {category.name}
                          {category.challenges.length > 0 && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Badge variant="outline" className="ml-2">
                                    {category.challenges.length} défi(s)
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  Cette catégorie est utilisée par des défis et ne peut pas être supprimée
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </TableCell>
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
                          
                          <Button 
                            variant="destructive" 
                            size="sm"
                            disabled={category.challenges.length > 0}
                            onClick={() => {
                              setCategoryToDelete(category);
                              setIsDialogOpen(true);
                            }}
                          >
                            Supprimer
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog de confirmation de suppression */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer la catégorie "{categoryToDelete?.name}" ?
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              disabled={isDeleting}
            >
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => categoryToDelete && deleteCategory(categoryToDelete.id)}
              disabled={isDeleting}
            >
              {isDeleting ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 