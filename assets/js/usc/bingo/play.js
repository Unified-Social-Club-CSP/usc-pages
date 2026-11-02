// Bingo: solo play with a speaking caller.
// The page is built only from OCS classes (ocs__stats, ocs__grid, ocs__grid-cell,
// ocs__btn, ocs__callout), so it follows the OCS theme. A marked square is an
// accent grid cell with a ✓, and the winning line gets a ⭐, so it never relies on color.
import { LETTERS, FREE, callOrder, makeCard, winningLines, letterFor, spoken } from './engine.js';
import { loadProgress, saveProgress } from '../progress.js';
import { canSpeak, speak, stopSpeaking } from '../voice.js';

const app = document.getElementById('bingo-app');
const $ = (sel) => app.querySelector(sel);

const game = {
  order: [],           // calling order for this game
  card: null,
  count: 0,            // balls called so far
  marked: new Set(),   // numbers the player has marked
  autoMark: true,
  voice: false,        // the caller's voice starts Off; the button turns it on
  paused: false,
  over: false,
  timer: null,
  intervalMs: 10000,
};

let stats = { played: 0, wins: 0, fastest: null };

// ---------- Screens and messages ----------

function show(screen) {
  app.querySelectorAll('[data-screen]').forEach((s) => { s.hidden = s.dataset.screen !== screen; });
}

function gameMessage(text, kind) {
  const box = $('[data-game-message]');
  const icon = { ok: '🎉 ', hint: '💡 ' }[kind] || '';
  box.textContent = text ? `${icon}${text}` : '';
  box.hidden = !text;
}

function showStats() {
  const parts = [`Games played: ${stats.played}`, `Wins: ${stats.wins}`];
  if (stats.fastest) parts.push(`Fastest Bingo: ${stats.fastest} numbers`);
  $('[data-stats]').textContent = stats.played ? parts.join(' · ') : '';
}

// ---------- Card ----------

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

// One square: the number big (ocs__stat-value) and its mark under it.
// Marked squares are accent cells with a ✓; the winning line shows a ⭐.
function paint(cell) {
  const marked = cell.dataset.free === 'true' || game.marked.has(Number(cell.dataset.value));
  cell.className = `ocs__grid-cell${marked ? ' ocs__grid-cell--accent' : ''}`;
  cell.querySelector('.ocs__stat-label').textContent = cell.dataset.win ? '⭐' : (marked ? '✓' : '\u00a0');
  if (cell.dataset.value) cell.setAttribute('aria-pressed', String(marked));
}

// The card is one OCS standard grid with 5 columns: a muted cell for each
// letter, B I N G O, then the 25 squares as grid-cell buttons.
function renderCard() {
  const grid = $('[data-card]');
  grid.replaceChildren();
  LETTERS.forEach((letter) => {
    const head = el('div', 'ocs__grid-cell ocs__grid-cell--muted');
    head.setAttribute('role', 'columnheader');
    head.appendChild(el('span', 'ocs__stat-value', letter));
    grid.appendChild(head);
  });
  for (let row = 0; row < 5; row += 1) {
    for (let col = 0; col < 5; col += 1) {
      const value = game.card[col][row];
      const cell = el('button');
      cell.type = 'button';
      cell.dataset.col = col;
      cell.dataset.row = row;
      cell.append(el('span', 'ocs__stat-value', value === FREE ? 'FREE' : String(value)), el('span', 'ocs__stat-label'));
      if (value === FREE) {
        cell.dataset.free = 'true';
        cell.disabled = true;
        cell.setAttribute('aria-label', 'Free space');
      } else {
        cell.dataset.value = value;
        cell.setAttribute('aria-label', `${letterFor(value)} ${value}`);
        cell.addEventListener('click', () => toggleMark(value, cell));
      }
      paint(cell);
      grid.appendChild(cell);
    }
  }
}

function calledSet() {
  return new Set(game.order.slice(0, game.count));
}

function toggleMark(value, cell) {
  if (game.over) return;
  if (!calledSet().has(value)) {
    gameMessage(`${letterFor(value)} ${value} has not been called yet.`, 'hint');
    return;
  }
  if (game.marked.has(value)) game.marked.delete(value); else game.marked.add(value);
  paint(cell);
}

function refreshMarks() {
  app.querySelectorAll('[data-card] [data-value]').forEach(paint);
}

