import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const root='http://127.0.0.1:3000';
await mkdir('artifacts',{recursive:true});
const browser=await chromium.launch({headless:true});
const failures=[];
const expect=async(condition,label)=>{if(!condition)throw Error(label)};
async function visit(name,viewport,url,shot,checks){
  const context=await browser.newContext({viewport,deviceScaleFactor:1,reducedMotion:'reduce'});
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',err=>errors.push(err.message));
  const response=await page.goto(root+url,{waitUntil:'networkidle',timeout:25000});
  if(!response||response.status()!==200)failures.push(name+': HTTP '+response?.status());
  await page.evaluate(()=>document.fonts.ready);
  await page.waitForTimeout(150);
  try{await checks(page);}catch(e){failures.push(name+': '+e.message);}
  await page.screenshot({path:'artifacts/'+shot,fullPage:true,animations:'disabled'});
  if(errors.length)failures.push(name+': runtime '+errors.join(' / '));
  await context.close();
}
await visit('Desktop curated homepage',{width:1440,height:900},'/','home-desktop.png',async p=>{
  await expect((await p.title()).includes('Dulten Richard Fromentin'),'full-name title absent');
  await expect((await p.title()).includes('Leadership & Service'),'new page title missing');
  await expect(await p.locator('.current-field').count()===1,'cinematic current field missing');
  await expect(await p.locator('.waypoint-nav a').count()===4,'four-chapter navigation missing');
  await expect(await p.locator('.signature-item').count()===3,'exactly three highlights expected');
  await expect(await p.locator('.closing-chapter blockquote').count()===1,'closing quote missing');
  await expect(await p.locator('.project-chapter, .lab-teaser, .home-equinox, .archive-invite, .manifesto-interlude').count()===0,'archived showcase leaked into homepage');
  await expect(await p.locator('.site-header nav a[href*="linkedin.com"]').count()===1,'LinkedIn missing from main nav');
  await expect(await p.locator('.site-header nav a[href="/projects/"]').count()===0,'Projects still in main nav');
  await expect(await p.locator('#motion-toggle').isVisible(),'pause motion control missing');
});
await visit('Mobile curated homepage',{width:390,height:844},'/','home-mobile.png',async p=>{
  await expect(await p.locator('.hero h1').isVisible(),'mobile hero missing');
  await expect(await p.locator('.signature-item').count()===3,'mobile highlights missing');
  await expect(await p.locator('.closing-links a[href*="linkedin.com"]').count()===1,'LinkedIn CTA missing');
  await expect(!(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+3)),'horizontal overflow');
});
await visit('Legacy projects retired',{width:1440,height:900},'/projects/','projects-retired.png',async p=>{
  await expect(await p.locator('meta[name="robots"]').getAttribute('content')==='noindex,follow','legacy page not hidden from indexing');
  await expect(await p.locator('.project-detail, .lab-graphic').count()===0,'project material still visibly published');
  await expect(await p.locator('a[href*="linkedin.com"]').count()>0,'LinkedIn handoff missing');
});
await visit('Mobile contact',{width:390,height:844},'/contact/','contact-mobile.png',async p=>{
  await expect(await p.locator('a[href^="mailto:"]').count()>0,'contact email missing');
  await expect(await p.locator('.site-header nav a[href="/projects/"]').count()===0,'Projects leaked into navigation');
  await expect(!(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+3)),'mobile contact overflows');
});
await browser.close();
if(failures.length){console.error(failures.join('\n'));process.exitCode=1;}
else console.log('Curated homepage, archive retirement and mobile contact checks passed.');
