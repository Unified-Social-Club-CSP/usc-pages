// Club Jeopardy board editor, for volunteers and staff.
// The board being edited lives in `draft` (the same shape the game plays:
// categories -> clues -> choices). The form is drawn from the draft, and read
// back into it before any button changes its shape, so nothing typed is lost.
// The server (api/usc_jeopardy.py) checks every board again before saving.
import { currentMember } from './account.js';
import { EDITOR_ROLES, deleteBoard, getBoard, listBoards, saveBoard } from './jeopardy-api.js';

const VALUES = [100, 200, 300, 400, 500];
const MAX_CATEGORIES = 6;
const MAX_CLUES = 5;
const MIN_CHOICES = 2;
const MAX_CHOICES = 4;

const root = document.getElementById('jeopardy-editor');
const $ = (sel) => root.querySelector(sel);
const form = $('[data-screen="edit"]');

let draft = null;     // the board being edited
let editingId = null; // its id on the server, or null for a new board

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function button(label, action, data = {}, className = 'ocs__btn small') {
  const b = el('button', className, label);
  b.type = 'button';
  b.dataset.action = action;
  Object.assign(b.dataset, data);
  return b;
}

// A labelled OCS input. `path` says where in the draft its value goes.
function field(label, path, value, { maxLength, options } = {}) {
  const wrap = el('div', 'ocs__field');
  const id = `f-${path.replace(/\./g, '-')}`;
  const lab = el('label', 'ocs__label', label);
  lab.htmlFor = id;
  let input;
  if (options) {
    input = el('select', 'ocs__input');
    options.forEach((o) => {
      const opt = el('option', '', String(o));
      opt.value = o;
      input.appendChild(opt);
    });
  } else {
    input = el('input', 'ocs__input');
    if (maxLength) input.maxLength = maxLength;
  }
  input.id = id;
  input.dataset.path = path;
  input.value = value ?? '';
  wrap.append(lab, input);
  return wrap;
}

function show(screen, message) {
  root.querySelectorAll('[data-screen]').forEach((s) => { s.hidden = s.dataset.screen !== screen; });
  $('[data-message]').textContent = message || '';
  $('[data-message]').hidden = !message;
}

// ---------- The board list ----------

async function showList(message) {
  const { ok, data, message: error } = await listBoards();
  if (!ok) { show('none', error || 'Could not load the boards.'); return; }
  $('[data-boards]').replaceChildren(...data.map((board) => {
    const row = el('tr');
    const actions = el('td');
    actions.append(
      button('✏️ Edit', 'edit', { id: board.id }),
      button('🗑 Remove', 'remove', { id: board.id, name: board.name }, 'ocs__btn small alert-red'),
    );
    row.append(
      el('td', '', board.name),
      el('td', '', board.level === 'harder' ? 'Harder' : 'Easy'),
      el('td', '', `${board.category_count} categories, ${board.clue_count} clues`),
      el('td', '', `${board.plays} games`),
      actions,
    );
    return row;
  }));
  show('list', message);
}

// ---------- One board ----------

const newClue = (value = 100) => ({ value, clue: '', choices: [{ emoji: '', label: '' }, { emoji: '', label: '' }, { emoji: '', label: '' }], answer: 0 });
const newCategory = () => ({ name: '', icon: '⭐', clues: [newClue(100), newClue(200), newClue(300)] });

function drawClue(clue, c, q, category) {
  const box = el('fieldset', 'ocs__callout');
  box.appendChild(el('legend', '', `Clue ${q + 1}`));
  box.append(
    field('Question', `c.${c}.q.${q}.clue`, clue.clue, { maxLength: 200 }),
    field('Points', `c.${c}.q.${q}.value`, clue.value, { options: VALUES }),
  );
  clue.choices.forEach((choice, a) => {
    const row = el('div', 'ocs__grid ocs__grid--standard');
    row.append(
      field(`Answer ${a + 1} picture`, `c.${c}.q.${q}.a.${a}.emoji`, choice.emoji, { maxLength: 8 }),
      field(`Answer ${a + 1} words`, `c.${c}.q.${q}.a.${a}.label`, choice.label, { maxLength: 40 }),
    );
    const right = el('label', 'ocs__label');
    const radio = el('input');
    radio.type = 'radio';
    radio.name = `answer-${c}-${q}`;
    radio.value = a;
    radio.checked = clue.answer === a;
    radio.dataset.path = `c.${c}.q.${q}.answer`;
    right.append(radio, ' Right answer');
    row.appendChild(right);
    box.appendChild(row);
  });
  const links = el('div', 'ocs__links');
  if (clue.choices.length < MAX_CHOICES) links.appendChild(button('➕ Answer', 'add-choice', { c, q }));
  if (clue.choices.length > MIN_CHOICES) links.appendChild(button('➖ Answer', 'remove-choice', { c, q }));
  if (category.clues.length > 1) links.appendChild(button('🗑 Remove Clue', 'remove-clue', { c, q }, 'ocs__btn small alert-red'));
  box.appendChild(links);
  return box;
}

