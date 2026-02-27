'use client';

import PageLayout from '../components/PageLayout';
import {
  getRequiredFinalForPassing,
  getRequiredFinalForTarget,
  HIGH_SCHOLARSHIP_THRESHOLD,
  isPercentage,
  parseInputValue,
  SCHOLARSHIP_THRESHOLD,
} from '../lib/academic';
import { usePersistedState } from '../lib/usePersistedState';

export default function FinalTargetPage() {
  const [regTerm, setRegTerm] = usePersistedState('ft-regterm', '');

  const regTermNumber = parseInputValue(regTerm);
  const regTermValid = isPercentage(regTermNumber);

  const requiredPass = regTermValid ? getRequiredFinalForPassing(regTermNumber) : '-';
  const requiredScholar = regTermValid ? getRequiredFinalForTarget(regTermNumber, SCHOLARSHIP_THRESHOLD) : '-';
  const requiredUpperScholar = regTermValid
    ? getRequiredFinalForTarget(regTermNumber, HIGH_SCHOLARSHIP_THRESHOLD)
    : '-';

  return (
    <PageLayout
      title="Final Target"
      description="Enter RegTerm to get required final prediction for pass, scholarship, and upper scholarship."
    >
      <div className="field-grid field-grid-2">
        <label>
          RegTerm (0-100)
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            placeholder="e.g. 75"
            value={regTerm}
            onChange={(event) => setRegTerm(event.target.value)}
          />
        </label>
      </div>

      <p className="error-text">{!regTermValid && regTerm.trim() !== '' ? 'RegTerm must be between 0 and 100.' : ''}</p>

      {!regTermValid ? (
        <p className="message">Enter a valid RegTerm to see predictions.</p>
      ) : (
        <div className="hint-box" style={{ marginTop: 16 }}>
          <p className="hint-title">Predictions</p>
          <p>Pass (&gt; 50): <strong>{requiredPass}</strong></p>
          <p>Scholarship (&gt;= 70): <strong>{requiredScholar}</strong></p>
          <p>Upper Scholarship (повышенная стипендия, &gt;= 90): <strong>{requiredUpperScholar}</strong></p>
        </div>
      )}
    </PageLayout>
  );
}
