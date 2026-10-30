// The interest survey on the profile page.
// Answers are always kept in this browser. When the member is signed in they are
// also saved to their account on the usc-flask backend (/api/usc/profile/interests),
// which uses them, added up without names, to help volunteers plan events.
import { pythonURI, fetchOptions, baseurl } from '../api/config.js';
import { currentMember } from './account.js';

const SITE = baseurl;
const LOCAL_KEY = 'usc-interests';

// The same questions and answer keys the backend accepts (model/usc_interests.py).
export const QUESTIONS = [
  {
    key: 'activities', many: true,
    text: 'What do you like to do at club?', note: 'Pick all you like.',
    options: [
      ['games', '🃏 Board and card games'], ['art', '🎨 Arts and crafts'], ['karaoke', '🎤 Karaoke'],
      ['sports', '🏀 Sports'], ['events', '🎩 Special events, like magic shows'],
    ],
  },
  {
    key: 'online', many: true,
    text: 'What would you like to do on this website?', note: 'Pick all you like.',
    options: [
      ['dates', '📅 See club dates'], ['bingo', '🎱 Play Bingo'], ['messages', '💬 Talk to a volunteer'],
    ],
  },
  {
    key: 'comfort', many: false,
    text: 'How easy is it for you to use a phone or computer?',
    options: [['starting', '🙂 It is hard for me'], ['okay', '😀 It is okay'], ['comfortable', '🤩 It is easy']],
  },
  {
    key: 'helper', many: false,
    text: 'Who helps you use this website?',
    options: [['self', 'I use it by myself'], ['family', 'A family member'], ['aide', 'An aide or staff member']],
  },
  {
    key: 'reminders', many: false,
    text: 'How should we remind you about club dates?',
    options: [['email', '✉️ Email'], ['phone', '📞 Phone call'], ['none', 'No reminders']],
  },
  {
    key: 'role', many: false,
    text: 'Who are you?',
    options: [['member', 'I am a club member'], ['family', 'I am family or an aide'], ['volunteer', 'I want to volunteer']],
  },
];

const form = document.getElementById('interest-survey');
const questionsBox = form.querySelector('[data-questions]');
const message = form.querySelector('[data-form-message]');
const statusText = document.querySelector('[data-status-text]');
const results = document.querySelector('[data-results]');
const recBox = document.querySelector('[data-recommendations]');
let signedIn = false;
let answers = {};

// Messages start with ✅ or ⚠️, so they never rely on color.
function say(text, kind = '') {
  const icon = { ok: '✅ ', error: '⚠️ ' }[kind] || '';
  message.textContent = text ? `${icon}${text}` : '';
}

function readLocal() {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY)) || {}; } catch (e) { return {}; }
}
function writeLocal(data) {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(data)); } catch (e) { /* storage blocked */ }
}

// Build each question as a group of big OCS pill buttons (filled when picked).
function renderQuestions() {
  questionsBox.replaceChildren();
  QUESTIONS.forEach((q, i) => {
    const group = document.createElement('div');
    group.setAttribute('role', 'group');
    group.setAttribute('aria-labelledby', `question-${q.key}`);
    const heading = document.createElement('h3');
    heading.id = `question-${q.key}`;
    heading.textContent = `${i + 1}. ${q.text}${q.note ? ` ${q.note}` : ''}`;
    group.appendChild(heading);
    const row = document.createElement('div');
    row.className = 'ocs__links';
    q.options.forEach(([value, label]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'ocs__btn large pill accent';
      button.textContent = label;
      button.dataset.value = value;
      button.addEventListener('click', () => choose(q, value));
      row.appendChild(button);
    });
    group.appendChild(row);
    group.dataset.key = q.key;
    questionsBox.appendChild(group);
  });
  showAnswers();
}

function choose(q, value) {
  if (q.many) {
    const current = new Set(answers[q.key] || []);
    if (current.has(value)) current.delete(value); else current.add(value);
    answers[q.key] = q.options.map(([v]) => v).filter((v) => current.has(v));
  } else {
    answers[q.key] = answers[q.key] === value ? undefined : value;
  }
  if (answers[q.key] === undefined || (Array.isArray(answers[q.key]) && !answers[q.key].length)) delete answers[q.key];
  say('');
  showAnswers();
}

