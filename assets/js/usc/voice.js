// Read-aloud for every Unified Social Club game.
// Browsers list many voices and the first one is often robotic, so this picks
// the most natural English voice the device has (the "Enhanced", "Premium", or
// "Natural" voices on Mac, Windows, and Chrome) and speaks at a normal pace.
// Read-aloud starts Off in every game; members turn it on with the game's button.

export const canSpeak = 'speechSynthesis' in globalThis;

// Best first: high-quality voices, then well-known clear voices by name.
const QUALITY = /(premium|enhanced|natural|neural)/i;
const PREFERRED = ['Samantha', 'Ava', 'Allison', 'Google US English', 'Microsoft Aria', 'Microsoft Jenny', 'Karen', 'Daniel'];
const ROBOTIC = /(albert|bad news|bahh|bells|boing|bubbles|cellos|good news|jester|organ|superstar|trinoids|whisper|wobble|zarvox|fred|junior|ralph)/i;

let chosen = null;

function pickVoice() {
  const english = window.speechSynthesis.getVoices()
    .filter((v) => /^en(-|_|$)/i.test(v.lang) && !ROBOTIC.test(v.name));
  if (!english.length) return null;
  const us = (v) => /en[-_]US/i.test(v.lang);
  return english.find((v) => QUALITY.test(v.name) && us(v))
    || english.find((v) => QUALITY.test(v.name))
    || PREFERRED.map((name) => english.find((v) => v.name.startsWith(name))).find(Boolean)
    || english.find(us)
    || english[0];
}

if (canSpeak) {
  chosen = pickVoice();
  // Chrome loads its voice list a moment after the page.
  window.speechSynthesis.addEventListener?.('voiceschanged', () => { chosen = pickVoice(); });
}

export function speak(text) {
  if (!canSpeak) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    if (chosen) { u.voice = chosen; u.lang = chosen.lang; }
    u.rate = 0.95;
    u.pitch = 1;
    window.speechSynthesis.speak(u);
  } catch (e) { /* speech not available */ }
}

export function stopSpeaking() {
  try { window.speechSynthesis.cancel(); } catch (e) { /* no speech */ }
}
