'use client';

import PageLayout from '../components/PageLayout';
import {
  getRequiredFinalForPassingDetails,
  getRequiredFinalForTargetDetails,
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

  const requiredPass = regTermValid ? getRequiredFinalForPassingDetails(regTermNumber) : null;
  const requiredScholar = regTermValid ? getRequiredFinalForTargetDetails(regTermNumber, SCHOLARSHIP_THRESHOLD) : null;
  const requiredUpperScholar = regTermValid
    ? getRequiredFinalForTargetDetails(regTermNumber, HIGH_SCHOLARSHIP_THRESHOLD)
    : null;

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
          <p>Pass (&gt; 50): <strong>{requiredPass ? requiredPass.displayValue : '-'}</strong></p>
          <p>Scholarship (&gt;= 70): <strong>{requiredScholar ? requiredScholar.displayValue : '-'}</strong></p>
          <p>Upper Scholarship (повышенная стипендия, &gt;= 90): <strong>{requiredUpperScholar ? requiredUpperScholar.displayValue : '-'}</strong></p>
        </div>
      )}
    </PageLayout>
  );
}
