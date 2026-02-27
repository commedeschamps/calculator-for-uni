export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) {
    throw new Error('Result is not a finite number.');
  }

  const rounded = Math.round((value + Number.EPSILON) * 1e10) / 1e10;
  return String(rounded);
}

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

function factorial(value: number): number {
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

function replaceFactorials(expression: string): string {
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

export function evaluateMathExpression(rawExpression: string, mode: 'DEG' | 'RAD'): number {
  if (!rawExpression.trim()) {
    throw new Error('Enter an expression first.');
  }

  let expr = rawExpression.toLowerCase().replace(/\s+/g, '');

  if (!/^[0-9+\-*/().,%!^a-z]+$/.test(expr)) {
    throw new Error('Expression contains unsupported characters.');
  }

  expr = expr.replace(/π/g, 'pi');
  expr = expr.replace(/\^/g, '**');

  const tokenPattern = /sin|cos|tan|log|ln|sqrt|abs|pi|e/g;
  const stripped = expr.replace(tokenPattern, '');

  if (/[a-df-z]/.test(stripped)) {
    throw new Error('Unknown function or token in expression.');
  }

  expr = expr.replace(/pi/g, 'PI_CONST');
  expr = expr.replace(/\be\b/g, 'E_CONST');
  expr = replaceFactorials(expr);
  expr = expr.replace(/(\d+(?:\.\d+)?)%/g, '($1/100)');

  const sin = (x: number) => Math.sin(mode === 'DEG' ? toRadians(x) : x);
  const cos = (x: number) => Math.cos(mode === 'DEG' ? toRadians(x) : x);
  const tan = (x: number) => Math.tan(mode === 'DEG' ? toRadians(x) : x);
  const log = (x: number) => Math.log10(x);
  const ln = (x: number) => Math.log(x);
  const sqrt = (x: number) => Math.sqrt(x);
  const abs = (x: number) => Math.abs(x);

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
  ) as (
    sinFn: (x: number) => number,
    cosFn: (x: number) => number,
    tanFn: (x: number) => number,
    logFn: (x: number) => number,
    lnFn: (x: number) => number,
    sqrtFn: (x: number) => number,
    absFn: (x: number) => number,
    factFn: (x: number) => number,
    piConst: number,
    eConst: number
  ) => number;

  const result = evaluator(sin, cos, tan, log, ln, sqrt, abs, factorial, Math.PI, Math.E);

  if (!Number.isFinite(result)) {
    throw new Error('Expression produced an invalid result.');
  }

  return result;
}
