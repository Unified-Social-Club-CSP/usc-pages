// Club Trivia: solo practice, one question at a time, Kahoot style.
// Each of the 4 answers has its own color AND shape (triangle, diamond, circle,
// square), so nobody has to tell colors apart. The timer can be
// turned off. The rules come first and never touch the page, so they can be
// tested on their own; the live club-night rooms will reuse them later.
// The page is built only from OCS classes: the four answer colors are the OCS
// button tones (alert-red, accent, alert-yellow, alert-green).
import { TRIVIA_QUESTIONS } from './trivia-data.js';
import { shuffle } from './bingo/engine.js';
import { loadProgress, saveProgress } from './progress.js';
import { currentMember } from './account.js';
import { canSpeak, speak, stopSpeaking } from './voice.js';

export const POINTS = 100;      // points for each right answer
export const TIME_LIMIT = 20;   // seconds per question when the timer is on
export const SHAPES = [
  { name: 'Triangle', symbol: '▲', tone: 'alert-red' },
  { name: 'Diamond', symbol: '◆', tone: 'accent' },
  { name: 'Circle', symbol: '●', tone: 'alert-yellow' },
  { name: 'Square', symbol: '■', tone: 'alert-green' },
];

// ---------- Rules ----------

export function newRun() {
  return { score: 0, right: 0, answered: 0, streak: 0, bestStreak: 0, correct: false };
}

// The run after one answer. choiceIndex is -1 when time ran out.
// Returns a new object; a wrong answer only resets the streak.
export function scoreQuestion(run, question, choiceIndex) {
  const correct = choiceIndex === question.answer;
  const streak = correct ? run.streak + 1 : 0;
  return {
    score: run.score + (correct ? POINTS : 0),
    right: run.right + (correct ? 1 : 0),
    answered: run.answered + 1,
    streak,
    bestStreak: Math.max(run.bestStreak, streak),
    correct,
  };
}

// A friendly line for the end screen. Every result gets praise.
export function cheer(right, total) {
  if (right === total) return 'Perfect score! 🌟';
  if (right >= total * 0.7) return 'Great job! 🎉';
  if (right >= total * 0.4) return 'Nice work! 👏';
  return 'Good practice! Try again any time. 💪';
}

// ---------- The page ----------

const app = globalThis.document?.getElementById('trivia-app');
const $ = (sel) => app.querySelector(sel);

const game = {
  questions: [],
  index: 0,             // question on screen
  run: newRun(),
  answered: false,
  timerOn: true,
  timeLeft: TIME_LIMIT,
  timer: null,
  canSpeak,
  voice: false,         // read-aloud starts Off; the button turns it on
};

let stats = { played: 0, bestScore: 0, bestStreak: 0 };

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
  const text = stats.played
    ? `Games played: ${stats.played} · Best score: ${stats.bestScore} · Best streak: ${stats.bestStreak}`
    : '';
  app.querySelectorAll('[data-stats]').forEach((line) => { line.textContent = text; });
}

const question = () => game.questions[game.index];

// ---------- Timer ----------

function showTime() {
  $('[data-time-left]').textContent = String(game.timeLeft);
}

function startTimer() {
  clearInterval(game.timer);
  $('[data-timer]').hidden = !game.timerOn;
  if (!game.timerOn) return;
  game.timeLeft = TIME_LIMIT;
  showTime();
  game.timer = setInterval(() => {
    game.timeLeft -= 1;
    showTime();
    if (game.timeLeft <= 0) answer(-1);
  }, 1000);
}

// ---------- A question ----------

function showBar() {
  $('[data-progress]').textContent = `${game.index + 1} of ${game.questions.length}`;
  $('[data-score]').textContent = String(game.run.score);
  $('[data-streak]').textContent = `🔥 ${game.run.streak}`;
}

function readQuestion() {
  const q = question();
  const options = q.choices.map((c, i) => `${SHAPES[i].name}: ${c.label}.`).join(' ');
  say(`${q.question} ${options}`);
}

function showQuestion() {
  const q = question();
  game.answered = false;
  showBar();
  $('[data-question]').textContent = q.question;
  $('[data-result]').hidden = true;

  // Kahoot-style tiles: shape, picture, and words on a filled OCS button.
  $('[data-answers]').replaceChildren(...q.choices.map((choice, i) => {
    const shape = SHAPES[i];
    const button = el('button', `ocs__btn large ${shape.tone} fill`, `${shape.symbol} ${choice.label}`);
    button.type = 'button';
    button.dataset.action = 'answer';
    button.dataset.choice = i;
    button.setAttribute('aria-label', `${shape.name}: ${choice.label}`);
    return button;
  }));
  show('question');
  startTimer();
  if (game.voice) readQuestion();
}

