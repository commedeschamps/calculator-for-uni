// ── Schedule Types ────────────────────────────────────

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export type ElectiveGroup = 'Base' | 'Pair1' | 'Pair2' | 'Pair3';

export type ClassType = 'lecture' | 'practice';

export type ScheduleItem = {
  id: string;
  day: DayOfWeek;
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
  subject: string;
  classroom: string | null;
  type: ClassType;
  lecturer: string | null;
  electiveGroup: ElectiveGroup;
  mode: 'offline' | 'online';
  notes?: string;
};

export type Conflict = {
  a: ScheduleItem;
  b: ScheduleItem;
  day: DayOfWeek;
};

export type Gap = {
  day: DayOfWeek;
  afterItem: ScheduleItem;
  beforeItem: ScheduleItem;
  minutes: number;
  slots: number;
};

// ── Constants ────────────────────────────────────────

export const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const DAY_SHORT: Record<DayOfWeek, string> = {
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thu',
  Friday: 'Fri',
  Saturday: 'Sat',
};

export const SLOT_MINUTES = 55;

export const ALL_TRACKS: ElectiveGroup[] = ['Base', 'Pair1', 'Pair2', 'Pair3'];

export const PAIR_LABELS: Record<string, string> = {
  Pair1: 'Elective 1 — SRE / Game Dev',
  Pair2: 'Elective 2 — AP2 / Mobile',
  Pair3: 'Elective 3 — OS / Blockchain',
};

// ── Utilities ────────────────────────────────────────

export function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function formatMinutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function overlaps(a: ScheduleItem, b: ScheduleItem): boolean {
  if (a.day !== b.day) return false;
  const aStart = parseTimeToMinutes(a.startTime);
  const aEnd = parseTimeToMinutes(a.endTime);
  const bStart = parseTimeToMinutes(b.startTime);
  const bEnd = parseTimeToMinutes(b.endTime);
  return aStart < bEnd && bStart < aEnd;
}

export function detectConflicts(items: ScheduleItem[]): Conflict[] {
  const conflicts: Conflict[] = [];
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      if (overlaps(items[i], items[j])) {
        conflicts.push({ a: items[i], b: items[j], day: items[i].day });
      }
    }
  }
  return conflicts;
}

export function detectGaps(items: ScheduleItem[]): Gap[] {
  const gaps: Gap[] = [];
  const byDay = groupByDay(items);

  for (const day of DAYS) {
    const dayItems = byDay[day];
    if (!dayItems || dayItems.length < 2) continue;

    const sorted = [...dayItems].sort(
      (a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime),
    );

    for (let i = 0; i < sorted.length - 1; i++) {
      const endCurrent = parseTimeToMinutes(sorted[i].endTime);
      const startNext = parseTimeToMinutes(sorted[i + 1].startTime);
      const gap = startNext - endCurrent;
      const slots = Math.floor(gap / SLOT_MINUTES);
      if (slots >= 2) {
        gaps.push({
          day,
          afterItem: sorted[i],
          beforeItem: sorted[i + 1],
          minutes: gap,
          slots,
        });
      }
    }
  }

  return gaps;
}

export function groupByDay(items: ScheduleItem[]): Partial<Record<DayOfWeek, ScheduleItem[]>> {
  const result: Partial<Record<DayOfWeek, ScheduleItem[]>> = {};
  for (const item of items) {
    if (!result[item.day]) result[item.day] = [];
    result[item.day]!.push(item);
  }
  // sort each day
  for (const day of DAYS) {
    if (result[day]) {
      result[day]!.sort((a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime));
    }
  }
  return result;
}

export function getFilteredItems(
  items: ScheduleItem[],
  enabledSubjects: Set<string>,
  filters: {
    lecturer: string;
    mode: string;
    day: string;
  },
): ScheduleItem[] {
  return items.filter((item) => {
    if (!enabledSubjects.has(item.subject)) return false;
    if (filters.lecturer && item.lecturer !== filters.lecturer) return false;
    if (filters.mode && item.mode !== filters.mode) return false;
    if (filters.day && item.day !== filters.day) return false;
    return true;
  });
}

