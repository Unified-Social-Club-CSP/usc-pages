---
layout: opencs
title: Sign In
description: "Sign in to save your progress in games and practice."
permalink: /login/
hide: true
microblog: true
---
<!-- markdownlint-disable MD033 -->
{%- comment -%}
  Sign in and create an account against usc-flask. Built only from shared OCS grammar:
  ocs__card, ocs__field / ocs__label / ocs__input, and OCS buttons (the open tab is filled).
  Logic: assets/js/usc/signin.js.
{%- endcomment -%}
{% include usc/header.html %}

<div class="ocs__container">
<div class="ocs__badge">Your Account</div>
<h1>Sign In</h1>
<p class="ocs__description">Sign in to save your progress in games and practice.</p>

<div class="ocs__card" id="account" hidden>
<h2 class="ocs__section-title">You are signed in</h2>
<p class="ocs__lead">Welcome, <strong data-account-name></strong>.</p>
<div class="ocs__callout" data-account-pending hidden>Your account is new, so a volunteer still needs to approve it. You can fill in your profile now; saved game progress turns on once you are approved.</div>
<div class="ocs__links">
<a class="ocs__btn large accent fill" href="{{ '/profile/' | relative_url }}">Your Profile &amp; Interests</a>
<a class="ocs__btn large accent" href="{{ '/play/' | relative_url }}">Play Games</a>
<button class="ocs__btn large alert-red" type="button" id="signout-button">Sign Out</button>
</div>
</div>

<div class="ocs__card" id="auth-forms">
<div class="ocs__links" role="tablist" aria-label="Sign in or create an account">
<button type="button" class="ocs__btn large pill accent fill" role="tab" id="tab-signin" aria-controls="panel-signin" aria-selected="true">Sign In</button>
<button type="button" class="ocs__btn large pill accent" role="tab" id="tab-create" aria-controls="panel-create" aria-selected="false">Create Account</button>
</div>

<form id="panel-signin" role="tabpanel" aria-labelledby="tab-signin" novalidate>
<div class="ocs__stack">
<div class="ocs__field">
<label class="ocs__label" for="signin-username">Username</label>
<input class="ocs__input" id="signin-username" name="username" autocomplete="username" required>
</div>
<div class="ocs__field">
<label class="ocs__label" for="signin-password">Password</label>
<input class="ocs__input" id="signin-password" name="password" type="password" autocomplete="current-password" required>
</div>
<p role="status" aria-live="polite" data-form-message></p>
<div class="ocs__links">
<button class="ocs__btn large alert-green fill" type="submit">Sign In</button>
</div>
</div>
</form>

<form id="panel-create" role="tabpanel" aria-labelledby="tab-create" novalidate hidden>
<div class="ocs__stack">
<div class="ocs__field">
<label class="ocs__label" for="create-name">Your name</label>
<input class="ocs__input" id="create-name" name="name" autocomplete="name" required>
</div>
<div class="ocs__field">
<label class="ocs__label" for="create-username">Choose a username</label>
<input class="ocs__input" id="create-username" name="username" autocomplete="username" required aria-describedby="create-username-help">
<small id="create-username-help">At least 2 letters or numbers. You will use this to sign in.</small>
</div>
<div class="ocs__field">
<label class="ocs__label" for="create-password">Choose a password</label>
<input class="ocs__input" id="create-password" name="password" type="password" autocomplete="new-password" required aria-describedby="create-password-help">
<small id="create-password-help">At least 8 characters.</small>
</div>
<p role="status" aria-live="polite" data-form-message></p>
<div class="ocs__links">
<button class="ocs__btn large alert-green fill" type="submit">Create Account</button>
</div>
</div>
</form>
</div>
</div>

<script type="module" src="{{ '/assets/js/usc/signin.js' | relative_url }}"></script>

{% include usc/footer.html %}
