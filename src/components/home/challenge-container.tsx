"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DailyChallengeCard } from "./daily-challenge-card";
import { LeaderboardCompact } from "./leaderboard-compact";
import { DailyChallengeService, DailyChallenge } from "@/lib/services/daily-challenge-service";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, Award, Users, ArrowRight, Eye, Timer, Target, Calendar, Code, BarChart, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from 'next/dynamic';

// Lazy loading des composants non critiques
const CompactChallengeCard = dynamic(() => import('./compact-challenge-card').then(mod => mod.CompactChallengeCard), {
  loading: () => <CardSkeleton height="250px" />,
  ssr: false
});

const EmptyStateCard = dynamic(() => import('./empty-state-card').then(mod => mod.EmptyStateCard), {
  ssr: true
});

// Lazy loading de BentoMainCard avec priorité plus élevée
const BentoMainCard = dynamic(() => import('./bento-main-card').then(mod => mod.BentoMainCard), {
  loading: () => <MainChallengeSkeleton />,
  ssr: true // Activé pour améliorer le LCP
});

// Lazy loading de LeaderboardCard
const LeaderboardCard = dynamic(() => import('./leaderboard-card').then(mod => mod.LeaderboardCard), {
  loading: () => <LeaderboardSkeleton />,
  ssr: true
});

// Squelettes de chargement
const CardSkeleton = ({ height = "200px" }: { height?: string }) => (
  <Card className="h-full border-0 shadow-sm bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
    <CardContent className="p-6">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-5 w-20" />
      </div>
      <Skeleton className="h-6 w-4/5 mb-4" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-3/4 mb-5" />
      <Skeleton className="h-9 w-full rounded-lg" />
    </CardContent>
  </Card>
);

/**
 * Composant principal pour afficher le défi du jour
 * Design bento minimaliste inspiré d'Apple - Version optimisée
 * Caractérisé par des espacements parfaitement calibrés, des transitions subtiles,
 * et une palette de couleurs désaturée pour une élégance intemporelle
 */
