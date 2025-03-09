'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import NotificationList from './NotificationList';

export default function NotificationIndicator() {
  const { data: session, status } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  // Fonction pour récupérer le nombre de notifications non lues
  const fetchUnreadCount = async () => {
    // Ne pas essayer de récupérer les notifications si l'utilisateur n'est pas connecté
    if (status !== 'authenticated' || !session?.user) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/notifications/count', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Utiliser credentials: 'include' pour envoyer les cookies de session
        credentials: 'include',
      });
      
      if (!response.ok) {
        // En cas d'erreur 401, ne pas afficher d'erreur car c'est probablement juste une session expirée
        if (response.status === 401) {
          console.log('Session expirée ou non authentifiée');
          setUnreadCount(0);
          return;
        }
        
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      // Utiliser la valeur count ou 0 si elle n'existe pas
      setUnreadCount(data.count || 0);
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
      setError(error instanceof Error ? error.message : 'Erreur inconnue');
      // En cas d'erreur, ne pas bloquer l'interface
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Récupérer le nombre de notifications non lues au chargement
  useEffect(() => {
    // N'exécuter que si l'utilisateur est authentifié
    if (status === 'authenticated' && session?.user) {
      fetchUnreadCount();
      
      // Mettre en place un intervalle pour rafraîchir le compteur
      const interval = setInterval(fetchUnreadCount, 60000); // Toutes les minutes
      
      return () => clearInterval(interval);
    }
  }, [session, status]);

  // Fonction appelée lorsqu'une notification est marquée comme lue
  const handleNotificationRead = () => {
    fetchUnreadCount();
  };

  // Si l'utilisateur n'est pas connecté ou en cours de chargement, ne rien afficher
  if (status !== 'authenticated' || !session?.user) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 md:w-96" align="end">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Notifications</h3>
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-4">
          <NotificationList 
            limit={5} 
            showUnreadOnly={false} 
            onNotificationRead={handleNotificationRead}
          />
        </div>
        <div className="p-3 border-t text-center">
          <a 
            href="/notifications" 
            className="text-sm text-primary hover:underline"
            onClick={() => setOpen(false)}
          >
            Voir toutes les notifications
          </a>
        </div>
      </PopoverContent>
    </Popover>
  );
} 