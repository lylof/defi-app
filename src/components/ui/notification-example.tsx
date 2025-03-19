import { useNotifications } from '@/lib/hooks/use-notifications';
import { Button } from '@/components/ui/button';

/**
 * Composant d'exemple pour utiliser le hook de notifications
 */
export function NotificationExample() {
  const { showSuccess, showError, showWarning, showInfo, clearNotifications } = useNotifications();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Exemple de notifications</h2>
      <div className="grid grid-cols-2 gap-4">
        <Button
          onClick={() => showSuccess('Opération réussie !')}
          className="bg-green-500 hover:bg-green-600"
        >
          Succès
        </Button>
        <Button
          onClick={() => showError('Une erreur est survenue')}
          className="bg-red-500 hover:bg-red-600"
        >
          Erreur
        </Button>
        <Button
          onClick={() => showWarning('Attention !')}
          className="bg-yellow-500 hover:bg-yellow-600"
        >
          Avertissement
        </Button>
        <Button
          onClick={() => showInfo('Information importante')}
          className="bg-blue-500 hover:bg-blue-600"
        >
          Information
        </Button>
      </div>
      <Button
        onClick={clearNotifications}
        className="w-full bg-gray-500 hover:bg-gray-600"
      >
        Effacer toutes les notifications
      </Button>
    </div>
  );
} 