// Rendered regression: route locale, persisted preferences, country pricing and responsive header.
// Local fixtures only: no signup submissions or production analytics writes.
const assert = require('node:assert/strict');
const {mkdirSync,writeFileSync} = require('node:fs');
const {execFileSync} = require('node:child_process');
const {chromium} = require('playwright');
const base=process.env.PREVIEW_URL || 'http://127.0.0.1:4192';
const out=process.env.REVIEW_OUTPUT || '/private/tmp/medipath-flow-locale-review';
const offer={standardDisplayedPrice:99,launchDisplayedPrice:49,trialDays:14,effectiveLaunchOfferActive:true,websiteVisible:true,emergencyPaused:false,founderHeadline:'Condição especial de lançamento para os primeiros médicos Medipath.',founderCopy:'Ative sua assinatura nos primeiros 14 dias e garanta R$49/mês enquanto sua assinatura permanecer ativa.'};
const baselineRevision='2a90638df1636696221de0692b9b49e287f6b826';
const locales=[['pt','/flow/','PT','Soluções'],['en','/en/flow/','EN','Solutions'],['es','/es/flow/','ES','Soluciones']];
(async()=>{
 mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const report=[];
 async function context(baseline=false){
  const ctx=await browser.newContext();
  await ctx.addInitScript(()=>{localStorage.setItem('medipath-language',location.pathname.startsWith('/en/')?'pt':'en');if(!sessionStorage.getItem('medipath-practice-country'))sessionStorage.setItem('medipath-practice-country','BR');});
  await ctx.route('**/*',async route=>{
   const url=new URL(route.request().url());const path=url.pathname;
   if(path.includes('/api/')){
    let data=path.endsWith('/pricing')?offer:path.endsWith('/visitor-country')?{}:path.includes('international-offer')?{available:true,signupAvailable:true,currency:'USD',monthlyAmountMinor:2400,trialDays:14,environment:'sandbox'}:{};
    return route.fulfill({json:data,headers:{'access-control-allow-origin':base,'access-control-allow-credentials':'true'}});
   }
   if(url.hostname==='challenges.cloudflare.com')return route.fulfill({contentType:'application/javascript',body:'window.turnstile={render:()=>1,reset:()=>{},remove:()=>{}};'});
   if(baseline&&url.origin===base){
    const file=decodeURIComponent(path).slice(1)+(path.endsWith('/')?'index.html':'');
    try {return route.fulfill({body:execFileSync('git',['show',baselineRevision+':'+file]),contentType:file.endsWith('.css')?'text/css':file.endsWith('.js')?'application/javascript':file.endsWith('.svg')?'image/svg+xml':file.endsWith('.png')?'image/png':'text/html'});}catch{return route.fulfill({status:404,body:''});}
   }
   return route.continue();
  });return ctx;
 }
 const baseline=await context(true),old=await baseline.newPage();await old.setViewportSize({width:1440,height:1000});await old.goto(base+'/flow/');await old.waitForTimeout(500);await old.screenshot({path:out+'/desktop-before.png'});
 const desktopBefore=await old.locator('.flow-intro').evaluate(el=>({rect:el.getBoundingClientRect().toJSON(),html:el.innerHTML}));
 // Baseline persisted EN reproduces mixed-language Brazilian route.
 assert.match(await old.locator('h1').innerText(),/What if/);
 assert.equal(await old.locator('[data-flow-language]').inputValue(),'/flow/');
 await baseline.close();
 const ctx=await context(),page=await ctx.newPage();let errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 for(const width of [375,390,430,1440])for(const [locale,path,selected,solutions] of locales){
  await page.setViewportSize({width,height:1200});await page.goto(base+path);await page.waitForTimeout(400);
  assert.equal(await page.locator('html').getAttribute('lang'),locale==='pt'?'pt-BR':locale==='en'?'en-US':'es');
  assert.equal(await page.locator('[data-flow-language]').inputValue(),path);
  assert.equal(await page.locator('[data-flow-language] option:checked').innerText(),selected);
  assert.equal(await page.locator('.master-nav a').last().innerText(),solutions);
  const nav=await page.locator('.master-header').evaluate(el=>{
   const links=[...el.querySelectorAll('.master-nav a')];const selector=el.querySelector('[data-flow-language]');
   return {ys:links.map(a=>a.getBoundingClientRect().y+a.getBoundingClientRect().height/2).concat(selector.getBoundingClientRect().y+selector.getBoundingClientRect().height/2),ends:links.at(-1).getBoundingClientRect().right,selectX:selector.getBoundingClientRect().x,overflow:document.documentElement.scrollWidth>innerWidth,login:[...el.querySelectorAll('[data-login-link]')].some(a=>!!a.getClientRects().length)};
  });assert.equal(nav.overflow,false,`${locale} ${width} overflow`);
  if(width<761){assert.ok(Math.max(...nav.ys)-Math.min(...nav.ys)<2,`${locale} ${width} nav rows`);assert.ok(nav.selectX>nav.ends);assert.equal(nav.login,false);}else if(locale==='pt')assert.equal(nav.login,true);
  if(locale==='pt'){
   assert.match(await page.locator('h1').innerText(),/^E se/);assert.match(await page.locator('[data-pricing-founder-headline]').innerText(),/^Condição/);
   assert.match(await page.locator('[data-pricing-price]').innerText(),/49/);
   assert.match(await page.locator('[data-pricing-standard]').innerText(),/99/);
   assert.equal(await page.locator('.flow-access-button').getAttribute('href'),'#teste-gratuito');
   assert.equal(await page.locator('.flow-app-store-badge').getAttribute('href'),'https://apps.apple.com/br/app/medipath-flow/id6824710389');
  }else{
   await page.locator('[name=practiceCountry]').selectOption('BR');await page.waitForTimeout(100);
   assert.equal(await page.locator('[name=practiceCountry]').inputValue(),'BR');
   assert.equal(await page.locator('[data-brazil-inline]').isVisible(),true);
   const support=await page.locator('[data-trial-support]').innerText();assert.match(support,locale==='en'?/days free.*No credit card/:/días gratis.*Sin tarjeta/);assert.match(support,/99/);if(width===390)await page.screenshot({path:out+'/'+locale+'-390-br.png',fullPage:true});
   await page.locator('[name=practiceCountry]').selectOption('US');await page.waitForTimeout(100);
   assert.equal(await page.locator('[data-brazil-inline]').isVisible(),false);assert.match(await page.locator('[data-global-price]').innerText(),/24/);
   assert.equal(await page.locator('[name=practiceCountry]').inputValue(),'US');
   assert.equal(await page.locator('[name=countryConfirmed]').inputValue(),'true');
  }
  if(locale!=='pt')assert.doesNotMatch(await page.locator('body').innerText(),/Condição especial|Preço padrão|dias gratuitos|por mês|Sem cartão|Escolha seu perfil|Nome Completo|Suporte/,`${locale} mixed Portuguese`);
  assert.deepEqual(errors,[]);
  if(width===390){await page.screenshot({path:out+'/'+locale+'-390.png',fullPage:true});await page.screenshot({path:out+'/'+locale+'-390-viewport.png'});}
  if(width===1440&&locale==='pt'){
   await page.setViewportSize({width,height:1000});await page.screenshot({path:out+'/desktop-after.png'});
   const current=await page.locator('.flow-intro').evaluate(el=>({rect:el.getBoundingClientRect().toJSON(),html:el.innerHTML}));
   // Family preference previously replaced hero DOM; approved PT geometry is compared in a clean context below.
   assert.ok(current.rect.width===desktopBefore.rect.width);
  }
  report.push({locale,width,result:'PASS'});
 }
 for(const [locale,path]of locales){await page.locator('[data-flow-language]').selectOption(path);await page.waitForURL(base+path);await page.reload();assert.equal(await page.locator('[data-flow-language]').inputValue(),path);assert.equal(await page.locator('html').getAttribute('lang'),locale==='pt'?'pt-BR':locale==='en'?'en-US':'es');if(locale!=='pt')assert.equal(await page.locator('[name=practiceCountry]').inputValue(),'US','country survives locale switch and reload');}
 const {readFileSync}=require('node:fs');
 const source=readFileSync('onboarding.js','utf8'), original=execFileSync('git',['show',baselineRevision+':onboarding.js'],{encoding:'utf8'});
 assert.equal(source.slice(source.indexOf('  form?.addEventListener("submit"'),source.indexOf('  applyLanguage(currentLanguage);')),original.slice(original.indexOf('  form?.addEventListener("submit"'),original.indexOf('  applyLanguage(currentLanguage);')),'submission and success handlers unchanged');
 // Desktop preservation with approved Portuguese preference, compared against HEAD.
 const clean=await context(true);await clean.addInitScript(()=>localStorage.setItem('medipath-language','pt'));const b=await clean.newPage();await b.setViewportSize({width:1440,height:1000});await b.goto(base+'/flow/');await b.waitForTimeout(300);
 await page.setViewportSize({width:1440,height:1000});await page.goto(base+'/flow/');await page.waitForTimeout(300);
 const geometry=p=>p.locator('.flow-intro, .flow-intro h1, .flow-dashboard-frame, .flow-access-options, .master-header').evaluateAll(els=>els.map(el=>({rect:el.getBoundingClientRect().toJSON(),font:getComputedStyle(el).font,text:el.textContent.trim()})));
 assert.equal(await page.locator('body').innerText(),await b.locator('body').innerText(),'approved PT desktop copy preserved');
 assert.deepEqual(await geometry(page),await geometry(b),'approved desktop geometry/copy preserved');
 await b.screenshot({path:out+'/desktop-approved-baseline.png'});
 await page.screenshot({path:out+'/desktop-after.png'});
 await clean.close();await ctx.close();await browser.close();
 writeFileSync(out+'/results.json',JSON.stringify({matrix:report,languageSwitchAndReload:'PASS',desktopPreservation:'PASS',productionRequests:'mocked; no mutations'},null,2));
 console.log('PASS 12 rendered locale/viewport combinations, country BR/US pricing, saved-locale conflict, switching/reload, desktop geometry preservation. Screenshots: '+out);
})().catch(e=>{console.error(e);process.exit(1)});
