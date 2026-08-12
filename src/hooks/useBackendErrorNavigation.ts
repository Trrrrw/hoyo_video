import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { BackendError } from "../api/client";

type BackendErrorState = {
  status: number;
};

type BackendErrorContextValue = {
  error: BackendErrorState | null;
  clearError: () => void;
  reportError: (error: BackendErrorState) => void;
};

const BackendErrorContext = createContext<BackendErrorContextValue | null>(
  null,
);

export function BackendErrorProvider({ children }: { children: ReactNode }) {
  const [error, setError] = useState<BackendErrorState | null>(null);
  const clearError = useCallback(() => setError(null), []);
  const reportError = useCallback(
    (nextError: BackendErrorState) => setError(nextError),
    [],
  );
  const value = useMemo(
    () => ({ error, clearError, reportError }),
    [clearError, error, reportError],
  );

  return createElement(BackendErrorContext.Provider, { value }, children);
}

export function useBackendErrorState() {
  const context = useContext(BackendErrorContext);
  if (!context) {
    throw new Error(
      "useBackendErrorState 必须在 BackendErrorProvider 内使用",
    );
  }
  return context;
}

export function useBackendErrorNavigation() {
  const { reportError } = useBackendErrorState();

  return useCallback(
    (error: unknown) => {
      if (error instanceof BackendError) {
        reportError({
          status: error.status === 404 ? 404 : 500,
        });
        return;
      }

      reportError({ status: 500 });
    },
    [reportError],
  );
}
