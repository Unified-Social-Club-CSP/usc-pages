// Unified Social Club: shared page behavior (loaded by _includes/usc/header.html).
import { baseurl } from '../api/config.js';
import { currentMember } from './account.js';

// ---- Text size (saved between visits) ----
// Sets --usc-size, which .usc-site uses as its base font size.
const SIZE_KEY = 'usc-text-size';
const SIZES = { normal: '20px', large: '23px', xlarge: '26px' };
const sizeButtons = document.querySelectorAll('[data-size]');

function applySize(size) {
  document.documentElement.style.setProperty('--usc-size', SIZES[size] || SIZES.normal);
  sizeButtons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.size === size)));
}

let savedSize = 'normal';
try { savedSize = localStorage.getItem(SIZE_KEY) || 'normal'; } catch (e) { /* storage blocked */ }
applySize(savedSize);

sizeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    applySize(button.dataset.size);
    try { localStorage.setItem(SIZE_KEY, button.dataset.size); } catch (e) { /* storage blocked */ }
  });
});

// ---- Nod to select (hands-free play), remembered between pages ----
// The camera code only loads once a member turns it on.
const NOD_KEY = 'usc-nod-select';
const nodButtons = document.querySelectorAll('[data-nod-toggle]');
let nodModule = null;

function showNod(on) {
  nodButtons.forEach((b) => b.setAttribute('aria-pressed', String(on)));
  try { localStorage.setItem(NOD_KEY, on ? 'on' : 'off'); } catch (e) { /* storage blocked */ }
}

async function setNod(on) {
  showNod(on);
  if (!on) { nodModule?.stop(); return; }
  nodModule = nodModule || await import('./access/nod-select.js');
  const started = await nodModule.start(() => setNod(false));
  if (!started) nodButtons.forEach((b) => b.setAttribute('aria-pressed', 'false'));
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
