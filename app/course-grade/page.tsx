'use client';

import { useMemo, useState, type ChangeEvent } from 'react';
import PageLayout from '../components/PageLayout';
import {
  calculateCourseTotal,
  calculateRegTerm,
  formatScore,
  FX_MAX_EXCLUSIVE,
  FX_MIN_EXCLUSIVE,
  getLetterGradeInfo,
  getRequiredFinalForTarget,
  HIGH_SCHOLARSHIP_THRESHOLD,
  isPercentage,
  parseInputValue,
  PASSING_THRESHOLD,
  RETAKE_THRESHOLD,
  SCHOLARSHIP_THRESHOLD,
  type StatusTone,
} from '../lib/academic';

type StatusState = {
  text: string;
  tone: StatusTone;
};

function deriveStatus(
  regTerm: number | null,
  regMidNumber: number | null,
  finalScoreNumber: number | null,
  total: number | null,
): StatusState {
  if (regTerm === null) {
    return { text: 'Set RegTerm directly or enter valid RegMid and RegEnd.', tone: 'warn' };
  }
  if (finalScoreNumber === null) {
    return { text: 'Enter a final score to see your result.', tone: 'warn' };
  }
  if (!isPercentage(finalScoreNumber)) {
    return { text: 'Final score must be between 0 and 100.', tone: 'warn' };
  }
  if (total === null) return { text: '-', tone: 'warn' };

  if (regMidNumber !== null && regMidNumber < RETAKE_THRESHOLD && regTerm < RETAKE_THRESHOLD) {
    return { text: 'Course retake required: RegMid < 25 and RegTerm < 25.', tone: 'warn' };
  }
  if (finalScoreNumber <= FX_MIN_EXCLUSIVE) {
    return { text: 'Not passed: Final is 25 or below.', tone: 'warn' };
  }
  if (finalScoreNumber > FX_MIN_EXCLUSIVE && finalScoreNumber < FX_MAX_EXCLUSIVE) {
    return { text: 'FX status: Final is between 25 and 50 (paid retake exam).', tone: 'warn' };
  }
  if (total < PASSING_THRESHOLD) {
    return { text: 'Not passed: total score is below 50.', tone: 'warn' };
  }
  if (total >= HIGH_SCHOLARSHIP_THRESHOLD) {
    return { text: 'Passed. Eligible for high scholarship (≥ 90).', tone: 'ok' };
  }
  if (total >= SCHOLARSHIP_THRESHOLD) {
    return { text: 'Passed. Eligible for scholarship (≥ 70).', tone: 'ok' };
  }
  return { text: 'Passed the course (≥ 50).', tone: 'ok' };
}

