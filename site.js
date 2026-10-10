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
  if (search && $('.search-open').length && typeof search.showModal === 'function') {
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

  // The playbook is a lesson-design illustration, not a claim that a pilot has taken place.
  const board = $('.youth-leadership-workshops-detail .project-visual');
  if (board) {
    const phases = [
      { label: 'Listen', title: 'Hear the team first.', text: 'Start with the team’s objective. Make space for every voice before deciding what to do.' },
      { label: 'Decide', title: 'Make a plan together.', text: 'In the proposed ad activity, small groups have five minutes to agree on an idea, roles, and a 30-second pitch.' },
      { label: 'Act', title: 'Step into the uncomfortable.', text: 'Groups present their short ad. It is practice in communicating clearly and backing a shared decision.' },
      { label: 'Reflect', title: 'Learn from what happened.', text: 'Discuss what worked, who participated, and what the group would change on its next attempt.' }
    ];
    const flow = document.createElement('section');
    flow.className = 'workshop-flow';
    flow.setAttribute('aria-label', 'Workshop learning cycle');
    flow.innerHTML = '<div class="workshop-flow-heading"><p>Inside the proposed workshop</p><span>Four movements / One team</span></div>' +
      '<div class="workshop-phases" role="group" aria-label="Explore a workshop phase"></div>' +
      '<div class="workshop-phase-copy" aria-live="polite"><strong></strong><p></p></div>';
    const controls = $('.workshop-phases', flow);
    const phaseTitle = $('.workshop-phase-copy strong', flow);
    const phaseText = $('.workshop-phase-copy p', flow);
    const renderPhase = index => {
      const phase = phases[index];
      phaseTitle.textContent = phase.title;
      phaseText.textContent = phase.text;
      Array.from(controls.querySelectorAll('button')).forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
    };
    phases.forEach((phase, i) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.innerHTML = '<small>0' + (i + 1) + '</small>' + phase.label;
      button.setAttribute('aria-pressed', String(i === 0));
      button.addEventListener('click', () => renderPhase(i));
      controls.append(button);
    });
    renderPhase(0);
    board.append(flow);
  }

  // Navigation stays instantaneous when pages are fast. Show an overlay only if a same-site
  // document navigation has genuinely taken more than 450ms. Do not intercept normal links.
  const slowNav = document.createElement('div');
  slowNav.className = 'slow-navigation';
  slowNav.hidden = true;
  slowNav.setAttribute('role', 'status');
  slowNav.setAttribute('aria-live', 'polite');
  slowNav.innerHTML = '<div class="slow-navigation-inner">' +
    '<span class="slow-navigation-brand">Dulten <em>Richard.</em></span>' +
    '<p class="slow-navigation-copy">Opening the next page…</p>' +
    '<div class="slow-navigation-track" aria-hidden="true"></div>' +
    '<button type="button">Stay on this page</button>' +
    '</div>';
  document.body.append(slowNav);
  let slowNavTimer = 0;
  let slowNavGuard = 0;
  const dismissSlowNav = () => {
    clearTimeout(slowNavTimer);
    clearTimeout(slowNavGuard);
    slowNav.hidden = true;
  };
  $('button', slowNav).addEventListener('click', dismissSlowNav);
  addEventListener('pagehide', dismissSlowNav);
  addEventListener('pageshow', dismissSlowNav);
  addEventListener('keydown', event => { if (event.key === 'Escape' && !slowNav.hidden) dismissSlowNav(); });
  document.addEventListener('click', event => {
    const a = event.target.closest('a[href]');
    if (!a || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ||
      a.hasAttribute('download') || (a.target && a.target !== '_self')) return;
    let next;
    try { next = new URL(a.href, location.href); } catch { return; }
    if (next.origin !== location.origin || next.protocol !== location.protocol ||
      (next.pathname === location.pathname && next.search === location.search)) return;
    dismissSlowNav();
    slowNavTimer = setTimeout(() => { slowNav.hidden = false; }, 450);
    // A failed or cancelled navigation must never leave the existing page covered.
    slowNavGuard = setTimeout(dismissSlowNav, 8000);
  });


  /* THE CURRENT: a bespoke navigable canvas rather than an ornamental video. */
  const currentHero = $('.hero');
  if (currentHero) {
    document.body.classList.add('cinematic-home');
    const scenic = document.createElement('canvas');
    scenic.className = 'current-field';
    scenic.setAttribute('aria-hidden', 'true');
    currentHero.insertBefore(scenic, $('.hero-shade'));

    const ornament = document.createElement('div');
    ornament.className = 'hero-compass';
    ornament.setAttribute('aria-hidden','true');
    ornament.innerHTML = '<span class="compass-ring"><i></i><i></i><i></i><i></i></span><span class="compass-label">DR / 2026</span>';
    currentHero.append(ornament);

    const notation = document.createElement('div');
    notation.className = 'hero-notation shell';
    notation.innerHTML = '<span>01 / Personal record</span><span>Scroll to navigate the current <b aria-hidden="true">↓</b></span>';
    currentHero.append(notation);

    const waypoint = document.createElement('nav');
    waypoint.className = 'waypoint-nav';
    waypoint.setAttribute('aria-label','Navigate homepage chapters');
    waypoint.innerHTML = '<a href="#top" aria-label="Opening, chapter one"><small>01</small><span>Opening</span></a>' +
      '<a href="#about" aria-label="About, chapter two"><small>02</small><span>About</span></a>' +
      '<a href="#experience" aria-label="Highlights, chapter three"><small>03</small><span>Highlights</span></a>' +
      '<a href="#connect" aria-label="Connect, chapter four"><small>04</small><span>Connect</span></a>';
    document.body.append(waypoint);
    const waypointAnchors = Array.from(waypoint.querySelectorAll('a'));
    const markChapter = (idx) => {
      waypointAnchors.forEach((a,i)=>{
        a.classList.toggle('is-active',i===idx);
        if(i===idx) a.setAttribute('aria-current','location');
        else a.removeAttribute('aria-current');
      });
    };
    markChapter(0);
    const chapters = [currentHero,$('#about'),$('#experience'),$('#connect')].filter(Boolean);
    if('IntersectionObserver' in window){
      const chapterObserver=new IntersectionObserver(()=>{
        let active = 0, near = Infinity;
        chapters.forEach((el,i)=>{
          const rect=el.getBoundingClientRect();
          const distance=Math.abs(rect.top - innerHeight*.35);
          if(rect.bottom>innerHeight*.2 && distance<near){near=distance;active=i;}
        });
        markChapter(active);
      },{threshold:[0,.15,.4,.75],rootMargin:'-18% 0px -55% 0px'});
      chapters.forEach(el=>chapterObserver.observe(el));
    }

    // Visible content is still genuine HTML if scripting or animation is unavailable.
    // The canvas uses deterministic seeded particles and a moving current / chart geometry.
    const ctx=scenic.getContext('2d',{alpha:true});
    if(ctx){
      let width=1,height=1,dpr=1,frame=0,raf=0,last=0,visible=true,now=0;
      let target={x:.69,y:.48},pointer={x:.69,y:.48},nodes=[];
      const random = (n)=>{const s=Math.sin(n*127.1+78.233)*43758.5453123;return s-Math.floor(s);};
      const resize=()=>{
        const box=currentHero.getBoundingClientRect();
        width=Math.max(1,Math.floor(box.width));height=Math.max(1,Math.floor(box.height));
        dpr=Math.min(devicePixelRatio||1,1.75);
        scenic.width=Math.floor(width*dpr);scenic.height=Math.floor(height*dpr);
        scenic.style.width=width+'px';scenic.style.height=height+'px';
        ctx.setTransform(dpr,0,0,dpr,0,0);
        const count = width < 680 ? 44 : 100;
        nodes=Array.from({length:count},(_,i)=>({
          x:random(i*7.4+1.1), y:random(i*8.7+4.9), z:.25+random(i*5.1+1.9)*.75,
          phase:random(i*6.5)*Math.PI*2
        }));
        paint(now);
      };
      const flowY=(x,i,t)=>height*(.18+.64*nodes[i].y)+Math.sin(x*.004+nodes[i].phase+t*(.16+nodes[i].z*.12))*height*.016;
      const paint=(t)=>{
        ctx.clearRect(0,0,width,height);
        ctx.globalCompositeOperation='screen';
        // Layered luminous drift-lines, like measured currents on a navigation chart.
        for(let l=0;l<11;l++){
          const baseline=height*(.17+l*.067);
          const offset=l*1.4;
          ctx.beginPath();
          for(let x=-20;x<=width+28;x+=28){
            const y=baseline+Math.sin(x*.0045+offset+t*.15)*height*.024+
              Math.cos(x*.0018+offset*.71-t*.09)*height*.011;
            if(x===-20)ctx.moveTo(x,y);else ctx.lineTo(x,y);
          }
          ctx.strokeStyle=l%3===0?'rgba(215,189,143,.18)':'rgba(137,182,199,.14)';
          ctx.lineWidth=l%4===0?1.1:.55;ctx.stroke();
        }
        pointer.x+=(target.x-pointer.x)*.035;
        pointer.y+=(target.y-pointer.y)*.035;
        const cursorX=pointer.x*width,cursorY=pointer.y*height;
        const aura=ctx.createRadialGradient(cursorX,cursorY,0,cursorX,cursorY,width*.29);
        aura.addColorStop(0,'rgba(200,197,172,.075)');
        aura.addColorStop(1,'rgba(200,197,172,0)');
        ctx.fillStyle=aura;ctx.fillRect(0,0,width,height);
        for(let i=0;i<nodes.length;i++){
          const n=nodes[i];
          let x=((n.x*width+t*(3+n.z*5))%(width+60))-30;
          let y=flowY(x,i,t);
          const dist=Math.hypot(x-cursorX,y-cursorY);
          const brighten=Math.max(0,1-dist/(width*.26));
          ctx.beginPath();ctx.arc(x,y,.45+n.z*.85+brighten*.65,0,Math.PI*2);
          ctx.fillStyle=(i%8===0)?'rgba(239,216,171,'+(.24+n.z*.45)+')':'rgba(190,218,222,'+(.10+n.z*.28+brighten*.2)+')';
          ctx.fill();
          if(i%7===0){
            ctx.beginPath();ctx.moveTo(x-19*n.z,y+1);ctx.lineTo(x-3*n.z,y);
            ctx.strokeStyle='rgba(232,220,200,'+(.06+n.z*.13)+')';ctx.lineWidth=.65;ctx.stroke();
          }
        }
        ctx.globalCompositeOperation='source-over';
      };
      const animate=(time)=>{
        raf=0;if(paused||!visible||document.hidden)return;
        if(time-last < 32){raf=requestAnimationFrame(animate);return;}
        last=time;now=time*.001;paint(now);raf=requestAnimationFrame(animate);
      };
      const play=()=>{
        if(paused || !visible || document.hidden){
          cancelAnimationFrame(raf);raf=0;paint(now);
        } else if(!raf)raf=requestAnimationFrame(animate);
      };
      currentHero.addEventListener('pointermove',event=>{
        if(event.pointerType==='touch')return;
        const box=currentHero.getBoundingClientRect();
        target.x=Math.max(0,Math.min(1,(event.clientX-box.left)/box.width));
        target.y=Math.max(0,Math.min(1,(event.clientY-box.top)/box.height));
        currentHero.style.setProperty('--cursor-x',(target.x*100).toFixed(2)+'%');
        currentHero.style.setProperty('--cursor-y',(target.y*100).toFixed(2)+'%');
      },{passive:true});
      currentHero.addEventListener('pointerleave',()=>{
        target={x:.69,y:.48};
      });
      if('IntersectionObserver' in window){
        const observer=new IntersectionObserver(entries=>{
          visible=entries[0].isIntersecting;play();
        },{threshold:0});
        observer.observe(currentHero);
      }
      if('ResizeObserver' in window){
        const obs=new ResizeObserver(()=>resize());obs.observe(currentHero);
      } else addEventListener('resize',resize,{passive:true});
      document.addEventListener('visibilitychange',play);
      motionButton?.addEventListener('click',()=>requestAnimationFrame(play));
      reduced.addEventListener('change',()=>requestAnimationFrame(play));
      resize();play();
    }
    // Motions only decorate already-visible information.
    if('IntersectionObserver' in window){
      const emerge=new IntersectionObserver((entries,observer)=>{
        entries.forEach(entry=>{
          if(!entry.isIntersecting)return;
          entry.target.classList.add('chapter-seen');observer.unobserve(entry.target);
        });
      },{threshold:.12});
      Array.from(document.querySelectorAll('.about-section,.signature-highlights,.closing-chapter'))
        .forEach(el=>emerge.observe(el));
    }
  }

})();
