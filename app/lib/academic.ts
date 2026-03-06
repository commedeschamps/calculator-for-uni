export const COURSE_TERM_WEIGHT = 0.6;
export const COURSE_FINAL_WEIGHT = 0.4;
export const PASSING_THRESHOLD = 50;
export const PASSING_TARGET_TOTAL = 50.1;
export const SCHOLARSHIP_THRESHOLD = 70;
export const HIGH_SCHOLARSHIP_THRESHOLD = 90;
export const FX_MIN_EXCLUSIVE = 25;
export const FX_MAX_EXCLUSIVE = 50;
export const RETAKE_THRESHOLD = 25;

// Attestation constants
export const ATTESTATION_SECTION_MAX = 100;
export const STANDARD_ATT1_WEIGHT = 30;
export const STANDARD_ATT2_WEIGHT = 30;
export const STANDARD_FINAL_WEIGHT = 40;

export const SYLLABUS_GPA_LINK_STORAGE_KEY = 'syl-gpa-linked';

const EPSILON = 0.0001;

export type StatusTone = 'ok' | 'warn';
export type ScholarshipTier = 'standard' | 'high' | null;
export type SyllabusSectionKind = 'attestation' | 'final' | 'regular';

export type LetterGradeInfo = {
  min: number;
  letter: string;
  points: number;
  numeric: string;
  traditional: string;
};

export type AcademicOutcome = {
  total: number | null;
  letterInfo: LetterGradeInfo | null;
  gradePoints: number | null;
  isPassed: boolean;
  isFx: boolean;
  isRetakeRequired: boolean;
  scholarshipTier: ScholarshipTier;
  statusText: string;
  statusTone: StatusTone;
};

export type CourseExamOutcome = AcademicOutcome & {
  regTerm: number | null;
  finalScore: number | null;
};

export type RequiredFinalTargetReason = 'ok' | 'retake_safe_minimum' | 'not_achievable';

export type RequiredFinalTargetDetails = {
  targetScore: number;
  rawRequiredFinal: number;
  requiredFinal: number | null;
  achievable: boolean;
  usesRetakeSafeMinimum: boolean;
  reason: RequiredFinalTargetReason;
  displayValue: string;
};

const GRADE_SCALE: LetterGradeInfo[] = [
  { min: 95, letter: 'A', points: 4.0, numeric: '4.0', traditional: 'Excellent' },
  { min: 90, letter: 'A-', points: 3.67, numeric: '3.67', traditional: 'Excellent' },
  { min: 85, letter: 'B+', points: 3.33, numeric: '3.33', traditional: 'Good' },
  { min: 80, letter: 'B', points: 3.0, numeric: '3.0', traditional: 'Good' },
  { min: 75, letter: 'B-', points: 2.67, numeric: '2.67', traditional: 'Good' },
  { min: 70, letter: 'C+', points: 2.33, numeric: '2.33', traditional: 'Good' },
  { min: 65, letter: 'C', points: 2.0, numeric: '2.0', traditional: 'Satisfactory' },
  { min: 60, letter: 'C-', points: 1.67, numeric: '1.67', traditional: 'Satisfactory' },
  { min: 55, letter: 'D+', points: 1.33, numeric: '1.33', traditional: 'Satisfactory' },
  { min: 50, letter: 'D', points: 1.0, numeric: '1.0', traditional: 'Satisfactory' },
  { min: 25, letter: 'FX', points: 0.0, numeric: '0', traditional: 'Fail' },
  { min: 0, letter: 'F', points: 0.0, numeric: '0', traditional: 'Fail' },
];

export const LETTER_GRADE_SCALE: LetterGradeInfo[] = GRADE_SCALE;

export type GpaCourse = {
  id: number;
  name: string;
  credits: string;
  total: string;
};

export type GpaSummary = {
  totalCredits: number;
  gpa: number;
  gradedCourses: number;
  skippedCourses: number;
};

export type SyllabusLinkedGpaCourse = {
  source: 'syllabus';
  syllabusCourseId: number;
  name: string;
  credits: number;
  total: number;
};

export type SyllabusItem = {
  id: string;
  title: string;
  maxPoints: string;
  score: string;
};

export type SyllabusSection = {
  id: string;
  kind: SyllabusSectionKind;
  title: string;
  weight: string;
  items: SyllabusItem[];
};

