const tabButtons = document.querySelectorAll('.tab-btn');
const panels = document.querySelectorAll('.panel');

for (const tabButton of tabButtons) {
  tabButton.addEventListener('click', () => {
    const { tab } = tabButton.dataset;

    tabButtons.forEach((button) => button.classList.remove('active'));
    panels.forEach((panel) => panel.classList.remove('active'));

    tabButton.classList.add('active');
    document.getElementById(tab).classList.add('active');
  });
}

const COURSE_TERM_WEIGHT = 0.6;
const COURSE_FINAL_WEIGHT = 0.4;
const PASSING_THRESHOLD = 50;
const SCHOLARSHIP_THRESHOLD = 70;
const HIGH_SCHOLARSHIP_THRESHOLD = 90;
const FX_MIN_EXCLUSIVE = 25;
const FX_MAX_EXCLUSIVE = 50;
const RETAKE_THRESHOLD = 25;

const regMidInput = document.getElementById('reg-mid');
const regEndInput = document.getElementById('reg-end');
const regTermInput = document.getElementById('reg-term');
const finalScoreInput = document.getElementById('final-score');
const calcCourseGradeBtn = document.getElementById('calc-course-grade');
const resetCourseGradeBtn = document.getElementById('reset-course-grade');
const courseErrorEl = document.getElementById('course-error');
const regtermResultEl = document.getElementById('regterm-result');
const totalResultEl = document.getElementById('total-result');
const statusResultEl = document.getElementById('status-result');
const needPassEl = document.getElementById('need-pass');
const needScholarEl = document.getElementById('need-scholar');
const needHighScholarEl = document.getElementById('need-high-scholar');

const requiredThresholdTargets = [
  { target: PASSING_THRESHOLD, element: needPassEl },
  { target: SCHOLARSHIP_THRESHOLD, element: needScholarEl },
  { target: HIGH_SCHOLARSHIP_THRESHOLD, element: needHighScholarEl },
];

function parseInputValue(input) {
  const raw = input.value.trim();
  if (raw === '') {
    return null;
  }
  const numeric = Number(raw);
  return Number.isFinite(numeric) ? numeric : null;
}

function isScoreInRange(score) {
  return Number.isFinite(score) && score >= 0 && score <= 100;
}

function formatScore(score, digits = 2) {
  return score.toFixed(digits);
}

function calculateRegTerm(regMid, regEnd) {
  return (regMid + regEnd) / 2;
}

function calculateCourseTotal(regTerm, finalScore) {
  return COURSE_TERM_WEIGHT * regTerm + COURSE_FINAL_WEIGHT * finalScore;
}

function getRequiredFinalForTarget(regTerm, targetScore) {
  const finalByTotalFormula = (targetScore - COURSE_TERM_WEIGHT * regTerm) / COURSE_FINAL_WEIGHT;
  const fxSafeMinimum = FX_MAX_EXCLUSIVE;
  const requiredFinal = Math.max(finalByTotalFormula, fxSafeMinimum);

  if (requiredFinal > 100) {
    return 'Not achievable (>100)';
  }

  if (requiredFinal === fxSafeMinimum && finalByTotalFormula <= fxSafeMinimum) {
    return `${formatScore(fxSafeMinimum, 1)} (FX-safe minimum)`;
  }

  return formatScore(requiredFinal, 1);
}

function renderRequiredThresholds(regTerm) {
  for (const thresholdTarget of requiredThresholdTargets) {
    thresholdTarget.element.textContent = getRequiredFinalForTarget(regTerm, thresholdTarget.target);
  }
}

function setCourseStatus(text, tone) {
  statusResultEl.textContent = text;
  statusResultEl.className = tone === 'ok' ? 'status-ok' : 'status-warn';
}

function clearCourseError() {
  courseErrorEl.textContent = '';
}

