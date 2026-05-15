import { create } from 'zustand';

const DEFAULT_AUTO_DISMISS_MS = 4000;
const DUPLICATE_WINDOW_MS = 1000;

export type NotificationVariant = 'error';

export interface AppNotification {
  id: string;
  variant: NotificationVariant;
  title?: string;
  message: string;
  createdAt: number;
  autoDismissMs: number;
}

interface NotifyOptions {
  title?: string;
}

interface NotificationState {
  notifications: AppNotification[];
  notifyError: (message: string, options?: NotifyOptions) => string;
  dismissNotification: (id: string) => void;
}

const createNotificationId = () => (
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`
);

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],

  notifyError: (message, options) => {
    const normalizedMessage = message.trim();
    if (!normalizedMessage) return '';

    const now = Date.now();
    const existing = get().notifications.find((notification) => (
      notification.variant === 'error' &&
      notification.message === normalizedMessage &&
      now - notification.createdAt < DUPLICATE_WINDOW_MS
    ));

    if (existing) return existing.id;

    const id = createNotificationId();
    set((state) => ({
      notifications: [
        ...state.notifications,
        {
          id,
          variant: 'error',
          title: options?.title,
          message: normalizedMessage,
          createdAt: now,
          autoDismissMs: DEFAULT_AUTO_DISMISS_MS,
        },
      ],
    }));

    return id;
  },

  dismissNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((notification) => notification.id !== id),
    }));
  },
}));

export const notifyError = (message: string, options?: NotifyOptions) => (
  useNotificationStore.getState().notifyError(message, options)
);

export const dismissNotification = (id: string) => (
  useNotificationStore.getState().dismissNotification(id)
);
