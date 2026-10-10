import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
const root='http://127.0.0.1:3000';
await mkdir('artifacts',{recursive:true});
const browser=await chromium.launch({headless:true});
const failures=[];
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
const expect=async(condition,label)=>{if(!condition)throw Error(label)};
await visit('Desktop home',{width:1440,height:900},'/','home-desktop.png',async p=>{
  await expect((await p.title()).includes('Dulten Richard Fromentin'),'full-name title absent');
  await expect(await p.locator('.current-field').count()===1,'animated field missing');
  await expect(await p.locator('.waypoint-nav a').count()===5,'chapter navigation missing');
  await expect(await p.locator('.manifesto-interlude h2').count()===1,'cinematic interlude missing');
  await expect(await p.locator('.lab-teaser').count()===1,'workshop feature missing');
  await expect(await p.locator('.hero h1').isVisible(),'hero heading missing');
  await expect(await p.locator('#motion-toggle').isVisible(),'pause-motion control missing');
});
await visit('Mobile home',{width:390,height:844},'/','home-mobile.png',async p=>{
  await expect(await p.locator('.hero h1').isVisible(),'mobile hero heading missing');
  await expect(await p.locator('.lab-teaser').isVisible(),'mobile workshop absent');
  const clipped=await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+3);
  await expect(!clipped,'horizontal overflow on mobile');
});
await visit('Desktop projects',{width:1440,height:900},'/projects/','projects-desktop.png',async p=>{
  await expect(await p.locator('.lab-graphic').count()===1,'workshop artwork missing');
  const phases=p.locator('.workshop-phases button');
  await expect(await phases.count()===4,'four phase controls missing');
  await phases.nth(1).click();
  await expect((await p.locator('.workshop-phase-copy strong').textContent()).includes('plan together'),'Decide stage failed');
  await phases.nth(2).click();
  await expect((await p.locator('.workshop-phase-copy strong').textContent()).includes('uncomfortable'),'Act stage failed');
});
await visit('Mobile projects',{width:390,height:844},'/projects/','projects-mobile.png',async p=>{
  await expect(await p.locator('.workshop-phases button').count()===4,'mobile phase controls missing');
  await expect(await p.locator('.project-detail').count()===2,'project sections missing');
  const clipped=await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+3);
  await expect(!clipped,'horizontal overflow on mobile project page');
});
await browser.close();
if(failures.length){console.error(failures.join('\n'));process.exitCode=1;}
else console.log('Chromium smoke tests passed: four screenshots, both viewports and interactive workshop.');