function highlightLines(lines) {
  lines.flat().forEach(([col, row]) => {
    const cell = app.querySelector(`[data-card] [data-col="${col}"][data-row="${row}"]`);
    if (cell) { cell.dataset.win = 'true'; paint(cell); }
  });
}

// ---------- Calling ----------

function say(text) {
  if (game.voice) speak(text); // shared voice: assets/js/usc/voice.js
}

function showCalls(announce) {
  const called = game.order.slice(0, game.count);
  const latest = called[called.length - 1];
  $('[data-ball]').textContent = latest ? `${letterFor(latest)} ${latest}` : '–';
  $('[data-count]').textContent = `${game.count} of 75`;
  const recent = called.slice(-4, -1).reverse().map((n) => `${letterFor(n)} ${n}`);
  $('[data-recent]').textContent = recent.length ? recent.join(', ') : '–';

  if (game.autoMark) {
    const onCard = new Set(game.card.flat());
    called.forEach((n) => { if (onCard.has(n)) game.marked.add(n); });
    refreshMarks();
  }
  if (announce && latest) say(spoken(latest));
  if (game.count >= 75 && !game.over) gameMessage('All 75 numbers have been called.', 'hint');
}

function callNext() {
  if (game.paused || game.over || game.count >= 75) return;
  game.count += 1;
  showCalls(true);
}

// ---------- Start and finish ----------

function startGame() {
  const seed = Math.floor(Math.random() * 4294967296);
  clearInterval(game.timer);
  Object.assign(game, {
    order: callOrder(seed),
    card: makeCard(seed ^ 0x5bd1e995),
    count: 0,
    marked: new Set(),
    paused: false,
    over: false,
    intervalMs: Number($('[data-speed]').value) * 1000,
  });
  renderCard();
  gameMessage('');
  $('[data-action="pause"]').textContent = 'Pause';
  $('[data-action="bingo"]').disabled = false;
  show('game');
  app.scrollIntoView({ block: 'start', behavior: 'smooth' });
  callNext();
  game.timer = setInterval(callNext, game.intervalMs);
}

function finish(won) {
  game.over = true;
  clearInterval(game.timer);
  $('[data-action="bingo"]').disabled = true;
  stats.played += 1;
  if (won) {
    stats.wins += 1;
    if (!stats.fastest || game.count < stats.fastest) stats.fastest = game.count;
  }
  saveProgress('bingo', stats);
  showStats();
}

function claimBingo() {
  const lines = winningLines(game.card, calledSet());
  if (lines.length) {
    highlightLines(lines);
    gameMessage(`BINGO! You won after ${game.count} numbers.`, 'ok');
    say('Bingo! You won!');
    finish(true);
  } else {
    gameMessage('Not a Bingo yet. You need a full row, column, or diagonal. Keep playing!', 'hint');
  }
}

// ---------- Buttons ----------

app.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const action = button.dataset.action;

  if (action === 'solo') startGame();
  if (action === 'bingo') claimBingo();
  if (action === 'quit') {
    clearInterval(game.timer);
    stopSpeaking();
    show('lobby');
  }
  if (action === 'pause') {
    game.paused = !game.paused;
    button.textContent = game.paused ? 'Resume' : 'Pause';
    gameMessage(game.paused ? 'Paused. Press Resume when you are ready.' : '', 'hint');
  }
  if (action === 'voice') {
    game.voice = !game.voice;
    button.textContent = `🔊 Voice: ${game.voice ? 'On' : 'Off'}`;
    button.setAttribute('aria-pressed', String(game.voice));
    if (!game.voice) stopSpeaking();
  }
  if (action === 'automark') {
    game.autoMark = !game.autoMark;
    button.textContent = `✓ Auto-mark: ${game.autoMark ? 'On' : 'Off'}`;
    button.setAttribute('aria-pressed', String(game.autoMark));
    if (game.autoMark) showCalls(false);
  }
});

// ---------- Start up ----------

if (!canSpeak) {
  const voiceButton = $('[data-action="voice"]');
  voiceButton.textContent = '🔊 Voice: Not available';
  voiceButton.disabled = true;
}

(async () => {
  const saved = await loadProgress('bingo');
  if (saved && typeof saved.played === 'number') stats = { ...stats, ...saved };
  showStats();
})();
