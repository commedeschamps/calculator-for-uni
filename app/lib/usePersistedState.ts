import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * useState backed by localStorage.
 * Reads saved value after mount to avoid hydration mismatches, then writes on change.
 * Falls back to `initialValue` if nothing is stored or parsing fails.
 */
export function usePersistedState<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void, boolean] {
  const [state, setState] = useState<T>(initialValue);
  const [hasHydrated, setHasHydrated] = useState(false);

  const loadedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (loadedKeyRef.current !== key) {
      loadedKeyRef.current = key;

      try {
        const stored = localStorage.getItem(key);
        if (stored !== null) {
          setState(JSON.parse(stored) as T);
        }
      } catch {
        // Bad storage data or storage unavailable — keep initial value
      }

      setHasHydrated(true);
      return;
    }

    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // Storage full or unavailable — silently skip
    }
  }, [key, state]);

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setState(value);
  }, []);

  return [state, setValue, hasHydrated];
}
