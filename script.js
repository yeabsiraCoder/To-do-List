const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const dueDateInput = document.getElementById('due-date');
const prioritySelect = document.getElementById('priority');
const todoList = document.getElementById('todo-list');
const filterButtons = document.querySelectorAll('.filter-btn');
const sortSelect = document.getElementById('sort-select');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function renderTasks(filter = 'all', sort = 'default') {
  todoList.innerHTML = '';
  let filtered = [...tasks];

  if (filter === 'active') filtered = filtered.filter(t => !t.completed);
  if (filter === 'completed') filtered = filtered.filter(t => t.completed);

  if (sort === 'priority') {
    const priorityMap = { high: 1, medium: 2, low: 3 };
    filtered.sort((a, b) => priorityMap[a.priority] - priorityMap[b.priority]);
  } else if (sort === 'due-date') {
    filtered.sort((a, b) => new Date(a.dueDate || 9999999999999) - new Date(b.dueDate || 9999999999999));
  }

  filtered.forEach(task => {
    const li = document.createElement('li');
    li.className = 'todo-item' + (task.completed ? ' completed' : '');
    li.setAttribute('data-id', task.id);

    li.innerHTML = `
      <input type="checkbox" ${task.completed ? 'checked' : ''}>
      <span class="task-text" contenteditable="true">${task.text}</span>
      <span class="due-date">${task.dueDate || 'No due date'}</span>
      <span class="priority ${task.priority}">${task.priority}</span>
      <button class="delete-btn">&times;</button>
    `;

    // Handlers
    li.querySelector('input[type="checkbox"]').addEventListener('change', () => {
      task.completed = !task.completed;
      saveTasks();
      renderTasks(getFilter(), sortSelect.value);
    });

    li.querySelector('.task-text').addEventListener('blur', (e) => {
      const newText = e.target.textContent.trim();
      if (newText) {
        task.text = newText;
        saveTasks();
      } else {
        renderTasks(getFilter(), sortSelect.value);
      }
    });

    li.querySelector('.delete-btn').addEventListener('click', () => {
      tasks = tasks.filter(t => t.id !== task.id);
      saveTasks();
      renderTasks(getFilter(), sortSelect.value);
    });

    todoList.appendChild(li);
  });
}

function getFilter() {
  const btn = document.querySelector('.filter-btn.active');
  return btn ? btn.dataset.filter : 'all';
}

todoForm.addEventListener('submit', e => {
  e.preventDefault();
  const text = todoInput.value.trim();
  if (!text) return alert('Enter a task!');
  const newTask = {
    id: Date.now(),
    text,
    dueDate: dueDateInput.value || null,
    priority: prioritySelect.value,
    completed: false
  };
  tasks.push(newTask);
  saveTasks();
  renderTasks(getFilter(), sortSelect.value);
  todoForm.reset();
});

filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderTasks(btn.dataset.filter, sortSelect.value);
  });
});

sortSelect.addEventListener('change', () => {
  renderTasks(getFilter(), sortSelect.value);
});

renderTasks();
