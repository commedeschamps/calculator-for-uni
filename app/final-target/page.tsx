'use client';

import { useMemo, useState } from 'react';
import PageLayout from '../components/PageLayout';

export default function FinalTargetPage() {
  const [currentGrade, setCurrentGrade] = useState('');
  const [desiredGrade, setDesiredGrade] = useState('');
  const [finalWeight, setFinalWeight] = useState('');

  const { text: targetResult, tone: targetTone } = useMemo(() => {
    const currentGradeNumber = Number(currentGrade);
    const desiredGradeNumber = Number(desiredGrade);
    const finalWeightNumber = Number(finalWeight);

    if (currentGrade === '' && desiredGrade === '' && finalWeight === '') {
      return { text: 'Enter values above to see your result.', tone: '' };
    }

    const valid =
      Number.isFinite(currentGradeNumber) &&
      Number.isFinite(desiredGradeNumber) &&
      Number.isFinite(finalWeightNumber) &&
      currentGradeNumber >= 0 &&
      currentGradeNumber <= 100 &&
      desiredGradeNumber >= 0 &&
      desiredGradeNumber <= 100 &&
      finalWeightNumber > 0 &&
      finalWeightNumber <= 100;

    if (!valid) {
      return { text: 'Please enter valid percentages (0-100).', tone: 'warn' };
    }

    const finalWeightRatio = finalWeightNumber / 100;
    const neededScore =
      (desiredGradeNumber - currentGradeNumber * (1 - finalWeightRatio)) / finalWeightRatio;

    if (neededScore <= 0) {
      return {
        text: `You already meet your target. Even 0% on the final keeps about ${desiredGradeNumber.toFixed(1)}%.`,
        tone: 'ok',
      };
    }

    if (neededScore > 100) {
      return {
        text: `You would need ${neededScore.toFixed(1)}% on the final. This target may not be achievable.`,
        tone: 'warn',
      };
    }

    return {
      text: `You need ${neededScore.toFixed(1)}% on the final exam.`,
      tone: 'ok',
    };
  }, [currentGrade, desiredGrade, finalWeight]);

  return (
    <PageLayout title="Final Target" description="Find out what score you need on the final to hit your goal.">
      <div className="field-grid field-grid-3">
        <label>
          Current Grade (%)
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            placeholder="e.g. 82.5"
            value={currentGrade}
            onChange={(event) => setCurrentGrade(event.target.value)}
          />
        </label>
        <label>
          Desired Grade (%)
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            placeholder="e.g. 90"
            value={desiredGrade}
            onChange={(event) => setDesiredGrade(event.target.value)}
          />
        </label>
        <label>
          Final Weight (%)
          <input
            type="number"
            min="1"
            max="100"
            step="0.1"
            placeholder="e.g. 35"
            value={finalWeight}
            onChange={(event) => setFinalWeight(event.target.value)}
          />
        </label>
      </div>

      <p className={`message ${targetTone ? `message-${targetTone}` : ''}`}>{targetResult}</p>
    </PageLayout>
  );
}
