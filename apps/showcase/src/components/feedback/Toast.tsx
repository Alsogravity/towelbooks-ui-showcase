import {
  createContext,
  type PropsWithChildren,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useI18n } from '../../i18n';
import { Alert, Portal, type AlertVariant } from '../primitives';

const DEFAULT_TOAST_DURATION_MS = 6000;
const MAX_VISIBLE_TOASTS = 3;

export type ToastVariant = AlertVariant;

export type ToastInput = {
  durationMs?: number;
  message?: ReactNode;
  replaceKey?: string;
  title: string;
  variant: ToastVariant;
};

type Toast = ToastInput & {
  id: string;
};

type ToastContextValue = {
  dismissToast: (id: string) => void;
  pushToast: (toast: ToastInput) => void;
};

const defaultContextValue: ToastContextValue = {
  dismissToast: () => undefined,
  pushToast: () => undefined,
};

const ToastContext = createContext<ToastContextValue>(defaultContextValue);

function createToastId() {
  return `toast_${Math.random().toString(16).slice(2, 10)}`;
}

export function ToastProvider({ children }: PropsWithChildren) {
  const { t } = useI18n();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef(new Map<string, number>());
  const toastLayerRef = useRef<HTMLDivElement>(null);

  const dismissToast = useCallback((id: string) => {
    const timer = timersRef.current.get(id);

    if (timer !== undefined) {
      window.clearTimeout(timer);
      timersRef.current.delete(id);
    }

    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== id),
    );
  }, []);

  const pushToast = useCallback(
    (toast: ToastInput) => {
      const id = createToastId();
      const durationMs = toast.durationMs ?? DEFAULT_TOAST_DURATION_MS;

      setToasts((currentToasts) => {
        const replacedToasts = toast.replaceKey
          ? currentToasts.filter(
              (currentToast) => currentToast.replaceKey === toast.replaceKey,
            )
          : [];

        for (const replacedToast of replacedToasts) {
          const timer = timersRef.current.get(replacedToast.id);

          if (timer !== undefined) {
            window.clearTimeout(timer);
            timersRef.current.delete(replacedToast.id);
          }
        }

        const remainingToasts = toast.replaceKey
          ? currentToasts.filter(
              (currentToast) => currentToast.replaceKey !== toast.replaceKey,
            )
          : currentToasts;
        const overflow = remainingToasts.length - MAX_VISIBLE_TOASTS + 1;

        if (overflow > 0) {
          const removed = remainingToasts.slice(0, overflow);

          for (const t of removed) {
            const timer = timersRef.current.get(t.id);

            if (timer !== undefined) {
              window.clearTimeout(timer);
              timersRef.current.delete(t.id);
            }
          }

          return [...remainingToasts.slice(overflow), { id, ...toast }];
        }

        return [...remainingToasts, { id, ...toast }];
      });

      const timer = window.setTimeout(() => {
        dismissToast(id);
      }, durationMs);

      timersRef.current.set(id, timer);
    },
    [dismissToast],
  );

  useEffect(() => {
    const timers = timersRef.current;

    return () => {
      for (const timer of timers.values()) {
        window.clearTimeout(timer);
      }
      timers.clear();
    };
  }, []);

  useLayoutEffect(() => {
    const layer = toastLayerRef.current;

    if (!layer?.isConnected) {
      return;
    }

    document.body.append(layer);
  }, [toasts]);

  const contextValue = useMemo(
    () => ({
      dismissToast,
      pushToast,
    }),
    [dismissToast, pushToast],
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <Portal>
        <div
          ref={toastLayerRef}
          data-testid="toast-layer"
          className="app-toast-layer"
        >
          {toasts.map((toast) => (
            <Alert
              key={toast.id}
              variant={toast.variant}
              className="pointer-events-auto w-full max-w-sm shadow-2"
            >
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink">{toast.title}</p>
                  {toast.message !== undefined && toast.message !== null ? (
                    <div className="mt-1 text-current">{toast.message}</div>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => dismissToast(toast.id)}
                  className="rounded-sm px-1.5 text-xl text-ink-3 transition-colors hover:text-ink"
                  aria-label={t('feedback.toast.dismiss')}
                >
                  ×
                </button>
              </div>
            </Alert>
          ))}
        </div>
      </Portal>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
