/* ── TodoFloat renderer ─────────────────────────────────────────────────── */
'use strict';

let tasks = [];
let filter = 'all';
let prioFilter = 'all';
let editingId = null;
let searchQuery = '';
let dragSrcId = null;
let activeCategory = 'all';
let categories = [];

let draftSubtasks = [];
let selectedDate = null;
let calViewYear = new Date().getFullYear();
let calViewMonth = new Date().getMonth();

const taskList = document.getElementById('task-list');
const emptyState = document.getElementById('empty-state');
const fab = document.getElementById('fab');
const modalOverlay = document.getElementById('modal-overlay');
const modalTitle = document.getElementById('modal-title');
const inpTitle = document.getElementById('inp-title');
const inpNotes = document.getElementById('inp-notes');
// inpLabel removed — using category dropdown instead
const inpSubtask = document.getElementById('inp-subtask');
const subtaskList = document.getElementById('subtask-list');
const duePreview = document.getElementById('due-preview');
const dueClear = document.getElementById('due-clear');
const slHrs = document.getElementById('sl-hrs');
const slMins = document.getElementById('sl-mins');
const ampmToggle = document.getElementById('ampm-toggle');
const timeHrs = document.getElementById('time-hrs');
const timeMins = document.getElementById('time-mins');
const timeAmpm = document.getElementById('time-ampm');
const btnSave = document.getElementById('btn-save');
const btnCancel = document.getElementById('btn-cancel');
const btnPin = document.getElementById('btn-pin');
const statTotal = document.getElementById('stat-total');
const statDone = document.getElementById('stat-done');
const statOverdue = document.getElementById('stat-overdue');

async function init() {
  tasks = await window.todoAPI.loadTasks();
  const settings = await window.todoAPI.getSettings();
  btnPin.classList.toggle('pinned', settings.alwaysOnTop);
  if (settings.collapsed) {
    document.getElementById('app').classList.add('collapsed');
    const btn = document.getElementById('btn-collapse');
    if (btn) btn.classList.add('collapsed');
  }
  renderAll();
  attachGlobalListeners();
  loadCategories();
}

async function save() { await window.todoAPI.saveTasks(tasks); }

function renderAll() { renderStats(); renderTaskList(); }

function renderStats() {
  const now = Date.now();
  const total = tasks.length;
  const done = tasks.filter(t => t.done).length;
  const overdue = tasks.filter(t => !t.done && t.dueTs && t.dueTs < now).length;
  statTotal.textContent = `${total} task${total !== 1 ? 's' : ''}`;
  statDone.textContent = `${done} done`;
  statOverdue.textContent = overdue > 0 ? `${overdue} overdue` : '';
  statOverdue.style.display = overdue > 0 ? '' : 'none';
}

function getFilteredTasks() {
  const now = new Date();
  const todayStr = dateStr(now.getFullYear(), now.getMonth(), now.getDate());
  return tasks.filter(t => {
    if (filter === 'today') {
      if (!t.dueTs) return false;
      const d = new Date(t.dueTs);
      if (dateStr(d.getFullYear(), d.getMonth(), d.getDate()) !== todayStr) return false;
    }
    if (filter === 'pending' && t.done) return false;
    if (filter === 'done' && !t.done) return false;
    if (filter === 'daily' && !t.daily) return false;
    if (prioFilter !== 'all' && t.priority !== prioFilter) return false;
    if (activeCategory !== 'all' && t.category !== activeCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const hit = t.title.toLowerCase().includes(q)
        || (t.notes || '').toLowerCase().includes(q)
        || (t.label || '').toLowerCase().includes(q)
        || (t.subtasks || []).some(s => s.text.toLowerCase().includes(q));
      if (!hit) return false;
    }
    return true;
  });
}

function renderTaskList() {
  const filtered = getFilteredTasks();
  taskList.innerHTML = '';
  emptyState.style.display = filtered.length === 0 ? 'block' : 'none';
  filtered.forEach(t => taskList.appendChild(buildTaskCard(t)));
}

