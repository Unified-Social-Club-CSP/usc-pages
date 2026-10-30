---
layout: opencs
title: Club Trivia
description: "Practice trivia about club life. Pick the right answer from 4 big buttons. Every button has a shape, a picture, and words."
permalink: /trivia/
hide: true
microblog: true
---
<!-- markdownlint-disable MD033 -->
{%- comment -%}
  Club Trivia (owner: Chetan): solo practice now, live club-night rooms later.
  Built only from shared OCS grammar (_sass/open-coding/elements): no page-specific
  classes or styles, so it follows the member's OCS theme.
  Logic: assets/js/usc/trivia.js. Questions: assets/js/usc/trivia-data.js.
{%- endcomment -%}
{% include usc/header.html %}

<div class="ocs__container">
<div class="ocs__badge">Solo Practice</div>
<h1>Club Trivia</h1>
<p class="ocs__description">Practice trivia about club life. Pick the right answer from 4 big buttons. Every button has a shape, a picture, and words.</p>

<div id="trivia-app" class="ocs__card" data-nod-scope data-nod-targets="[data-action]">

<!-- Start screen -->
<div data-screen="start">
<h2 class="ocs__section-title">Settings</h2>
<div class="ocs__links">
<button class="ocs__btn large accent" type="button" data-action="timer" aria-pressed="true">⏱️ Timer: On (20 seconds)</button>
<button class="ocs__btn large accent" type="button" data-action="voice" aria-pressed="true">🔊 Read Questions Out Loud: On</button>
</div>
<h2 class="ocs__section-title">Ready? 10 questions</h2>
<div class="ocs__links">
<button class="ocs__btn large alert-green fill" type="button" data-action="start">▶ Start Trivia</button>
</div>
<div class="ocs__callout"><span data-account>Sign in to save your scores on any computer.</span> <span data-stats></span></div>
</div>

<!-- One question -->
<div data-screen="question" hidden>
<div class="ocs__stats">
<div class="ocs__stat"><span class="ocs__stat-value" data-progress></span><span class="ocs__stat-label">Question</span></div>
<div class="ocs__stat"><span class="ocs__stat-value" data-score></span><span class="ocs__stat-label">Score</span></div>
<div class="ocs__stat"><span class="ocs__stat-value" data-streak></span><span class="ocs__stat-label">Streak</span></div>
<div class="ocs__stat" data-timer><span class="ocs__stat-value" data-time-left></span><span class="ocs__stat-label">⏱️ Seconds left</span></div>
</div>
<h2 data-question></h2>
<div class="ocs__links">
<button class="ocs__btn large accent" type="button" data-action="read">🔊 Read It to Me</button>
</div>
<h3 class="ocs__section-title">Pick an answer</h3>
<div class="ocs__grid ocs__grid--col2" data-answers></div>
<div data-result hidden>
<div class="ocs__callout" role="status" data-feedback></div>
<div class="ocs__callout">
<div class="ocs__links">
<button class="ocs__btn large accent fill" type="button" data-action="next">Next Question</button>
</div>
</div>
</div>
<div class="ocs__callout">
<div class="ocs__links">
<button class="ocs__btn medium alert-red" type="button" data-action="quit" data-nod-skip>End Game</button>
</div>
</div>
</div>

<!-- End screen -->
<div data-screen="end" hidden>
<h2 data-cheer aria-live="polite"></h2>
<p class="ocs__lead" data-summary></p>
<div class="ocs__links">
<button class="ocs__btn large accent fill" type="button" data-action="start">▶ Play Again</button>
</div>
<div class="ocs__callout" data-stats></div>
</div>

</div>
<noscript><div class="ocs__callout">Trivia needs JavaScript turned on in your browser.</div></noscript>

<div class="ocs__card">
<div class="ocs__card-header">
<h2 class="ocs__section-title">Live Game at Club Night — Coming Soon</h2>
<span class="ocs__status-pill ocs__status-pill--neutral">Not ready yet</span>
</div>
<p class="ocs__lead">Soon we will play trivia together at club, all at the same time.</p>
<div class="ocs__grid ocs__grid--standard">
<div class="ocs__grid-cell"><strong>📺 Host screen</strong><br>A volunteer shows the questions on the big screen at club.</div>
<div class="ocs__grid-cell"><strong>🔢 4-digit join code</strong><br>The big screen shows a code, like 4 8 2 7. Type it on your phone or tablet to join.</div>
<div class="ocs__grid-cell"><strong>▲ ◆ ● ■ Tap your answer</strong><br>Press the same shapes and pictures you practice with here. Scores show on the big screen.</div>
</div>
<div class="ocs__callout">This part is not built yet. Practice above until then!</div>
</div>
</div>

<script type="module" src="{{ '/assets/js/usc/trivia.js' | relative_url }}"></script>

{% include usc/footer.html %}
