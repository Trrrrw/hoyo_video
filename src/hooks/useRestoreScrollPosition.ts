import { useEffect, useLayoutEffect, useRef } from "react";

type RestoreScrollPositionOptions = {
  scrollElement: HTMLElement | null;
  storageKey: string;
  locationKey: string;
  shouldRestore: boolean;
  layoutVersion: number | string;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  onLoadMore?: () => void;
  onRestoreComplete?: () => void;
};

function readStoredScrollTop(storageKey: string) {
  try {
    return Number(sessionStorage.getItem(storageKey) ?? "0");
  } catch {
    return 0;
  }
}

function writeStoredScrollTop(storageKey: string, scrollTop: number) {
  try {
    sessionStorage.setItem(storageKey, String(scrollTop));
  } catch {
    // Scroll restoration is optional when storage is unavailable
  }
}

function removeStoredScrollTop(storageKey: string) {
  try {
    sessionStorage.removeItem(storageKey);
  } catch {
    // Scroll restoration is optional when storage is unavailable
  }
}

export function consumeRestoreNavigationState() {
  const historyState = window.history.state;
  if (!historyState || typeof historyState !== "object") return;

  window.history.replaceState(
    { ...historyState, usr: null },
    "",
    window.location.href,
  );
}

export function useRestoreScrollPosition({
  scrollElement,
  storageKey,
  locationKey,
  shouldRestore,
  layoutVersion,
  isLoading,
  isLoadingMore,
  hasMore,
  onLoadMore,
  onRestoreComplete,
}: RestoreScrollPositionOptions) {
  const pendingScrollTop = useRef<number | null>(null);
  const restoredStorageKey = useRef<string | null>(null);

  useLayoutEffect(() => {
    if (shouldRestore) return;

    pendingScrollTop.current = null;
    if (restoredStorageKey.current !== storageKey) {
      removeStoredScrollTop(storageKey);
    }
  }, [shouldRestore, storageKey]);

  useLayoutEffect(() => {
    if (
      !shouldRestore ||
      !scrollElement ||
      restoredStorageKey.current === storageKey
    ) {
      return;
    }

    const savedScrollTop = readStoredScrollTop(storageKey);
    if (!Number.isFinite(savedScrollTop) || savedScrollTop <= 0) {
      restoredStorageKey.current = storageKey;
      onRestoreComplete?.();
      return;
    }

    pendingScrollTop.current = savedScrollTop;

    const restoreScrollPosition = () => {
      const targetScrollTop = pendingScrollTop.current;
      if (targetScrollTop === null) return;

      if (isLoading || isLoadingMore) return;

      const maxScrollTop = Math.max(
        0,
        scrollElement.scrollHeight - scrollElement.clientHeight,
      );

      if (maxScrollTop < targetScrollTop && hasMore && onLoadMore) {
        onLoadMore();
        return;
      }

      scrollElement.scrollTop = Math.min(targetScrollTop, maxScrollTop);
      pendingScrollTop.current = null;
      restoredStorageKey.current = storageKey;
      onRestoreComplete?.();
    };

    restoreScrollPosition();
    const frame = requestAnimationFrame(restoreScrollPosition);

    return () => cancelAnimationFrame(frame);
  }, [
    hasMore,
    isLoading,
    isLoadingMore,
    layoutVersion,
    onLoadMore,
    onRestoreComplete,
    scrollElement,
    shouldRestore,
    storageKey,
  ]);

  useEffect(() => {
    if (!scrollElement) return;

    let pendingSaveFrame: number | null = null;
    let navigationStarted = false;

    const markNavigationStart = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const link = target.closest("a");
      if (!link?.href) return;

      const nextLocation = new URL(link.href, window.location.href);
      if (
        nextLocation.pathname === window.location.pathname &&
        nextLocation.search === window.location.search
      ) {
        return;
      }

      navigationStarted = true;
      if (pendingSaveFrame !== null) {
        cancelAnimationFrame(pendingSaveFrame);
        pendingSaveFrame = null;
      }
    };

    const saveScrollPosition = (scrollTop: number) => {
      if (
        !scrollElement.isConnected ||
        `${window.location.pathname}${window.location.search}` !== locationKey
      ) {
        return;
      }

      const targetScrollTop = pendingScrollTop.current;
      if (targetScrollTop !== null && scrollTop < targetScrollTop) return;

      writeStoredScrollTop(storageKey, scrollTop);
    };

    const handleScroll = () => {
      if (navigationStarted) return;

      const scrollTop = Math.round(scrollElement.scrollTop);
      if (
        pendingScrollTop.current !== null &&
        scrollTop < pendingScrollTop.current
      ) {
        return;
      }

      if (scrollTop > 0) {
        saveScrollPosition(scrollTop);
        return;
      }

      if (pendingSaveFrame !== null) {
        cancelAnimationFrame(pendingSaveFrame);
      }
      pendingSaveFrame = requestAnimationFrame(() => {
        pendingSaveFrame = null;
        saveScrollPosition(0);
      });
    };

    scrollElement.addEventListener("scroll", handleScroll, {
      passive: true,
    });
    document.addEventListener("click", markNavigationStart, true);

    return () => {
      scrollElement.removeEventListener("scroll", handleScroll);
      document.removeEventListener("click", markNavigationStart, true);
      if (pendingSaveFrame !== null) {
        cancelAnimationFrame(pendingSaveFrame);
      }
    };
  }, [locationKey, scrollElement, storageKey]);

  return pendingScrollTop;
}
