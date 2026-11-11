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
   for(const [route,country,expected] of [['/flow/','BR','R$99/mês'],['/en/flow/','BR','R$99/month'],['/en/flow/','US','US$24/month'],['/es/flow/','MX','US$24/mes'],['/es/flow/','ES','US$24/mes'],['/flow/international/','PT','US$24/mês'],['/en/flow/','AQ','unavailable']]){
    await send('Page.navigate',{url:base+route+'?fixture=1&country='+country});
    await poll(()=>ev(`location.pathname===${JSON.stringify(route)} && document.readyState==='complete' && document.querySelector('[data-pricing-country]')?.options.length===250`));
    await poll(()=>ev(`document.querySelector('[data-country-quote]').textContent.includes(${JSON.stringify(expected)})`));
    assert.equal(await ev('document.documentElement.scrollWidth<=innerWidth'),true,`overflow ${route} ${width}`);
    if(route!=='/flow/'){
      assert.equal(await ev('document.querySelector("[name=practiceCountry]").value'),country);
      assert.equal(await ev('document.querySelector("[name=countryConfirmed]").checked'),false);
      await ev('const c=document.querySelector("[data-pricing-country]");c.value="MX";c.dispatchEvent(new Event("change"));');
      assert.equal(await ev('document.querySelector("[name=practiceCountry]").value'),'MX');
    }
   }
  }
  console.log('PASS 14 mobile/desktop country-language scenarios; signup sync, unchecked confirmation, authoritative prices, unsupported denial');
 } finally { ws.close(); }
})().catch(e=>{console.error(e);process.exitCode=1});