function answer(choiceIndex) {
  if (game.answered) return;
  game.answered = true;
  clearInterval(game.timer);
  const q = question();
  game.run = scoreQuestion(game.run, q, choiceIndex);
  showBar();

  // Mark the right answer (and a wrong pick) with words, not just color.
  // The right one stays bright but can't be pressed again; the rest are disabled.
  app.querySelectorAll('[data-answers] .ocs__btn').forEach((button, i) => {
    if (i === q.answer) {
      button.textContent = `✓ ${button.textContent}`;
      delete button.dataset.action;
    } else {
      if (i === choiceIndex) button.textContent = `✗ ${button.textContent} (your answer)`;
      button.disabled = true;
    }
  });

  const right = q.choices[q.answer];
  let message = `Nice try! The answer was ${SHAPES[q.answer].symbol} ${right.label}.`;
  if (choiceIndex === -1) message = `Time's up! The answer was ${SHAPES[q.answer].symbol} ${right.label}.`;
  if (game.run.correct) {
    message = game.run.streak >= 3
      ? `Yes! +${POINTS} points. ${game.run.streak} in a row! 🔥`
      : `Yes! That's right. +${POINTS} points.`;
  }
  $('[data-feedback]').textContent = message;
  if (game.voice) say(game.run.correct ? "Yes! That's right." : `${choiceIndex === -1 ? "Time's up!" : 'Nice try!'} The answer was ${right.label}.`);

  const next = $('[data-action="next"]');
  next.textContent = game.index + 1 < game.questions.length ? 'Next Question' : 'See My Score';
  $('[data-result]').hidden = false;
  next.focus();
}

// ---------- Start and finish ----------

function startGame() {
  Object.assign(game, { questions: shuffle(TRIVIA_QUESTIONS, Math.random), index: 0, run: newRun() });
  showQuestion();
}

function finish() {
  clearInterval(game.timer);
  stopSpeaking();
  const total = game.questions.length;
  const { right, score, bestStreak } = game.run;
  $('[data-cheer]').textContent = cheer(right, total);
  $('[data-summary]').textContent = `You got ${right} of ${total} right. Score: ${score}. Best streak: ${bestStreak}.`;

  stats.played += 1;
  stats.bestScore = Math.max(stats.bestScore, score);
  stats.bestStreak = Math.max(stats.bestStreak, bestStreak);
  saveProgress('trivia', stats);
  showStats();
  show('end');
  if (game.voice) say(`You got ${right} of ${total} right. ${cheer(right, total).replace(/[^\w\s!.']/gu, '')}`);
}

// ---------- Buttons ----------

function onClick(event) {
  const button = event.target.closest('[data-action]');
  if (!button || button.disabled) return;
  const action = button.dataset.action;

  if (action === 'start') startGame();
  if (action === 'answer') answer(Number(button.dataset.choice));
  if (action === 'read') readQuestion();
  if (action === 'next') {
    if (game.index + 1 < game.questions.length) {
      game.index += 1;
      showQuestion();
    } else {
      finish();
    }
  }
  if (action === 'quit') {
    clearInterval(game.timer);
    stopSpeaking();
    show('start');
  }
  if (action === 'timer') {
    game.timerOn = !game.timerOn;
    button.textContent = `⏱️ Timer: ${game.timerOn ? `On (${TIME_LIMIT} seconds)` : 'Off'}`;
    button.setAttribute('aria-pressed', String(game.timerOn));
  }
  if (action === 'voice') {
    game.voice = !game.voice;
    button.textContent = `🔊 Read Questions Out Loud: ${game.voice ? 'On' : 'Off'}`;
    button.setAttribute('aria-pressed', String(game.voice));
    if (!game.voice) stopSpeaking();
  }
}

// ---------- Start up ----------

if (app) {
  app.addEventListener('click', onClick);

  // Without speech, say so on the buttons instead of hiding them.
  if (!game.canSpeak) {
    app.querySelectorAll('[data-action="voice"], [data-action="read"]').forEach((b) => {
      b.textContent = 'Reading out loud: Not available';
      b.disabled = true;
    });
  }

  (async () => {
    const saved = await loadProgress('trivia');
    if (saved && typeof saved.played === 'number') stats = { ...stats, ...saved };
    showStats();
  })();

  currentMember().then((member) => {
    $('[data-account]').textContent = member
      ? 'You are signed in, so your scores are saved to your account.'
      : 'Sign in to save your scores on any computer.';
  });
}
