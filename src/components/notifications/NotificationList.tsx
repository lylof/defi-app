'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Notification } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Bell, Check, Trash2 } from 'lucide-react';

interface NotificationListProps {
  limit?: number;
  showUnreadOnly?: boolean;
  onNotificationRead?: () => void;
}

interface NotificationResponse {
  data: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  unreadCount: number;
}

export default function NotificationList({ 
  limit = 10, 
  showUnreadOnly = false,
  onNotificationRead
}: NotificationListProps) {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fonction pour charger les notifications
  const loadNotifications = async (pageNum = 1, replace = true) => {
    if (!session?.user) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: limit.toString(),
      });
      
      if (showUnreadOnly) {
        params.append('unreadOnly', 'true');
      }
      
      const response = await fetch(`/api/notifications?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des notifications');
      }
      
      const data: NotificationResponse = await response.json();
      
      setNotifications(prev => replace ? data.data : [...prev, ...data.data]);
      setHasMore(pageNum < data.pagination.totalPages);
      setUnreadCount(data.unreadCount);
      setPage(pageNum);
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les notifications',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Charger les notifications au montage du composant
  useEffect(() => {
    if (session?.user) {
      loadNotifications(1);
    }
  }, [session, showUnreadOnly]);

  // Fonction pour marquer une notification comme lue
  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du marquage de la notification');
      }
      
      // Mettre à jour l'état local
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Notifier le parent si nécessaire
      if (onNotificationRead) {
        onNotificationRead();
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de marquer la notification comme lue',
        variant: 'destructive',
      });
    }
  };

  // Fonction pour supprimer une notification
  const deleteNotification = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression de la notification');
      }
      
      // Mettre à jour l'état local
      setNotifications(prev => prev.filter(notif => notif.id !== id));
      
      // Mettre à jour le compteur si la notification n'était pas lue
      const wasUnread = notifications.find(n => n.id === id)?.read === false;
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      toast({
        title: 'Succès',
        description: 'Notification supprimée',
      });
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la notification',
        variant: 'destructive',
      });
    }
  };

  // Fonction pour marquer toutes les notifications comme lues
  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications?action=markAllRead', {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du marquage des notifications');
      }
      
      // Mettre à jour l'état local
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
      setUnreadCount(0);
      
      // Notifier le parent si nécessaire
      if (onNotificationRead) {
        onNotificationRead();
      }
      
      toast({
        title: 'Succès',
        description: 'Toutes les notifications ont été marquées comme lues',
      });
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de marquer toutes les notifications comme lues',
        variant: 'destructive',
      });
    }
  };

  // Fonction pour charger plus de notifications
  const loadMore = () => {
    if (hasMore && !loading) {
      loadNotifications(page + 1, false);
    }
  };

  // Rendu du composant de chargement
  if (loading && notifications.length === 0) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-start gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  // Rendu quand il n'y a pas de notifications
  if (notifications.length === 0 && !loading) {
    return (
      <div className="text-center py-8">
        <Bell className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
        <h3 className="text-lg font-medium">Aucune notification</h3>
        <p className="text-muted-foreground">
          Vous n'avez pas encore de notifications.
        </p>
      </div>
    );
  }

  // Fonction pour obtenir la couleur de la priorité
  const getPriorityColor = (priority: string) => {
    switch (priority.toUpperCase()) {
      case 'HIGH':
        return 'bg-red-500';
      case 'MEDIUM':
        return 'bg-yellow-500';
      case 'LOW':
      default:
        return 'bg-blue-500';
    }
  };

  // Fonction pour obtenir la couleur du type
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'BADGE_EARNED':
        return 'bg-purple-500 hover:bg-purple-600';
      case 'LEVEL_UP':
        return 'bg-green-500 hover:bg-green-600';
      case 'POINTS_EARNED':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'CHALLENGE_COMPLETED':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'SUBMISSION_EVALUATED':
        return 'bg-indigo-500 hover:bg-indigo-600';
      case 'COMMENT_RECEIVED':
        return 'bg-pink-500 hover:bg-pink-600';
      case 'WELCOME':
        return 'bg-teal-500 hover:bg-teal-600';
      case 'SYSTEM':
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  // Rendu principal
  return (
    <div className="space-y-4">
      {unreadCount > 0 && (
        <div className="flex justify-between items-center mb-4">
          <Badge variant="outline" className="px-3 py-1">
            {unreadCount} non {unreadCount === 1 ? 'lue' : 'lues'}
          </Badge>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={markAllAsRead}
            disabled={loading}
          >
            <Check className="mr-2 h-4 w-4" />
            Tout marquer comme lu
          </Button>
        </div>
      )}

      <div className="space-y-3">
        {notifications.map((notification) => (
          <Card 
            key={notification.id} 
            className={`p-4 transition-colors ${!notification.read ? 'bg-muted/30' : ''}`}
          >
            <div className="flex items-start gap-3">
              <div className={`h-2 w-2 rounded-full mt-2 ${getPriorityColor(notification.priority)}`} />
              
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{notification.title}</h4>
                    <Badge className={`mt-1 ${getTypeColor(notification.type)}`}>
                      {notification.type.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.createdAt), { 
                      addSuffix: true,
                      locale: fr
                    })}
                  </span>
                </div>
                
                <p className="mt-2 text-sm text-muted-foreground">
                  {notification.content}
                </p>
                
                {notification.linkUrl && (
                  <a 
                    href={notification.linkUrl} 
                    className="text-sm text-primary hover:underline mt-2 inline-block"
                  >
                    Voir plus
                  </a>
                )}
                
                <div className="flex justify-end gap-2 mt-3">
                  {!notification.read && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => markAsRead(notification.id)}
                      disabled={loading}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Marquer comme lu
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => deleteNotification(notification.id)}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Supprimer
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-4">
          <Button 
            variant="outline" 
            onClick={loadMore} 
            disabled={loading}
          >
            {loading ? 'Chargement...' : 'Charger plus'}
          </Button>
        </div>
      )}
    </div>
  );
} 