function buildTaskCard(t) {
  const li = document.createElement('li');
  li.className = `task-card prio-${t.priority}${t.done ? ' done' : ''}`;
  li.dataset.id = t.id;

  const now = Date.now();
  const todayStr = (() => { const d = new Date(); return dateStr(d.getFullYear(), d.getMonth(), d.getDate()); })();
  let dueCls = '', dueLabel = '';
  if (t.dueTs) {
    const d = new Date(t.dueTs);
    const ds = dateStr(d.getFullYear(), d.getMonth(), d.getDate());
    dueLabel = formatDue(t.dueTs);
    if (!t.done && t.dueTs < now) { dueCls = 'overdue'; dueLabel = '⚠ ' + dueLabel; }
    else if (ds === todayStr) { dueCls = 'today'; dueLabel = '⏰ ' + dueLabel; }
  }

  const sub = t.subtasks || [];
  const subDone = sub.filter(s => s.done).length;
  const subPct = sub.length > 0 ? Math.round((subDone / sub.length) * 100) : 0;

  li.draggable = true;
  li.innerHTML = `
    <div class="task-top">
      <div class="drag-handle" title="Drag to reorder">⠿</div>
      <div class="task-check${t.done ? ' checked' : ''}" data-action="toggle"></div>
      <div class="task-body">
        <div class="task-title">${escHtml(t.title)}</div>
        ${t.notes ? `<div class="task-notes">${escHtml(t.notes)}</div>` : ''}
      </div>
      <div class="task-actions">
        <button data-action="edit" title="Edit">✎</button>
        <button data-action="delete" class="task-del" title="Delete">🗑</button>
      </div>
    </div>
    ${(t.label || t.dueTs || t.daily) ? `
    <div class="task-meta">
      ${t.label ? `<span class="tag tag-label">${escHtml(t.label)}</span>` : ''}
      ${t.dueTs ? `<span class="tag tag-due ${dueCls}">${dueLabel}</span>` : ''}
      ${t.daily ? `<span class="tag tag-daily">↻ Daily</span>` : ''}
    </div>` : ''}
    ${sub.length > 0 ? `
    <ul class="subtask-list">
      ${sub.map((s, i) => `
        <li class="subtask-item${s.done ? ' done' : ''}" data-sub="${i}">
          <div class="subtask-dot"></div>
          <span>${escHtml(s.text)}</span>
        </li>`).join('')}
    </ul>
    <div class="subtask-progress">
      <div class="subtask-progress-fill" style="width:${subPct}%"></div>
    </div>` : ''}
    <div class="task-recurring-row">
      <div class="recurring-btn${t.daily ? ' is-daily' : ''}" data-action="toggleDaily">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M5 1v4l2.5 2.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
          <path d="M9 5A4 4 0 1 1 5 1" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
        </svg>
        <span class="recurring-tooltip">${t.daily ? 'Remove from Daily' : 'Add to Daily'}</span>
      </div>
    </div>
  `;

  li.addEventListener('click', e => {
    const action = e.target.closest('[data-action]')?.dataset.action;
    const subIdx = e.target.closest('[data-sub]')?.dataset.sub;
    if (action === 'toggle') { toggleTask(t.id); return; }
    if (action === 'edit') { openEditModal(t.id); return; }
    if (action === 'delete') { deleteTask(t.id); return; }
    if (action === 'toggleDaily') { toggleDaily(t.id); return; }
    if (subIdx !== undefined) { toggleSubtask(t.id, parseInt(subIdx)); }
  });

  li.addEventListener('dragstart', e => {
    dragSrcId = t.id;
    setTimeout(() => li.classList.add('dragging'), 0);
    e.dataTransfer.effectAllowed = 'move';
  });
  li.addEventListener('dragend', () => {
    li.classList.remove('dragging');
    document.querySelectorAll('.task-card').forEach(c => c.classList.remove('drag-over'));
  });
  li.addEventListener('dragover', e => {
    e.preventDefault();
    document.querySelectorAll('.task-card').forEach(c => c.classList.remove('drag-over'));
    if (dragSrcId !== t.id) li.classList.add('drag-over');
  });
  li.addEventListener('drop', e => {
    e.preventDefault();
    if (dragSrcId === t.id) return;
    const srcIdx = tasks.findIndex(x => x.id === dragSrcId);
    const destIdx = tasks.findIndex(x => x.id === t.id);
    if (srcIdx < 0 || destIdx < 0) return;
    const [moved] = tasks.splice(srcIdx, 1);
    tasks.splice(destIdx, 0, moved);
    save(); renderAll();
    toast('Task reordered', 'info');
  });

  return li;
}