function showAnswers() {
  questionsBox.querySelectorAll('[data-key]').forEach((group) => {
    const picked = answers[group.dataset.key];
    group.querySelectorAll('[data-value]').forEach((button) => {
      const on = Array.isArray(picked) ? picked.includes(button.dataset.value) : picked === button.dataset.value;
      button.classList.toggle('fill', on);
      button.setAttribute('aria-pressed', String(on));
    });
  });
}

// Turn the answers into a short list of pages to try.
export function recommend(a) {
  const activities = a.activities || [];
  const online = a.online || [];
  const recs = [];
  const add = (href, icon, title, text) => { if (!recs.some((r) => r.href === href)) recs.push({ href, icon, title, text }); };
  if (online.includes('dates') || activities.includes('events')) {
    add('/events/', '📅', 'Club Dates', 'See the next Fridays the club meets.');
  }
  if (online.includes('bingo') || activities.includes('games')) {
    add('/bingo/play/', '🎱', 'Bingo', 'Big-print Bingo with a caller who reads the numbers out loud.');
  }
  if (online.includes('messages')) {
    add('/dm/', '💬', 'Ask a Volunteer', 'Send a private message to a club volunteer.');
  }
  if (a.comfort === 'starting' || a.helper === 'family' || a.helper === 'aide') {
    add('/accessibility/', '🙂', 'Easier Ways to Play', 'Make the words bigger, or play with a nod of your head.');
  }
  if (a.role === 'volunteer') {
    add('https://www.unifiedsocialclub.com/blank-4', '🤝', 'Volunteer', 'Thank you! Sign up on the club\'s volunteer page.');
  }
  if (!recs.length) add('/play/', '⭐', 'Games', 'See the games you can play.');
  // Easier ways to play first for people who find technology hard.
  if (a.comfort === 'starting') recs.sort((x, y) => (y.href === '/accessibility/') - (x.href === '/accessibility/'));
  return recs;
}

function showRecommendations() {
  const recs = recommend(answers);
  // Each recommendation is an OCS grid cell with an OCS button, like the Games page.
  recBox.replaceChildren(...recs.map((r) => {
    const card = document.createElement('div');
    card.className = 'ocs__grid-cell';
    card.innerHTML = '<strong></strong><p></p><a class="ocs__btn large accent fill">Go</a>';
    card.querySelector('strong').textContent = `${r.icon} ${r.title}`;
    card.querySelector('p').textContent = r.text;
    card.querySelector('a').href = r.href.startsWith('http') ? r.href : SITE + r.href;
    return card;
  }));
  results.hidden = false;
}

async function load() {
  answers = readLocal();
  try {
    const user = await currentMember();
    if (user) {
      signedIn = true;
      statusText.textContent = `Signed in as ${user.name}. Your answers are saved to your account.`;
      const response = await fetch(`${pythonURI}/api/usc/profile/interests`, fetchOptions);
      if (response.ok) {
        const body = await response.json();
        if (body.answers) answers = body.answers;
      } else if (response.status === 403) {
        statusText.textContent = `Signed in as ${user.name}. Your account is waiting for a volunteer to approve it, so for now your answers are saved in this browser.`;
        signedIn = false;
      }
    }
  } catch (e) { /* server unreachable: keep the browser copy */ }
  if (!signedIn && !statusText.textContent.includes('waiting')) {
    statusText.innerHTML = `You're not signed in, so your answers are saved in this browser only. <a href="${SITE}/login/">Sign in</a> to keep them on any computer.`;
  }
  renderQuestions();
  if (Object.keys(answers).length) showRecommendations();
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!Object.keys(answers).length) {
    say('Tap at least one answer first.', 'error');
    return;
  }
  writeLocal(answers);
  if (signedIn) {
    say('Saving…');
    try {
      const response = await fetch(`${pythonURI}/api/usc/profile/interests`, {
        ...fetchOptions,
        method: 'PUT',
        body: JSON.stringify({ answers }),
      });
      say(response.ok ? 'Saved to your account.' : 'Saved in this browser. We could not reach your account right now.', response.ok ? 'ok' : 'error');
    } catch (e) {
      say('Saved in this browser. We could not reach your account right now.', 'error');
    }
  } else {
    say('Saved in this browser.', 'ok');
  }
  showRecommendations();
  results.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

load();
