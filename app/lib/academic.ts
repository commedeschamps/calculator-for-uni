export const COURSE_TERM_WEIGHT = 0.6;
export const COURSE_FINAL_WEIGHT = 0.4;
export const PASSING_THRESHOLD = 50;
export const PASSING_TARGET_TOTAL = 50.1;
export const SCHOLARSHIP_THRESHOLD = 70;
export const HIGH_SCHOLARSHIP_THRESHOLD = 90;
export const FX_MIN_EXCLUSIVE = 25;
export const FX_MAX_EXCLUSIVE = 50;
export const RETAKE_THRESHOLD = 25;

export type StatusTone = 'ok' | 'warn';

export type LetterGradeInfo = {
  min: number;
  letter: string;
  numeric: string;
  traditional: string;
};

export const LETTER_GRADE_SCALE: LetterGradeInfo[] = [
  { min: 95, letter: 'A', numeric: '4.0', traditional: 'Excellent' },
  { min: 90, letter: 'A-', numeric: '3.67', traditional: 'Excellent' },
  { min: 85, letter: 'B+', numeric: '3.33', traditional: 'Good' },
  { min: 80, letter: 'B', numeric: '3.0', traditional: 'Good' },
  { min: 75, letter: 'B-', numeric: '2.67', traditional: 'Good' },
  { min: 70, letter: 'C+', numeric: '2.33', traditional: 'Good' },
  { min: 65, letter: 'C', numeric: '2.0', traditional: 'Satisfactory' },
  { min: 60, letter: 'C-', numeric: '1.67', traditional: 'Satisfactory' },
  { min: 55, letter: 'D+', numeric: '1.33', traditional: 'Satisfactory' },
  { min: 50, letter: 'D', numeric: '1.0', traditional: 'Satisfactory' },
  { min: 25, letter: 'FX', numeric: '0', traditional: 'Fail' },
  { min: 0, letter: 'F', numeric: '0', traditional: 'Fail' },
];

export type GpaScaleStep = { min: number; points: number };

export const GPA_SCALE: GpaScaleStep[] = [
  { min: 95, points: 4.0 },
  { min: 90, points: 3.67 },
  { min: 85, points: 3.33 },
  { min: 80, points: 3.0 },
  { min: 75, points: 2.67 },
  { min: 70, points: 2.33 },
  { min: 65, points: 2.0 },
  { min: 60, points: 1.67 },
  { min: 55, points: 1.33 },
  { min: 50, points: 1.0 },
  { min: 0, points: 0.0 },
];

export type GpaCourse = {
  id: number;
  name: string;
  credits: string;
  total: string;
};

export type SyllabusItem = {
  id: string;
  title: string;
  score: string;
};

export type SyllabusSection = {
  id: string;
  title: string;
  weight: string;
  items: SyllabusItem[];
};

export type SyllabusCourse = {
  id: number;
  title: string;
  sections: SyllabusSection[];
};

export type SyllabusSectionResult = {
  sectionId: string;
  average: number;
  weight: number;
  contribution: number;
  gradedItems: number;
  totalItems: number;
};

export type SyllabusCourseResult = {
  sectionResults: SyllabusSectionResult[];
  totalWeight: number;
  weightedTotal: number;
  hasInvalidWeights: boolean;
};

export function parseInputValue(rawValue: string): number | null {
  if (rawValue.trim() === '') {
    return null;
  }

  const value = Number(rawValue);
  return Number.isFinite(value) ? value : null;
}

export function isPercentage(value: number | null): value is number {
  return value !== null && Number.isFinite(value) && value >= 0 && value <= 100;
}

export function formatScore(score: number, digits = 2): string {
  return score.toFixed(digits);
}

export function calculateRegTerm(regMid: number, regEnd: number): number {
  return (regMid + regEnd) / 2;
}

export function calculateCourseTotal(regTerm: number, finalScore: number): number {
  return COURSE_TERM_WEIGHT * regTerm + COURSE_FINAL_WEIGHT * finalScore;
}

export function getRequiredFinalForTarget(regTerm: number, targetScore: number): string {
  const finalByTotalFormula = (targetScore - COURSE_TERM_WEIGHT * regTerm) / COURSE_FINAL_WEIGHT;
  const requiredFinal = Math.max(finalByTotalFormula, FX_MAX_EXCLUSIVE);

  if (requiredFinal > 100) {
    return 'Not achievable (>100)';
  }

  if (requiredFinal === FX_MAX_EXCLUSIVE && finalByTotalFormula <= FX_MAX_EXCLUSIVE) {
    return `${formatScore(FX_MAX_EXCLUSIVE, 1)} (retake-safe minimum)`;
  }

  return formatScore(requiredFinal, 1);
}

export function getRequiredFinalForPassing(regTerm: number): string {
  return getRequiredFinalForTarget(regTerm, PASSING_TARGET_TOTAL);
}

export function getLetterGradeInfo(totalScore: number | null): LetterGradeInfo | null {
  if (!isPercentage(totalScore)) {
    return null;
  }

  for (const gradeStep of LETTER_GRADE_SCALE) {
    if (totalScore >= gradeStep.min) {
      return gradeStep;
    }
  }

  return null;
}

export function createGpaCourse(id: number): GpaCourse {
  return {
    id,
    name: '',
    credits: '',
    total: '',
  };
}

export function totalToGradePoints(total: number): number {
  for (const step of GPA_SCALE) {
    if (total >= step.min) {
      return step.points;
    }
  }

  return 0;
}

function createEntityId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createSyllabusItem(title: string): SyllabusItem {
  return {
    id: createEntityId('item'),
    title,
    score: '',
  };
}

export function createSyllabusSection(title: string, weight: string, itemTitles: string[]): SyllabusSection {
  return {
    id: createEntityId('section'),
    title,
    weight,
    items: itemTitles.map((itemTitle) => createSyllabusItem(itemTitle)),
  };
}

export function createSyllabusCourse(id: number, title?: string): SyllabusCourse {
  return {
    id,
    title: title ?? `Course ${id}`,
    sections: [
      createSyllabusSection('Assignments', '40', ['Assignment 1', 'Assignment 2']),
      createSyllabusSection('Quizzes', '20', ['Quiz 1']),
      createSyllabusSection('Midterm / Endterm', '40', ['Midterm', 'Endterm']),
    ],
  };
}

function parseWeight(weight: string): number | null {
  const value = parseInputValue(weight);
  return isPercentage(value) ? value : null;
}

export function calculateSyllabusCourseResult(course: SyllabusCourse): SyllabusCourseResult {
  let totalWeight = 0;
  let weightedTotal = 0;
  let hasInvalidWeights = false;

  const sectionResults: SyllabusSectionResult[] = course.sections.map((section) => {
    const weightValue = parseWeight(section.weight);
    const weight = weightValue ?? 0;

    if (weightValue === null) {
      hasInvalidWeights = true;
    }

    totalWeight += weight;

    const gradedScores = section.items
      .map((item) => parseInputValue(item.score))
      .filter((score): score is number => isPercentage(score));

    const average =
      gradedScores.length > 0 ? gradedScores.reduce((sum, score) => sum + score, 0) / gradedScores.length : 0;
    const contribution = average * (weight / 100);

    weightedTotal += contribution;

    return {
      sectionId: section.id,
      average,
      weight,
      contribution,
      gradedItems: gradedScores.length,
      totalItems: section.items.length,
    };
  });

  return {
    sectionResults,
    totalWeight,
    weightedTotal,
    hasInvalidWeights,
  };
}
