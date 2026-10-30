---
layout: opencs
title: Messages
description: "Message a Unified Social Club volunteer privately."
permalink: /dm/
hide: true
---
<!-- markdownlint-disable MD033 -->
{%- comment -%}
  Messages: the stock OCS direct-messages chat (_includes/dm_chat.html), talking to
  usc-flask's /api/dm routes (dm_backend: python in _config.yml).
{%- endcomment -%}
{% include usc/header.html %}

<div class="ocs__container">
<div class="ocs__badge">Ask a Volunteer</div>
<h1>Messages</h1>
<p class="ocs__description">Ask a club volunteer anything, privately. Press <strong>+ New chat</strong>, pick a volunteer, and type your question.</p>

{% include dm_chat.html %}

<div class="ocs__card">
<h2 class="ocs__section-title">Safe by design</h2>
<div class="ocs__grid ocs__grid--standard">
<div class="ocs__grid-cell"><strong>Volunteers only</strong><br>Members can message volunteers and staff, not other members, so strangers can't send you private messages.</div>
<div class="ocs__grid-cell"><strong>Approved accounts</strong><br>Messages work once a volunteer approves your new account. Until then, you can still contact the club through their website.</div>
<div class="ocs__grid-cell"><strong>Never share money details</strong><br>A real volunteer will never ask for passwords, gift cards, or bank information in a message.</div>
</div>
</div>
</div>

{% include usc/footer.html %}