function updateRegTermPreview() {
  clearCourseError();

  const regMid = parseInputValue(regMidInput);
  const regEnd = parseInputValue(regEndInput);

  if (!isScoreInRange(regMid) || !isScoreInRange(regEnd)) {
    regTermInput.value = '';
    regtermResultEl.textContent = '0.00';
    totalResultEl.textContent = '-';
    needPassEl.textContent = '-';
    needScholarEl.textContent = '-';
    needHighScholarEl.textContent = '-';
    return null;
  }

  const regTerm = calculateRegTerm(regMid, regEnd);
  const formattedRegTerm = formatScore(regTerm);
  regTermInput.value = formattedRegTerm;
  regtermResultEl.textContent = formattedRegTerm;
  renderRequiredThresholds(regTerm);
  return { regMid, regEnd, regTerm };
}

function handleCourseCalculation() {
  const baseScores = updateRegTermPreview();

  if (!baseScores) {
    courseErrorEl.textContent = 'Enter valid RegMid and RegEnd scores between 0 and 100.';
    setCourseStatus('Invalid input. Check RegMid and RegEnd.', 'warn');
    return;
  }

  const { regMid, regTerm } = baseScores;
  const finalScore = parseInputValue(finalScoreInput);

  if (finalScore === null) {
    totalResultEl.textContent = '-';
    setCourseStatus('Final score is empty. Forecast shown below.', 'warn');
    return;
  }

  if (!isScoreInRange(finalScore)) {
    courseErrorEl.textContent = 'Final score must be between 0 and 100.';
    totalResultEl.textContent = '-';
    setCourseStatus('Invalid final score.', 'warn');
    return;
  }

  const total = calculateCourseTotal(regTerm, finalScore);
  totalResultEl.textContent = formatScore(total);

  if (regMid < RETAKE_THRESHOLD && regTerm < RETAKE_THRESHOLD) {
    setCourseStatus('Course retake required: RegMid < 25 and RegTerm < 25.', 'warn');
    return;
  }

  if (finalScore <= FX_MIN_EXCLUSIVE) {
    setCourseStatus('Not passed: Final is 25 or below.', 'warn');
    return;
  }

  if (finalScore > FX_MIN_EXCLUSIVE && finalScore < FX_MAX_EXCLUSIVE) {
    setCourseStatus('FX status: Final is between 25 and 50 (paid retake exam).', 'warn');
    return;
  }

  if (total < PASSING_THRESHOLD) {
    setCourseStatus('Not passed: total score is below 50.', 'warn');
    return;
  }

  if (total >= HIGH_SCHOLARSHIP_THRESHOLD) {
    setCourseStatus('Passed. Eligible for high scholarship (total >= 90).', 'ok');
    return;
  }

  if (total >= SCHOLARSHIP_THRESHOLD) {
    setCourseStatus('Passed. Eligible for scholarship (total >= 70).', 'ok');
    return;
  }

  if (total >= PASSING_THRESHOLD) {
    setCourseStatus('Passed the course (total >= 50).', 'ok');
    return;
  }
}

function resetCourseCalculator() {
  regMidInput.value = '';
  regEndInput.value = '';
  regTermInput.value = '';
  finalScoreInput.value = '';
  regtermResultEl.textContent = '0.00';
  totalResultEl.textContent = '-';
  needPassEl.textContent = '-';
  needScholarEl.textContent = '-';
  needHighScholarEl.textContent = '-';
  clearCourseError();
  setCourseStatus('Enter scores and press Calculate.', 'warn');
}

regMidInput.addEventListener('input', updateRegTermPreview);
regEndInput.addEventListener('input', updateRegTermPreview);
calcCourseGradeBtn.addEventListener('click', handleCourseCalculation);
resetCourseGradeBtn.addEventListener('click', resetCourseCalculator);

