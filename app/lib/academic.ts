export const COURSE_TERM_WEIGHT = 0.6;
export const COURSE_FINAL_WEIGHT = 0.4;
export const PASSING_THRESHOLD = 50;
export const PASSING_TARGET_TOTAL = 50.1;
export const SCHOLARSHIP_THRESHOLD = 70;
export const HIGH_SCHOLARSHIP_THRESHOLD = 90;
export const FX_MIN_EXCLUSIVE = 25;
export const FX_MAX_EXCLUSIVE = 50;
export const RETAKE_THRESHOLD = 25;

// ── Attestation constants ──
export const ATTESTATION_SECTION_MAX = 100;
export const STANDARD_ATT1_WEIGHT = 30;
export const STANDARD_ATT2_WEIGHT = 30;
export const STANDARD_FINAL_WEIGHT = 40;

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
  maxPoints: string;
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

export type SyllabusSectionPresetItem = {
  title: string;
  maxPoints: number;
};

export type SyllabusSectionPreset = {
  title: string;
  weight: string;
  items: SyllabusSectionPresetItem[];
};

export type SyllabusSectionResult = {
  sectionId: string;
  score: number;
  weight: number;
  contribution: number;
  gradedItems: number;
  totalItems: number;
  isAttestation: boolean;
  maxPointsSum: number; // sum of all item maxPoints in an attestation section
  maxPointsMismatch: boolean; // true if maxPointsSum ≠ 100 for attestation sections
  overflowAmount: number; // how much over maxPointsSum for attestation sections
};

export type AttestationFormulaBreakdown = {
  att1Score: number;
  att1Weight: number;
  att2Score: number;
  att2Weight: number;
  finalScore: number;
  finalWeight: number;
  total: number;
};

