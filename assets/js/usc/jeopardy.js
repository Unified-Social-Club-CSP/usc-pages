// Club Jeopardy: 2 to 4 teams take turns picking a square on the board.
// Each clue has 3 picture answers. A right answer adds the square's points;
// a wrong answer costs nothing. The rules come first and never touch the page,
// so they can be tested on their own; the page code below them only runs on
// the Jeopardy page. The page is built only from OCS classes (ocs__grid,
// ocs__btn, ocs__stats, ocs__callout, ocs__table), so it follows the OCS theme.
import { JEOPARDY_CATEGORIES } from './jeopardy-data.js';
import { loadProgress, saveProgress } from './progress.js';
import { currentMember } from './account.js';
import { canSpeak, speak, stopSpeaking } from './voice.js';
import { EDITOR_ROLES, getBoard, listBoards, recentResults, saveResult } from './jeopardy-api.js';

export const MIN_TEAMS = 2;
export const MAX_TEAMS = 4;
// Each team's color is a picture next to its name, so color is never the only clue.
export const TEAM_MARKS = ['🟦', '🟥', '🟩', '🟪'];

// ---------- Rules ----------

// Teams start at 0 points and are named Team 1, Team 2, and so on.
export function makeTeams(count) {
  const n = Math.min(MAX_TEAMS, Math.max(MIN_TEAMS, Number(count) || MIN_TEAMS));
  return Array.from({ length: n }, (_, i) => ({ name: `Team ${i + 1}`, mark: TEAM_MARKS[i], score: 0 }));
}

// Scores after one answer (our CPT procedure).
// teams: [{ name, score }], teamIndex: whose turn it is, clue: { value, answer },
// choiceIndex: the answer they picked. Returns a new list of scores and leaves
// `teams` unchanged. Only the team that answered can gain points, and only when
// they are right; a wrong answer changes nothing (no penalty).
export function scoreAnswer(teams, teamIndex, clue, choiceIndex) {
  const correct = choiceIndex === clue.answer;
  const scores = [];
  for (let i = 0; i < teams.length; i += 1) {
    if (correct && i === teamIndex) {
      scores.push(teams[i].score + clue.value);
    } else {
      scores.push(teams[i].score);
    }
  }
  return scores;
}

// Whose turn is next: every team gets a turn, then back to Team 1.
export function nextTurn(teamIndex, teamCount) {
  return (teamIndex + 1) % teamCount;
}

// The team or teams with the most points (more than one means a tie).
export function leaders(teams) {
  const top = Math.max(...teams.map((t) => t.score));
  return teams.filter((t) => t.score === top);
}

export function clueCount(categories) {
  return categories.reduce((sum, c) => sum + c.clues.length, 0);
}

// ---------- The page ----------

const app = globalThis.document?.getElementById('jeopardy-app');
const $ = (sel) => app.querySelector(sel);

const game = {
  categories: JEOPARDY_CATEGORIES,
  boardId: null,        // a board from the club server, or null for the offline board
  teamCount: 2,
  teams: [],
  turn: 0,              // index of the team whose turn it is
  used: new Set(),      // squares already played, as "col-row"
  clue: null,           // { col, row } of the open clue
  answered: false,
  canSpeak,
  voice: false,         // read-aloud starts Off; the button turns it on
};

let stats = { played: 0, highScore: 0 };

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function show(screen) {
  app.querySelectorAll('[data-screen]').forEach((s) => { s.hidden = s.dataset.screen !== screen; });
  app.scrollIntoView({ block: 'start', behavior: 'smooth' });
}

const say = speak; // shared voice: assets/js/usc/voice.js

function showStats() {
  const text = stats.played ? `Games played: ${stats.played} · Highest team score: ${stats.highScore}` : '';
  app.querySelectorAll('[data-stats]').forEach((line) => { line.textContent = text; });
}

const openClue = () => game.categories[game.clue.col].clues[game.clue.row];
const teamLabel = (team) => `${team.mark} ${team.name}`;
const sentence = (text) => (/[.!?]$/.test(text) ? text : `${text}.`);

// ---------- Scores and board ----------

// One OCS stat box per team; the team whose turn it is gets a "Your turn" pill.
function renderScores() {
  $('[data-scores]').replaceChildren(...game.teams.map((team, i) => {
    const box = el('div', 'ocs__stat');
    box.append(el('span', 'ocs__stat-value', String(team.score)), el('span', 'ocs__stat-label', teamLabel(team)));
    if (i === game.turn) box.appendChild(el('span', 'ocs__status', '⭐ Your turn'));
    return box;
  }));
}