const expressionInput = document.getElementById('expression');
const resultEl = document.getElementById('result');
const calcErrorEl = document.getElementById('calc-error');
const angleModeBtn = document.getElementById('angle-mode');
const clearBtn = document.getElementById('clear');
const deleteBtn = document.getElementById('delete');
const evaluateBtn = document.getElementById('evaluate');
const keyButtons = document.querySelectorAll('.key[data-insert]');

let angleMode = 'DEG';

for (const keyButton of keyButtons) {
  keyButton.addEventListener('click', () => {
    insertText(keyButton.dataset.insert);
  });
}

expressionInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    calculateExpression();
  }
});

angleModeBtn.addEventListener('click', () => {
  angleMode = angleMode === 'DEG' ? 'RAD' : 'DEG';
  angleModeBtn.textContent = `Mode: ${angleMode}`;
});

clearBtn.addEventListener('click', () => {
  expressionInput.value = '';
  resultEl.textContent = '0';
  calcErrorEl.textContent = '';
});

deleteBtn.addEventListener('click', () => {
  expressionInput.value = expressionInput.value.slice(0, -1);
});

evaluateBtn.addEventListener('click', calculateExpression);

function insertText(text) {
  expressionInput.value += text;
  expressionInput.focus();
}

function calculateExpression() {
  calcErrorEl.textContent = '';

  try {
    const value = evaluateMathExpression(expressionInput.value, angleMode);
    resultEl.textContent = formatNumber(value);
  } catch (error) {
    calcErrorEl.textContent = error.message;
  }
}

function formatNumber(value) {
  if (!Number.isFinite(value)) {
    throw new Error('Result is not a finite number.');
  }

  const rounded = Math.round((value + Number.EPSILON) * 1e10) / 1e10;
  return String(rounded);
}

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function factorial(value) {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error('Factorial only supports non-negative integers.');
  }

  if (value > 170) {
    throw new Error('Factorial is too large to compute safely.');
  }

  let output = 1;
  for (let i = 2; i <= value; i += 1) {
    output *= i;
  }
  return output;
}

function evaluateMathExpression(rawExpression, mode) {
  if (!rawExpression.trim()) {
    throw new Error('Enter an expression first.');
  }

  let expr = rawExpression.toLowerCase().replace(/\s+/g, '');

  const basicCheck = /^[0-9+\-*/().,%!^a-z]+$/.test(expr);
  if (!basicCheck) {
    throw new Error('Expression contains unsupported characters.');
  }

  expr = expr.replace(/π/g, 'pi');
  expr = expr.replace(/\^/g, '**');

  const allowedTokens = ['sin', 'cos', 'tan', 'log', 'ln', 'sqrt', 'abs', 'pi', 'e'];
  const tokenPattern = /sin|cos|tan|log|ln|sqrt|abs|pi|e/g;
  const stripped = expr.replace(tokenPattern, '');

  if (/[a-df-z]/.test(stripped)) {
    throw new Error('Unknown function or token in expression.');
  }

  expr = expr.replace(/pi/g, 'PI_CONST');
  expr = expr.replace(/\be\b/g, 'E_CONST');

  expr = replaceFactorials(expr);
  expr = expr.replace(/(\d+(?:\.\d+)?)%/g, '($1/100)');

  const sin = (x) => Math.sin(mode === 'DEG' ? toRadians(x) : x);
  const cos = (x) => Math.cos(mode === 'DEG' ? toRadians(x) : x);
  const tan = (x) => Math.tan(mode === 'DEG' ? toRadians(x) : x);
  const log = (x) => Math.log10(x);
  const ln = (x) => Math.log(x);
  const sqrt = (x) => Math.sqrt(x);
  const abs = (x) => Math.abs(x);

  const evaluator = new Function(
    'sin',
    'cos',
    'tan',
    'log',
    'ln',
    'sqrt',
    'abs',
    'fact',
    'PI_CONST',
    'E_CONST',
    `return (${expr});`
  );

  const output = evaluator(sin, cos, tan, log, ln, sqrt, abs, factorial, Math.PI, Math.E);

  if (!Number.isFinite(output)) {
    throw new Error('Expression produced an invalid result.');
  }

  return output;
}