export type SyllabusCourse = {
  id: number;
  title: string;
  credits: string;
  sections: SyllabusSection[];
};

export type SyllabusSectionPresetItem = {
  title: string;
  maxPoints: number;
};

export type SyllabusSectionPreset = {
  kind: SyllabusSectionKind;
  title: string;
  weight: string;
  items: SyllabusSectionPresetItem[];
};

export type SyllabusSectionResult = {
  sectionId: string;
  kind: SyllabusSectionKind;
  score: number;
  normalizedScore: number;
  weight: number;
  contribution: number;
  gradedItems: number;
  totalItems: number;
  maxPointsSum: number;
  maxPointsMismatch: boolean;
  overflowAmount: number;
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
  const normalized = rawValue.trim().replace(',', '.');
  if (normalized === '') {
    return null;
  }

  const value = Number(normalized);
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

export function extractCourseTitleAndCredits(rawTitle: string): { title: string; credits: string } {
  const match = rawTitle.trim().match(/^(.*?)(?:\s*\((\d+(?:[.,]\d+)?)\s*cr\.?\))$/i);
  if (!match) {
    return { title: rawTitle.trim(), credits: '' };
  }

  return {
    title: match[1].trim(),
    credits: match[2].replace(',', '.'),
  };
}

export function normalizeCourseName(name: string): string {
  return extractCourseTitleAndCredits(name).title.toLowerCase().replace(/\s+/g, ' ').trim();
}

function approxEqual(a: number, b: number, epsilon = EPSILON): boolean {
  return Math.abs(a - b) <= epsilon;
}

function getGradeScaleStep(totalScore: number | null): LetterGradeInfo | null {
  if (!isPercentage(totalScore)) {
    return null;
  }

  for (const step of GRADE_SCALE) {
    if (totalScore >= step.min) {
      return step;
    }
  }

  return null;
}

export function getRequiredFinalForTargetDetails(regTerm: number, targetScore: number): RequiredFinalTargetDetails {
  const rawRequiredFinal = (targetScore - COURSE_TERM_WEIGHT * regTerm) / COURSE_FINAL_WEIGHT;
  const requiredFinal = Math.max(rawRequiredFinal, FX_MAX_EXCLUSIVE);

  if (requiredFinal > 100) {
    return {
      targetScore,
      rawRequiredFinal,
      requiredFinal: null,
      achievable: false,
      usesRetakeSafeMinimum: false,
      reason: 'not_achievable',
      displayValue: 'Not achievable (>100)',
    };
  }

  if (requiredFinal === FX_MAX_EXCLUSIVE && rawRequiredFinal <= FX_MAX_EXCLUSIVE) {
    return {
      targetScore,
      rawRequiredFinal,
      requiredFinal,
      achievable: true,
      usesRetakeSafeMinimum: true,
      reason: 'retake_safe_minimum',
      displayValue: `${formatScore(FX_MAX_EXCLUSIVE, 1)} (retake-safe minimum)`,
    };
  }

  return {
    targetScore,
    rawRequiredFinal,
    requiredFinal,
    achievable: true,
    usesRetakeSafeMinimum: false,
    reason: 'ok',
    displayValue: formatScore(requiredFinal, 1),
  };
}

export function getRequiredFinalForPassingDetails(regTerm: number): RequiredFinalTargetDetails {
  return getRequiredFinalForTargetDetails(regTerm, PASSING_TARGET_TOTAL);
}

export function getRequiredFinalForTarget(regTerm: number, targetScore: number): string {
  return getRequiredFinalForTargetDetails(regTerm, targetScore).displayValue;
}

export function getRequiredFinalForPassing(regTerm: number): string {
  return getRequiredFinalForPassingDetails(regTerm).displayValue;
}

export function getLetterGradeInfo(totalScore: number | null): LetterGradeInfo | null {
  return getGradeScaleStep(totalScore);
}

export function totalToGradePoints(total: number): number {
  return getGradeScaleStep(total)?.points ?? 0;
}

export function getAcademicOutcomeFromTotal(
  total: number | null,
  options?: { hasWeightMismatch?: boolean },
): AcademicOutcome {
  const letterInfo = getLetterGradeInfo(total);
  const gradePoints = letterInfo ? letterInfo.points : null;
  const hasWeightMismatch = options?.hasWeightMismatch ?? false;

  if (!isPercentage(total)) {
    return {
      total: null,
      letterInfo: null,
      gradePoints: null,
      isPassed: false,
      isFx: false,
      isRetakeRequired: false,
      scholarshipTier: null,
      statusText: '-',
      statusTone: 'warn',
    };
  }

  const scholarshipTier: ScholarshipTier =
    total >= HIGH_SCHOLARSHIP_THRESHOLD
      ? 'high'
      : total >= SCHOLARSHIP_THRESHOLD
        ? 'standard'
        : null;

  const baseOutcome: AcademicOutcome = {
    total,
    letterInfo,
    gradePoints,
    isPassed: total > PASSING_THRESHOLD,
    isFx: false,
    isRetakeRequired: false,
    scholarshipTier,
    statusText: total > PASSING_THRESHOLD ? 'Passed the course (> 50).' : 'Course is not passed.',
    statusTone: total > PASSING_THRESHOLD ? 'ok' : 'warn',
  };

  if (hasWeightMismatch) {
    return {
      ...baseOutcome,
      statusText: 'Weight sum must equal 100% for reliable final result.',
      statusTone: 'warn',
    };
  }

  if (scholarshipTier === 'high') {
    return {
      ...baseOutcome,
      statusText: 'Passed. Eligible for high scholarship (≥ 90).',
    };
  }

  if (scholarshipTier === 'standard') {
    return {
      ...baseOutcome,
      statusText: 'Passed. Eligible for scholarship (≥ 70).',
    };
  }

  return baseOutcome;
}

export function getCourseOutcomeFromExamInputs(input: {
  regTerm: number | null;
  regMid: number | null;
  finalScore: number | null;
  total: number | null;
}): CourseExamOutcome {
  const { regTerm, regMid, finalScore, total } = input;
  const baseOutcome = getAcademicOutcomeFromTotal(total);

  if (regTerm === null) {
    return {
      ...baseOutcome,
      regTerm,
      finalScore,
      statusText: 'Set RegTerm directly or enter valid RegMid and RegEnd.',
      statusTone: 'warn',
    };
  }

  if (finalScore === null) {
    return {
      ...baseOutcome,
      regTerm,
      finalScore,
      statusText: 'Enter a final score to see your result.',
      statusTone: 'warn',
    };
  }

  if (!isPercentage(finalScore)) {
    return {
      ...baseOutcome,
      regTerm,
      finalScore,
      statusText: 'Final score must be between 0 and 100.',
      statusTone: 'warn',
    };
  }

  if (total === null) {
    return {
      ...baseOutcome,
      regTerm,
      finalScore,
      statusText: '-',
      statusTone: 'warn',
    };
  }

  if (regMid !== null && regMid < RETAKE_THRESHOLD && regTerm < RETAKE_THRESHOLD) {
    return {
      ...baseOutcome,
      regTerm,
      finalScore,
      isPassed: false,
      isRetakeRequired: true,
      isFx: false,
      scholarshipTier: null,
      statusText: 'Course retake required: RegMid < 25 and RegTerm < 25.',
      statusTone: 'warn',
    };
  }

  if (finalScore <= FX_MIN_EXCLUSIVE) {
    return {
      ...baseOutcome,
      regTerm,
      finalScore,
      isPassed: false,
      isRetakeRequired: false,
      isFx: false,
      scholarshipTier: null,
      statusText: 'Not passed: Final is 25 or below.',
      statusTone: 'warn',
    };
  }

  if (finalScore > FX_MIN_EXCLUSIVE && finalScore < FX_MAX_EXCLUSIVE) {
    return {
      ...baseOutcome,
      regTerm,
      finalScore,
      isPassed: false,
      isRetakeRequired: false,
      isFx: true,
      scholarshipTier: null,
      statusText: 'FX status: Final is between 25 and 50 (paid retake exam).',
      statusTone: 'warn',
    };
  }

  return {
    ...baseOutcome,
    regTerm,
    finalScore,
  };
}

export function createGpaCourse(id: number): GpaCourse {
  return {
    id,
    name: '',
    credits: '',
    total: '',
  };
}

export function calculateGpaSummary(
  courses: Array<{ credits: number | string; total: number | string }>,
): GpaSummary {
  let sumPoints = 0;
  let sumCredits = 0;
  let gradedCourses = 0;
  let skippedCourses = 0;

  for (const course of courses) {
    const creditsValue =
      typeof course.credits === 'number' ? course.credits : parseInputValue(String(course.credits));
    const totalValue =
      typeof course.total === 'number' ? course.total : parseInputValue(String(course.total));

    if (creditsValue === null || creditsValue <= 0 || !isPercentage(totalValue)) {
      skippedCourses++;
      continue;
    }

    sumPoints += creditsValue * totalToGradePoints(totalValue);
    sumCredits += creditsValue;
    gradedCourses++;
  }

  return {
    totalCredits: sumCredits,
    gpa: sumCredits === 0 ? 0 : sumPoints / sumCredits,
    gradedCourses,
    skippedCourses,
  };
}

function createEntityId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createSyllabusItem(title: string, maxPoints = 25): SyllabusItem {
  return {
    id: createEntityId('item'),
    title,
    maxPoints: String(maxPoints),
    score: '',
  };
}

export function detectSyllabusSectionKind(sectionTitle: string): SyllabusSectionKind {
  const normalized = sectionTitle.trim().toLowerCase();
  if (normalized.includes('attest')) return 'attestation';
  if (normalized.includes('final') || normalized.includes('exam')) return 'final';
  return 'regular';
}

function toSectionKind(value: SyllabusSectionKind | string): SyllabusSectionKind {
  if (value === 'attestation' || value === 'final' || value === 'regular') {
    return value;
  }

  return detectSyllabusSectionKind(value);
}

export function isAttestationSection(value: SyllabusSectionKind | string): boolean {
  return toSectionKind(value) === 'attestation';
}

export function isFinalExamSection(value: SyllabusSectionKind | string): boolean {
  return toSectionKind(value) === 'final';
}

export function createSyllabusSection(
  title: string,
  weight: string,
  items: SyllabusSectionPresetItem[],
  kind: SyllabusSectionKind = detectSyllabusSectionKind(title),
): SyllabusSection {
  return {
    id: createEntityId('section'),
    kind,
    title,
    weight,
    items: items.map((item) => createSyllabusItem(item.title, item.maxPoints)),
  };
}

export const DEFAULT_SYLLABUS_SECTION_PRESETS: SyllabusSectionPreset[] = [
  {
    kind: 'attestation',
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
    kind: 'attestation',
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
    kind: 'final',
    title: 'Final Exam',
    weight: '40',
    items: [{ title: 'MCQ', maxPoints: 100 }],
  },
];

export function createSyllabusCourse(id: number, title?: string, credits = ''): SyllabusCourse {
  return {
    id,
    title: title ?? `Course ${id}`,
    credits,
    sections: DEFAULT_SYLLABUS_SECTION_PRESETS.map((preset) =>
      createSyllabusSection(preset.title, preset.weight, preset.items, preset.kind),
    ),
  };
}

export function usesStandardAttestationStructure(course: SyllabusCourse): boolean {
  const attestations = course.sections.filter((section) => section.kind === 'attestation');
  const finals = course.sections.filter((section) => section.kind === 'final');
  const regularWithWeight = course.sections.filter((section) => {
    if (section.kind !== 'regular') return false;
    const weight = parseWeight(section.weight);
    return weight !== null && weight > 0;
  });

  if (attestations.length !== 2 || finals.length !== 1 || regularWithWeight.length > 0) {
    return false;
  }

  const attestationWeights = attestations
    .map((section) => parseWeight(section.weight))
    .filter((weight): weight is number => weight !== null)
    .sort((a, b) => a - b);
  const finalWeight = parseWeight(finals[0].weight);
  const totalWeight = course.sections.reduce((sum, section) => sum + (parseWeight(section.weight) ?? 0), 0);

  return (
    attestationWeights.length === 2 &&
    approxEqual(attestationWeights[0], STANDARD_ATT1_WEIGHT) &&
    approxEqual(attestationWeights[1], STANDARD_ATT2_WEIGHT) &&
    finalWeight !== null &&
    approxEqual(finalWeight, STANDARD_FINAL_WEIGHT) &&
    approxEqual(totalWeight, 100)
  );
}

export function getSyllabusItemInputConfig(sectionKind: SyllabusSectionKind | string, _itemMaxPoints?: number): {
  min: number;
  max: number;
  step: number;
  placeholder: string;
} {
  const kind = toSectionKind(sectionKind);

  if (kind === 'attestation') {
    return {
      min: 0,
      max: 100,
      step: 0.1,
      placeholder: 'Grade % (0-100)',
    };
  }

  return {
    min: 0,
    max: 100,
    step: 0.1,
    placeholder: 'Score (0-100)',
  };
}

export function getSyllabusSectionMetricLabel(sectionKind: SyllabusSectionKind | string): 'Total' | 'Avg' {
  return toSectionKind(sectionKind) === 'attestation' ? 'Total' : 'Avg';
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

    const isAttestation = section.kind === 'attestation';
    let gradedCount = 0;
    let rawSum = 0;
    let maxPointsSum = 0;

    for (const item of section.items) {
      const itemMax = parseInputValue(item.maxPoints);
      if (isAttestation && itemMax !== null && itemMax > 0) {
        maxPointsSum += itemMax;
      }

      const scoreValue = parseInputValue(item.score);
      if (scoreValue === null) continue;

      if (isAttestation) {
        const maxPoints = itemMax !== null && itemMax > 0 ? itemMax : 25;
        if (scoreValue >= 0) {
          rawSum += maxPoints * (Math.min(scoreValue, 100) / 100);
          gradedCount++;
        }
      } else if (isPercentage(scoreValue)) {
        rawSum += scoreValue;
        gradedCount++;
      }
    }

    if (isAttestation && maxPointsSum === 0) {
      maxPointsSum = section.items.length * 25;
    }

    const maxPointsMismatch = isAttestation && !approxEqual(maxPointsSum, ATTESTATION_SECTION_MAX);
    const score = isAttestation ? rawSum : gradedCount > 0 ? rawSum / gradedCount : 0;
    const normalizedScore = isAttestation && maxPointsSum > 0 ? (rawSum / maxPointsSum) * 100 : score;
    const overflowAmount = isAttestation ? Math.max(0, rawSum - maxPointsSum) : 0;

    if (overflowAmount > 0) {
      hasAttestationOverflow = true;
    }

    const contribution = Math.min(normalizedScore, 100) * (weight / 100);
    weightedTotal += contribution;

    return {
      sectionId: section.id,
      kind: section.kind,
      score,
      normalizedScore,
      weight,
      contribution,
      gradedItems: gradedCount,
      totalItems: section.items.length,
      maxPointsSum,
      maxPointsMismatch,
      overflowAmount,
    };
  });

  const usesAttestation = usesStandardAttestationStructure(course);
  let formulaBreakdown: AttestationFormulaBreakdown | null = null;

  if (usesAttestation) {
    const attResults = sectionResults.filter((result) => result.kind === 'attestation');
    const finalResults = sectionResults.filter((result) => result.kind === 'final');

    if (attResults.length === 2 && finalResults.length === 1) {
      formulaBreakdown = {
        att1Score: Math.min(attResults[0].normalizedScore, 100),
        att1Weight: attResults[0].weight,
        att2Score: Math.min(attResults[1].normalizedScore, 100),
        att2Weight: attResults[1].weight,
        finalScore: finalResults[0].normalizedScore,
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

export function canSyncSyllabusCourseToGpa(course: SyllabusCourse, result: SyllabusCourseResult): boolean {
  const credits = parseInputValue(course.credits);
  const hasAnyGradedItems = result.sectionResults.some((section) => section.gradedItems > 0);

  return (
    credits !== null &&
    credits > 0 &&
    hasAnyGradedItems &&
    !result.hasInvalidWeights &&
    approxEqual(result.totalWeight, 100) &&
    isPercentage(result.weightedTotal)
  );
}

export function buildSyllabusLinkedGpaCourses(courses: SyllabusCourse[]): SyllabusLinkedGpaCourse[] {
  return courses.flatMap((course) => {
    const result = calculateSyllabusCourseResult(course);
    if (!canSyncSyllabusCourseToGpa(course, result)) {
      return [];
    }

    return [{
      source: 'syllabus' as const,
      syllabusCourseId: course.id,
      name: course.title.trim() || `Course ${course.id}`,
      credits: parseInputValue(course.credits) ?? 0,
      total: Number(formatScore(result.weightedTotal)),
    }];
  });
}
