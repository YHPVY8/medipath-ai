const assert=require('node:assert/strict');
const base='http://127.0.0.1:4175';
async function pause(ms=45){await new Promise(r=>setTimeout(r,ms));}
async function poll(fn){for(let i=0;i<100;i++){try{const r=await fn();if(r)return r;}catch{}await pause();}throw Error('Preview timed out');}
(async()=>{
 const target=await poll(async()=>(await(await fetch('http://127.0.0.1:9335/json/list')).json()).find(x=>x.type==='page'));
 const ws=new WebSocket(target.webSocketDebuggerUrl), jobs=new Map();let i=0;
 await new Promise((r,j)=>{ws.addEventListener('open',r,{once:true});ws.addEventListener('error',j,{once:true});});
 ws.addEventListener('message',({data})=>{const v=JSON.parse(data);if(jobs.has(v.id)){const [r,j]=jobs.get(v.id);jobs.delete(v.id);v.error?j(v.error):r(v.result);}});
 const send=(method,params={})=>new Promise((r,j)=>{const id=++i;jobs.set(id,[r,j]);ws.send(JSON.stringify({id,method,params}));});
 const ev=async expression=>{const x=await send('Runtime.evaluate',{expression,returnByValue:true});if(x.exceptionDetails)throw Error(x.exceptionDetails.exception.description);return x.result.value;};
 try {
  for(const width of [390,1280]){
   await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width===390});
   for(const route of ['/en/flow/','/es/flow/','/en/terms/','/en/privacy/','/es/terms/','/es/privacy/','/en/flow/signup/','/es/flow/signup/']){
    await send('Page.navigate',{url:base+route});
    await poll(()=>ev(`location.pathname===${JSON.stringify(route)} && document.readyState==='complete'`));
    assert.equal(await ev('document.documentElement.scrollWidth<=innerWidth'),true,`overflow ${route} ${width}`);
    if(route.endsWith('/flow/')){
     assert.equal(await ev('document.querySelectorAll("[name=practiceCountry],#international-signup").length'),0);
     assert.equal(await ev('document.querySelector(".flow-hero-actions .primary").getAttribute("href")'),route+'signup/');
     for(const tab of ['does','time','video']){
      await ev(`document.querySelector('#flow-tab-${tab}').click()`);
      assert.equal(await ev(`document.querySelector('#flow-panel-${tab}').hidden`),false);
     }
    }else if(route.endsWith('/signup/')){
     await poll(()=>ev('document.querySelector("[name=practiceCountry]").options.length===250'));
     assert.equal(await ev('document.querySelector("[data-international-form]").hidden'),true);
     await ev('const c=document.querySelector("[name=practiceCountry]");c.value="BR";c.dispatchEvent(new Event("change"));');
     assert.equal(await ev('document.querySelector("[data-international-form]").hidden'),true);
     assert.equal(await ev(`[...document.querySelectorAll('a')].some(a=>new URL(a.href).pathname==='/flow/' && new URL(a.href).hash==='#teste-gratuito')`),true);
    }else{
     assert.equal(await ev('document.querySelector("meta[name=robots]").content'),'noindex, nofollow');
     assert.equal(await ev('document.querySelectorAll("article section").length'),route.includes('/terms/')?24:12);
    }
   }
  }
  await ev('sessionStorage.removeItem("medipath-practice-country")');
  await send('Page.navigate',{url:base+'/en/flow/signup/?fixture=1'});
  await poll(()=>ev('document.querySelector("[name=practiceCountry]")?.value==="CA" && !document.querySelector("[data-international-form]").hidden'));
  await ev('document.querySelector("[name=doctorName]").value="Synthetic Example";const c=document.querySelector("[name=practiceCountry]");c.value="MX";c.dispatchEvent(new Event("change"));');
  await poll(()=>ev('!document.querySelector("[data-international-form]").hidden'));
  assert.equal(await ev('document.querySelector("[name=doctorName]").value'),'Synthetic Example');
  assert.equal(await ev('document.querySelector("[name=countryConfirmed]").checked'),false);
  console.log('PASS 16 mobile/desktop page checks, three tabs, single signup-country control, closed signup and legal draft sections');
 } finally { ws.close(); }
})().catch(e=>{console.error(e);process.exitCode=1});
