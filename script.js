/* ================================================================
   Data
   ================================================================ */
const stack = [];
const MAX = 8;
const POP_ANIMATION_MS  = 220;
const PEEK_HIGHLIGHT_MS = 1500;

/* ================================================================
   DOM refs
   ================================================================ */
const valueInput    = document.getElementById('valueInput');
const pushBtn       = document.getElementById('pushBtn');
const popBtn        = document.getElementById('popBtn');
const peekBtn       = document.getElementById('peekBtn');
const clearBtn      = document.getElementById('clearBtn');
const stackContainer = document.getElementById('stackContainer');
const messageEl     = document.getElementById('message');
const sizeBadge     = document.getElementById('sizeBadge');
const activeOpEl    = document.getElementById('activeOp');
const codeContent   = document.getElementById('codeContent');
const modeToggle    = document.getElementById('modeToggle');
const toggleLabelC  = document.getElementById('toggleLabelC');
const toggleLabelJS = document.getElementById('toggleLabelJS');

/* ================================================================
   State
   ================================================================ */
let currentMode = 'c';   // 'c' | 'js'
let currentOp   = null;
let peekActive  = false;

/* ================================================================
   Code Snippets
   ================================================================ */
// Each line: { text, highlight: true|false }
// 'highlight' marks the lines that perform the actual operation.
const CODE = {
  c: {
    push: [
      { t: 'void push(int stack[], int *top, int val) {' },
      { t: '  if (*top == MAX - 1) {',                   h: true },
      { t: '    printf("Stack Overflow!\\n");',           h: true },
      { t: '    return;',                                 h: true },
      { t: '  }' },
      { t: '  (*top)++;',                                h: true },
      { t: '  stack[*top] = val;',                       h: true },
      { t: '  printf("Pushed %d\\n", val);',             h: true },
      { t: '}' },
    ],
    pop: [
      { t: 'int pop(int stack[], int *top) {' },
      { t: '  if (*top == -1) {',                        h: true },
      { t: '    printf("Stack Underflow!\\n");',         h: true },
      { t: '    return -1;',                             h: true },
      { t: '  }' },
      { t: '  int item = stack[*top];',                  h: true },
      { t: '  (*top)--;',                                h: true },
      { t: '  printf("Popped %d\\n", item);',            h: true },
      { t: '  return item;',                             h: true },
      { t: '}' },
    ],
    peek: [
      { t: 'int peek(int stack[], int top) {' },
      { t: '  if (top == -1) {',                         h: true },
      { t: '    printf("Stack is Empty!\\n");',          h: true },
      { t: '    return -1;',                             h: true },
      { t: '  }' },
      { t: '  return stack[top];',                       h: true },
      { t: '}' },
    ],
    clear: [
      { t: 'void clear(int *top) {' },
      { t: '  while (*top != -1) {',                     h: true },
      { t: '    (*top)--;',                              h: true },
      { t: '  }',                                        h: true },
      { t: '  printf("Stack cleared!\\n");',             h: true },
      { t: '}' },
    ],
  },
  js: {
    push: [
      { t: 'function push(stack, value) {' },
      { t: '  if (stack.length >= MAX) {',               h: true },
      { t: '    console.log("Stack Overflow!");',        h: true },
      { t: '    return false;',                          h: true },
      { t: '  }' },
      { t: '  stack.push(value);',                      h: true },
      { t: '  console.log(`Pushed ${value}`);',         h: true },
      { t: '  return true;',                            h: true },
      { t: '}' },
    ],
    pop: [
      { t: 'function pop(stack) {' },
      { t: '  if (stack.length === 0) {',               h: true },
      { t: '    console.log("Stack Underflow!");',      h: true },
      { t: '    return null;',                          h: true },
      { t: '  }' },
      { t: '  const item = stack.pop();',               h: true },
      { t: '  console.log(`Popped ${item}`);',          h: true },
      { t: '  return item;',                            h: true },
      { t: '}' },
    ],
    peek: [
      { t: 'function peek(stack) {' },
      { t: '  if (stack.length === 0) {',               h: true },
      { t: '    console.log("Stack is Empty!");',       h: true },
      { t: '    return null;',                          h: true },
      { t: '  }' },
      { t: '  return stack[stack.length - 1];',         h: true },
      { t: '}' },
    ],
    clear: [
      { t: 'function clear(stack) {' },
      { t: '  stack.length = 0;',                       h: true },
      { t: '  console.log("Stack cleared!");',          h: true },
      { t: '}' },
    ],
  },
};