// The board is one OCS standard grid (3 columns): a header cell for each
// category, then its 100, 200, and 300 squares as grid-cell buttons.
function renderBoard() {
  const cells = [];
  game.categories.forEach((category, col) => {
    cells.push(el('div', 'ocs__grid-cell ocs__grid-cell--header', `${category.icon} ${category.name}`));
    category.clues.forEach((clue, row) => {
      const used = game.used.has(`${col}-${row}`);
      const square = el('button', `ocs__grid-cell${used ? ' ocs__grid-cell--muted' : ''}`);
      square.type = 'button';
      square.disabled = used;
      square.appendChild(el('span', 'ocs__stat-value', used ? '✓' : String(clue.value)));
      square.setAttribute('aria-label', `${category.name}, ${clue.value} points${used ? ', already played' : ''}`);
      if (!used) {
        square.dataset.action = 'pick';
        square.dataset.col = col;
        square.dataset.row = row;
      }
      cells.push(square);
    });
  });
  $('[data-board]').replaceChildren(...cells);
}

function showBoard() {
  const team = game.teams[game.turn];
  $('[data-turn]').textContent = `${teamLabel(team)}, pick a square!`;
  renderScores();
  renderBoard();
  show('board');
  if (game.voice) say(`${team.name}, pick a square.`);
}

// ---------- A clue ----------

function readClue() {
  const clue = openClue();
  const options = clue.choices.map((c) => c.label).join(', or, ');
  say(`${clue.clue} Is it: ${options}?`);
}

function pick(col, row) {
  if (game.used.has(`${col}-${row}`)) return;
  game.clue = { col, row };
  game.answered = false;
  const category = game.categories[col];
  const clue = openClue();
  $('[data-clue-head]').textContent = `${teamLabel(game.teams[game.turn])} · ${category.name} · ${clue.value} points`;
  $('[data-clue-text]').textContent = clue.clue;
  $('[data-result]').hidden = true;

  $('[data-choices]').replaceChildren(...clue.choices.map((choice, i) => {
    const button = el('button', 'ocs__btn large accent', `${choice.emoji} ${choice.label}`);
    button.type = 'button';
    button.dataset.action = 'answer';
    button.dataset.choice = i;
    return button;
  }));
  show('clue');
  if (game.voice) readClue();
}

function answer(choiceIndex) {
  if (game.answered) return;
  game.answered = true;
  const clue = openClue();
  const team = game.teams[game.turn];
  const correct = choiceIndex === clue.answer;

  const scores = scoreAnswer(game.teams, game.turn, clue, choiceIndex);
  scores.forEach((score, i) => { game.teams[i].score = score; });
  game.used.add(`${game.clue.col}-${game.clue.row}`);
  game.turn = nextTurn(game.turn, game.teams.length);

  // The right answer turns green with a check mark (words, not just color).
  // It stays bright but can't be pressed again; the other answers are disabled.
  app.querySelectorAll('[data-choices] .ocs__btn').forEach((button, i) => {
    if (i === clue.answer) {
      button.className = 'ocs__btn large alert-green fill';
      button.textContent = `✓ ${button.textContent}`;
      delete button.dataset.action;
    } else {
      if (i === choiceIndex) button.className = 'ocs__btn large alert-red';
      button.disabled = true;
    }
  });

  const right = clue.choices[clue.answer];
  $('[data-feedback]').textContent = correct
    ? `Yes! ${right.emoji} ${right.label} is right. ${team.name} gets ${clue.value} points!`
    : `Nice try! The answer was ${sentence(`${right.emoji} ${right.label}`)}`;
  if (game.voice) say(correct ? `Yes! ${team.name} gets ${clue.value} points!` : `Nice try! The answer was ${sentence(right.label)}`);

  const next = $('[data-action="next"]');
  next.textContent = game.used.size >= clueCount(game.categories)
    ? 'See the Scores'
    : `Next: ${teamLabel(game.teams[game.turn])}'s Turn`;
  $('[data-result]').hidden = false;
  next.focus();
}

// ---------- Boards from the club server ----------

// One button per board. If the server can't be reached, the offline Club Life
// board (jeopardy-data.js) is the only choice, so the game always works.
async function loadBoards() {
  const { ok, data } = await listBoards();
  const boards = ok && Array.isArray(data) && data.length ? data : [];
  const buttons = boards.map((board) => {
    const button = el('button', 'ocs__btn large pill accent', `${board.name} · ${board.level === 'harder' ? 'Harder' : 'Easy'}`);
    button.type = 'button';
    button.dataset.action = 'board';
    button.dataset.id = board.id;
    return button;
  });
  if (!buttons.length) {
    const offline = el('button', 'ocs__btn large pill accent', 'Club Life · Easy (offline)');
    offline.type = 'button';
    offline.dataset.action = 'board';
    offline.dataset.id = '';
    buttons.push(offline);
  }
  $('[data-boards]').replaceChildren(...buttons);
  setBoard(buttons[0].dataset.id);
}

