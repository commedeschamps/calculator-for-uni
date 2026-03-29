import type { SyllabusSectionKind } from './academic';

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
  sections: { kind?: SyllabusSectionKind; title: string; weight: string; items: SyllabusTemplateItem[] }[];
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
        { title: 'Evaluation of Research Articles (ARA)', maxPoints: 10 },
        { title: 'Research Context, Aim, and Questions (RCA)', maxPoints: 10 },
        { title: 'Paper-based Midterm Test (MT)', maxPoints: 10 },
      ]},
      { title: '2nd Attestation', weight: '30', items: [
        { title: 'Defining the Key Concept (DC)', maxPoints: 5 },
        { title: 'Research Data Presentation (RDP)', maxPoints: 15 },
        { title: 'Paper-based Endterm Test (ET)', maxPoints: 10 },
      ]},
      { title: 'Final Exam', weight: '40', items: [
        { title: 'Poster Presentation + Final Draft', maxPoints: 100 },
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
        { title: 'Practical Work 1: Installation, Unity Hub, Interface Overview', maxPoints: 10 },
        { title: 'Assignment 1: Creating 3D Scenes and User Interface', maxPoints: 25 },
        { title: 'Practical Work 2: Lighting, Cameras, Materials, Shaders & Textures', maxPoints: 10 },
        { title: 'Assignment 2: 2D Puzzle Game', maxPoints: 25 },
        { title: 'Midterm Quiz', maxPoints: 30 },
      ]},
      { title: '2nd Attestation', weight: '30', items: [
        { title: 'Practical Work 3: Mecanim and Animation', maxPoints: 10 },
        { title: 'Assignment 3: The 3D Coin Collection Game', maxPoints: 25 },
        { title: 'Practical Work 4: Working with Multimedia', maxPoints: 10 },
        { title: 'Assignment 4: The 3D Shooter Game', maxPoints: 25 },
        { title: 'Endterm Quiz', maxPoints: 30 },
      ]},
      { title: 'Final Exam', weight: '40', items: [
        { title: 'Final Project', maxPoints: 100 },
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
        { title: 'Assignment 1: Getting Started, Basic App, Basic Widgets', maxPoints: 10 },
        { title: 'Assignment 2: Understanding Widgets, Scrollable Widgets, Advanced Scrollable Widgets', maxPoints: 15 },
        { title: 'Assignment 3: Interactive Widgets, Routes & Navigation, Deep Links and Web URLs', maxPoints: 15 },
        { title: 'Assignment 4: Shared Preferences, JSON Serialization, Networking in Flutter', maxPoints: 20 },
        { title: 'Midterm', maxPoints: 40 },
      ]},
      { title: '2nd Attestation', weight: '30', items: [
        { title: 'Assignment 5: Managing State, Working with Streams', maxPoints: 10 },
        { title: 'Assignment 6: Saving Data Locally, Firebase Cloud Firestore', maxPoints: 15 },
        { title: 'Assignment 7: Introduction to Testing, Widget Testing', maxPoints: 15 },
        { title: 'Assignment 8: Platform-Specific App Assets, Build & Release', maxPoints: 20 },
        { title: 'Endterm', maxPoints: 40 },
      ]},
      { title: 'Final Exam', weight: '40', items: [
        { title: 'Presentation of Final Project', maxPoints: 100 },
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