export function getUniqueSubjects(items: ScheduleItem[]): { base: string[]; electives: Map<string, ElectiveGroup> } {
  const base = new Set<string>();
  const electives = new Map<string, ElectiveGroup>();
  for (const item of items) {
    if (item.electiveGroup === 'Base') {
      base.add(item.subject);
    } else {
      electives.set(item.subject, item.electiveGroup);
    }
  }
  return { base: Array.from(base).sort(), electives };
}

export function getUniqueValues(items: ScheduleItem[], key: keyof ScheduleItem): string[] {
  const set = new Set<string>();
  for (const item of items) {
    const val = item[key];
    if (typeof val === 'string' && val) set.add(val);
  }
  return Array.from(set).sort();
}

export function getTimeRange(items: ScheduleItem[]): { earliest: number; latest: number } {
  let earliest = 24 * 60;
  let latest = 0;
  for (const item of items) {
    const s = parseTimeToMinutes(item.startTime);
    const e = parseTimeToMinutes(item.endTime);
    if (s < earliest) earliest = s;
    if (e > latest) latest = e;
  }
  return { earliest, latest };
}

// ── SE-2411 Schedule Data ────────────────────────────

let _id = 0;
function sid(): string {
  return `s${++_id}`;
}

export const SCHEDULE_DATA: ScheduleItem[] = [
  // ── Monday ──
  { id: sid(), day: 'Monday', startTime: '13:05', endTime: '13:55', subject: 'Blockchain Technologies 2', classroom: 'C1.2.252K', type: 'practice', lecturer: 'Alkhabay Bakgeldi', electiveGroup: 'Pair3', mode: 'offline' },
  { id: sid(), day: 'Monday', startTime: '14:00', endTime: '14:50', subject: 'Academic Writing', classroom: 'C1.1.253P', type: 'practice', lecturer: 'Nazipa Ayubayeva', electiveGroup: 'Base', mode: 'offline' },
  { id: sid(), day: 'Monday', startTime: '15:00', endTime: '15:50', subject: 'Academic Writing', classroom: 'C1.1.253P', type: 'practice', lecturer: 'Nazipa Ayubayeva', electiveGroup: 'Base', mode: 'offline' },
  { id: sid(), day: 'Monday', startTime: '17:00', endTime: '17:50', subject: 'Cross-platform mobile development', classroom: 'C1.1.240K (Apple)', type: 'practice', lecturer: 'Makhmetova Kuralay', electiveGroup: 'Pair2', mode: 'offline' },
  { id: sid(), day: 'Monday', startTime: '17:00', endTime: '17:50', subject: 'Advanced Programming 2', classroom: 'C1.2.123K (Huawei)', type: 'practice', lecturer: 'Nurlybek Taubakabyl', electiveGroup: 'Pair2', mode: 'offline' },
  { id: sid(), day: 'Monday', startTime: '18:00', endTime: '18:50', subject: 'Probability and Statistics', classroom: 'C1.1.252L', type: 'lecture', lecturer: 'Birzhan Ayanbayev', electiveGroup: 'Base', mode: 'offline' },
  { id: sid(), day: 'Monday', startTime: '19:00', endTime: '19:50', subject: 'Probability and Statistics', classroom: 'C1.1.328L', type: 'lecture', lecturer: 'Birzhan Ayanbayev', electiveGroup: 'Base', mode: 'offline', notes: 'Room change' },

  // ── Tuesday ──
  { id: sid(), day: 'Tuesday', startTime: '12:00', endTime: '12:50', subject: 'Introduction to Game Development', classroom: 'C1.1.357K', type: 'practice', lecturer: 'Kamila Zhakupova', electiveGroup: 'Pair1', mode: 'offline' },
  { id: sid(), day: 'Tuesday', startTime: '13:05', endTime: '13:55', subject: 'Introduction to Game Development', classroom: 'C1.1.357K', type: 'practice', lecturer: 'Kamila Zhakupova', electiveGroup: 'Pair1', mode: 'offline' },
  { id: sid(), day: 'Tuesday', startTime: '14:00', endTime: '14:50', subject: 'Advanced Operating Systems', classroom: 'C1.1.334L', type: 'lecture', lecturer: 'Abiche-Adejor Egahi', electiveGroup: 'Pair3', mode: 'offline' },
  { id: sid(), day: 'Tuesday', startTime: '15:00', endTime: '15:50', subject: 'Advanced Operating Systems', classroom: 'C1.1.334L', type: 'lecture', lecturer: 'Abiche-Adejor Egahi', electiveGroup: 'Pair3', mode: 'offline' },
  { id: sid(), day: 'Tuesday', startTime: '16:00', endTime: '16:50', subject: 'Introduction to SRE', classroom: 'C1.1.334L', type: 'lecture', lecturer: 'Temirgaly Dinmukhammed', electiveGroup: 'Pair1', mode: 'offline' },
  { id: sid(), day: 'Tuesday', startTime: '17:00', endTime: '17:50', subject: 'Introduction to SRE', classroom: 'C1.1.334L', type: 'lecture', lecturer: 'Temirgaly Dinmukhammed', electiveGroup: 'Pair1', mode: 'offline' },
  { id: sid(), day: 'Tuesday', startTime: '18:00', endTime: '18:50', subject: 'Blockchain Technologies 2', classroom: 'C1.3.370', type: 'lecture', lecturer: 'Kozhakhmet Zhaksylyk', electiveGroup: 'Pair3', mode: 'offline' },
  { id: sid(), day: 'Tuesday', startTime: '19:00', endTime: '19:50', subject: 'Blockchain Technologies 2', classroom: 'C1.3.370', type: 'lecture', lecturer: 'Kozhakhmet Zhaksylyk', electiveGroup: 'Pair3', mode: 'offline' },

  // ── Wednesday ──
  { id: sid(), day: 'Wednesday', startTime: '14:00', endTime: '14:50', subject: 'Introduction to Game Development', classroom: 'C1.1.334L', type: 'lecture', lecturer: 'Sembayev Talgat', electiveGroup: 'Pair1', mode: 'offline' },
  { id: sid(), day: 'Wednesday', startTime: '15:00', endTime: '15:50', subject: 'Introduction to Game Development', classroom: 'C1.1.334L', type: 'lecture', lecturer: 'Sembayev Talgat', electiveGroup: 'Pair1', mode: 'offline' },
  { id: sid(), day: 'Wednesday', startTime: '16:00', endTime: '16:50', subject: 'Blockchain Technologies 2', classroom: 'C1.1.241K', type: 'practice', lecturer: 'Alkhabay Bakgeldi', electiveGroup: 'Pair3', mode: 'offline' },
  { id: sid(), day: 'Wednesday', startTime: '17:00', endTime: '17:50', subject: 'Blockchain Technologies 2', classroom: 'C1.1.241K', type: 'practice', lecturer: 'Alkhabay Bakgeldi', electiveGroup: 'Pair3', mode: 'offline' },
  { id: sid(), day: 'Wednesday', startTime: '18:00', endTime: '18:50', subject: 'Cross-platform mobile development', classroom: 'C1.3.361', type: 'lecture', lecturer: 'Omirzak Islam', electiveGroup: 'Pair2', mode: 'offline' },
  { id: sid(), day: 'Wednesday', startTime: '19:00', endTime: '19:50', subject: 'Cross-platform mobile development', classroom: 'C1.3.361', type: 'lecture', lecturer: 'Omirzak Islam', electiveGroup: 'Pair2', mode: 'offline' },

  // ── Thursday ──
  { id: sid(), day: 'Thursday', startTime: '14:00', endTime: '14:50', subject: 'Advanced Programming 2', classroom: 'C1.2.237L', type: 'lecture', lecturer: 'Alshynov Shynggys', electiveGroup: 'Pair2', mode: 'offline' },
  { id: sid(), day: 'Thursday', startTime: '15:00', endTime: '15:50', subject: 'Advanced Programming 2', classroom: 'C1.2.237L', type: 'lecture', lecturer: 'Alshynov Shynggys', electiveGroup: 'Pair2', mode: 'offline' },
  { id: sid(), day: 'Thursday', startTime: '16:00', endTime: '16:50', subject: 'Cross-platform mobile development', classroom: 'C1.1.240K (Apple)', type: 'practice', lecturer: 'Makhmetova Kuralay', electiveGroup: 'Pair2', mode: 'offline' },
  { id: sid(), day: 'Thursday', startTime: '16:00', endTime: '16:50', subject: 'Advanced Programming 2', classroom: 'C1.2.239K', type: 'practice', lecturer: 'Nurlybek Taubakabyl', electiveGroup: 'Pair2', mode: 'offline' },
  { id: sid(), day: 'Thursday', startTime: '17:00', endTime: '17:50', subject: 'Cross-platform mobile development', classroom: 'C1.1.240K (Apple)', type: 'practice', lecturer: 'Makhmetova Kuralay', electiveGroup: 'Pair2', mode: 'offline' },
  { id: sid(), day: 'Thursday', startTime: '17:00', endTime: '17:50', subject: 'Advanced Programming 2', classroom: 'C1.2.239K', type: 'practice', lecturer: 'Nurlybek Taubakabyl', electiveGroup: 'Pair2', mode: 'offline' },
  { id: sid(), day: 'Thursday', startTime: '18:00', endTime: '18:50', subject: 'Probability and Statistics', classroom: 'C1.1.223P', type: 'practice', lecturer: 'Kairbek Kabdolkhanov', electiveGroup: 'Base', mode: 'offline' },
  { id: sid(), day: 'Thursday', startTime: '19:00', endTime: '19:50', subject: 'Probability and Statistics', classroom: 'C1.1.223P', type: 'practice', lecturer: 'Kairbek Kabdolkhanov', electiveGroup: 'Base', mode: 'offline' },

  // ── Friday ──
  { id: sid(), day: 'Friday', startTime: '13:05', endTime: '13:55', subject: 'Introduction to SRE', classroom: 'C1.2.221K', type: 'practice', lecturer: 'Daniyar Amantayev', electiveGroup: 'Pair1', mode: 'offline' },
  { id: sid(), day: 'Friday', startTime: '14:00', endTime: '14:50', subject: 'Introduction to SRE', classroom: 'C1.2.221K', type: 'practice', lecturer: 'Daniyar Amantayev', electiveGroup: 'Pair1', mode: 'offline' },
  { id: sid(), day: 'Friday', startTime: '15:00', endTime: '15:50', subject: 'Academic Writing', classroom: 'C1.3.319', type: 'practice', lecturer: 'Nazipa Ayubayeva', electiveGroup: 'Base', mode: 'offline' },
  { id: sid(), day: 'Friday', startTime: '17:00', endTime: '17:50', subject: 'Advanced Operating Systems', classroom: null, type: 'practice', lecturer: 'Mehak Basharat', electiveGroup: 'Pair3', mode: 'online' },
  { id: sid(), day: 'Friday', startTime: '18:00', endTime: '18:50', subject: 'Advanced Operating Systems', classroom: null, type: 'practice', lecturer: 'Mehak Basharat', electiveGroup: 'Pair3', mode: 'online' },
  { id: sid(), day: 'Friday', startTime: '19:00', endTime: '19:50', subject: 'Advanced Operating Systems', classroom: null, type: 'practice', lecturer: 'Mehak Basharat', electiveGroup: 'Pair3', mode: 'online' },

  // ── Saturday ──
  { id: sid(), day: 'Saturday', startTime: '17:00', endTime: '17:50', subject: 'Probability and Statistics', classroom: null, type: 'lecture', lecturer: null, electiveGroup: 'Base', mode: 'online', notes: 'learn.astanait.edu.kz' },
  { id: sid(), day: 'Saturday', startTime: '18:00', endTime: '18:50', subject: 'Academic Writing', classroom: null, type: 'lecture', lecturer: null, electiveGroup: 'Base', mode: 'online', notes: 'learn.astanait.edu.kz' },
  { id: sid(), day: 'Saturday', startTime: '19:00', endTime: '19:50', subject: 'Academic Writing', classroom: null, type: 'lecture', lecturer: null, electiveGroup: 'Base', mode: 'online', notes: 'learn.astanait.edu.kz' },
];
