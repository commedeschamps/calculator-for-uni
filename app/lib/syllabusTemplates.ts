// ── Pre-built syllabus templates for SE-2411 Term 6 ──
// All courses follow the standard attestation structure:
//   1st Attestation (30%) — each item has its own max points, sum = 100
//   2nd Attestation (30%) — each item has its own max points, sum = 100
//   Final Exam       (40%) — scored 0-100
//   Total = 0.3 × Att1 + 0.3 × Att2 + 0.4 × Final

export type SyllabusTemplateItem = {
  title: string;
  maxPoints: number;
};

export type SyllabusTemplate = {
  key: string;
  name: string;
  credits: number;
  category: 'base' | 'elective';
  pair?: number; // elective pair number
  sections: { title: string; weight: string; items: SyllabusTemplateItem[] }[];
};

export const SYLLABUS_TEMPLATES: SyllabusTemplate[] = [
  // ── Base (mandatory) subjects ──
  {
    key: 'prob-stats',
    name: 'Probability and Statistics',
    credits: 5,
    category: 'base',
    sections: [
      { title: '1st Attestation', weight: '30', items: [
        { title: 'Assignment 1', maxPoints: 25 },
        { title: 'Assignment 2', maxPoints: 25 },
        { title: 'Quiz 1', maxPoints: 25 },
        { title: 'Midterm', maxPoints: 25 },
      ]},
      { title: '2nd Attestation', weight: '30', items: [
        { title: 'Assignment 3', maxPoints: 25 },
        { title: 'Assignment 4', maxPoints: 25 },
        { title: 'Quiz 2', maxPoints: 25 },
        { title: 'Endterm', maxPoints: 25 },
      ]},
      { title: 'Final Exam', weight: '40', items: [
        { title: 'Final Exam', maxPoints: 100 },
      ]},
    ],
  },
  {
    key: 'acad-writing',
    name: 'Academic Writing',
    credits: 5,
    category: 'base',
    sections: [
      { title: '1st Attestation', weight: '30', items: [
        { title: 'Classwork 1', maxPoints: 25 },
        { title: 'Classwork 2', maxPoints: 25 },
        { title: 'Assignment 1', maxPoints: 25 },
        { title: 'Midterm Essay', maxPoints: 25 },
      ]},
      { title: '2nd Attestation', weight: '30', items: [
        { title: 'Classwork 3', maxPoints: 25 },
        { title: 'Classwork 4', maxPoints: 25 },
        { title: 'Assignment 2', maxPoints: 25 },
        { title: 'Endterm Essay', maxPoints: 25 },
      ]},
      { title: 'Final Exam', weight: '40', items: [
        { title: 'Final Essay', maxPoints: 100 },
      ]},
    ],
  },
  {
    key: 'industrial-practice',
    name: 'Industrial Practice',
    credits: 4,
    category: 'base',
    sections: [
      { title: '1st Attestation', weight: '30', items: [
        { title: 'Report 1', maxPoints: 25 },
        { title: 'Report 2', maxPoints: 25 },
        { title: 'Report 3', maxPoints: 25 },
        { title: 'Supervisor Eval', maxPoints: 25 },
      ]},
      { title: '2nd Attestation', weight: '30', items: [
        { title: 'Report 4', maxPoints: 25 },
        { title: 'Report 5', maxPoints: 25 },
        { title: 'Defense Prep', maxPoints: 25 },
        { title: 'Supervisor Eval 2', maxPoints: 25 },
      ]},
      { title: 'Final Exam', weight: '40', items: [
        { title: 'Final Report & Defense', maxPoints: 100 },
      ]},
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
      { title: '1st Attestation', weight: '30', items: [
        { title: 'Assignment 1', maxPoints: 25 },
        { title: 'Assignment 2', maxPoints: 25 },
        { title: 'Quiz 1', maxPoints: 25 },
        { title: 'Midterm', maxPoints: 25 },
      ]},
      { title: '2nd Attestation', weight: '30', items: [
        { title: 'Assignment 3', maxPoints: 25 },
        { title: 'Assignment 4', maxPoints: 25 },
        { title: 'Assignment 5', maxPoints: 25 },
        { title: 'Endterm', maxPoints: 25 },
      ]},
      { title: 'Final Exam', weight: '40', items: [
        { title: 'Final Exam', maxPoints: 100 },
      ]},
    ],
  },
  {
    key: 'intro-gamedev',
    name: 'Introduction to Game Development',
    credits: 4,
    category: 'elective',
    pair: 1,
    sections: [
      { title: '1st Attestation', weight: '30', items: [
        { title: 'Assignment 1', maxPoints: 25 },
        { title: 'Assignment 2', maxPoints: 25 },
        { title: 'Assignment 3', maxPoints: 25 },
        { title: 'Midterm', maxPoints: 25 },
      ]},
      { title: '2nd Attestation', weight: '30', items: [
        { title: 'Assignment 4', maxPoints: 25 },
        { title: 'Assignment 5', maxPoints: 25 },
        { title: 'Assignment 6', maxPoints: 25 },
        { title: 'Endterm', maxPoints: 25 },
      ]},
      { title: 'Final Exam', weight: '40', items: [
        { title: 'MCQ', maxPoints: 100 },
      ]},
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
      { title: '1st Attestation', weight: '30', items: [
        { title: 'Assignment 1', maxPoints: 25 },
        { title: 'Assignment 2', maxPoints: 25 },
        { title: 'Quiz 1', maxPoints: 25 },
        { title: 'Midterm', maxPoints: 25 },
      ]},
      { title: '2nd Attestation', weight: '30', items: [
        { title: 'Assignment 3', maxPoints: 25 },
        { title: 'Assignment 4', maxPoints: 25 },
        { title: 'Assignment 5', maxPoints: 25 },
        { title: 'Endterm', maxPoints: 25 },
      ]},
      { title: 'Final Exam', weight: '40', items: [
        { title: 'Final Exam', maxPoints: 100 },
      ]},
    ],
  },
  {
    key: 'cross-mobile',
    name: 'Cross-platform mobile development',
    credits: 5,
    category: 'elective',
    pair: 2,
    sections: [
      { title: '1st Attestation', weight: '30', items: [
        { title: 'Assignment 1', maxPoints: 25 },
        { title: 'Assignment 2', maxPoints: 25 },
        { title: 'Quiz 1', maxPoints: 25 },
        { title: 'Midterm', maxPoints: 25 },
      ]},
      { title: '2nd Attestation', weight: '30', items: [
        { title: 'Assignment 3', maxPoints: 25 },
        { title: 'Assignment 4', maxPoints: 25 },
        { title: 'Assignment 5', maxPoints: 25 },
        { title: 'Endterm', maxPoints: 25 },
      ]},
      { title: 'Final Exam', weight: '40', items: [
        { title: 'Final Project', maxPoints: 100 },
      ]},
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
      { title: '1st Attestation', weight: '30', items: [
        { title: 'Assignment 1', maxPoints: 25 },
        { title: 'Assignment 2', maxPoints: 25 },
        { title: 'Quiz 1', maxPoints: 25 },
        { title: 'Midterm', maxPoints: 25 },
      ]},
      { title: '2nd Attestation', weight: '30', items: [
        { title: 'Assignment 3', maxPoints: 25 },
        { title: 'Assignment 4', maxPoints: 25 },
        { title: 'Assignment 5', maxPoints: 25 },
        { title: 'Endterm', maxPoints: 25 },
      ]},
      { title: 'Final Exam', weight: '40', items: [
        { title: 'Final Exam', maxPoints: 100 },
      ]},
    ],
  },
  {
    key: 'blockchain-2',
    name: 'Blockchain Technologies 2',
    credits: 5,
    category: 'elective',
    pair: 3,
    sections: [
      { title: '1st Attestation', weight: '30', items: [
        { title: 'Assignment 1', maxPoints: 25 },
        { title: 'Assignment 2', maxPoints: 25 },
        { title: 'Quiz 1', maxPoints: 25 },
        { title: 'Midterm', maxPoints: 25 },
      ]},
      { title: '2nd Attestation', weight: '30', items: [
        { title: 'Assignment 3', maxPoints: 25 },
        { title: 'Assignment 4', maxPoints: 25 },
        { title: 'Assignment 5', maxPoints: 25 },
        { title: 'Endterm', maxPoints: 25 },
      ]},
      { title: 'Final Exam', weight: '40', items: [
        { title: 'Final Exam', maxPoints: 100 },
      ]},
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
