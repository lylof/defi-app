import { Suspense } from 'react';
import { ChallengeContainer } from '@/components/home/challenge-container';

/**
 * Page d'accueil de l'application LPT Défis
 * Implémente la philosophie "Un Visuel, Un Défi, Un Clic"
 * Conçue pour inciter à l'action immédiate par une interface minimaliste
 * Design inspiré d'Apple/iOS avec typographie soignée et espaces négatifs calibrés
 */
export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 pb-16">
      {/* Éléments de design abstrait */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        <div className="absolute -top-[35%] -left-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-[var(--primary)]/5 via-[var(--primary)]/3 to-transparent blur-3xl opacity-60 animate-blob"></div>
        <div className="absolute -bottom-[35%] -right-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-tl from-gray-200/50 via-gray-100/30 to-transparent blur-3xl opacity-60 dark:from-gray-800/20 dark:via-gray-800/10 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 w-full max-w-screen-xl mx-auto px-4">
        {/* En-tête avec animation subtile */}
        <header className="pt-12 pb-6 text-center">
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-gray-900 dark:text-white mb-4 bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 text-transparent animate-gradient">
            Défis Quotidiens
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Relevez les challenges, améliorez vos compétences et rejoignez une communauté de passionnés.
          </p>
        </header>

        {/* Conteneur principal avec effet de shadow subtil */}
        <div className="bg-white/30 dark:bg-gray-900/30 backdrop-blur-sm rounded-xl p-5 md:p-8 shadow-sm">
          <Suspense fallback={<div className="animate-pulse h-[500px] w-full bg-gray-200/50 dark:bg-gray-800/50 rounded-lg"></div>}>
            <ChallengeContainer />
          </Suspense>
        </div>
      </div>
      
      {/* Pied de page discret */}
      <footer className="mt-16 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>© {new Date().getFullYear()} LPT Défis · Tous droits réservés</p>
      </footer>
    </main>
  );
}

/* Styles pour l'animation des blobs et dégradés */
const styles = `
@keyframes blob {
  0% {
    transform: translate(0px, 0px) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
  100% {
    transform: translate(0px, 0px) scale(1);
  }
}

@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.animate-blob {
  animation: blob 20s infinite alternate;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animate-gradient {
  background-size: 200% auto;
  animation: gradient 8s ease infinite;
}
`;

// Ajouter les styles à la page
export const metadata = {
  title: 'LPT Défis - Relevez le défi du jour',
  description: 'Plateforme de défis quotidiens pour développer vos compétences techniques',
};