function drawCategory(category, c) {
  const card = el('fieldset', 'ocs__card');
  card.appendChild(el('legend', 'ocs__section-title', `Category ${c + 1}`));
  card.append(
    field('Category name', `c.${c}.name`, category.name, { maxLength: 40 }),
    field('Category picture', `c.${c}.icon`, category.icon, { maxLength: 8 }),
  );
  category.clues.forEach((clue, q) => card.appendChild(drawClue(clue, c, q, category)));
  const links = el('div', 'ocs__links');
  if (category.clues.length < MAX_CLUES) links.appendChild(button('➕ Add Clue', 'add-clue', { c }));
  if (draft.categories.length > 1) links.appendChild(button('🗑 Remove Category', 'remove-category', { c }, 'ocs__btn small alert-red'));
  card.appendChild(links);
  return card;
}

function drawForm() {
  form.elements.name.value = draft.name;
  form.elements.level.value = draft.level;
  $('[data-edit-title]').textContent = editingId ? `Edit: ${draft.name}` : 'New Board';
  $('[data-categories]').replaceChildren(...draft.categories.map(drawCategory));
  $('[data-action="add-category"]').hidden = draft.categories.length >= MAX_CATEGORIES;
}

// Copies every input back into the draft.
function readForm() {
  draft.name = form.elements.name.value.trim();
  draft.level = form.elements.level.value;
  form.querySelectorAll('[data-path]').forEach((input) => {
    const p = input.dataset.path.split('.');
    const category = draft.categories[Number(p[1])];
    if (p.length === 3) { category[p[2]] = input.value.trim(); return; }
    const clue = category.clues[Number(p[3])];
    if (p[4] === 'answer') { if (input.checked) clue.answer = Number(input.value); return; }
    if (p[4] === 'value') { clue.value = Number(input.value); return; }
    if (p[4] === 'clue') { clue.clue = input.value.trim(); return; }
    clue.choices[Number(p[5])][p[6]] = input.value.trim();
  });
}

async function edit(id) {
  if (id) {
    const { ok, data, message } = await getBoard(id);
    if (!ok) { showList(message); return; }
    draft = { name: data.name, level: data.level, categories: data.categories };
  } else {
    draft = { name: '', level: 'easy', categories: [newCategory()] };
  }
  editingId = id || null;
  drawForm();
  show('edit');
  form.elements.name.focus();
}

async function save(event) {
  event.preventDefault();
  readForm();
  const { ok, message } = await saveBoard(draft, editingId);
  if (!ok) {
    $('[data-message]').textContent = `Not saved yet: ${message || 'please try again.'}`;
    $('[data-message]').hidden = false;
    $('[data-message]').scrollIntoView({ block: 'center' });
    return;
  }
  showList(`Saved "${draft.name}". Members can play it now.`);
}

// ---------- Buttons ----------

root.addEventListener('click', async (event) => {
  const b = event.target.closest('[data-action]');
  if (!b) return;
  const { action } = b.dataset;
  const c = Number(b.dataset.c);
  const q = Number(b.dataset.q);

  if (action === 'new') edit(null);
  if (action === 'edit') edit(Number(b.dataset.id));
  if (action === 'cancel') showList();
  if (action === 'remove') {
    if (!window.confirm(`Remove the board "${b.dataset.name}"? Members won't be able to play it anymore.`)) return;
    const { ok, message } = await deleteBoard(Number(b.dataset.id));
    showList(ok ? 'Board removed.' : message);
  }

  // Shape changes: keep what was typed, change the draft, then redraw.
  const shape = ['add-category', 'remove-category', 'add-clue', 'remove-clue', 'add-choice', 'remove-choice'];
  if (!shape.includes(action)) return;
  readForm();
  if (action === 'add-category') draft.categories.push(newCategory());
  if (action === 'remove-category') draft.categories.splice(c, 1);
  if (action === 'add-clue') {
    const clues = draft.categories[c].clues;
    clues.push(newClue(VALUES[Math.min(clues.length, VALUES.length - 1)]));
  }
  if (action === 'remove-clue') draft.categories[c].clues.splice(q, 1);
  if (action === 'add-choice') draft.categories[c].clues[q].choices.push({ emoji: '', label: '' });
  if (action === 'remove-choice') {
    const clue = draft.categories[c].clues[q];
    clue.choices.pop();
    clue.answer = Math.min(clue.answer, clue.choices.length - 1);
  }
  drawForm();
});

form.addEventListener('submit', save);

// ---------- Start up: volunteers and staff only ----------

currentMember().then((member) => {
  if (!member) { show('none', 'Please sign in with your volunteer account to edit boards.'); return; }
  if (!member.active || !EDITOR_ROLES.includes(member.role)) {
    show('none', 'Only volunteers and staff can edit boards. You can still play Jeopardy!');
    return;
  }
  showList();
});
