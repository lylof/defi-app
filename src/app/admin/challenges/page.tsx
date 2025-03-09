import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const metadata = {
  title: "Gestion des Défis | LPT Défis",
};

async function getChallenges() {
  return await prisma.challenge.findMany({
    include: {
      category: true,
      participations: true,
      createdBy: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export default async function ChallengesPage() {
  const challenges = await getChallenges();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestion des Défis</h1>
        <Link href="/admin/challenges/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau Défi
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Défis</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Participants</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date de création</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {challenges.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    Aucun défi trouvé
                  </TableCell>
                </TableRow>
              ) : (
                challenges.map((challenge) => (
                  <TableRow key={challenge.id}>
                    <TableCell className="font-medium">{challenge.title}</TableCell>
                    <TableCell>{challenge.category.name}</TableCell>
                    <TableCell>{challenge.points}</TableCell>
                    <TableCell>{challenge.participations.length}</TableCell>
                    <TableCell>
                      {challenge.isPublished ? (
                        <Badge variant="success">Publié</Badge>
                      ) : (
                        <Badge variant="secondary">Brouillon</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {format(new Date(challenge.createdAt), "dd MMMM yyyy", { locale: fr })}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Link href={`/admin/challenges/${challenge.id}`}>
                          <Button variant="outline" size="sm">
                            Voir
                          </Button>
                        </Link>
                        <Link href={`/admin/challenges/${challenge.id}/edit`}>
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