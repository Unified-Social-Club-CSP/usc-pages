---
layout: opencs
title: Your Profile
description: "Tell us what you're interested in, and we'll put the games and events you care about first."
permalink: /profile/
hide: true
microblog: true
---
<!-- markdownlint-disable MD033 -->
{%- comment -%}
  Interest survey. Built only from shared OCS grammar (_sass/open-coding/elements):
  each answer is an OCS pill button that fills when picked, like the Jeopardy team picker.
  Logic: assets/js/usc/profile.js (saves to usc-flask /api/usc/profile/interests).
{%- endcomment -%}
{% include usc/header.html %}

<div class="ocs__container">
<div class="ocs__badge">Your Interests</div>
<h1>Your Profile</h1>
<p class="ocs__description">Tell us what you're interested in, and we'll put the games and events you care about first.</p>

<div class="ocs__callout" data-profile-status>
<span data-status-text>Checking whether you're signed in…</span>
</div>

<form id="interest-survey" class="ocs__card" data-nod-scope novalidate>
<h2 class="ocs__section-title">Your interests</h2>
<p class="ocs__lead">Six quick questions. Tap your answers; there's no typing. You can change them any time.</p>
<div data-questions></div>
<p role="status" aria-live="polite" data-form-message></p>
<div class="ocs__links">
<button class="ocs__btn large alert-green fill" type="submit">Save My Answers</button>
</div>
</form>

<div class="ocs__card" data-results hidden>
<h2 class="ocs__section-title">Picked for you</h2>
<p class="ocs__lead">Based on your answers.</p>
<div class="ocs__grid ocs__grid--card" data-recommendations></div>
</div>
</div>

<script type="module" src="{{ '/assets/js/usc/profile.js' | relative_url }}"></script>

{% include usc/footer.html %}
