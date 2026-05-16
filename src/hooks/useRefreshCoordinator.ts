import {useCallback, useEffect, useRef} from 'react';

export type RefreshSource =
  | 'manual'
  | 'global_event'
  | 'focus'
  | 'resume'
  | 'widget_event';

interface UseRefreshCoordinatorOptions {
  debounceMs?: number;
  onBeforeStart?: () => void;
  onComplete?: () => void;
  onError?: (error: unknown, source: RefreshSource) => void;
}

/**
 * Coordinates refresh requests so each screen runs at most one in-flight load.
 * If multiple triggers arrive while loading, one follow-up run is queued.
 */
export function useRefreshCoordinator(
  runLoad: () => Promise<void>,
  options: UseRefreshCoordinatorOptions = {},
) {
  const {debounceMs = 150, onBeforeStart, onComplete, onError} = options;
  const inFlightRef = useRef(false);
  const pendingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onBeforeStartRef = useRef<UseRefreshCoordinatorOptions['onBeforeStart']>(onBeforeStart);
  const onCompleteRef = useRef<UseRefreshCoordinatorOptions['onComplete']>(onComplete);
  const onErrorRef = useRef<UseRefreshCoordinatorOptions['onError']>(onError);

  useEffect(() => {
    onBeforeStartRef.current = onBeforeStart;
  }, [onBeforeStart]);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const execute = useCallback(
    async (source: RefreshSource) => {
      if (inFlightRef.current) {
        pendingRef.current = true;
        console.log('REFRESH_QUEUED', source);
        return;
      }

      inFlightRef.current = true;
      onBeforeStartRef.current?.();
      console.log('REFRESH_START', source);

      try {
        await runLoad();
      } catch (error) {
        onErrorRef.current?.(error, source);
      } finally {
        inFlightRef.current = false;
        onCompleteRef.current?.();
        console.log('REFRESH_DONE', source);
      }

      if (pendingRef.current) {
        pendingRef.current = false;
        await execute('global_event');
      }
    },
    [runLoad],
  );

  const requestRefresh = useCallback(
    async (source: RefreshSource) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      if (source === 'manual') {
        await execute(source);
        return;
      }

      await new Promise<void>(resolve => {
        timerRef.current = setTimeout(() => {
          timerRef.current = null;
          resolve();
        }, debounceMs);
      });

      await execute(source);
    },
    [debounceMs, execute],
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {requestRefresh};
}