function toggleTask(id) {
  const t = tasks.find(x => x.id === id);
  if (t) { t.done = !t.done; save(); renderAll(); if (t.done) toast('Done! 🎉', 'success'); }
}
function toggleSubtask(taskId, idx) {
  const t = tasks.find(x => x.id === taskId);
  if (t && t.subtasks[idx]) { t.subtasks[idx].done = !t.subtasks[idx].done; save(); renderAll(); }
}
function toggleDaily(id) {
  const t = tasks.find(x => x.id === id);
  if (!t) return;
  t.daily = !t.daily;
  save(); renderAll();
  toast(t.daily ? '↻ Added to Daily' : 'Removed from Daily', 'info');
}
function deleteTask(id) {
  const deletedTask = tasks.find(t => t.id === id);
  const card = document.querySelector(`.task-card[data-id="${id}"]`);
  if (card) {
    card.classList.add('removing');
    setTimeout(() => { tasks = tasks.filter(t => t.id !== id); save(); renderAll(); }, 220);
  } else {
    tasks = tasks.filter(t => t.id !== id); save(); renderAll();
  }
  toast('Task deleted', 'error', () => { tasks.unshift(deletedTask); save(); renderAll(); });
}

function getSelectedPriority() { return document.querySelector('.prio-opt.active')?.dataset.val || 'med'; }

function saveTask() {
  const title = inpTitle.value.trim();
  if (!title) { inpTitle.focus(); inpTitle.style.borderColor = 'var(--red)'; return; }
  inpTitle.style.borderColor = '';
  const taskData = {
    title, notes: inpNotes.value.trim(),
    priority: getSelectedPriority(), dueTs: buildDueTs(),
    category: document.getElementById('inp-category')?.value || '',
    subtasks: draftSubtasks.slice(), done: false
  };
  if (editingId) {
    const idx = tasks.findIndex(t => t.id === editingId);
    if (idx > -1) tasks[idx] = { ...tasks[idx], ...taskData };
  } else {
    tasks.unshift({ id: uid(), ...taskData });
  }
  const isEdit = !!editingId;
  save(); renderAll(); closeModal();
  toast(isEdit ? 'Task updated ✓' : 'Task added ✓', 'success');
}

function buildDueTs() {
  if (!selectedDate) return null;
  const hrs24 = to24(parseInt(slHrs.value), ampmToggle.textContent);
  return new Date(selectedDate.year, selectedDate.month, selectedDate.day, hrs24, parseInt(slMins.value), 0).getTime();
}
function to24(h, ampm) {
  if (ampm === 'AM') return h === 12 ? 0 : h;
  return h === 12 ? 12 : h + 12;
}
function updateTimeDisplay() {
  timeHrs.textContent = String(parseInt(slHrs.value)).padStart(2, '0');
  timeMins.textContent = String(parseInt(slMins.value)).padStart(2, '0');
  timeAmpm.textContent = ampmToggle.textContent;
  updateDuePreview();
}
function updateDuePreview() {
  if (selectedDate) { duePreview.textContent = formatDue(buildDueTs()); dueClear.classList.remove('hidden'); }
  else { duePreview.textContent = ''; dueClear.classList.add('hidden'); }
}

