const stack = [];
const MAX = 8;

const valueInput = document.getElementById("valueInput");
const pushBtn = document.getElementById("pushBtn");
const popBtn = document.getElementById("popBtn");
const peekBtn = document.getElementById("peekBtn");
const clearBtn = document.getElementById("clearBtn");

const stackContainer = document.getElementById("stackContainer");
const message = document.getElementById("message");
const sizeBadge = document.getElementById("sizeBadge");
const activeOp = document.getElementById("activeOp");
const pseudoLines = document.querySelectorAll("#pseudo span");

function setMessage(text, tone = "normal") {
  message.textContent = text;
  message.style.color =
    tone === "error" ? "#ff9bb0" :
    tone === "warn"  ? "#ffd38a" :
    tone === "good"  ? "#8bf7cc" : "#d9e4ff";
}

function highlight(op) {
  activeOp.textContent = `Operation: ${op ? op.toUpperCase() : "None"}`;
  pseudoLines.forEach(line => {
    line.classList.toggle("active", op && line.dataset.op === op);
  });
}

function render() {
  stackContainer.innerHTML = "";
  stack.forEach((value, idx) => {
    const el = document.createElement("div");
    el.className = "stack-item";
    if (idx === stack.length - 1) el.classList.add("top");
    el.textContent = value;
    stackContainer.appendChild(el);
  });
  sizeBadge.textContent = `Size: ${stack.length}`;
}

function push() {
  const value = valueInput.value.trim();
  highlight("push");

  if (!value) {
    setMessage("Please enter a value to push.", "warn");
    return;
  }
  if (stack.length >= MAX) {
    setMessage("Overflow! Stack is full.", "error");
    return;
  }

  stack.push(value);
  render();
  setMessage(`Pushed "${value}" onto stack.`, "good");
  valueInput.value = "";
  valueInput.focus();
}

function pop() {
  highlight("pop");

  if (stack.length === 0) {
    setMessage("Underflow! Stack is empty.", "error");
    return;
  }

  const topEl = stackContainer.lastElementChild;
  if (topEl) topEl.classList.add("pop-out");

  const removed = stack[stack.length - 1];

  setTimeout(() => {
    stack.pop();
    render();
    setMessage(`Popped "${removed}" from stack.`, "good");
  }, 220);
}

function peek() {
  highlight("peek");

  if (stack.length === 0) {
    setMessage("Stack is empty. Nothing to peek.", "warn");
    return;
  }

  const top = stack[stack.length - 1];
  render();
  setMessage(`Top element is "${top}".`, "good");
}

function clearStack() {
  highlight("clear");

  if (stack.length === 0) {
    setMessage("Stack is already empty.", "warn");
    return;
  }

  stack.length = 0;
  render();
  setMessage("Cleared all elements from stack.", "good");
}

pushBtn.addEventListener("click", push);
popBtn.addEventListener("click", pop);
peekBtn.addEventListener("click", peek);
clearBtn.addEventListener("click", clearStack);

valueInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") push();
});

render();