'use strict';
(() => {
  const data = window.SITE_DATA || { search: [], email: 'fromentindulten@gmail.com' };
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const read = key => { try { return localStorage.getItem(key); } catch { return null; } };
  const write = (key, value) => { try { localStorage.setItem(key, value); } catch {} };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = read('motion-paused') === 'true' || reduced.matches;
  let animations = [];
  const motionButton = $('#motion-toggle');
  function applyMotion() {
    document.documentElement.classList.toggle('motion-paused', paused);
    if (motionButton) {
      motionButton.hidden = false;
      motionButton.setAttribute('aria-pressed', String(paused));
      motionButton.textContent = paused ? 'Resume motion' : 'Pause motion';
    }
    if (paused) {
      animations.forEach(a => a.finish());
      animations = [];
      document.documentElement.style.setProperty('--hero-offset', '0px');
    }
  }
  motionButton?.addEventListener('click', () => { paused = !paused; write('motion-paused', String(paused)); applyMotion(); });
  reduced.addEventListener('change', () => { paused = reduced.matches || read('motion-paused') === 'true'; applyMotion(); });
  applyMotion();

  // Analytics never receives free-form search or contact data, and never loads in the private review.
  const publicHost = location.hostname === 'dultenrichard.github.io';
  const privacySignal = () => navigator.globalPrivacyControl === true || navigator.doNotTrack === '1' || window.doNotTrack === '1';
  const analyticsAllowed = () => publicHost && !privacySignal() && read('privacy-analytics') === 'on';
  function loadAnalytics() {
    if (!analyticsAllowed() || $('#umami-script')) return;
    const script = document.createElement('script');
    script.id = 'umami-script'; script.defer = true;
    script.src = 'https://cloud.umami.is/script.js';
    script.dataset.websiteId = '83a9f356-ddca-4004-a55c-96f06d9a6b14';
    script.dataset.domains = 'dultenrichard.github.io';
    script.dataset.excludeSearch = 'true';
    document.head.append(script);
  }
  function track(name, fields = {}) { if (analyticsAllowed() && window.umami?.track) window.umami.track(name, fields); }
  function privacyStatus() {
    const el = $('#privacy-analytics-status');
    if (!el) return;
    el.textContent = !publicHost ? 'Analytics are disabled on this private review.' : privacySignal() ? 'Analytics are off because a browser privacy signal is enabled.' : analyticsAllowed() ? 'Analytics enabled in this browser.' : 'Analytics disabled in this browser.';
    const enable = $('#privacy-enable-analytics');
    if (enable) enable.disabled = !publicHost || privacySignal();
  }
  $('#privacy-enable-analytics')?.addEventListener('click', () => { write('privacy-analytics', 'on'); loadAnalytics(); privacyStatus(); });
  $('#privacy-disable-analytics')?.addEventListener('click', () => {
    write('privacy-analytics', 'off');
    // Reload stops an already-running third-party script and its automatic listeners.
    if ($('#umami-script')) location.reload(); else privacyStatus();
  });
  loadAnalytics(); privacyStatus();

  // Native dialogs supply focus containment, Escape, and focus restoration.
  const search = $('#site-search'), menu = $('#site-menu');
  function openDialog(dialog, focusTarget) {
    if (!dialog || typeof dialog.showModal !== 'function') return;
    $$('dialog[open]').forEach(d => d.close());
    dialog.showModal(); document.body.style.overflow = 'hidden';
    if (focusTarget) focusTarget.focus();
  }
  $$('dialog').forEach(dialog => {
    $('.dialog-close', dialog)?.addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => { document.body.style.overflow = ''; });
    dialog.addEventListener('click', event => {
      const rect = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
      if (event.target.closest('a')) dialog.close();
    });
  });
  if (menu && typeof menu.showModal === 'function') {
    $$('.menu-open').forEach(button => { button.hidden = false; button.addEventListener('click', () => { openDialog(menu); track('navigation_open'); }); });
  }
  const searchInput = $('#global-search'), searchResults = $('#search-results'), searchStatus = $('#search-status');
  function runSearch() {
    const query = (searchInput?.value || '').trim().toLocaleLowerCase();
    const terms = query.split(/\s+/).filter(Boolean);
    let matches = data.search.filter(item => terms.every(term => (item.title + ' ' + item.text + ' ' + item.kind).toLocaleLowerCase().includes(term)));
    if (!terms.length) matches = data.search.filter(item => item.kind === 'Page' || item.kind === 'Document');
    searchResults.replaceChildren();
    searchStatus.textContent = query ? `${matches.length} matching ${matches.length === 1 ? 'record' : 'records'}.` : 'Start with a page, or search for a role, award, project, or year.';
    for (const item of matches.slice(0, 30)) {
      const a = document.createElement('a'); a.href = item.href;
      const kind = document.createElement('small'); kind.textContent = item.kind;
      const title = document.createElement('h3'); title.textContent = item.title;
      const excerpt = document.createElement('p'); excerpt.textContent = item.text.length > 155 ? item.text.slice(0, 152) + '…' : item.text;
      a.append(kind, title, excerpt); searchResults.append(a);
    }
    if (matches.length > 30) { const note = document.createElement('p'); note.textContent = 'Showing the first 30 matches. Add another word to narrow your search.'; searchResults.append(note); }
  }
  if (search && typeof search.showModal === 'function') {
    $$('.search-open').forEach(button => { button.hidden = false; const key = $('kbd', button); if (key && !/Mac|iPhone|iPad/.test(navigator.platform)) key.textContent = 'Ctrl K'; button.addEventListener('click', () => { runSearch(); openDialog(search, searchInput); }); });
    searchInput.addEventListener('input', runSearch);
    document.addEventListener('keydown', event => {
      const typing = event.target.closest('input,textarea,select,[contenteditable="true"]');
      if (((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') || (event.key === '/' && !typing && !menu?.open)) {
        event.preventDefault(); runSearch(); openDialog(search, searchInput);
      }
    });
  }

  const header = $('.site-header'), progress = $('.reading-progress');
  let lastScroll = scrollY, queued = false;
  const finePointer = matchMedia('(pointer:fine)');
  function scrollFrame() {
    const current = scrollY;
    const range = document.documentElement.scrollHeight - innerHeight;
    if (progress) progress.style.transform = `scaleX(${range > 0 ? Math.min(1, current / range) : 0})`;
    header?.classList.toggle('scrolled', current > 40);
    if (Math.abs(current - lastScroll) > 8 || current < 100) {
      header?.classList.toggle('header-hidden', current > lastScroll && current > 250 && !header.contains(document.activeElement) && !menu?.open && !search?.open);
      lastScroll = current;
    }
    if (!paused && finePointer.matches && $('.hero') && current < innerHeight * 1.3) document.documentElement.style.setProperty('--hero-offset', `${Math.min(45, current * .06)}px`);
    queued = false;
  }
  function queueScroll() { if (!queued) { requestAnimationFrame(scrollFrame); queued = true; } }
  addEventListener('scroll', queueScroll, { passive: true }); addEventListener('resize', queueScroll); scrollFrame();
  if ('IntersectionObserver' in window) {
    const reveal = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        if (paused || typeof entry.target.animate !== 'function') return;
        const animation = entry.target.animate([{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 850, easing: 'cubic-bezier(.22,.8,.22,1)' });
        animations.push(animation); animation.onfinish = () => { animations = animations.filter(x => x !== animation); };
      });
    }, { threshold: .12 });
    $$('[data-reveal]').forEach(el => reveal.observe(el));
    const yearNav = $('.year-nav');
    if (yearNav) {
      const observer = new IntersectionObserver(entries => {
        const visible = entries.filter(x => x.isIntersecting).sort((a,b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length) $$('a', yearNav).forEach(a => { const active = a.hash === '#' + visible[0].target.id; a.classList.toggle('active', active); if(active) a.setAttribute('aria-current','location'); else a.removeAttribute('aria-current'); });
      }, { rootMargin: '-15% 0px -50% 0px' });
      $$('.timeline-year').forEach(el => observer.observe(el));
    }
  }
  const filter = $('[data-filter-group="awards"]'), awardRows = $$('.award-row');
  function filterAwards(category) {
    let count = 0;
    awardRows.forEach(row => { const match = category === 'All' || row.dataset.category === category; row.hidden = !match; if (match) count++; });
    $$('button', filter).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.filter === category)));
    $('#award-count').textContent = `${count} recognition ${count === 1 ? 'entry' : 'entries'}`;
  }
  if (filter) { filter.hidden = false; filterAwards('All'); $$('button',filter).forEach(b => b.addEventListener('click', () => { filterAwards(b.dataset.filter); track('recognition_filter', { category: b.dataset.filter }); })); }
  function revealFragment() {
    let id; try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    const target = id && document.getElementById(id);
    if (!target) return;
    if (target.matches('.award-row')) { if (filter) filterAwards('All'); target.open = true; }
    let parent = target.closest('details'); while (parent) { parent.open = true; parent = parent.parentElement.closest('details'); }
  }
  addEventListener('hashchange', revealFragment); revealFragment();
  const skillInput = $('#skill-search'), skillRows = $$('.skill-record');
  if (skillInput) {
    $('.skill-controls').hidden = false;
    const aliases = { 'material-handling':'logistics', organization:'planning', budgeting:'planning', 'problem-solving':'research', advocacy:'communication', 'public-speaking':'communication' };
    const requested = new URLSearchParams(location.search).get('skill') || '';
    skillInput.value = aliases[requested] || requested;
    function filterSkills() {
      const query = skillInput.value.trim().toLowerCase().replace(/-/g,' '); let count = 0;
      skillRows.forEach(row => { const match = !query || (row.dataset.skill.replace(/-/g,' ') + ' ' + row.textContent).toLowerCase().includes(query); row.hidden = !match; if(match)count++; });
      $('#skill-count').textContent = `${count} ${count === 1 ? 'skill' : 'skills'}`; $('#skill-empty').hidden = count !== 0;
    }
    skillInput.addEventListener('input', filterSkills); $('#clear-skills').addEventListener('click', () => { skillInput.value='';filterSkills();skillInput.focus(); }); filterSkills();
  }
  const copy = $('#copy-email');
  if (copy && navigator.clipboard && window.isSecureContext) {
    copy.hidden = false; copy.addEventListener('click', async () => { try { await navigator.clipboard.writeText(data.email); $('#copy-status').textContent = 'Email address copied.'; } catch { $('#copy-status').textContent = 'Select the address above to copy it.'; } });
  }
  const form = $('#contact-form');
  if (form) {
    $('#composer').hidden = false;
    const params = new URLSearchParams(location.search), topic = params.get('topic');
    if ([...form.elements.topic.options].some(x => x.value === topic)) form.elements.topic.value = topic;
    const record = params.get('record');
    if (record) { const title = data.search.find(x => x.href.endsWith('#' + record))?.title || record.replace(/-/g,' '); form.elements.message.value = `I’d like to request the supporting record for ${title}.\n\n`; }
    form.addEventListener('submit', event => {
      event.preventDefault(); if(!form.reportValidity())return;
      const values = new FormData(form);
      const subject = `${values.get('topic')} enquiry — ${values.get('name')}`;
      const body = `Name: ${values.get('name')}\nEmail: ${values.get('email')}\n\n${values.get('message')}`;
      location.href = `mailto:${data.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      $('#form-status').textContent = 'Email draft requested. If your mail app does not open, copy the address and message into your email service.';
      track('contact_draft', { topic: values.get('topic') });
    });
  }
  document.addEventListener('click', event => {
    const a = event.target.closest('a'); if (!a)return;
    if (a.getAttribute('href')?.endsWith('.pdf'))track('document_download', { document:'experience_profile' });
  });
})();
