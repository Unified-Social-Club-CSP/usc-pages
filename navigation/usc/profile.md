---
layout: opencs
title: Your Profile
description: "Tell us what you're interested in, and we'll put the games and events you care about first."
permalink: /profile/
hide: true
microblog: true
---
<!-- markdownlint-disable MD033 -->
<div class="usc-site">

{% include usc/header.html %}

<section class="usc-page-title">
    <div class="usc-container">
        <h1>Your Profile</h1>
        <p>Tell us what you're interested in, and we'll put the games and events you care about first.</p>
    </div>
</section>

<section class="usc-section">
    <div class="usc-container">
<div class="usc-card usc-card--tint" data-profile-status style="margin-bottom:1rem">
  <p data-status-text>Checking whether you're signed in…</p>
</div>
<form class="usc-card" id="interest-survey" novalidate>
  <h2>Your interests</h2>
  <p class="hint">Six quick questions. Tap your answers; there's no typing. You can change them any time.</p>
  <div data-questions></div>
  <p class="form-message" role="status" aria-live="polite"></p>
  <button class="ocs__btn large accent fill" type="submit">Save My Answers</button>
</form>
<div class="usc-card" data-results hidden style="margin-top:1rem">
  <h2>Picked for you</h2>
  <p class="hint">Based on your answers.</p>
  <div class="usc-cards" data-recommendations></div>
</div>
    </div>
</section>
<script type="module" src="{{ '/assets/js/usc/profile.js' | relative_url }}"></script>

{% include usc/footer.html %}

</div>
