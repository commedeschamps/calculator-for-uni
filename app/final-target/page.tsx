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
    <PageLayout title="Final Target">
      <section className="card section-block">
        <div className="section-head">
          <div>
            <h2>Summary</h2>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat">
            <span>RegTerm</span>
            <strong>{regTermValid ? regTerm : '-'}</strong>
          </div>
          <div className="stat">
            <span>Pass</span>
            <strong>{requiredPass ? requiredPass.displayValue : '-'}</strong>
          </div>
          <div className="stat">
            <span>Scholarship</span>
            <strong>{requiredScholar ? requiredScholar.displayValue : '-'}</strong>
          </div>
          <div className="stat">
            <span>High</span>
            <strong>{requiredUpperScholar ? requiredUpperScholar.displayValue : '-'}</strong>
          </div>
        </div>
      </section>

      <section className="card section-block">
          <div className="section-head">
            <div>
              <h2>Input</h2>
            </div>
          </div>

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
      </section>

      {!regTermValid ? (
        <p className="message">Enter a valid RegTerm to view the required final scores.</p>
      ) : (
        <section className="forecast-grid">
          <article className="card forecast-card">
            <div className="forecast-card__top">
              <span className="forecast-card__label">Pass</span>
              <span className="forecast-card__threshold">&gt; 50</span>
            </div>
            <div className="forecast-card__value">{requiredPass ? requiredPass.displayValue : '-'}</div>
          </article>

          <article className="card forecast-card">
            <div className="forecast-card__top">
              <span className="forecast-card__label">Scholarship</span>
              <span className="forecast-card__threshold">≥ 70</span>
            </div>
            <div className="forecast-card__value">{requiredScholar ? requiredScholar.displayValue : '-'}</div>
          </article>

          <article className="card forecast-card">
            <div className="forecast-card__top">
              <span className="forecast-card__label">High Scholarship</span>
              <span className="forecast-card__threshold">≥ 90</span>
            </div>
            <div className="forecast-card__value">{requiredUpperScholar ? requiredUpperScholar.displayValue : '-'}</div>
          </article>
        </section>
      )}
    </PageLayout>
  );
}