function replaceFactorials(expression) {
  let expr = expression;
  const pattern = /(\([^()]*\)|\d+(?:\.\d+)?)!/;

  while (pattern.test(expr)) {
    expr = expr.replace(pattern, 'fact($1)');
  }

  if (expr.includes('!')) {
    throw new Error('Unsupported factorial placement.');
  }

  return expr;
}

const courseList = document.getElementById('course-list');
const courseRowTemplate = document.getElementById('course-row-template');
const addCourseBtn = document.getElementById('add-course');
const calcGpaBtn = document.getElementById('calc-gpa');
const totalCreditsEl = document.getElementById('total-credits');
const gpaResultEl = document.getElementById('gpa-result');

function addCourseRow() {
  const fragment = courseRowTemplate.content.cloneNode(true);
  const row = fragment.querySelector('.course-row');

  row.querySelector('.remove-course').addEventListener('click', () => {
    row.remove();
  });

  courseList.appendChild(fragment);
}

addCourseBtn.addEventListener('click', addCourseRow);

calcGpaBtn.addEventListener('click', () => {
  const rows = Array.from(document.querySelectorAll('.course-row'));

  let totalPoints = 0;
  let totalCredits = 0;

  for (const row of rows) {
    const credits = Number(row.querySelector('.course-credits').value);
    const grade = Number(row.querySelector('.course-grade').value);

    if (!Number.isFinite(credits) || credits <= 0) {
      continue;
    }

    totalPoints += credits * grade;
    totalCredits += credits;
  }

  if (totalCredits === 0) {
    totalCreditsEl.textContent = '0';
    gpaResultEl.textContent = '0.00';
    return;
  }

  totalCreditsEl.textContent = String(Math.round(totalCredits * 100) / 100);
  gpaResultEl.textContent = (totalPoints / totalCredits).toFixed(2);
});

addCourseRow();
addCourseRow();

const currentGradeInput = document.getElementById('current-grade');
const desiredGradeInput = document.getElementById('desired-grade');
const finalWeightInput = document.getElementById('final-weight');
const calcTargetBtn = document.getElementById('calc-target');
const targetResultEl = document.getElementById('target-result');

calcTargetBtn.addEventListener('click', () => {
  const currentGrade = Number(currentGradeInput.value);
  const desiredGrade = Number(desiredGradeInput.value);
  const finalWeightPercent = Number(finalWeightInput.value);

  const valid =
    Number.isFinite(currentGrade) &&
    Number.isFinite(desiredGrade) &&
    Number.isFinite(finalWeightPercent) &&
    currentGrade >= 0 &&
    currentGrade <= 100 &&
    desiredGrade >= 0 &&
    desiredGrade <= 100 &&
    finalWeightPercent > 0 &&
    finalWeightPercent <= 100;

  if (!valid) {
    targetResultEl.textContent = 'Please enter valid percentages.';
    targetResultEl.className = 'result-message warn';
    return;
  }

  const finalWeight = finalWeightPercent / 100;
  const neededScore = (desiredGrade - currentGrade * (1 - finalWeight)) / finalWeight;

  if (neededScore <= 0) {
    targetResultEl.textContent =
      `You already meet your target. Even 0% on the final keeps about ${desiredGrade.toFixed(1)}%.`;
    targetResultEl.className = 'result-message ok';
    return;
  }

  if (neededScore > 100) {
    targetResultEl.textContent =
      `You would need ${neededScore.toFixed(1)}% on the final. This target may not be achievable.`;
    targetResultEl.className = 'result-message warn';
    return;
  }

  targetResultEl.textContent = `You need ${neededScore.toFixed(1)}% on the final exam.`;
  targetResultEl.className = 'result-message ok';
});