/* ================================================================
   Helpers
   ================================================================ */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function setMessage(text, tone = 'normal') {
  messageEl.textContent = text;
  messageEl.style.color =
    tone === 'error' ? 'var(--neon-pink)'  :
    tone === 'warn'  ? 'var(--amber)'       :
    tone === 'good'  ? 'var(--neon-green)'  : 'var(--muted)';
}

/* ================================================================
   Code Panel
   ================================================================ */
function renderCode(op) {
  if (!op) {
    codeContent.innerHTML =
      '<span class="code-line code-comment">// Select an operation to see the code.</span>';
    return;
  }

  const lines = CODE[currentMode][op];
  const hlClass = `hl-${op}`;

  codeContent.innerHTML = lines
    .map(({ t, h }) => {
      const cls = h ? `code-line ${hlClass}` : 'code-line';
      return `<span class="${cls}">${escapeHtml(t)}</span>`;
    })
    .join('\n');
}

/* ================================================================
   Stack Render
   ================================================================ */
function render() {
  stackContainer.innerHTML = '';
  stack.forEach((value, idx) => {
    const el = document.createElement('div');
    el.className = 'stack-item';
    if (idx === stack.length - 1) {
      el.classList.add(peekActive ? 'peek-hl' : 'top');
    }
    el.textContent = value;
    stackContainer.appendChild(el);
  });
  sizeBadge.textContent = `Size: ${stack.length} / ${MAX}`;
}

function highlight(op) {
  currentOp = op;
  activeOpEl.textContent = `Operation: ${op ? op.toUpperCase() : '—'}`;
  renderCode(op);
}

/* ================================================================
   Operations
   ================================================================ */
function push() {
  const value = valueInput.value.trim();
  highlight('push');

  if (!value) {
    setMessage('Enter a value to push.', 'warn');
    return;
  }
  if (stack.length >= MAX) {
    setMessage('Overflow! Stack is full.', 'error');
    return;
  }

  stack.push(value);
  render();
  setMessage(`Pushed "${value}" onto the stack.`, 'good');
  valueInput.value = '';
  valueInput.focus();
}

function pop() {
  highlight('pop');

  if (stack.length === 0) {
    setMessage('Underflow! Stack is empty.', 'error');
    return;
  }

  const topEl  = stackContainer.lastElementChild;
  if (topEl) topEl.classList.add('pop-out');
  const removed = stack[stack.length - 1];

  setTimeout(() => {
    stack.pop();
    render();
    setMessage(`Popped "${removed}" from the stack.`, 'good');
  }, POP_ANIMATION_MS);
}

function peek() {
  highlight('peek');

  if (stack.length === 0) {
    setMessage('Stack is empty. Nothing to peek.', 'warn');
    return;
  }

  const top = stack[stack.length - 1];
  peekActive = true;
  render();
  setMessage(`Top element is "${top}".`, 'warn');

  setTimeout(() => {
    peekActive = false;
    render();
  }, PEEK_HIGHLIGHT_MS);
}

function clearStack() {
  highlight('clear');

  if (stack.length === 0) {
    setMessage('Stack is already empty.', 'warn');
    return;
  }

  stack.length = 0;
  render();
  setMessage('Stack cleared.', 'warn');
}

/* ================================================================
   Toggle Mode
   ================================================================ */
function updateToggleLabels() {
  currentMode = modeToggle.checked ? 'js' : 'c';
  toggleLabelC.classList.toggle('active',  !modeToggle.checked);
  toggleLabelJS.classList.toggle('active',  modeToggle.checked);
  renderCode(currentOp);
}

/* ================================================================
   Event Listeners
   ================================================================ */
pushBtn.addEventListener('click', push);
popBtn.addEventListener('click', pop);
peekBtn.addEventListener('click', peek);
clearBtn.addEventListener('click', clearStack);
modeToggle.addEventListener('change', updateToggleLabels);
valueInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') push(); });

/* ================================================================
   Init
   ================================================================ */
updateToggleLabels();
render();