export type SyllabusCourseResult = {
  sectionResults: SyllabusSectionResult[];
  totalWeight: number;
  weightedTotal: number;
  hasInvalidWeights: boolean;
  usesAttestationStructure: boolean;
  hasAttestationOverflow: boolean;
  formulaBreakdown: AttestationFormulaBreakdown | null;
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

export function createSyllabusItem(title: string, maxPoints: number = 25): SyllabusItem {
  return {
    id: createEntityId('item'),
    title,
    maxPoints: String(maxPoints),
    score: '',
  };
}

export function createSyllabusSection(
  title: string,
  weight: string,
  items: SyllabusSectionPresetItem[],
): SyllabusSection {
  return {
    id: createEntityId('section'),
    title,
    weight,
    items: items.map((item) => createSyllabusItem(item.title, item.maxPoints)),
  };
}

export const DEFAULT_SYLLABUS_SECTION_PRESETS: SyllabusSectionPreset[] = [
  {
    title: '1st Attestation',
    weight: '30',
    items: [
      { title: 'Assignment 1', maxPoints: 25 },
      { title: 'Assignment 2', maxPoints: 25 },
      { title: 'Assignment 3', maxPoints: 25 },
      { title: 'Midterm', maxPoints: 25 },
    ],
  },
  {
    title: '2nd Attestation',
    weight: '30',
    items: [
      { title: 'Assignment 4', maxPoints: 25 },
      { title: 'Assignment 5', maxPoints: 25 },
      { title: 'Assignment 6', maxPoints: 25 },
      { title: 'Endterm', maxPoints: 25 },
    ],
  },
  {
    title: 'Final Exam',
    weight: '40',
    items: [
      { title: 'MCQ', maxPoints: 100 },
    ],
  },
];

export function createSyllabusCourse(id: number, title?: string): SyllabusCourse {
  return {
    id,
    title: title ?? `Course ${id}`,
    sections: DEFAULT_SYLLABUS_SECTION_PRESETS.map((preset) =>
      createSyllabusSection(preset.title, preset.weight, preset.items),
    ),
  };
}

export function isAttestationSection(sectionTitle: string): boolean {
  return sectionTitle.trim().toLowerCase().includes('attest');
}

export function isFinalExamSection(sectionTitle: string): boolean {
  const normalized = sectionTitle.trim().toLowerCase();
  return normalized.includes('final') || normalized.includes('exam');
}

/**
 * Checks whether a course follows the standard attestation structure:
 * 1st Attestation (30%) + 2nd Attestation (30%) + Final Exam (40%) = 100%
 */
export function usesStandardAttestationStructure(course: SyllabusCourse): boolean {
  const attestations = course.sections.filter((s) => isAttestationSection(s.title));
  const finals = course.sections.filter((s) => isFinalExamSection(s.title));
  return attestations.length === 2 && finals.length >= 1 && course.sections.length <= 4;
}

export function getSyllabusItemInputConfig(sectionTitle: string, _itemMaxPoints?: number): {
  min: number;
  max: number;
  step: number;
  placeholder: string;
} {
  return {
    min: 0,
    max: 100,
    step: 0.1,
    placeholder: 'Score (0-100)',
  };
}

export function getSyllabusSectionMetricLabel(sectionTitle: string): 'Total' | 'Avg' {
  return isAttestationSection(sectionTitle) ? 'Total' : 'Avg';
}

function parseWeight(weight: string): number | null {
  const value = parseInputValue(weight);
  return isPercentage(value) ? value : null;
}

export function calculateSyllabusCourseResult(course: SyllabusCourse): SyllabusCourseResult {
  let totalWeight = 0;
  let weightedTotal = 0;
  let hasInvalidWeights = false;
  let hasAttestationOverflow = false;

  const sectionResults: SyllabusSectionResult[] = course.sections.map((section) => {
    const weightValue = parseWeight(section.weight);
    const weight = weightValue ?? 0;

    if (weightValue === null) {
      hasInvalidWeights = true;
    }

    totalWeight += weight;

    const isAttest = isAttestationSection(section.title);

    // For attestation sections: each item has a weight (maxPoints) and a grade (score, 0-100%).
    // Item contribution to attestation = maxPoints × (score / 100).
    // Attestation total = sum of item contributions (should be out of maxPointsSum, ideally 100).
    let gradedCount = 0;
    let rawSum = 0;
    let maxPointsSum = 0;

    for (const item of section.items) {
      const itemMax = parseInputValue(item.maxPoints);
      if (isAttest && itemMax !== null && itemMax > 0) {
        maxPointsSum += itemMax;
      }

      const scoreVal = parseInputValue(item.score);
      if (scoreVal === null) continue;

      if (isAttest) {
        const max = (itemMax !== null && itemMax > 0) ? itemMax : 25;
        if (scoreVal >= 0) {
          // score is a percentage (0-100), contribution = weight × score / 100
          const clamped = Math.min(scoreVal, 100);
          rawSum += max * (clamped / 100);
          gradedCount++;
        }
      } else {
        if (isPercentage(scoreVal)) {
          rawSum += scoreVal;
          gradedCount++;
        }
      }
    }

    // For attestation sections with no maxPoints set, use default sum
    if (isAttest && maxPointsSum === 0) {
      maxPointsSum = section.items.length * 25;
    }

    const maxPointsMismatch = isAttest && Math.abs(maxPointsSum - ATTESTATION_SECTION_MAX) > 0.0001;

    const score = isAttest
      ? rawSum
      : gradedCount > 0
        ? rawSum / gradedCount
        : 0;

    // For attestation: rawSum is already the weighted total (out of maxPointsSum)
    // normalizedScore converts it to 0-100 scale for the section contribution
    const normalizedScore = isAttest && maxPointsSum > 0
      ? (rawSum / maxPointsSum) * 100
      : score;

    const overflowAmount = isAttest ? Math.max(0, rawSum - maxPointsSum) : 0;
    if (overflowAmount > 0) {
      hasAttestationOverflow = true;
    }

    // Use normalized score (0-100) for contribution
    const cappedNormalized = isAttest ? Math.min(normalizedScore, 100) : score;
    const contribution = cappedNormalized * (weight / 100);

    weightedTotal += contribution;

    return {
      sectionId: section.id,
      score,
      weight,
      contribution,
      gradedItems: gradedCount,
      totalItems: section.items.length,
      isAttestation: isAttest,
      maxPointsSum,
      maxPointsMismatch,
      overflowAmount,
    };
  });

  // Build formula breakdown if using attestation structure
  const usesAttestation = usesStandardAttestationStructure(course);
  let formulaBreakdown: AttestationFormulaBreakdown | null = null;

  if (usesAttestation) {
    const attResults = sectionResults.filter((r) => {
      const section = course.sections.find((s) => s.id === r.sectionId);
      return section && isAttestationSection(section.title);
    });
    const finalResults = sectionResults.filter((r) => {
      const section = course.sections.find((s) => s.id === r.sectionId);
      return section && isFinalExamSection(section.title);
    });

    if (attResults.length >= 2 && finalResults.length >= 1) {
      // Normalize attestation scores to 0-100 for formula display
      const att1Norm = attResults[0].maxPointsSum > 0
        ? Math.min((attResults[0].score / attResults[0].maxPointsSum) * 100, 100)
        : attResults[0].score;
      const att2Norm = attResults[1].maxPointsSum > 0
        ? Math.min((attResults[1].score / attResults[1].maxPointsSum) * 100, 100)
        : attResults[1].score;
      formulaBreakdown = {
        att1Score: att1Norm,
        att1Weight: attResults[0].weight,
        att2Score: att2Norm,
        att2Weight: attResults[1].weight,
        finalScore: finalResults[0].score,
        finalWeight: finalResults[0].weight,
        total: weightedTotal,
      };
    }
  }

  return {
    sectionResults,
    totalWeight,
    weightedTotal,
    hasInvalidWeights,
    usesAttestationStructure: usesAttestation,
    hasAttestationOverflow,
    formulaBreakdown,
  };
}
