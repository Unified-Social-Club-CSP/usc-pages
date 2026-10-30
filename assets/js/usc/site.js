// Unified Social Club: shared page behavior (loaded by _includes/usc/header.html).
import { baseurl } from '../api/config.js';
import { currentMember } from './account.js';

// ---- Text size: the OCS font-size preference ----
// OCS keeps each visitor's theme in localStorage 'sitePreferences' and applies it on
// every page (assets/js/user-preferences.js). The dashboard's Font Size slider
// (12 to 22px) writes the same "size" field; these buttons only change that field.
// "Normal" removes it again, so the page goes back to the stock OCS text size.
const PREF_KEY = 'sitePreferences';
const SIZES = { large: 18, xlarge: 22 };
const sizeButtons = document.querySelectorAll('[data-size]');

function readPrefs() {
  try { return JSON.parse(localStorage.getItem(PREF_KEY)) || {}; } catch (e) { return {}; }
}

// The chosen button is a filled OCS button (and aria-pressed for screen readers).
function showSize(px) {
  const name = Object.keys(SIZES).filter((key) => SIZES[key] <= px).pop() || 'normal';
  sizeButtons.forEach((b) => {
    const on = b.dataset.size === name;
    b.classList.toggle('fill', on);
    b.setAttribute('aria-pressed', String(on));
  });
}

function setSize(name) {
  const prefs = { ...readPrefs() };
  if (SIZES[name]) prefs.size = SIZES[name]; else delete prefs.size;
  const empty = !Object.keys(prefs).length;
  try {
    if (empty) localStorage.removeItem(PREF_KEY); else localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
    localStorage.removeItem('preferencesReset');
  } catch (e) { /* storage blocked: still change this page */ }
  if (empty) window.SitePreferences?.resetPreferences();
  else window.SitePreferences?.applyPreferences(prefs);
  showSize(prefs.size || 0);
}

showSize(Number(readPrefs().size) || 0);
sizeButtons.forEach((button) => {
  button.addEventListener('click', () => setSize(button.dataset.size));
});

// ---- Nod to select (hands-free play), remembered between pages ----
// The camera code only loads once a member turns it on.
const NOD_KEY = 'usc-nod-select';
const nodButtons = document.querySelectorAll('[data-nod-toggle]');
let nodModule = null;

function pressNod(on) {
  nodButtons.forEach((b) => {
    b.classList.toggle('fill', on);
    b.setAttribute('aria-pressed', String(on));
  });
}

function showNod(on) {
  pressNod(on);
  try { localStorage.setItem(NOD_KEY, on ? 'on' : 'off'); } catch (e) { /* storage blocked */ }
}

async function setNod(on) {
  showNod(on);
  if (!on) { nodModule?.stop(); return; }
  nodModule = nodModule || await import('./access/nod-select.js');
  const started = await nodModule.start(() => setNod(false));
  if (!started) showNod(false); // camera refused: stay off on the next page too
}

nodButtons.forEach((button) => {
  button.addEventListener('click', () => setNod(button.getAttribute('aria-pressed') !== 'true'));
});
try { if (localStorage.getItem(NOD_KEY) === 'on') setNod(true); } catch (e) { /* storage blocked */ }

// ---- Show who is signed in on the OCS Login button ----
// OCS login.js fills #loginArea from /api/id, which refuses accounts still waiting
// for approval, so those members would see "Login". Fill it in for them once
// login.js is done (it sets opacity to 1).
currentMember().then((member) => {
  if (!member || !member.name) return; // not signed in: keep "Login"
  let tries = 0;
  const timer = setInterval(() => {
    const loginArea = document.getElementById('loginArea');
    tries += 1;
    if (!loginArea || tries > 50) { clearInterval(timer); return; }
    if (loginArea.style.opacity !== '1') return;
    clearInterval(timer);
    if (loginArea.querySelector('.dropbtn')) return; // OCS already shows the name
    const link = document.createElement('a');
    link.className = 'page-link';
    link.href = `${baseurl}/login/#account`;
    link.textContent = `Hi, ${String(member.name).split(' ')[0]}`;
    loginArea.replaceChildren(link);
  }, 100);
});