export function ChallengeContainer() {
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("ongoing");
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [timePercentage, setTimePercentage] = useState(100);

  // Récupération du défi du jour au chargement
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    
    const fetchDailyChallenge = async () => {
      try {
        setIsLoading(true);
        // Utiliser le cache si disponible, sinon forcer le rafraîchissement
        const data = await DailyChallengeService.getDailyChallenge(false);
        
        // Vérifier si le composant est toujours monté avant de mettre à jour l'état
        if (isMounted) {
          setDailyChallenge(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError("Impossible de récupérer le défi du jour");
          console.error("Erreur lors de la récupération du défi du jour:", err);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchDailyChallenge();
    
    // Nettoyage pour éviter les mises à jour d'état sur un composant démonté
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  // Calcul du temps restant avec précision à la seconde
  useEffect(() => {
    if (!dailyChallenge) return;

    const calculateTimeLeft = () => {
      const now = new Date();
      const endTime = new Date(dailyChallenge.endTime);
      const totalDuration = 24 * 60 * 60 * 1000; // 24 heures en millisecondes
      const diff = endTime.getTime() - now.getTime();
      
      // Calcul du pourcentage de temps restant avec arrondi pour éviter les décimales
      const timePercentageValue = Math.max(0, Math.min(100, Math.round((diff / totalDuration) * 100)));
      setTimePercentage(timePercentageValue);
      
      if (diff <= 0) {
        setTimeLeft("Terminé");
        return;
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft(`${hours}h ${minutes < 10 ? '0' : ''}${minutes}m ${seconds < 10 ? '0' : ''}${seconds}s`);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    
    return () => clearInterval(interval);
  }, [dailyChallenge]);

  // Détermine la couleur pour l'indicateur de temps avec une transition douce entre les états
  const getTimeColor = () => {
    if (timePercentage > 50) return 'var(--primary)';
    if (timePercentage > 20) return 'var(--accent-yellow)';
    return 'var(--accent-red)';
  };

  return (
    <div className="w-full">
      {/* Grille principale style bento avec espacement parfaitement calibré */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
        {/* Carte principale du défi avec animations raffinées */}
        <motion.div 
          className="lg:col-span-8"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {isLoading ? (
            <MainChallengeSkeleton />
          ) : error ? (
            <ErrorState error={error} onRetry={() => window.location.reload()} />
          ) : dailyChallenge ? (
            <BentoMainCard 
              challenge={dailyChallenge}
              timeLeft={timeLeft}
              timePercentage={timePercentage}
              timeColor={getTimeColor()}
            />
          ) : null}
        </motion.div>

        {/* Carte du classement avec esthétique Apple */}
        <motion.div 
          className="lg:col-span-4"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
        >
          {isLoading ? (
            <LeaderboardSkeleton />
          ) : dailyChallenge ? (
            <LeaderboardCard challengeId={dailyChallenge.id} />
          ) : null}
        </motion.div>
      </div>

      {/* Onglets des catégories de défis avec effet 3D subtil */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <TabsNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {activeTab === "ongoing" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {[
                  {
                    title: "API RESTful",
                    domain: "Back-end",
                    difficulty: "Intermédiaire",
                    timeLeft: "1j 8h",
                    participants: 42,
                    points: 30,
                    icon: <Code className="h-4 w-4" />
                  },
                  {
                    title: "Dashboard React",
                    domain: "Front-end",
                    difficulty: "Avancé",
                    timeLeft: "12h 20m",
                    participants: 65,
                    points: 45,
                    icon: <BarChart className="h-4 w-4" />
                  },
                  {
                    title: "CI/CD Pipeline",
                    domain: "DevOps",
                    difficulty: "Expert",
                    timeLeft: "4h 15m",
                    participants: 28,
                    points: 60,
                    icon: <Zap className="h-4 w-4" />
                  }
                ].map((challenge, index) => (
                  <motion.div
                    key={challenge.title}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      transition: { delay: 0.1 + index * 0.1, duration: 0.5 }
                    }}
                    className="apple-card"
                    whileHover={{ scale: 1.02, y: -3 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CompactChallengeCard {...challenge} />
                  </motion.div>
                ))}
              </div>
            )}
            {activeTab === "upcoming" && (
              <div className="mt-8">
                <EmptyStateCard
                  title="Prochains défis"
                  description="Les prochains défis seront disponibles bientôt. Revenez dans quelques jours !"
                  icon={<Calendar className="h-12 w-12 text-gray-400" />}
                />
              </div>
            )}
            {activeTab === "completed" && (
              <div className="mt-8">
                <EmptyStateCard
                  title="Défis terminés"
                  description="Vous n'avez pas encore de défis terminés. Participez à un défi pour commencer !"
                  icon={<Timer className="h-12 w-12 text-gray-400" />}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
      
      {/* Section "Pourquoi participer" avec style minimaliste Apple */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-16 mb-16"
      >
        <div className="text-center mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Pourquoi participer aux défis?</h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Rejoignez notre communauté de développeurs passionnés et progressez ensemble à travers des défis stimulants
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <Code className="h-8 w-8 text-[var(--primary)]" />,
              title: "Améliorez vos compétences",
              description: "Relevez des défis techniques qui vous poussent à explorer de nouvelles technologies et approches"
            },
            {
              icon: <Users className="h-8 w-8 text-[var(--primary)]" />,
              title: "Rejoignez une communauté",
              description: "Connectez-vous avec d'autres développeurs, partagez vos solutions et apprenez ensemble"
            },
            {
              icon: <Award className="h-8 w-8 text-[var(--primary)]" />,
              title: "Gagnez des récompenses",
              description: "Accumulez des points, grimpez dans le classement et débloquez des avantages exclusifs"
            }
          ].map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                transition: { delay: 0.2 + index * 0.1, duration: 0.5 }
              }}
              className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800/60"
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)" }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-gray-50 dark:bg-gray-900/60 p-3 rounded-xl inline-flex mb-5">
                {item.icon}
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                {item.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
      
      {/* Section Newsletter avec style Apple */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="mt-16 pt-8 border-t border-gray-100 dark:border-gray-800"
      >
        <Card className="border-0 shadow-sm apple-card overflow-hidden">
          <CardContent className="p-8 text-center flex flex-col items-center">
            <Target className="h-10 w-10 text-[var(--primary)] mb-4" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              Ne manquez aucun défi
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
              Inscrivez-vous pour recevoir une notification quand un nouveau défi est disponible
            </p>
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
              <input 
                type="email" 
                placeholder="Votre email" 
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] dark:bg-gray-800"
              />
              <Button className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white">
                S'inscrire
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

/**
 * Navigation par onglets style Apple avec animations fluides
 * Design épuré avec transitions subtilement animées
 */
function TabsNavigation({
  activeTab,
  onTabChange
}: {
  activeTab: string;
  onTabChange: (tab: string) => void;
}) {
  return (
    <div className="border-b border-gray-200/80 dark:border-gray-800/60">
      <div className="flex space-x-8">
        <TabButton 
          label="En cours" 
          isActive={activeTab === "ongoing"} 
          onClick={() => onTabChange("ongoing")} 
        />
        <TabButton 
          label="À venir" 
          isActive={activeTab === "upcoming"} 
          onClick={() => onTabChange("upcoming")} 
        />
        <TabButton 
          label="Terminés" 
          isActive={activeTab === "completed"} 
          onClick={() => onTabChange("completed")} 
        />
      </div>
    </div>
  );
}

/**
 * Bouton d'onglet avec animation raffinée
 */
function TabButton({ 
  label, 
  isActive, 
  onClick 
}: { 
  label: string; 
  isActive: boolean; 
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        "text-sm font-medium pb-2.5 relative",
        isActive 
          ? "text-gray-900 dark:text-white" 
          : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
      )}
      whileHover={!isActive ? { y: -1 } : {}}
      transition={{ duration: 0.2 }}
    >
      {label}
      {isActive && (
        <motion.div 
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--primary)]"
          layoutId="activeTab"
          transition={{ duration: 0.3, type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
    </motion.button>
  );
}

/**
 * État d'erreur optimisé avec design minimaliste
 * Interface épurée pour une expérience utilisateur sereine même en cas d'erreur
 */
function ErrorState({
  error,
  onRetry
}: {
  error: string;
  onRetry: () => void;
}) {
  return (
    <Card className="border-0 shadow-sm bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
      <CardContent className="p-10 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-gray-500 dark:text-gray-400 mb-5 text-center"
        >
          {error}
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={onRetry}
            variant="outline"
            className="bg-transparent border-gray-200/80 dark:border-gray-800/60 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900/60"
          >
            Réessayer
          </Button>
        </motion.div>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton pour la carte principale avec animation subtile
 * Design épuré inspiré des états de chargement d'Apple
 */
function MainChallengeSkeleton() {
  return (
    <Card className="h-full border-0 shadow-sm bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
      <CardContent className="p-7">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-6">
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-7 w-7 rounded-md" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-2 w-2 rounded-full" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-7 w-28 rounded-full" />
        </div>
        
        <Skeleton className="h-8 w-3/5 mb-3" />
        <Skeleton className="h-4 w-full mb-1.5" />
        <Skeleton className="h-4 w-4/5 mb-7" />
        
        <Skeleton className="h-1 w-full mb-7" />
        
        <Skeleton className="h-40 w-full mb-7 rounded-xl" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-0">
          <div className="flex gap-4">
            <Skeleton className="h-10 w-24 rounded-md" />
            <Skeleton className="h-10 w-24 rounded-md" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 flex-1 rounded-lg" />
            <Skeleton className="h-10 flex-1 rounded-lg" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton pour le classement avec animation subtile
 * Design épuré inspiré des états de chargement d'Apple
 */
function LeaderboardSkeleton() {
  return (
    <Card className="h-full border-0 shadow-sm bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
      <CardContent className="p-7">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
        
        {[...Array(5)].map((_, i) => (
          <motion.div 
            key={i} 
            className="flex items-center justify-between mb-4"
            initial={{ opacity: 0, y: 5 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              transition: { delay: 0.1 + i * 0.05, duration: 0.3 }
            }}
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-5 w-28" />
            </div>
            <Skeleton className="h-5 w-12" />
          </motion.div>
        ))}
        
        <Skeleton className="h-9 w-full mt-2 rounded-lg" />
      </CardContent>
    </Card>
  );
}

// Icône Trophy personnalisée avec trait fin style Apple
interface IconProps {
  className?: string;
  [key: string]: any;
}

const Trophy = ({ className, ...props }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5 text-yellow-500 mr-2"
    aria-hidden="true"
  >
    <path d="M8 21v-2a4 4 0 0 1 4-4v0a4 4 0 0 1 4 4v2"></path>
    <path d="M8 21H16"></path>
    <path d="M12 17v-5"></path>
    <path d="M5 3H19"></path>
    <path d="M6.5 3C4.5 5.5 4.5 7 4.5 8.5C4.5 10 4.5 10.5 6.5 13C8.5 10.5 8.5 10 8.5 8.5C8.5 7 8.5 5.5 6.5 3Z"></path>
    <path d="M17.5 3C15.5 5.5 15.5 7 15.5 8.5C15.5 10 15.5 10.5 17.5 13C19.5 10.5 19.5 10 19.5 8.5C19.5 7 19.5 5.5 17.5 3Z"></path>
  </svg>
); 