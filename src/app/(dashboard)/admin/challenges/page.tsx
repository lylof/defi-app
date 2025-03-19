import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Plus, Filter, ArrowUpRight, CheckCircle, Clock, AlertCircle, Users, Tag, CalendarDays, FileText, Check, Bookmark, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { formatDuration } from "@/lib/utils/date-utils";
import { capitalize } from "@/lib/utils/string-utils";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Gestion des Défis | Administration",
  description: "Gérer les défis de la plateforme",
};

// Définir le type pour les défis
interface Challenge {
  id: string;
  title: string;
  description: string;
  brief: string;
  points: number;
  startDate: Date;
  endDate: Date;
  category?: {
    name: string;
  };
  submissions: any[];
  participations: any[];
}

export default async function ChallengesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  // Utilisez une requête mock pour les défis ou vérifiez que le modèle Challenge existe
  // dans votre schéma Prisma et est correctement généré
  const challenges = [
    {
      id: "1",
      title: "Défi exemple 1",
      description: "Description longue du défi...",
      brief: "Créez une application simple pour démontrer votre compréhension des concepts de base.",
      points: 100,
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 jours dans le passé
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours dans le futur
      category: { name: "Développement" },
      submissions: [],
      participations: []
    },
    {
      id: "2",
      title: "Défi exemple 2",
      description: "Description longue du défi...",
      brief: "Créez une interface utilisateur réactive en utilisant les principes du design moderne.",
      points: 150,
      startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 jours dans le futur 
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 jours dans le futur
      category: { name: "Design" },
      submissions: [],
      participations: []
    },
    {
      id: "3",
      title: "Défi exemple 3",
      description: "Description longue du défi...",
      brief: "Optimisez une application existante pour améliorer ses performances et sa stabilité.",
      points: 200,
      startDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 21 jours dans le passé
      endDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 jours dans le passé
      category: { name: "Performance" },
      submissions: [{}],
      participations: [{}]
    }
  ];

  // Obtenir la date actuelle
  const now = new Date();
  
  // Filtrer les défis
  const activeChallenges = challenges.filter(
    (challenge: Challenge) => new Date(challenge.startDate) <= now && new Date(challenge.endDate) >= now
  );
  
  const upcomingChallenges = challenges.filter(
    (challenge: Challenge) => new Date(challenge.startDate) > now
  );
  
  const endedChallenges = challenges.filter(
    (challenge: Challenge) => new Date(challenge.endDate) < now
  );
  
  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: { 
        delay: custom * 0.1,
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1]
      }
    })
  };
  
  const cardVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    },
    hover: { 
      y: -5,
      transition: { duration: 0.2 }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <motion.div
          initial="hidden" 
          animate="visible" 
          variants={fadeInUpVariants}
          custom={1}
        >
          <h1 className="text-2xl md:text-3xl font-bold mb-1">Gestion des Défis</h1>
          <p className="text-muted-foreground">
            Créer et gérer les défis proposés aux utilisateurs
          </p>
        </motion.div>
        
        <motion.div
          initial="hidden" 
          animate="visible" 
          variants={fadeInUpVariants}
          custom={2}
        >
          <Button asChild className="admin-btn-enhanced primary">
          <Link href="/admin/challenges/new">
            <Plus className="mr-2 h-4 w-4" />
              Nouveau défi
          </Link>
        </Button>
        </motion.div>
      </div>

      <motion.div
        initial="hidden" 
        animate="visible" 
        variants={fadeInUpVariants}
        custom={3}
      >
      <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all" className="admin-tab-enhanced">
              <FileText className="h-4 w-4 mr-2" /> 
              Tous les défis
            </TabsTrigger>
            <TabsTrigger value="active" className="admin-tab-enhanced">
              <Check className="h-4 w-4 mr-2" /> 
              Actifs
              <Badge className="ml-2 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                {activeChallenges.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="admin-tab-enhanced">
              <Calendar className="h-4 w-4 mr-2" /> 
              À venir
              <Badge className="ml-2 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                {upcomingChallenges.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="ended" className="admin-tab-enhanced">
              <Clock className="h-4 w-4 mr-2" /> 
              Terminés
              <Badge className="ml-2 bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400">
                {endedChallenges.length}
              </Badge>
            </TabsTrigger>
        </TabsList>
        
          <TabsContent value="all">
            {challenges.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {challenges.map((challenge: Challenge, index: number) => {
                  // Déterminer le statut du défi
                  let status = "ended";
                  let statusText = "Terminé";
                  let statusColor = "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
                  
                  if (new Date(challenge.startDate) > now) {
                    status = "upcoming";
                    statusText = "À venir";
                    statusColor = "bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-300";
                  } else if (new Date(challenge.endDate) >= now) {
                    status = "active";
                    statusText = "Actif";
                    statusColor = "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300";
                  }
                  
                  return (
                    <motion.div 
                      key={challenge.id}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover="hover"
                      custom={index}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link href={`/admin/challenges/${challenge.id}`} className="block">
                        <Card className="admin-card-enhanced h-full hover:border-primary/30 transition-colors">
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <Badge className={`${statusColor} admin-badge-enhanced mb-2`}>
                                {status === 'upcoming' && <Calendar className="h-3 w-3 mr-1" />}
                                {status === 'active' && <Check className="h-3 w-3 mr-1" />}
                                {status === 'ended' && <Clock className="h-3 w-3 mr-1" />}
                                {statusText}
                              </Badge>
                              <Badge className="bg-primary/10 text-primary admin-badge-enhanced">
                                {challenge.points} pts
                              </Badge>
                            </div>
                            <CardTitle className="text-lg font-semibold line-clamp-1">{challenge.title}</CardTitle>
                            <CardDescription className="line-clamp-1">
                              <span className="inline-flex items-center">
                                <Bookmark className="h-3 w-3 mr-1 text-muted-foreground" />
                                {challenge.category?.name || "Sans catégorie"}
                              </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                            <div className="line-clamp-2 text-sm mb-3">
                              {challenge.brief}
                            </div>
                            <div className="flex justify-between items-center text-sm text-muted-foreground">
                              <div className="flex items-center">
                                <Users className="h-4 w-4 mr-1" />
                                <span>{challenge.submissions.length} soumission{challenge.submissions.length !== 1 ? 's' : ''}</span>
                              </div>
                              <div className="flex items-center text-primary text-xs font-medium">
                                <span>Voir détails</span>
                                <ArrowUpRight className="h-3 w-3 ml-1" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="admin-card-enhanced p-8 text-center">
                <div className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                  <h3 className="text-lg font-medium mb-2">Aucun défi créé</h3>
                  <p className="text-muted-foreground mb-4">
                    Créez votre premier défi pour engager vos utilisateurs.
                  </p>
                  <Button asChild className="admin-btn-enhanced primary">
                    <Link href="/admin/challenges/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Créer un défi
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="active">
            {activeChallenges.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeChallenges.map((challenge: Challenge, index: number) => (
                  <motion.div 
                    key={challenge.id}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    custom={index}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link href={`/admin/challenges/${challenge.id}`} className="block">
                      <Card className="admin-card-enhanced h-full hover:border-primary/30 transition-colors">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <Badge className="bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300 admin-badge-enhanced mb-2">
                              <Check className="h-3 w-3 mr-1" />
                              Actif
                            </Badge>
                            <Badge className="bg-primary/10 text-primary admin-badge-enhanced">
                              {challenge.points} pts
                            </Badge>
                          </div>
                          <CardTitle className="text-lg font-semibold line-clamp-1">{challenge.title}</CardTitle>
                          <CardDescription className="line-clamp-1">
                            <span className="inline-flex items-center">
                              <Bookmark className="h-3 w-3 mr-1 text-muted-foreground" />
                              {challenge.category?.name || "Sans catégorie"}
                            </span>
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="line-clamp-2 text-sm mb-3">
                            {challenge.brief}
                          </div>
                          <div className="flex justify-between items-center text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              <span>{challenge.submissions.length} soumission{challenge.submissions.length !== 1 ? 's' : ''}</span>
                            </div>
                            <div className="flex items-center text-primary text-xs font-medium">
                              <span>Voir détails</span>
                              <ArrowUpRight className="h-3 w-3 ml-1" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="admin-card-enhanced p-8 text-center">
                <div className="flex flex-col items-center justify-center py-12">
                  <Check className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                  <h3 className="text-lg font-medium mb-2">Aucun défi actif</h3>
                  <p className="text-muted-foreground mb-4">
                    Il n'y a actuellement aucun défi en cours.
                  </p>
                  <Button asChild className="admin-btn-enhanced primary">
                    <Link href="/admin/challenges/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Créer un défi
                    </Link>
                  </Button>
                </div>
          </div>
            )}
          </TabsContent>
          
          <TabsContent value="upcoming">
            {upcomingChallenges.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingChallenges.map((challenge: Challenge, index: number) => (
                  <motion.div 
                    key={challenge.id}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    custom={index}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link href={`/admin/challenges/${challenge.id}`} className="block">
                      <Card className="admin-card-enhanced h-full hover:border-primary/30 transition-colors">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-300 admin-badge-enhanced mb-2">
                              <Calendar className="h-3 w-3 mr-1" />
                              À venir
                            </Badge>
                            <Badge className="bg-primary/10 text-primary admin-badge-enhanced">
                              {challenge.points} pts
                            </Badge>
                          </div>
                          <CardTitle className="text-lg font-semibold line-clamp-1">{challenge.title}</CardTitle>
                          <CardDescription className="line-clamp-1">
                            <span className="inline-flex items-center">
                              <Bookmark className="h-3 w-3 mr-1 text-muted-foreground" />
                              {challenge.category?.name || "Sans catégorie"}
                            </span>
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="line-clamp-2 text-sm mb-3">
                            {challenge.brief}
                          </div>
                          <div className="flex justify-between items-center text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>Début: {format(new Date(challenge.startDate), "dd MMM yyyy", { locale: fr })}</span>
                            </div>
                            <div className="flex items-center text-primary text-xs font-medium">
                              <span>Voir détails</span>
                              <ArrowUpRight className="h-3 w-3 ml-1" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="admin-card-enhanced p-8 text-center">
                <div className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                  <h3 className="text-lg font-medium mb-2">Aucun défi à venir</h3>
                  <p className="text-muted-foreground mb-4">
                    Planifiez de nouveaux défis pour vos utilisateurs.
                  </p>
                  <Button asChild className="admin-btn-enhanced primary">
                    <Link href="/admin/challenges/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Planifier un défi
                    </Link>
                  </Button>
                </div>
            </div>
          )}
        </TabsContent>
        
          <TabsContent value="ended">
            {endedChallenges.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {endedChallenges.map((challenge: Challenge, index: number) => (
                  <motion.div 
                    key={challenge.id}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    custom={index}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link href={`/admin/challenges/${challenge.id}`} className="block">
                      <Card className="admin-card-enhanced h-full hover:border-primary/30 transition-colors">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 admin-badge-enhanced mb-2">
                              <Clock className="h-3 w-3 mr-1" />
                              Terminé
                            </Badge>
                            <Badge className="bg-primary/10 text-primary admin-badge-enhanced">
                              {challenge.points} pts
                            </Badge>
                          </div>
                          <CardTitle className="text-lg font-semibold line-clamp-1">{challenge.title}</CardTitle>
                          <CardDescription className="line-clamp-1">
                            <span className="inline-flex items-center">
                              <Bookmark className="h-3 w-3 mr-1 text-muted-foreground" />
                              {challenge.category?.name || "Sans catégorie"}
                            </span>
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="line-clamp-2 text-sm mb-3">
                            {challenge.brief}
                          </div>
                          <div className="flex justify-between items-center text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              <span>{challenge.submissions.length} soumission{challenge.submissions.length !== 1 ? 's' : ''}</span>
                            </div>
                            <div className="flex items-center text-primary text-xs font-medium">
                              <span>Voir détails</span>
                              <ArrowUpRight className="h-3 w-3 ml-1" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="admin-card-enhanced p-8 text-center">
                <div className="flex flex-col items-center justify-center py-12">
                  <Clock className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                  <h3 className="text-lg font-medium mb-2">Aucun défi terminé</h3>
                  <p className="text-muted-foreground mb-4">
                    Les défis terminés apparaîtront ici.
                  </p>
                  <Button asChild className="admin-btn-enhanced primary">
                    <Link href="/admin/challenges/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Créer un défi
                    </Link>
                  </Button>
                </div>
              </div>
            )}
        </TabsContent>
      </Tabs>
      </motion.div>
    </div>
  );
} 