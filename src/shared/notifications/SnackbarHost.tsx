import { X } from 'lucide-react';
import { useEffect } from 'react';
import { dismissNotification, useNotificationStore } from './notificationStore';
import './snackbar.css';

const SnackbarHost = () => {
  const notifications = useNotificationStore((state) => state.notifications);

  useEffect(() => {
    const timers = notifications.map((notification) => {
      const elapsedMs = Date.now() - notification.createdAt;
      const remainingMs = Math.max(notification.autoDismissMs - elapsedMs, 0);

      return window.setTimeout(() => {
        dismissNotification(notification.id);
      }, remainingMs);
    });

    return () => {
      timers.forEach(window.clearTimeout);
    };
  }, [notifications]);

  if (notifications.length === 0) return null;

  return (
    <div className="snackbar-stack" aria-live="assertive" aria-relevant="additions removals">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`snackbar snackbar-${notification.variant}`}
          role="alert"
        >
          <div className="snackbar-content">
            {notification.title && (
              <div className="snackbar-title">{notification.title}</div>
            )}
            <div className="snackbar-message">{notification.message}</div>
          </div>
          <button
            type="button"
            className="snackbar-close"
            onClick={() => dismissNotification(notification.id)}
            aria-label="Dismiss notification"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default SnackbarHost;
