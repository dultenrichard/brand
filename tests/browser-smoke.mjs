import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const root='http://127.0.0.1:3000';
await mkdir('artifacts',{recursive:true});
const browser=await chromium.launch({headless:true});
const failures=[];
const check=(condition,message)=>{if(!condition)throw Error(message)};
async function visit(name,viewport,url,shot,assertions){
  const context=await browser.newContext({viewport,deviceScaleFactor:1,reducedMotion:'reduce'});
  const page=await context.newPage(), errors=[], assets=[];
  page.on('pageerror',err=>errors.push(err.message));
  page.on('response',res=>{if(res.status()===404 && new URL(res.url()).pathname!== '/favicon.ico')assets.push(res.url());});
  const response=await page.goto(root+url,{waitUntil:'networkidle',timeout:30000});
  if(!response||response.status()!==200) failures.push(name+': HTTP '+response?.status());
  await page.evaluate(()=>document.fonts.ready);
  await page.waitForTimeout(160);
  try{await assertions(page);}catch(e){failures.push(name+': '+e.message);}
  await page.screenshot({path:'artifacts/'+shot,fullPage:true,animations:'disabled'});
  if(errors.length)failures.push(name+': runtime '+errors.join(' / '));
  if(assets.length)failures.push(name+': assets 404 '+assets.join(', '));
  await context.close();
}
await visit('Desktop home', {width:1440,height:900},'/', 'home-desktop.png', async page=>{
  check((await page.title()).includes('Dulten Richard Fromentin'),'site identity title');
  check(await page.locator('.current-field').count()===1,'animated water hero missing');
  check(await page.locator('.hero-discover').count()===1,'orbit discover interaction missing');
  check(await page.locator('.waypoint-nav a').count()===4,'4 waypoints expected');
  check(await page.locator('.spotlight-stage').count()===1,'interactive stage absent');
  check(await page.locator('.spotlight-select').count()===3,'3 highlight selectors expected');
  check(await page.locator('.spotlight-panel').count()===3,'3 highlight chapters expected');
  check(await page.locator('.spotlight-panel:not([hidden])').count()===1,'exactly 1 featured chapter shown');
  check(await page.locator('.spotlight-canvas').count()===1,'dynamic stage art missing');
  check(await page.locator('.project-chapter,.signature-list,.archive-invite').count()===0,'unwanted catalogue remained');
  check(await page.locator('.site-header nav a[href*="linkedin.com"]').count()===1,'LinkedIn nav');
  await page.locator('[data-spotlight-select="1"]').click();
  await page.waitForFunction(()=>document.querySelector('[data-spotlight]').dataset.active==='1',{timeout:2000});
  check((await page.locator('#spotlight-panel-2 h3').textContent()).includes('205'),'205 signal absent');
  check(await page.locator('#spotlight-panel-1').isHidden(),'former stage still visible');
  await page.locator('[data-spotlight-select="1"]').focus();
  await page.keyboard.press('ArrowRight');
  await page.waitForFunction(()=>document.querySelector('[data-spotlight]').dataset.active==='2',{timeout:2000});
  check(await page.locator('[data-spotlight-select="2"]').getAttribute('aria-pressed')==='true','keyboard selection inaccessible');
  await page.locator('[data-spotlight-select="0"]').click();
  await page.waitForFunction(()=>document.querySelector('[data-spotlight]').dataset.active==='0',{timeout:2000});
});
await visit('Mobile home',{width:390,height:844},'/','home-mobile.png',async page=>{
  check(await page.locator('.hero h1').isVisible(),'name missing');
  check(await page.locator('.spotlight-select').count()===3,'mobile chapter controls absent');
  check(await page.locator('.spotlight-panel:not([hidden])').count()===1,'multiple chapters stacked on mobile');
  check(await page.locator('.closing-links a[href*="linkedin.com"]').count()===1,'LinkedIn CTA missing');
  const menu=page.locator('.menu-open');
  check(await menu.isVisible(),'mobile menu control missing');
  await menu.click();
  check(await page.locator('#site-menu').evaluate(el=>el.open),'menu did not open');
  await page.locator('#site-menu .dialog-close').click();
  await page.locator('[data-spotlight-select="2"]').click();
  await page.waitForFunction(()=>document.querySelector('[data-spotlight]').dataset.active==='2',{timeout:2000});
  check(!(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+3)),'horizontal overflow');
});
await visit('Retired project legacy',{width:1440,height:900},'/projects/','projects-retired.png',async page=>{
  check(await page.locator('meta[name=robots]').getAttribute('content')==='noindex,follow','legacy project still indexed');
  check(await page.locator('.project-detail,.lab-graphic').count()===0,'project content still promoted');
});
await visit('Mobile contact',{width:390,height:844},'/contact/','contact-mobile.png',async page=>{
  check(await page.locator('a[href^="mailto:"]').count()>0,'email missing');
  check(!(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+3)),'horizontal overflow');
});
await browser.close();
if(failures.length){console.error(failures.join('\n'));process.exitCode=1;}
else console.log('Cinematic homepage, interactive chapter navigation, mobile menu, archive and contact QA passed.');
