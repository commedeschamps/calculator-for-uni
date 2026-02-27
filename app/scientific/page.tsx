'use client';

import { useState } from 'react';
import PageLayout from '../components/PageLayout';
import { evaluateMathExpression, formatNumber } from '../lib/scientific';

type HistoryEntry = {
  expression: string;
  result: string;
};

type ScientificKey = {
  label: string;
  value: string;
  kind?: 'op';
};

const SCIENTIFIC_KEYS: ScientificKey[] = [
  { label: 'sin', value: 'sin(' },
  { label: 'cos', value: 'cos(' },
  { label: 'tan', value: 'tan(' },
  { label: 'log', value: 'log(' },
  { label: 'ln', value: 'ln(' },
  { label: 'sqrt', value: 'sqrt(' },
  { label: '(', value: '(' },
  { label: ')', value: ')' },
  { label: '7', value: '7' },
  { label: '8', value: '8' },
  { label: '9', value: '9' },
  { label: '÷', value: '/', kind: 'op' },
  { label: '^', value: '^' },
  { label: 'π', value: 'pi' },
  { label: 'e', value: 'e' },
  { label: '!', value: '!' },
  { label: '4', value: '4' },
  { label: '5', value: '5' },
  { label: '6', value: '6' },
  { label: '×', value: '*', kind: 'op' },
  { label: '−', value: '-', kind: 'op' },
  { label: 'abs', value: 'abs(' },
  { label: '%', value: '%' },
  { label: ',', value: ',' },
  { label: '1', value: '1' },
  { label: '2', value: '2' },
  { label: '3', value: '3' },
  { label: '+', value: '+', kind: 'op' },
  { label: '0', value: '0' },
  { label: '.', value: '.' },
];

const MAX_HISTORY = 5;

export default function ScientificPage() {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('0');
  const [calcError, setCalcError] = useState('');
  const [angleMode, setAngleMode] = useState<'DEG' | 'RAD'>('DEG');
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  function handleScientificCalculate() {
    if (!expression.trim()) return;
    setCalcError('');

    try {
      const value = evaluateMathExpression(expression, angleMode);
      const formatted = formatNumber(value);
      setResult(formatted);
      setHistory((prev) => [{ expression, result: formatted }, ...prev].slice(0, MAX_HISTORY));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to evaluate expression.';
      setCalcError(message);
    }
  }

  function handleScientificClear() {
    setExpression('');
    setResult('0');
    setCalcError('');
  }

  function handleScientificDelete() {
    setExpression((prev) => prev.slice(0, -1));
  }

  return (
    <PageLayout title="Scientific Calculator" description="Evaluate expressions with trig, log, constants, and more.">
      <label className="single-field" htmlFor="expression">
        Expression
        <input
          id="expression"
          type="text"
          autoComplete="off"
          placeholder="e.g. sin(45) + 3^2"
          value={expression}
          onChange={(event) => setExpression(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              handleScientificCalculate();
            }
          }}
        />
      </label>

      <p className="error-text">{calcError}</p>

      <div className="actions">
        <button className="btn btn-muted" type="button" onClick={() => setAngleMode((prev) => (prev === 'DEG' ? 'RAD' : 'DEG'))}>
          Mode: {angleMode}
        </button>
        <button className="btn btn-muted" type="button" onClick={handleScientificClear}>
          Clear
        </button>
        <button className="btn btn-muted" type="button" onClick={handleScientificDelete}>
          Delete
        </button>
        <span className="kbd-hint">Press Enter to evaluate</span>
      </div>

      <div className="result-panel">
        <span>Result</span>
        <strong>{result}</strong>
      </div>

      {history.length > 0 && (
        <div className="history-list">
          <p className="history-title">Recent</p>
          {history.map((entry, index) => (
            <button
              key={`${entry.expression}-${index}`}
              type="button"
              className="history-entry"
              onClick={() => setExpression(entry.expression)}
            >
              <span className="history-expr">{entry.expression}</span>
              <span className="history-result">= {entry.result}</span>
            </button>
          ))}
        </div>
      )}

      <div className="keypad" aria-label="Calculator keypad">
        {SCIENTIFIC_KEYS.map((key) => (
          <button
            key={`${key.label}-${key.value}`}
            className={`key ${key.kind === 'op' ? 'op' : ''}`}
            type="button"
            onClick={() => setExpression((prev) => `${prev}${key.value}`)}
          >
            {key.label}
          </button>
        ))}
        <button className="key equal" type="button" onClick={handleScientificCalculate}>
          =
        </button>
      </div>
    </PageLayout>
  );
}