// The chosen board is a filled button (and aria-pressed for screen readers).
function setBoard(id) {
  game.boardId = id ? Number(id) : null;
  app.querySelectorAll('[data-action="board"]').forEach((b) => {
    const on = b.dataset.id === String(id);
    b.classList.toggle('fill', on);
    b.setAttribute('aria-pressed', String(on));
  });
}

// Saves the finished game (signed-in members only), then shows the last games
// played on this board. The server checks the scores before keeping them.
async function saveAndShowRecent(member) {
  if (!game.boardId) return;
  if (member) await saveResult(game.boardId, game.teams.map(({ name, score }) => ({ name, score })));
  const { ok, data } = await recentResults(game.boardId);
  const box = $('[data-recent]');
  box.hidden = !(ok && data.length);
  if (box.hidden) return;
  $('[data-recent-rows]').replaceChildren(...data.map((result) => {
    const row = el('tr');
    const when = result.played_at ? new Date(`${result.played_at}Z`).toLocaleDateString() : '';
    row.append(
      el('td', '', result.winners.join(' and ')),
      el('td', '', result.teams.map((t) => `${t.name}: ${t.score}`).join(', ')),
      el('td', '', when),
    );
    return row;
  }));
}

// ---------- Start and finish ----------

async function startGame() {
  game.categories = JEOPARDY_CATEGORIES;
  if (game.boardId) {
    const { ok, data } = await getBoard(game.boardId);
    if (ok) game.categories = data.categories;
    else game.boardId = null; // board gone or server down: play the offline board
  }
  Object.assign(game, { teams: makeTeams(game.teamCount), turn: 0, used: new Set(), clue: null });
  showBoard();
}

function finish() {
  stopSpeaking();
  const top = leaders(game.teams);
  const headline = top.length === 1
    ? `${top[0].name} wins with ${top[0].score} points!`
    : `It's a tie! ${top.map((t) => t.name).join(' and ')} have ${top[0].score} points.`;
  $('[data-winner]').textContent = `${top.length === 1 ? '🏆' : '🤝'} ${headline}`;

  const ranked = [...game.teams].sort((a, b) => b.score - a.score);
  $('[data-final]').replaceChildren(...ranked.map((team) => {
    const row = el('tr');
    row.append(el('td', '', teamLabel(team)), el('td', '', String(team.score)));
    return row;
  }));

  stats.played += 1;
  stats.highScore = Math.max(stats.highScore, top[0].score);
  saveProgress('jeopardy', stats);
  showStats();
  $('[data-recent]').hidden = true;
  currentMember().then(saveAndShowRecent);
  show('final');
  if (game.voice) say(`${headline} Great job, everybody!`);
}

// The chosen team count is a filled button (and aria-pressed for screen readers).
function setTeamCount(count) {
  game.teamCount = count;
  app.querySelectorAll('[data-action="teams"]').forEach((b) => {
    const on = Number(b.dataset.count) === count;
    b.classList.toggle('fill', on);
    b.setAttribute('aria-pressed', String(on));
  });
}

// ---------- Buttons ----------

function onClick(event) {
  const button = event.target.closest('[data-action]');
  if (!button || button.disabled) return;
  const action = button.dataset.action;

  if (action === 'teams') setTeamCount(Number(button.dataset.count));
  if (action === 'board') setBoard(button.dataset.id);
  if (action === 'start' || action === 'again') startGame();
  if (action === 'pick') pick(Number(button.dataset.col), Number(button.dataset.row));
  if (action === 'answer') answer(Number(button.dataset.choice));
  if (action === 'read') readClue();
  if (action === 'next') {
    if (game.used.size >= clueCount(game.categories)) finish(); else showBoard();
  }
  if (action === 'quit') finish();
  if (action === 'setup') show('setup');
  if (action === 'voice') {
    game.voice = !game.voice;
    button.textContent = `🔊 Read Clues Out Loud: ${game.voice ? 'On' : 'Off'}`;
    button.setAttribute('aria-pressed', String(game.voice));
    if (!game.voice) stopSpeaking();
  }
}

// ---------- Start up ----------

if (app) {
  app.addEventListener('click', onClick);
  setTeamCount(game.teamCount);
  loadBoards();

  // Without speech, say so on the buttons instead of hiding them.
  if (!game.canSpeak) {
    app.querySelectorAll('[data-action="voice"], [data-action="read"]').forEach((b) => {
      b.textContent = 'Reading out loud: Not available';
      b.disabled = true;
    });
  }

  (async () => {
    const saved = await loadProgress('jeopardy');
    if (saved && typeof saved.played === 'number') stats = { ...stats, ...saved };
    showStats();
  })();

  currentMember().then((member) => {
    $('[data-account]').textContent = member
      ? 'You are signed in, so your games are saved to your account.'
      : 'Sign in to save your games on any computer.';
    $('[data-editor-link]').hidden = !(member && member.active && EDITOR_ROLES.includes(member.role));
  });
}
