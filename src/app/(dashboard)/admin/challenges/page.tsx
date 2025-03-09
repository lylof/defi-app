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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { Plus } from "lucide-react";

export const metadata = {
  title: "Gestion des Défis | Administration",
  description: "Gérer les défis de la plateforme",
};

export default async function ChallengesPage() {
  // Récupérer les défis avec leurs catégories
  const challenges = await prisma.challenge.findMany({
    include: {
      category: true,
      submissions: {
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestion des Défis</h1>
        <Button asChild>
          <Link href="/admin/challenges/new">
            <Plus className="mr-2 h-4 w-4" />
            Nouveau Défi
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">Tous les défis</TabsTrigger>
          <TabsTrigger value="active">Actifs</TabsTrigger>
          <TabsTrigger value="upcoming">À venir</TabsTrigger>
          <TabsTrigger value="ended">Terminés</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4 mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {challenges.map((challenge) => (
              <Card key={challenge.id}>
                <CardHeader>
                  <CardTitle className="truncate">{challenge.title}</CardTitle>
                  <CardDescription>
                    Catégorie: {challenge.category.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    {challenge.brief.substring(0, 100)}...
                  </p>
                  <div className="flex justify-between text-sm">
                    <span>{challenge.points} points</span>
                    <span>{challenge.submissions.length} soumissions</span>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" asChild>
                    <Link href={`/admin/challenges/${challenge.id}`}>
                      Voir détails
                    </Link>
                  </Button>
                  <Button variant="secondary" asChild>
                    <Link href={`/admin/challenges/${challenge.id}/edit`}>
                      Modifier
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          {challenges.length === 0 && (
            <div className="text-center py-10">
              <p className="text-muted-foreground">Aucun défi trouvé. Créez votre premier défi.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="active" className="mt-6">
          <p className="text-center py-10">Filtrage des défis actifs à implémenter</p>
        </TabsContent>
        
        <TabsContent value="upcoming" className="mt-6">
          <p className="text-center py-10">Filtrage des défis à venir à implémenter</p>
        </TabsContent>
        
        <TabsContent value="ended" className="mt-6">
          <p className="text-center py-10">Filtrage des défis terminés à implémenter</p>
        </TabsContent>
      </Tabs>
    </div>
  );
} 