export default function CourseGradePage() {
  const [regMid, setRegMid] = useState('');
  const [regEnd, setRegEnd] = useState('');
  const [regTermInput, setRegTermInput] = useState('');
  const [finalScore, setFinalScore] = useState('');
  const [manualTotal, setManualTotal] = useState('');

  const regMidNumber = parseInputValue(regMid);
  const regEndNumber = parseInputValue(regEnd);
  const regTermManualNumber = parseInputValue(regTermInput);
  const regTermFromFormula =
    isPercentage(regMidNumber) && isPercentage(regEndNumber)
      ? calculateRegTerm(regMidNumber, regEndNumber)
      : null;
  const regTerm = isPercentage(regTermManualNumber) ? regTermManualNumber : regTermFromFormula;
  const regTermInputError = regTermInput.trim() !== '' && !isPercentage(regTermManualNumber);

  const requiredPass = regTerm === null ? '-' : getRequiredFinalForTarget(regTerm, PASSING_THRESHOLD);
  const requiredScholar = regTerm === null ? '-' : getRequiredFinalForTarget(regTerm, SCHOLARSHIP_THRESHOLD);
  const requiredHighScholar =
    regTerm === null ? '-' : getRequiredFinalForTarget(regTerm, HIGH_SCHOLARSHIP_THRESHOLD);

  const finalScoreNumber = parseInputValue(finalScore);
  const manualTotalNumber = parseInputValue(manualTotal);
  const hasManualTotalInput = manualTotal.trim() !== '';

  const computedTotal = useMemo(() => {
    if (regTerm !== null && isPercentage(finalScoreNumber)) {
      return calculateCourseTotal(regTerm, finalScoreNumber);
    }
    return null;
  }, [regTerm, finalScoreNumber]);

  const effectiveTotalForLetter = hasManualTotalInput
    ? isPercentage(manualTotalNumber) ? manualTotalNumber : null
    : computedTotal;

  const letterGradeInputError = hasManualTotalInput && !isPercentage(manualTotalNumber);
  const letterGradeInfo = getLetterGradeInfo(effectiveTotalForLetter);
  const activeTotalSource = hasManualTotalInput ? 'Manual total' : 'Calculated total';

  const courseStatus = useMemo(
    () => deriveStatus(regTerm, regMidNumber, finalScoreNumber, computedTotal),
    [regTerm, regMidNumber, finalScoreNumber, computedTotal],
  );

  function handleFieldChange(setter: (value: string) => void) {
    return (event: ChangeEvent<HTMLInputElement>) => setter(event.target.value);
  }

  function handleReset() {
    setRegMid('');
    setRegEnd('');
    setRegTermInput('');
    setFinalScore('');
    setManualTotal('');
  }

  return (
    <PageLayout title="Course Grade" description="Calculate your course result using midterm, endterm, and final scores.">
      <div className="split-layout">
        <article className="card">
          <h2>Input</h2>
          <div className="field-grid field-grid-2">
            <label>
              RegMid (0-100)
              <input type="number" min="0" max="100" step="0.1" value={regMid} onChange={handleFieldChange(setRegMid)} />
            </label>
            <label>
              RegEnd (0-100)
              <input type="number" min="0" max="100" step="0.1" value={regEnd} onChange={handleFieldChange(setRegEnd)} />
            </label>
            <label>
              RegTerm (0-100)
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                placeholder={
                  regTermFromFormula === null ? 'Type or use RegMid/RegEnd' : `Auto: ${formatScore(regTermFromFormula)}`
                }
                value={regTermInput}
                onChange={handleFieldChange(setRegTermInput)}
              />
            </label>
            <label>
              Final (0-100)
              <input type="number" min="0" max="100" step="0.1" value={finalScore} onChange={handleFieldChange(setFinalScore)} />
            </label>
            <label>
              Total (0-100)
              <input type="number" min="0" max="100" step="0.1" value={manualTotal} onChange={handleFieldChange(setManualTotal)} placeholder="Override calculated total" />
            </label>
          </div>

          <p className="error-text">{letterGradeInputError ? 'Total must be between 0 and 100.' : ''}</p>
          <p className="error-text">{regTermInputError ? 'RegTerm must be between 0 and 100.' : ''}</p>

          <div className="actions">
            <button className="btn btn-muted" type="button" onClick={handleReset}>
              Reset
            </button>
          </div>
        </article>

        <article className="card">
          <h2>Results</h2>

          <div className="stats-grid">
            <div className="stat">
              <span>RegTerm</span>
              <strong>{regTerm === null ? '-' : formatScore(regTerm)}</strong>
            </div>
            <div className="stat">
              <span>Computed Total</span>
              <strong>{computedTotal === null ? '-' : formatScore(computedTotal)}</strong>
            </div>
            <div className="stat">
              <span>{activeTotalSource}</span>
              <strong>{effectiveTotalForLetter === null ? '-' : formatScore(effectiveTotalForLetter)}</strong>
            </div>
            <div className="stat stat-highlight">
              <span>Letter Grade</span>
              <strong>{letterGradeInfo ? letterGradeInfo.letter : '-'}</strong>
            </div>
          </div>

          <div className="info-box">
            <p>
              Numeric Equivalent: <strong>{letterGradeInfo ? letterGradeInfo.numeric : '-'}</strong>
            </p>
            <p>
              Traditional Grade: <strong>{letterGradeInfo ? letterGradeInfo.traditional : '-'}</strong>
            </p>
            <p>
              Status:{' '}
              <strong className={courseStatus.tone === 'ok' ? 'status-ok' : 'status-warn'}>{courseStatus.text}</strong>
            </p>
          </div>

          <div className="hint-box">
            <p className="hint-title">Required final forecast</p>
            <p>Pass (≥ 50): {requiredPass}</p>
            <p>Scholarship (≥ 70): {requiredScholar}</p>
            <p>High Scholarship (≥ 90): {requiredHighScholar}</p>
          </div>
        </article>
      </div>
    </PageLayout>
  );
}