function buildCalendar(year, month) {
  const wrap = document.getElementById('calendar-wrap');
  const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const today = new Date();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();
  let html = `<div class="cal-header"><button class="cal-nav" id="cal-prev">‹</button><span>${MONTHS[month]} ${year}</span><button class="cal-nav" id="cal-next">›</button></div><div class="cal-grid">${DAYS.map(d => `<div class="cal-day-label">${d}</div>`).join('')}`;
  for (let i = firstDay - 1; i >= 0; i--) html += `<div class="cal-day other">${daysInPrev - i}</div>`;
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = (d === today.getDate() && month === today.getMonth() && year === today.getFullYear());
    const isSel = (selectedDate && selectedDate.day === d && selectedDate.month === month && selectedDate.year === year);
    html += `<div class="cal-day${isToday ? ' today' : ''}${isSel ? ' selected' : ''}" data-d="${d}">${d}</div>`;
  }
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
  let next = 1;
  for (let i = firstDay + daysInMonth; i < totalCells; i++) html += `<div class="cal-day other">${next++}</div>`;
  html += '</div>';
  wrap.innerHTML = html;
  document.getElementById('cal-prev').addEventListener('click', () => { calViewMonth--; if (calViewMonth < 0) { calViewMonth = 11; calViewYear--; } buildCalendar(calViewYear, calViewMonth); });
  document.getElementById('cal-next').addEventListener('click', () => { calViewMonth++; if (calViewMonth > 11) { calViewMonth = 0; calViewYear++; } buildCalendar(calViewYear, calViewMonth); });
  wrap.querySelectorAll('.cal-day[data-d]').forEach(el => {
    el.addEventListener('click', () => { selectedDate = { year: calViewYear, month: calViewMonth, day: parseInt(el.dataset.d) }; buildCalendar(calViewYear, calViewMonth); updateDuePreview(); });
  });
}

function renderDraftSubtasks() {
  subtaskList.innerHTML = draftSubtasks.map((s, i) => `<li><span>${escHtml(s.text)}</span><button data-idx="${i}">✕</button></li>`).join('');
  subtaskList.querySelectorAll('button').forEach(b => {
    b.addEventListener('click', () => { draftSubtasks.splice(parseInt(b.dataset.idx), 1); renderDraftSubtasks(); });
  });
}
function addDraftSubtask() {
  const v = inpSubtask.value.trim(); if (!v) return;
  draftSubtasks.push({ text: v, done: false }); inpSubtask.value = ''; renderDraftSubtasks();
}

function openAddModal() {
  editingId = null; modalTitle.textContent = 'New Task';
  inpTitle.value = ''; inpNotes.value = '';
  draftSubtasks = []; selectedDate = null;
  document.querySelectorAll('.prio-opt').forEach(b => b.classList.toggle('active', b.dataset.val === 'med'));
  const now = new Date(); calViewYear = now.getFullYear(); calViewMonth = now.getMonth();
  slHrs.value = 12; slMins.value = 0; ampmToggle.textContent = 'AM'; timeAmpm.textContent = 'AM';
  populateCategorySelect('');
  renderDraftSubtasks(); buildCalendar(calViewYear, calViewMonth); updateTimeDisplay();
  modalOverlay.classList.remove('hidden'); setTimeout(() => inpTitle.focus(), 80);
}
function openEditModal(id) {
  const t = tasks.find(x => x.id === id); if (!t) return;
  editingId = id; modalTitle.textContent = 'Edit Task';
  inpTitle.value = t.title; inpNotes.value = t.notes || '';
  draftSubtasks = (t.subtasks || []).map(s => ({ ...s }));
  document.querySelectorAll('.prio-opt').forEach(b => b.classList.toggle('active', b.dataset.val === t.priority));
  if (t.dueTs) {
    const d = new Date(t.dueTs);
    selectedDate = { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() };
    calViewYear = d.getFullYear(); calViewMonth = d.getMonth();
    let h = d.getHours(); const ampm = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12;
    slHrs.value = h; slMins.value = d.getMinutes(); ampmToggle.textContent = ampm; timeAmpm.textContent = ampm;
  } else {
    selectedDate = null; const now = new Date(); calViewYear = now.getFullYear(); calViewMonth = now.getMonth();
    slHrs.value = 12; slMins.value = 0; ampmToggle.textContent = 'AM'; timeAmpm.textContent = 'AM';
  }
  populateCategorySelect(t.category || '');
  renderDraftSubtasks(); buildCalendar(calViewYear, calViewMonth); updateTimeDisplay();
  modalOverlay.classList.remove('hidden'); setTimeout(() => inpTitle.focus(), 80);
}
function closeModal() { modalOverlay.classList.add('hidden'); editingId = null; }

