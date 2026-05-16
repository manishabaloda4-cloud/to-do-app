// DOM elements
const input      = document.getElementById('todo-input');
const addBtn     = document.getElementById('add-btn');
const list       = document.getElementById('todo-list');
const emptyState = document.getElementById('emptyState');
const doneCount  = document.getElementById('doneCount');
const totalCount = document.getElementById('totalCount');
const progressFill = document.getElementById('progressFill');
const clearDone  = document.getElementById('clearDone');
const dateDisplay = document.getElementById('dateDisplay');
const filterBtns = document.querySelectorAll('.filter-btn');

// State
const saved = localStorage.getItem('todos');
let todos = saved ? JSON.parse(saved) : [];
let currentFilter = 'all';

// Show today's date
const now = new Date();
dateDisplay.textContent = now.toLocaleDateString('en-US', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
});

// Save to localStorage
function saveTodos() {
  localStorage.setItem('todos', JSON.stringify(todos));
}

// Update stats + progress bar
function updateStats() {
  const total = todos.length;
  const done  = todos.filter(t => t.completed).length;
  doneCount.textContent  = done;
  totalCount.textContent = total;
  progressFill.style.width = total ? (done / total * 100) + '%' : '0%';
}

// Create a todo list item
function createTodoNode(todo, index) {
  const li = document.createElement('li');
  li.className = 'todo-item';
  li.dataset.index = index;

  // Hidden real checkbox
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = !!todo.completed;

  // Custom visual checkbox
  const customCheck = document.createElement('div');
  customCheck.className = 'custom-check' + (todo.completed ? ' checked' : '');
  customCheck.addEventListener('click', () => {
    todo.completed = !todo.completed;
    customCheck.classList.toggle('checked', todo.completed);
    textSpan.classList.toggle('done', todo.completed);
    saveTodos();
    updateStats();
    if (currentFilter !== 'all') render();
  });

  // Text span (double-click to edit)
  const textSpan = document.createElement('span');
  textSpan.className = 'todo-text' + (todo.completed ? ' done' : '');
  textSpan.textContent = todo.text;
  textSpan.title = 'Double-click to edit';

  textSpan.addEventListener('dblclick', () => {
    const editInput = document.createElement('input');
    editInput.className = 'edit-input';
    editInput.value = todo.text;
    li.replaceChild(editInput, textSpan);
    editInput.focus();

    function finishEdit() {
      const newText = editInput.value.trim();
      if (newText) {
        todo.text = newText;
        saveTodos();
      }
      textSpan.textContent = todo.text;
      li.replaceChild(textSpan, editInput);
    }

    editInput.addEventListener('blur', finishEdit);
    editInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') finishEdit();
      if (e.key === 'Escape') li.replaceChild(textSpan, editInput);
    });
  });

  // Delete button with icon
  const delBtn = document.createElement('button');
  delBtn.className = 'del-btn';
  delBtn.title = 'Delete';
  delBtn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>`;

  delBtn.addEventListener('click', () => {
    // BUG FIX: was todo.splice → must be todos.splice
    li.classList.add('removing');
    li.addEventListener('animationend', () => {
      const realIndex = todos.indexOf(todo);
      if (realIndex !== -1) todos.splice(realIndex, 1);
      saveTodos();
      render();
    }, { once: true });
  });

  li.appendChild(checkbox);
  li.appendChild(customCheck);
  li.appendChild(textSpan);
  li.appendChild(delBtn);
  return li;
}

// Render list based on filter
function render() {
  // BUG FIX: was ' ' (space) → must be '' (empty)
  list.innerHTML = '';

  const filtered = todos.filter(t => {
    if (currentFilter === 'active')    return !t.completed;
    if (currentFilter === 'completed') return  t.completed;
    return true;
  });

  filtered.forEach((todo) => {
    const node = createTodoNode(todo, todos.indexOf(todo));
    list.appendChild(node);
  });

  // Show/hide empty state
  if (filtered.length === 0) {
    emptyState.classList.add('show');
  } else {
    emptyState.classList.remove('show');
  }

  updateStats();
}

// Add new todo
function addTodo() {
  // BUG FIX: was input.value=' ' (space) → must be '' (empty)
  const text = input.value.trim();
  if (!text) return;
  todos.push({ text, completed: false });
  input.value = '';
  saveTodos();
  render();
  input.focus();
}

// Filter buttons
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    render();
  });
});

// Clear completed
clearDone.addEventListener('click', () => {
  todos = todos.filter(t => !t.completed);
  saveTodos();
  render();
});

// Event listeners
addBtn.addEventListener('click', addTodo);
input.addEventListener('keydown', e => {
  if (e.key === 'Enter') addTodo();
});

// Initial render
render();
