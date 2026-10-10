'use strict';
/**
 * The Selected Record / the guided experience.
 * Normal HTML, buttons, and a LinkedIn link are the source of truth.
 * Canvas/motion enhance the design but are never required for navigation.
 */
(() => {
  const stage = document.querySelector('[data-spotlight]');
  if (!stage) return;
  const root = document.documentElement;
  const controls = [...stage.querySelectorAll('[data-spotlight-select]')];
  const panels = [...stage.querySelectorAll('[data-spotlight-panel]')];
  const numeral = stage.querySelector('[data-spotlight-number]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const canMove = () => !reduced.matches && !root.classList.contains('motion-paused');
  let current = 0, transitionToken = 0;
  // All chapters are ordinary HTML in no-JS mode. One is visible at a time
  // once buttons have initialized.
  const set = (index) => {
    index = Math.max(0, Math.min(panels.length - 1, index));
    current = index;
    stage.dataset.active = String(index);
    stage.style.setProperty('--active-index', String(index));
    controls.forEach((b, i) => {
      b.setAttribute('aria-pressed', String(i === index));
      b.tabIndex = i === index ? 0 : -1;
    });
    panels.forEach((p, i) => {
      p.hidden = i !== index;
      p.classList.toggle('is-active', i === index);
    });
    if (numeral) numeral.textContent = String(index + 1).padStart(2, '0');
  };
  const change = (index) => {
    if (index === current || index < 0 || index >= panels.length) return;
    if (canMove() && document.startViewTransition) {
      const token = ++transitionToken;
      try {
        const transition = document.startViewTransition(() => {
          if (token === transitionToken) set(index);
        });
        transition.finished.catch(() => {});
      } catch { set(index); }
    } else set(index);
  };
  stage.classList.add('spotlight-ready');
  controls.forEach((button,i) => {
    button.addEventListener('click', () => change(i));
    button.addEventListener('keydown', (event) => {
      const k = event.key;
      const next = k === 'ArrowRight' || k === 'ArrowDown' ? (i+1)%controls.length :
                   k === 'ArrowLeft' || k === 'ArrowUp' ? (i+controls.length-1)%controls.length :
                   k === 'Home' ? 0 : k === 'End' ? controls.length-1 : -1;
      if (next === -1) return;
      event.preventDefault();
      change(next);
      controls[next].focus();
    });
  });
  set(0);

  let touchStartX = null, touchStartY = null;
  const viewport = stage.querySelector('.spotlight-viewport');
  viewport?.addEventListener('touchstart',e=>{
    if(e.touches.length!==1)return;
    touchStartX=e.touches[0].clientX;touchStartY=e.touches[0].clientY;
  },{passive:true});
  viewport?.addEventListener('touchend',e=>{
    if(touchStartX===null || e.changedTouches.length!==1)return;
    const dx=e.changedTouches[0].clientX-touchStartX,dy=e.changedTouches[0].clientY-touchStartY;
    touchStartX=null;touchStartY=null;
    if(Math.abs(dx)>75&&Math.abs(dx)>Math.abs(dy)*1.45){
      change(Math.max(0,Math.min(panels.length-1,current+(dx<0?1:-1))));
    }
  },{passive:true});

  // Micro parallax is driven by pointer position, never by scrolling hijacks.
  const pointer = {x:.53,y:.5}, aim={x:.53,y:.5};
  const fine = matchMedia('(pointer: fine)');
  stage.addEventListener('pointermove',e=>{
    if(!fine.matches)return;
    const r=stage.getBoundingClientRect();
    aim.x=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));
    aim.y=Math.max(0,Math.min(1,(e.clientY-r.top)/r.height));
    stage.style.setProperty('--spot-x',(aim.x*100).toFixed(2)+'%');
    stage.style.setProperty('--spot-y',(aim.y*100).toFixed(2)+'%');
  },{passive:true});
  stage.addEventListener('pointerleave',()=>{
    aim.x=.53;aim.y=.5;
    stage.style.setProperty('--spot-x','53%');
    stage.style.setProperty('--spot-y','50%');
  });

  // A responsive original line field whose geometry changes with the chapter.
  // It complements the existing water hero without downloading heavy libraries.
  const canvas=document.createElement('canvas');
  canvas.className='spotlight-canvas';
  canvas.setAttribute('aria-hidden','true');
  stage.insertBefore(canvas,stage.firstChild);
  const ctx=canvas.getContext('2d',{alpha:true});
  if(!ctx)return;
  let w=1,h=1,dpr=1,raf=0,last=0,clock=0,visible=false,resizeReq=false;
  const resize=()=>{
    const r=stage.getBoundingClientRect();
    w=Math.max(1,Math.floor(r.width));h=Math.max(1,Math.floor(r.height));
    dpr=Math.min(devicePixelRatio||1,1.5);
    canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
    canvas.style.width=w+'px';canvas.style.height=h+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
    paint(clock);
  };
  const paint=(t)=>{
    ctx.clearRect(0,0,w,h);
    pointer.x+=(aim.x-pointer.x)*.04;
    pointer.y+=(aim.y-pointer.y)*.04;
    const cx=w*(w<750?.58:.55),cy=h*.47;
    ctx.save();
    ctx.globalCompositeOperation='screen';
    // Fine illuminated contour lines transform from orbit to path to rising field.
    for(let line=0;line<20;line++){
      const band=line/19;
      ctx.beginPath();
      const steps=w<750?42:76;
      for(let j=0;j<=steps;j++){
        const x=w*j/steps;
        let y=h*(.10+.82*band);
        if(current===0){
          y += Math.sin((x/w)*Math.PI*3.5+line*.11+t*.13)*(16+band*13);
          y += Math.cos(x/w*7.4+line*.38)*8;
        } else if(current===1){
          const dd=(x-cx)/Math.max(1,w);
          y += Math.sin(dd*12+line*.49-t*.16)*24;
          y += Math.sin(dd*27+line*.19+t*.11)*9;
        } else {
          y += (1-x/w)*h*.18*(.35+band)+Math.sin(x/w*8-line*.25-t*.19)*12;
        }
        if(j===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
      }
      ctx.lineWidth=line%5===0?.85:.5;
      ctx.strokeStyle=line%5===0?'rgba(215,196,151,.19)':'rgba(135,183,195,.105)';
      ctx.stroke();
    }
    // A deliberately spare navigation/measurement halo; different for each signal.
    const rr=Math.min(w,h)*(w<750?.29:.36);
    const ringX=cx+(pointer.x-.53)*w*.026;
    const ringY=cy+(pointer.y-.5)*h*.018;
    for(let i=0;i<5;i++){
      const radius=rr*(.35+i*.24);
      ctx.beginPath();
      ctx.ellipse(ringX,ringY,radius,radius*(current===2?.62:1),current===2?-.48:.12,0,Math.PI*2);
      ctx.lineWidth=i===4?1.05:.6;
      ctx.strokeStyle=i%2===0?'rgba(219,198,156,.2)':'rgba(181,214,217,.12)';
      ctx.stroke();
    }
    const maxPoints=w<750?18:38;
    for(let i=0;i<maxPoints;i++){
      const n=i+1;
      const a=n*2.39996+t*.015;
      const radius=rr*(.22+(n%7)*.115);
      const x=ringX+Math.cos(a)*radius, y=ringY+Math.sin(a)*radius*(current===2?.57:1);
      ctx.beginPath();ctx.arc(x,y,n%5===0?1.2:.7,0,Math.PI*2);
      ctx.fillStyle=n%5===0?'rgba(232,207,164,.63)':'rgba(180,217,216,.35)';ctx.fill();
    }
    ctx.restore();
  };
  const tick=time=>{
    raf=0;
    if(!visible||!canMove()||document.hidden)return;
    if(time-last<40){raf=requestAnimationFrame(tick);return;}
    last=time;clock=time*.001;paint(clock);
    raf=requestAnimationFrame(tick);
  };
  const schedule=()=>{
    if(!visible||!canMove()||document.hidden){
      if(raf)cancelAnimationFrame(raf);
      raf=0;paint(clock);
    } else if(!raf)raf=requestAnimationFrame(tick);
  };
  new IntersectionObserver(entries=>{
    visible=entries.some(e=>e.isIntersecting);
    schedule();
  },{threshold:0}).observe(stage);
  if('ResizeObserver' in window){
    new ResizeObserver(()=>resize()).observe(stage);
  }else addEventListener('resize',resize,{passive:true});
  document.addEventListener('visibilitychange',schedule);
  reduced.addEventListener('change',schedule);
  document.querySelector('#motion-toggle')?.addEventListener('click',()=>requestAnimationFrame(schedule));
  resize();schedule();

  // Magnetic discover dial follows only a few pixels, no forced custom cursor.
  const discover=document.querySelector('.hero-discover');
  if(discover&&fine.matches&&!reduced.matches){
    discover.addEventListener('pointermove',e=>{
      if(!canMove())return;
      const r=discover.getBoundingClientRect();
      discover.style.setProperty('--mag-x',((e.clientX-r.left-r.width/2)*.08).toFixed(2)+'px');
      discover.style.setProperty('--mag-y',((e.clientY-r.top-r.height/2)*.08).toFixed(2)+'px');
    });
    discover.addEventListener('pointerleave',()=>{
      discover.style.setProperty('--mag-x','0px');
      discover.style.setProperty('--mag-y','0px');
    });
  }
})();