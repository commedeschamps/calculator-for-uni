import { PAIR_LABELS, type ElectiveGroup, SCHEDULE_DATA, getUniqueSubjects } from './schedule';

export const SCHEDULE_ENABLED_SUBJECTS_STORAGE_KEY = 'sch-enabled-subjects';

const { base: baseSubjects, electives } = getUniqueSubjects(SCHEDULE_DATA);

export const BASE_SUBJECTS = baseSubjects;
export const ELECTIVE_MAP = electives;

export const ELECTIVE_PAIRS: { pair: ElectiveGroup; label: string; subjects: string[] }[] = (() => {
  const grouped = new Map<ElectiveGroup, string[]>();

  ELECTIVE_MAP.forEach((pair, subject) => {
    if (!grouped.has(pair)) {
      grouped.set(pair, []);
    }

    grouped.get(pair)!.push(subject);
  });

  return Array.from(grouped.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([pair, subjects]) => ({
      pair,
      label: PAIR_LABELS[pair] || pair,
      subjects: subjects.sort(),
    }));
})();

export function buildDefaultEnabledSubjects(): Set<string> {
  const defaults = new Set(BASE_SUBJECTS);

  for (const { subjects } of ELECTIVE_PAIRS) {
    const firstSubject = subjects[0];
    if (firstSubject) {
      defaults.add(firstSubject);
    }
  }

  return defaults;
}

export function normalizeEnabledSubjects(subjects: Iterable<string>): Set<string> {
  const incoming = new Set(subjects);
  const normalized = new Set<string>();

  for (const subject of BASE_SUBJECTS) {
    if (incoming.has(subject)) {
      normalized.add(subject);
    }
  }

  for (const { subjects: pairSubjects } of ELECTIVE_PAIRS) {
    const selected = pairSubjects.find((subject) => incoming.has(subject));
    if (selected) {
      normalized.add(selected);
    }
  }

  return normalized;
}

export function readEnabledSubjectsFromStorage(): Set<string> {
  if (typeof window === 'undefined') {
    return buildDefaultEnabledSubjects();
  }

  try {
    const stored = localStorage.getItem(SCHEDULE_ENABLED_SUBJECTS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as string[];
      if (Array.isArray(parsed)) {
        return normalizeEnabledSubjects(parsed);
      }
    }
  } catch {
    // Ignore malformed storage and fall back to defaults.
  }

  return buildDefaultEnabledSubjects();
}
