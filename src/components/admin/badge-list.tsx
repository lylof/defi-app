"use client";

import React from "react";
import Link from "next/link";
import { Badge as BadgeModel } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface BadgeListProps {
  badges: BadgeModel[];
}

export function BadgeList({ badges }: BadgeListProps) {
  const router = useRouter();

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le badge "${name}" ?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/badges/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Une erreur est survenue");
      }

      toast.success("Badge supprimé avec succès");
      router.refresh();
    } catch (error) {
      console.error("Erreur lors de la suppression du badge:", error);
      toast.error(error instanceof Error ? error.message : "Une erreur est survenue");
    }
  };

  if (badges.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Aucun badge trouvé</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {badges.map((badge) => (
        <Card key={badge.id} className="overflow-hidden">
          <div className="aspect-square relative bg-muted flex items-center justify-center">
            {badge.image ? (
              <img
                src={badge.image}
                alt={badge.name}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="text-muted-foreground">Pas d'image</div>
            )}
          </div>
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg">{badge.name}</h3>
              <Badge variant="outline">{badge.points} pts</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {badge.description}
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/admin/badges/${badge.id}/edit`)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Modifier
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(badge.id, badge.name)}
              >
                <Trash className="h-4 w-4 mr-1" />
                Supprimer
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 