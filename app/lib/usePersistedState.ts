import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * useState backed by localStorage.
 * Reads saved value on mount; writes on every change.
 * Falls back to `initialValue` if nothing is stored or parsing fails.
 */
export function usePersistedState<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? (JSON.parse(stored) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const keyRef = useRef(key);
  keyRef.current = key;

  useEffect(() => {
    try {
      localStorage.setItem(keyRef.current, JSON.stringify(state));
    } catch {
      // Storage full or unavailable — silently skip
    }
  }, [state]);

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setState(value);
  }, []);

  return [state, setValue];
}
