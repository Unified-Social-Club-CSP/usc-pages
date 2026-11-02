---
layout: opencs
title: Club Jeopardy
description: "A team game about club life. Pick a square, hear the question, and choose the right picture. Wrong answers never lose points."
permalink: /jeopardy/
hide: true
microblog: true
---
<!-- markdownlint-disable MD033 -->
{%- comment -%}
  Club Jeopardy (owner: Aaditya). The game is built only from shared OCS grammar
  (_sass/open-coding/elements): no page-specific classes or styles, so it follows the
  member's OCS theme. Logic: assets/js/usc/jeopardy.js. Boards come from usc-flask (api/usc_jeopardy.py)
  through assets/js/usc/jeopardy-api.js; assets/js/usc/jeopardy-data.js is the offline board.
{%- endcomment -%}
{% include usc/header.html %}

<div class="ocs__container">
<div class="ocs__badge">Team Game</div>
<h1>Club Jeopardy</h1>
<p class="ocs__description">A team game about club life. Pick a square, hear the question, and choose the right picture. Wrong answers never lose points.</p>

<div id="jeopardy-app" class="ocs__card" data-nod-scope data-nod-targets="[data-action]">

<!-- Start screen: which board and how many teams -->
<div data-screen="setup">
<h2 class="ocs__section-title">Pick a board</h2>
<div class="ocs__links" role="group" aria-label="Jeopardy boards" data-boards>
<span>Loading boards…</span>
</div>
<h2 class="ocs__section-title">How many teams?</h2>
<div class="ocs__links" role="group" aria-label="Number of teams">
<button class="ocs__btn large pill accent fill" type="button" data-action="teams" data-count="2" aria-pressed="true">2 Teams</button>
<button class="ocs__btn large pill accent" type="button" data-action="teams" data-count="3" aria-pressed="false">3 Teams</button>
<button class="ocs__btn large pill accent" type="button" data-action="teams" data-count="4" aria-pressed="false">4 Teams</button>
</div>
<h2 class="ocs__section-title">Settings</h2>
<div class="ocs__links">
<button class="ocs__btn large accent" type="button" data-action="voice" aria-pressed="false">🔊 Read Clues Out Loud: Off</button>
</div>
<h2 class="ocs__section-title">Ready?</h2>
<div class="ocs__links">
<button class="ocs__btn large alert-green fill" type="button" data-action="start">▶ Start Jeopardy</button>
</div>
<div class="ocs__callout"><span data-account>Sign in to save your games on any computer.</span> <span data-stats></span></div>
<div class="ocs__links" data-editor-link hidden>
<a class="ocs__btn medium" href="{{ '/jeopardy/editor/' | relative_url }}" data-nod-skip>✏️ Edit Boards (volunteers)</a>
</div>
</div>

<!-- The board -->
<div data-screen="board" hidden>
<div class="ocs__stats" data-scores aria-label="Scores"></div>
<h2 data-turn aria-live="polite"></h2>
<div class="ocs__grid ocs__grid--standard" data-board></div>
<div class="ocs__callout">
<div class="ocs__links">
<button class="ocs__btn medium alert-red" type="button" data-action="quit" data-nod-skip>End Game</button>
</div>
</div>
</div>

<!-- One clue -->
<div data-screen="clue" hidden>
<div class="ocs__badge" data-clue-head></div>
<h2 data-clue-text></h2>
<div class="ocs__links">
<button class="ocs__btn large accent" type="button" data-action="read">🔊 Read It to Me</button>
</div>
<h3 class="ocs__section-title">Pick an answer</h3>
<div class="ocs__grid ocs__grid--standard" data-choices></div>
<div data-result hidden>
<div class="ocs__callout" role="status" data-feedback></div>
<div class="ocs__callout">
<div class="ocs__links">
<button class="ocs__btn large accent fill" type="button" data-action="next">Next</button>
</div>
</div>
</div>
</div>

<!-- Final scores -->
<div data-screen="final" hidden>
<h2 data-winner aria-live="polite"></h2>
<p class="ocs__lead">Great job, everybody! Here are the scores.</p>
<div class="ocs__table-wrap">
<table class="ocs__table">
<thead><tr><th>Team</th><th>Points</th></tr></thead>
<tbody data-final></tbody>
</table>
</div>
<div class="ocs__callout">
<div class="ocs__links">
<button class="ocs__btn large accent fill" type="button" data-action="again">▶ Play Again</button>
<button class="ocs__btn large accent" type="button" data-action="setup">Change Teams</button>
</div>
</div>
<div class="ocs__callout" data-stats></div>
<div data-recent hidden>
<h3 class="ocs__section-title">Recent games on this board</h3>
<div class="ocs__table-wrap">
<table class="ocs__table">
<thead><tr><th>Winner</th><th>Scores</th><th>Played</th></tr></thead>
<tbody data-recent-rows></tbody>
</table>
</div>
</div>
</div>

</div>
<noscript><div class="ocs__callout">Jeopardy needs JavaScript turned on in your browser.</div></noscript>

<div class="ocs__card">
<h2 class="ocs__section-title">How to play</h2>
<div class="ocs__grid ocs__grid--standard">
<div class="ocs__grid-cell"><strong>1. Pick</strong><br>Your team picks a category and points. Easier questions have fewer points.</div>
<div class="ocs__grid-cell"><strong>2. Answer</strong><br>Press the picture you think is right. Press 🔊 to hear the question again.</div>
<div class="ocs__grid-cell"><strong>3. Take turns</strong><br>Right answers win points. Wrong answers lose nothing. Then the next team goes.</div>
</div>
</div>
</div>

<script type="module" src="{{ '/assets/js/usc/jeopardy.js' | relative_url }}"></script>

{% include usc/footer.html %}
