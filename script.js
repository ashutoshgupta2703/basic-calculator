// Basic calculator logic (safe-ish): supports + - * / and decimals.
// Put script.js in same folder as index.html and style.css.

const exprEl = document.getElementById('expr');
const resEl  = document.getElementById('res');
const buttons = document.querySelectorAll('.btn');

let expr = ''; // holds the expression string

// helpers
function updateDisplays() {
  exprEl.textContent = expr || '0';
  // show current typed expression as result until computed
  resEl.textContent  = expr || '0';
}

function getLastNumber() {
  const m = expr.match(/([0-9.]+)$/);
  return m ? m[0] : '';
}

// append a digit or decimal
function appendNumber(ch) {
  if (ch === '.') {
    const last = getLastNumber();
    if (last.includes('.')) return;         // prevent multiple dots in same number
    if (last === '') expr += '0.';         // ".5" -> "0.5"
    else expr += '.';
  } else {
    expr += ch;
  }
  updateDisplays();
}

// append operator (+ - * /). Allows leading "-" for negative numbers.
function appendOperator(op) {
  if (expr === '' && op === '-') {
    expr = '-';
    updateDisplays();
    return;
  }
  if (expr === '') return; // don't start with other operators
  const last = expr.slice(-1);
  if ('+-*/'.includes(last)) {
    // replace existing operator with new one (easier UX)
    expr = expr.slice(0, -1) + op;
  } else {
    expr += op;
  }
  updateDisplays();
}

function clearAll() {
  expr = '';
  updateDisplays();
}

function deleteLast() {
  expr = expr.slice(0, -1);
  updateDisplays();
}

// Evaluate the expression safely-ish
function calculate() {
  if (!expr) return;
  // remove trailing operators
  while (expr.length && '+-*/'.includes(expr.slice(-1))) {
    expr = expr.slice(0, -1);
  }
  if (!expr) { updateDisplays(); return; }

  // simple sanitization: only digits, operators and dot allowed
  if (!/^[0-9+\-*/. ]+$/.test(expr)) {
    resEl.textContent = 'Error';
    expr = '';
    return;
  }

  try {
    // Use Function constructor rather than eval (slightly cleaner)
    const value = Function('"use strict"; return (' + expr + ')')();
    if (!isFinite(value)) { resEl.textContent = 'Error'; expr = ''; return; }
    const rounded = parseFloat(value.toFixed(12)); // avoid floating noise
    resEl.textContent = rounded;
    expr = String(rounded); // allow continued calculations
    exprEl.textContent = expr;
  } catch (e) {
    resEl.textContent = 'Error';
    expr = '';
  }
}

// button wiring
buttons.forEach(btn => {
  const action = btn.dataset.action;
  const value  = btn.dataset.value;

  btn.addEventListener('click', () => {
    if (action === 'clear') { clearAll(); return; }
    if (action === 'del')   { deleteLast(); return; }
    if (action === 'equals'){ calculate(); return; }

    // if dataset contains a value and it is an operator marker, treat as operator
    if (value && btn.dataset.ptype === 'op') { appendOperator(value); return; }

    // otherwise treat as number (value must exist)
    if (value) appendNumber(value);
  });
});

// keyboard support
window.addEventListener('keydown', (e) => {
  const key = e.key;
  if (/^[0-9]$/.test(key)) { appendNumber(key); e.preventDefault(); return; }
  if (key === '.') { appendNumber('.'); e.preventDefault(); return; }
  if (key === '+' || key === '-' || key === '*' || key === '/') { appendOperator(key); e.preventDefault(); return; }
  if (key === 'Enter') { calculate(); e.preventDefault(); return; }
  if (key === 'Backspace') { deleteLast(); e.preventDefault(); return; }
  if (key === 'Escape') { clearAll(); e.preventDefault(); return; }
});
