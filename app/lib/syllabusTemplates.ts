// ── Pre-built syllabus templates for SE-2411 Term 6 ──

export type SyllabusTemplate = {
  key: string;
  name: string;
  credits: number;
  category: 'base' | 'elective';
  pair?: number; // elective pair number
  sections: { title: string; weight: string; items: string[] }[];
};

export const SYLLABUS_TEMPLATES: SyllabusTemplate[] = [
  // ── Base (mandatory) subjects ──
  {
    key: 'prob-stats',
    name: 'Probability and Statistics',
    credits: 5,
    category: 'base',
    sections: [
      { title: 'Assignments', weight: '20', items: ['Assignment 1', 'Assignment 2', 'Assignment 3', 'Assignment 4'] },
      { title: 'Quizzes', weight: '20', items: ['Quiz 1', 'Quiz 2', 'Quiz 3', 'Quiz 4'] },
      { title: 'Midterm', weight: '20', items: ['Midterm'] },
      { title: 'Endterm', weight: '40', items: ['Endterm'] },
    ],
  },
  {
    key: 'acad-writing',
    name: 'Academic Writing',
    credits: 5,
    category: 'base',
    sections: [
      { title: 'Classwork', weight: '20', items: ['Classwork 1', 'Classwork 2', 'Classwork 3', 'Classwork 4'] },
      { title: 'Assignments', weight: '20', items: ['Assignment 1', 'Assignment 2'] },
      { title: 'Midterm', weight: '20', items: ['Midterm Essay'] },
      { title: 'Endterm', weight: '40', items: ['Endterm Essay'] },
    ],
  },
  {
    key: 'industrial-practice',
    name: 'Industrial Practice',
    credits: 4,
    category: 'base',
    sections: [
      { title: 'Weekly Reports', weight: '30', items: ['Report 1', 'Report 2', 'Report 3', 'Report 4', 'Report 5'] },
      { title: 'Supervisor Evaluation', weight: '30', items: ['Supervisor Evaluation'] },
      { title: 'Final Report & Defense', weight: '40', items: ['Final Report', 'Defense'] },
    ],
  },

  // ── Elective Pair 1: SRE / Game Dev ──
  {
    key: 'intro-sre',
    name: 'Introduction to SRE',
    credits: 4,
    category: 'elective',
    pair: 1,
    sections: [
      { title: 'Assignments', weight: '30', items: ['Assignment 1', 'Assignment 2', 'Assignment 3', 'Assignment 4', 'Assignment 5'] },
      { title: 'Quizzes', weight: '10', items: ['Quiz 1', 'Quiz 2'] },
      { title: 'Midterm', weight: '20', items: ['Midterm'] },
      { title: 'Endterm', weight: '40', items: ['Endterm'] },
    ],
  },
  {
    key: 'intro-gamedev',
    name: 'Introduction to Game Development',
    credits: 4,
    category: 'elective',
    pair: 1,
    sections: [
      { title: 'Assignments', weight: '30', items: ['Assignment 1', 'Assignment 2', 'Assignment 3', 'Assignment 4'] },
      { title: 'Quizzes', weight: '10', items: ['Quiz 1', 'Quiz 2'] },
      { title: 'Midterm', weight: '20', items: ['Midterm Project'] },
      { title: 'Endterm', weight: '40', items: ['Final Project'] },
    ],
  },

  // ── Elective Pair 2: AP2 / Cross-platform Mobile ──
  {
    key: 'adv-prog-2',
    name: 'Advanced Programming 2',
    credits: 5,
    category: 'elective',
    pair: 2,
    sections: [
      { title: 'Assignments', weight: '30', items: ['Assignment 1', 'Assignment 2', 'Assignment 3', 'Assignment 4', 'Assignment 5'] },
      { title: 'Quizzes', weight: '10', items: ['Quiz 1', 'Quiz 2'] },
      { title: 'Midterm', weight: '20', items: ['Midterm'] },
      { title: 'Endterm', weight: '40', items: ['Endterm'] },
    ],
  },
  {
    key: 'cross-mobile',
    name: 'Cross-platform mobile development',
    credits: 5,
    category: 'elective',
    pair: 2,
    sections: [
      { title: 'Assignments', weight: '30', items: ['Assignment 1', 'Assignment 2', 'Assignment 3', 'Assignment 4', 'Assignment 5'] },
      { title: 'Quizzes', weight: '10', items: ['Quiz 1', 'Quiz 2'] },
      { title: 'Midterm', weight: '20', items: ['Midterm'] },
      { title: 'Endterm', weight: '40', items: ['Final Project'] },
    ],
  },

  // ── Elective Pair 3: OS / Blockchain ──
  {
    key: 'adv-os',
    name: 'Advanced Operating Systems',
    credits: 5,
    category: 'elective',
    pair: 3,
    sections: [
      { title: 'Assignments', weight: '30', items: ['Assignment 1', 'Assignment 2', 'Assignment 3', 'Assignment 4', 'Assignment 5'] },
      { title: 'Quizzes', weight: '10', items: ['Quiz 1', 'Quiz 2'] },
      { title: 'Midterm', weight: '20', items: ['Midterm'] },
      { title: 'Endterm', weight: '40', items: ['Endterm'] },
    ],
  },
  {
    key: 'blockchain-2',
    name: 'Blockchain Technologies 2',
    credits: 5,
    category: 'elective',
    pair: 3,
    sections: [
      { title: 'Assignments', weight: '30', items: ['Assignment 1', 'Assignment 2', 'Assignment 3', 'Assignment 4', 'Assignment 5'] },
      { title: 'Quizzes', weight: '10', items: ['Quiz 1', 'Quiz 2'] },
      { title: 'Midterm', weight: '20', items: ['Midterm'] },
      { title: 'Endterm', weight: '40', items: ['Endterm'] },
    ],
  },
];

export function getElectivePairs(): { pair: number; label: string; templates: SyllabusTemplate[] }[] {
  const map = new Map<number, SyllabusTemplate[]>();
  for (const t of SYLLABUS_TEMPLATES) {
    if (t.category === 'elective' && t.pair != null) {
      if (!map.has(t.pair)) map.set(t.pair, []);
      map.get(t.pair)!.push(t);
    }
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a - b)
    .map(([pair, templates]) => ({
      pair,
      label: `Elective ${pair}`,
      templates,
    }));
}

export function getBaseTemplates(): SyllabusTemplate[] {
  return SYLLABUS_TEMPLATES.filter((t) => t.category === 'base');
}
