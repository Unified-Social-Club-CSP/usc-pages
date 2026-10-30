---
layout: opencs
title: Play Bingo
description: "Large-print Bingo with a speaking caller. The computer calls the numbers, and you can pause any time."
permalink: /bingo/play/
hide: true
microblog: true
---
<!-- markdownlint-disable MD033 -->
{%- comment -%}
  Bingo (solo play with a speaking caller). Built only from shared OCS grammar
  (_sass/open-coding/elements) like Jeopardy and Trivia; the card is an ocs__grid of
  grid cells (5 columns: _sass/open-coding/usc-site.scss).
  Logic: assets/js/usc/bingo/play.js. Card and calling order: assets/js/usc/bingo/engine.js.
{%- endcomment -%}
{% include usc/header.html %}

<div class="ocs__container">
<div class="ocs__badge">Solo Game</div>
<h1>Play Bingo</h1>
<p class="ocs__description">Large-print Bingo with a speaking caller. The computer calls the numbers, and you can pause any time.</p>

<div id="bingo-app" class="ocs__card" data-nod-scope data-nod-targets="[data-action], select">

<!-- Start screen -->
<div data-screen="lobby">
<h2 class="ocs__section-title">Settings</h2>
<div class="ocs__field">
<label class="ocs__label" for="bingo-speed">Time between numbers</label>
<select class="ocs__input" id="bingo-speed" data-speed>
<option value="12">Slow (12 seconds)</option>
<option value="10" selected>Relaxed (10 seconds)</option>
<option value="8">Medium (8 seconds)</option>
<option value="6">Quick (6 seconds)</option>
</select>
</div>
<h2 class="ocs__section-title">Ready?</h2>
<div class="ocs__links">
<button class="ocs__btn large alert-green fill" type="button" data-action="solo">▶ Start Bingo</button>
</div>
<div class="ocs__callout">Sign in to save your games on any computer. <span data-stats></span></div>
</div>

<!-- The game -->
<div data-screen="game" hidden>
<div class="ocs__stats">
<div class="ocs__stat"><span class="ocs__stat-value" data-ball aria-live="assertive" aria-atomic="true">–</span><span class="ocs__stat-label">Current number</span></div>
<div class="ocs__stat"><span class="ocs__stat-value" data-count>0 of 75</span><span class="ocs__stat-label">Numbers called</span></div>
<div class="ocs__stat"><span class="ocs__stat-value" data-recent>–</span><span class="ocs__stat-label">Recent numbers</span></div>
</div>
<h2 class="ocs__section-title">Your card</h2>
<div class="ocs__grid ocs__grid--standard" data-card role="grid" aria-label="Your Bingo card"></div>
<div class="ocs__callout" data-game-message aria-live="polite" hidden></div>
<div class="ocs__callout">
<div class="ocs__links">
<button class="ocs__btn large alert-green fill" type="button" data-action="bingo">BINGO!</button>
<button class="ocs__btn large accent" type="button" data-action="pause">Pause</button>
<button class="ocs__btn large accent" type="button" data-action="voice" aria-pressed="true">🔊 Voice: On</button>
<button class="ocs__btn large accent" type="button" data-action="automark" aria-pressed="true">✓ Auto-mark: On</button>
</div>
</div>
<div class="ocs__callout">
<div class="ocs__links">
<button class="ocs__btn medium alert-red" type="button" data-action="quit" data-nod-skip>End Game</button>
</div>
</div>
</div>

</div>
<noscript><div class="ocs__callout">Bingo needs JavaScript turned on in your browser.</div></noscript>

<div class="ocs__card">
<h2 class="ocs__section-title">How to play</h2>
<div class="ocs__grid ocs__grid--standard">
<div class="ocs__grid-cell"><strong>1. Listen</strong><br>The caller says a number, like "B 7", and shows it at the top.</div>
<div class="ocs__grid-cell"><strong>2. Mark</strong><br>Numbers on your card are marked for you with a ✓. Turn Auto-mark off to tap them yourself.</div>
<div class="ocs__grid-cell"><strong>3. Call Bingo</strong><br>When you have a full row, column, or diagonal, press BINGO!</div>
</div>
</div>
</div>

<script type="module" src="{{ '/assets/js/usc/bingo/play.js' | relative_url }}"></script>

{% include usc/footer.html %}
