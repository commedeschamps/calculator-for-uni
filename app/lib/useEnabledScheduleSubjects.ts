'use client';

import { useCallback, useEffect, useState, type SetStateAction } from 'react';

import {
  SCHEDULE_ENABLED_SUBJECTS_STORAGE_KEY,
  buildDefaultEnabledSubjects,
  normalizeEnabledSubjects,
  readEnabledSubjectsFromStorage,
} from './schedulePreferences';

export function useEnabledScheduleSubjects() {
  const [enabledSubjects, setEnabledSubjects] = useState<Set<string>>(buildDefaultEnabledSubjects);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setEnabledSubjects(readEnabledSubjectsFromStorage());
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    try {
      localStorage.setItem(
        SCHEDULE_ENABLED_SUBJECTS_STORAGE_KEY,
        JSON.stringify(Array.from(enabledSubjects)),
      );
    } catch {
      // Ignore storage failures in private / restricted environments.
    }
  }, [enabledSubjects, hasHydrated]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== SCHEDULE_ENABLED_SUBJECTS_STORAGE_KEY) {
        return;
      }

      setEnabledSubjects(readEnabledSubjectsFromStorage());
    };

    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const setNormalizedSubjects = useCallback((value: SetStateAction<Set<string>>) => {
    setEnabledSubjects((prev) => {
      const next = typeof value === 'function' ? value(prev) : value;
      return normalizeEnabledSubjects(next);
    });
  }, []);

  return [enabledSubjects, setNormalizedSubjects, hasHydrated] as const;
}