function attachGlobalListeners() {
  fab.addEventListener('click', openAddModal);
  btnSave.addEventListener('click', saveTask);
  btnCancel.addEventListener('click', closeModal);
  document.getElementById('modal-close').addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') saveTask();
    if ((e.ctrlKey || e.metaKey) && e.key === 'n' && modalOverlay.classList.contains('hidden')) openAddModal();
  });

  document.getElementById('btn-min').addEventListener('click', () => window.todoAPI.minimize());
  document.getElementById('btn-close').addEventListener('click', () => window.todoAPI.hide());

  btnPin.addEventListener('click', () => {
    const pinned = btnPin.classList.toggle('pinned');
    window.todoAPI.togglePin(pinned);
    window.todoAPI.setMovable(!pinned);
  });

  document.getElementById('btn-collapse').addEventListener('click', () => {
    const appEl = document.getElementById('app');
    const isCollapsed = appEl.classList.toggle('collapsed');
    document.getElementById('btn-collapse').classList.toggle('collapsed', isCollapsed);
    window.todoAPI.setCollapsed(isCollapsed);
  });

  document.querySelectorAll('.filter-btn').forEach(b => {
    b.addEventListener('click', () => {
      filter = b.dataset.filter;
      document.querySelectorAll('.filter-btn').forEach(x => x.classList.toggle('active', x === b));
      renderAll();
    });
  });
  document.querySelectorAll('.prio-btn').forEach(b => {
    b.addEventListener('click', () => {
      prioFilter = b.dataset.prio;
      document.querySelectorAll('.prio-btn').forEach(x => x.classList.toggle('active', x === b));
      renderAll();
    });
  });
  document.querySelectorAll('.prio-opt').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('.prio-opt').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
    });
  });

  slHrs.addEventListener('input', updateTimeDisplay);
  slMins.addEventListener('input', updateTimeDisplay);
  ampmToggle.addEventListener('click', () => { ampmToggle.textContent = ampmToggle.textContent === 'AM' ? 'PM' : 'AM'; updateTimeDisplay(); });
  dueClear.addEventListener('click', () => { selectedDate = null; buildCalendar(calViewYear, calViewMonth); updateDuePreview(); });
  document.getElementById('btn-add-subtask').addEventListener('click', addDraftSubtask);
  inpSubtask.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addDraftSubtask(); } });
  inpTitle.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); inpNotes.focus(); } });
}

function populateCategorySelect(selected = '') {
  const sel = document.getElementById('inp-category');
  if (!sel) return;
  sel.innerHTML = '<option value="">None</option>';
  categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    if (cat === selected) opt.selected = true;
    sel.appendChild(opt);
  });
}

// ── Categories — no prompt(), inline input instead ────────────────────────────
function loadCategories() {
  const saved = localStorage.getItem('todofloat-categories');
  categories = saved ? JSON.parse(saved) : [];
  renderCategories();

  const catInputBar = document.getElementById('cat-input-bar');
  const inpCat = document.getElementById('inp-cat');
  const btnCatSave = document.getElementById('btn-cat-save');
  const btnCatCancel = document.getElementById('btn-cat-cancel');
  const btnAddCat = document.getElementById('btn-add-cat');

  // Show inline input
  btnAddCat.addEventListener('click', () => {
    catInputBar.classList.remove('hidden');
    inpCat.value = '';
    inpCat.focus();
  });

  // Save category
  const saveCategory = () => {
    const name = inpCat.value.trim();
    if (name && !categories.includes(name)) {
      categories.push(name);
      saveCategories();
      renderCategories();
    }
    catInputBar.classList.add('hidden');
    inpCat.value = '';
  };

  btnCatSave.addEventListener('click', saveCategory);
  inpCat.addEventListener('keydown', e => { if (e.key === 'Enter') saveCategory(); if (e.key === 'Escape') { catInputBar.classList.add('hidden'); } });
  btnCatCancel.addEventListener('click', () => { catInputBar.classList.add('hidden'); inpCat.value = ''; });
}

