'use client';

import { useMemo, type ChangeEvent } from 'react';
import AnimatedNumber from '../components/AnimatedNumber';
import CopyButton from '../components/CopyButton';
import PageLayout from '../components/PageLayout';
import { useToast } from '../components/ToastProvider';
import { usePersistedState } from '../lib/usePersistedState';
import {
  getAcademicOutcomeFromTotal,
  calculateCourseTotal,
  calculateRegTerm,
  formatScore,
  getCourseOutcomeFromExamInputs,
  getRequiredFinalForPassingDetails,
  getRequiredFinalForTargetDetails,
  HIGH_SCHOLARSHIP_THRESHOLD,
  isPercentage,
  parseInputValue,
  SCHOLARSHIP_THRESHOLD,
} from '../lib/academic';

export default function CourseGradePage() {
  const [regMid, setRegMid] = usePersistedState('cg-regMid', '');
  const [regEnd, setRegEnd] = usePersistedState('cg-regEnd', '');
  const [regTermInput, setRegTermInput] = usePersistedState('cg-regTerm', '');
  const [finalScore, setFinalScore] = usePersistedState('cg-final', '');
  const [manualTotal, setManualTotal] = usePersistedState('cg-total', '');

  const { showToast } = useToast();

  const regMidNumber = parseInputValue(regMid);
  const regEndNumber = parseInputValue(regEnd);
  const regTermManualNumber = parseInputValue(regTermInput);
  const regTermFromFormula =
    isPercentage(regMidNumber) && isPercentage(regEndNumber)
      ? calculateRegTerm(regMidNumber, regEndNumber)
      : null;
  const regTerm = isPercentage(regTermManualNumber) ? regTermManualNumber : regTermFromFormula;
  const regTermInputError = regTermInput.trim() !== '' && !isPercentage(regTermManualNumber);

  const requiredPass = regTerm === null ? null : getRequiredFinalForPassingDetails(regTerm);
  const requiredScholar = regTerm === null ? null : getRequiredFinalForTargetDetails(regTerm, SCHOLARSHIP_THRESHOLD);
  const requiredHighScholar =
    regTerm === null ? null : getRequiredFinalForTargetDetails(regTerm, HIGH_SCHOLARSHIP_THRESHOLD);

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
  const effectiveOutcome = useMemo(
    () => getAcademicOutcomeFromTotal(effectiveTotalForLetter),
    [effectiveTotalForLetter],
  );
  const letterGradeInfo = effectiveOutcome.letterInfo;
  const activeTotalSource = hasManualTotalInput ? 'Manual total' : 'Calculated total';

  const courseOutcome = useMemo(
    () =>
      getCourseOutcomeFromExamInputs({
        regTerm,
        regMid: regMidNumber,
        finalScore: finalScoreNumber,
        total: computedTotal,
      }),
    [regTerm, regMidNumber, finalScoreNumber, computedTotal],
  );

  const forecastCards = [
    { label: 'Pass', threshold: '> 50', details: requiredPass },
    { label: 'Scholarship', threshold: '≥ 70', details: requiredScholar },
    { label: 'High Scholarship', threshold: '≥ 90', details: requiredHighScholar },
  ];

  function handleFieldChange(setter: (value: string) => void) {
    return (event: ChangeEvent<HTMLInputElement>) => setter(event.target.value);
  }

  function handleReset() {
    const prev = { regMid, regEnd, regTermInput, finalScore, manualTotal };
    setRegMid('');
    setRegEnd('');
    setRegTermInput('');
    setFinalScore('');
    setManualTotal('');
    showToast('Fields cleared', () => {
      setRegMid(prev.regMid);
      setRegEnd(prev.regEnd);
      setRegTermInput(prev.regTermInput);
      setFinalScore(prev.finalScore);
      setManualTotal(prev.manualTotal);
    });
  }

  return (
    <PageLayout title="Course Grade">
      <section className="card section-block">
        <div className="section-head">
          <div>
            <h2>Summary</h2>
          </div>
          <button className="btn btn-muted" type="button" onClick={handleReset}>
            Reset
          </button>
        </div>

        <div className="stats-grid">
          <div className="stat">
            <span>RegTerm</span>
            <strong>{regTerm === null ? '-' : formatScore(regTerm, 1)}</strong>
          </div>
          <div className="stat">
            <span>Computed Total</span>
            <strong>{computedTotal === null ? '-' : formatScore(computedTotal, 1)}</strong>
          </div>
          <div className="stat">
            <span>Active Total</span>
            <strong>{effectiveTotalForLetter === null ? '-' : formatScore(effectiveTotalForLetter, 1)}</strong>
          </div>
          <div className="stat">
            <span>Letter</span>
            <strong>{letterGradeInfo ? letterGradeInfo.letter : '-'}</strong>
          </div>
        </div>
      </section>

      <div className="split-layout">
        <article className="card">
          <div className="section-head">
            <div>
              <h2>Inputs</h2>
            </div>
          </div>

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
        </article>

        <article className="card">
          <div className="section-head">
            <div>
              <h2>Results</h2>
            </div>
            <CopyButton
              value={[
                `RegTerm: ${regTerm === null ? '-' : formatScore(regTerm)}`,
                `Computed Total: ${computedTotal === null ? '-' : formatScore(computedTotal)}`,
                `${activeTotalSource}: ${effectiveTotalForLetter === null ? '-' : formatScore(effectiveTotalForLetter)}`,
                `Letter Grade: ${letterGradeInfo ? letterGradeInfo.letter : '-'}`,
                `Numeric: ${letterGradeInfo ? letterGradeInfo.numeric : '-'}`,
                `Traditional: ${letterGradeInfo ? letterGradeInfo.traditional : '-'}`,
                `Status: ${courseOutcome.statusText}`,
                `---`,
                `Required for Pass (>50): ${requiredPass ? requiredPass.displayValue : '-'}`,
                `Required for Scholarship (≥70): ${requiredScholar ? requiredScholar.displayValue : '-'}`,
                `Required for High Scholarship (≥90): ${requiredHighScholar ? requiredHighScholar.displayValue : '-'}`,
              ].join('\n')}
              label="Copy all results"
            />
          </div>

          <div className="stats-grid">
            <div className="stat">
              <span>RegTerm</span>
              <strong>{regTerm === null ? '-' : <AnimatedNumber value={regTerm} />}</strong>
            </div>
            <div className="stat">
              <span>Computed Total</span>
              <strong>{computedTotal === null ? '-' : <AnimatedNumber value={computedTotal} />}</strong>
            </div>
            <div className="stat">
              <span>{activeTotalSource}</span>
              <strong>{effectiveTotalForLetter === null ? '-' : <AnimatedNumber value={effectiveTotalForLetter} />}</strong>
            </div>
            <div className="stat stat-highlight stat-with-copy">
              <span>Letter Grade</span>
              <strong>{letterGradeInfo ? letterGradeInfo.letter : '-'}</strong>
              {letterGradeInfo ? <CopyButton value={letterGradeInfo.letter} label="Copy letter grade" /> : null}
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
              <strong className={courseOutcome.statusTone === 'ok' ? 'status-ok' : 'status-warn'}>{courseOutcome.statusText}</strong>
            </p>
          </div>
        </article>
      </div>

      <section className="forecast-grid">
        {forecastCards.map((card) => (
          <article key={card.label} className={`card forecast-card${card.details && !card.details.achievable ? ' forecast-card--impossible' : ''}`}>
            <div className="forecast-card__top">
              <span className="forecast-card__label">{card.label}</span>
              <span className="forecast-card__threshold">{card.threshold}</span>
            </div>
            <div className="forecast-card__value">{card.details ? card.details.displayValue : '-'}</div>
          </article>
        ))}
      </section>
    </PageLayout>
  );
}
