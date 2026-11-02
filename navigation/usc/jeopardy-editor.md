---
layout: opencs
title: Jeopardy Board Editor
description: "Volunteers write the Club Jeopardy boards: categories, questions, picture answers, and points."
permalink: /jeopardy/editor/
hide: true
---
<!-- markdownlint-disable MD033 -->
{%- comment -%}
  Club Jeopardy board editor (owner: Aaditya), for Admin, Teacher, and Volunteer
  accounts. Built only from stock OCS classes (ocs__card, ocs__field, ocs__input,
  ocs__btn, ocs__table, ocs__callout). Logic: assets/js/usc/jeopardy-editor.js,
  which saves through usc-flask api/usc_jeopardy.py; the server checks every board.
{%- endcomment -%}
{% include usc/header.html %}

<div class="ocs__container">
<div class="ocs__badge">Volunteers</div>
<h1>Jeopardy Board Editor</h1>
<p class="ocs__description">Write the boards members play at club night. Each clue needs a question, 2 to 4 picture answers, and the right answer picked.</p>

<div id="jeopardy-editor">

<div class="ocs__callout" role="status" data-message>Checking your account…</div>

<!-- All boards -->
<div class="ocs__card" data-screen="list" hidden>
<h2 class="ocs__section-title">Boards</h2>
<div class="ocs__table-wrap">
<table class="ocs__table">
<thead><tr><th>Board</th><th>Level</th><th>Clues</th><th>Played</th><th></th></tr></thead>
<tbody data-boards></tbody>
</table>
</div>
<div class="ocs__links">
<button class="ocs__btn large alert-green fill" type="button" data-action="new">➕ New Board</button>
<a class="ocs__btn large" href="{{ '/jeopardy/' | relative_url }}">▶ Play Jeopardy</a>
</div>
</div>

<!-- One board -->
<form class="ocs__card" data-screen="edit" hidden novalidate>
<h2 class="ocs__section-title" data-edit-title>New Board</h2>
<div class="ocs__field">
<label class="ocs__label" for="board-name">Board name</label>
<input class="ocs__input" id="board-name" name="name" maxlength="60" required>
</div>
<div class="ocs__field">
<label class="ocs__label" for="board-level">Level</label>
<select class="ocs__input" id="board-level" name="level">
<option value="easy">Easy</option>
<option value="harder">Harder</option>
</select>
</div>
<div data-categories></div>
<div class="ocs__links">
<button class="ocs__btn medium accent" type="button" data-action="add-category">➕ Add Category</button>
</div>
<div class="ocs__callout">
<div class="ocs__links">
<button class="ocs__btn large alert-green fill" type="submit">💾 Save Board</button>
<button class="ocs__btn large" type="button" data-action="cancel">Cancel</button>
</div>
</div>
</form>

</div>
<noscript><div class="ocs__callout">The editor needs JavaScript turned on in your browser.</div></noscript>
</div>

<script type="module" src="{{ '/assets/js/usc/jeopardy-editor.js' | relative_url }}"></script>

{% include usc/footer.html %}