function showCatContextMenu(x, y, cat) {
  const menu = document.getElementById('cat-context-menu');
  const deleteBtn = document.getElementById('cat-ctx-delete');

  menu.style.left = x + 'px';
  menu.style.top = y + 'px';
  menu.classList.remove('hidden');

  // Clean up old listener
  const newDeleteBtn = deleteBtn.cloneNode(true);
  deleteBtn.parentNode.replaceChild(newDeleteBtn, deleteBtn);

  newDeleteBtn.addEventListener('click', () => {
    categories = categories.filter(c => c !== cat);
    if (activeCategory === cat) activeCategory = 'all';
    saveCategories(); renderCategories(); renderAll();
    menu.classList.add('hidden');
  });

  // Click anywhere else closes menu
  setTimeout(() => {
    document.addEventListener('click', () => menu.classList.add('hidden'), { once: true });
  }, 0);
}

function saveCategories() {
  localStorage.setItem('todofloat-categories', JSON.stringify(categories));
}

function renderCategories() {
  const bar = document.getElementById('categories-bar');
  const addBtn = document.getElementById('btn-add-cat');
  bar.querySelectorAll('.cat-btn:not([data-cat="all"])').forEach(b => b.remove());
  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'cat-btn' + (activeCategory === cat ? ' active' : '');
    btn.dataset.cat = cat;
    btn.textContent = cat;

    // Left click — select category
    btn.addEventListener('click', () => {
      activeCategory = cat; renderCategories(); renderAll();
    });

    // Right click — show context menu
    btn.addEventListener('contextmenu', e => {
      e.preventDefault();
      showCatContextMenu(e.clientX, e.clientY, cat);
    });

    bar.insertBefore(btn, addBtn);
  });
  const allBtn = bar.querySelector('[data-cat="all"]');
  allBtn.classList.toggle('active', activeCategory === 'all');
  allBtn.onclick = () => { activeCategory = 'all'; renderCategories(); renderAll(); };
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
function escHtml(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function dateStr(y, m, d) { return `${y}-${m}-${d}`; }
function formatDue(ts) {
  const d = new Date(ts), today = new Date();
  const todayStr = dateStr(today.getFullYear(), today.getMonth(), today.getDate());
  const dStr = dateStr(d.getFullYear(), d.getMonth(), d.getDate());
  const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (dStr === todayStr) return `Today ${timeStr}`;
  const tom = new Date(today); tom.setDate(tom.getDate() + 1);
  if (dStr === dateStr(tom.getFullYear(), tom.getMonth(), tom.getDate())) return `Tomorrow ${timeStr}`;
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + timeStr;
}

function toast(msg, type = 'info', undoFn = null) {
  const container = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = undoFn ? `<span>${msg}</span><button class="toast-undo">Undo</button>` : `<span>${msg}</span>`;
  container.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  let dismissed = false;
  const dismiss = () => {
    if (dismissed) return; dismissed = true;
    el.classList.remove('show'); el.classList.add('hide');
    setTimeout(() => el.remove(), 300);
  };
  if (undoFn) el.querySelector('.toast-undo').addEventListener('click', () => { undoFn(); dismiss(); });
  setTimeout(dismiss, 4000);
}

function attachSearchListeners() {
  const inp = document.getElementById('inp-search');
  const clear = document.getElementById('search-clear');
  inp.addEventListener('input', () => { searchQuery = inp.value.trim(); clear.classList.toggle('hidden', !searchQuery); renderAll(); });
  clear.addEventListener('click', () => { inp.value = ''; searchQuery = ''; clear.classList.add('hidden'); inp.focus(); renderAll(); });
  document.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key === 'f') { e.preventDefault(); inp.focus(); inp.select(); } });
}

attachSearchListeners();
init();