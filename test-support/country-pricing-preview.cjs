const http=require('node:http'), fs=require('node:fs'), path=require('node:path');
const root=process.cwd(), requests=[];
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.mp4':'video/mp4','.woff2':'font/woff2'};
http.createServer(async(req,res)=>{
 const url=new URL(req.url,'http://127.0.0.1:4175');
 res.setHeader('X-Robots-Tag','noindex, nofollow');
 if(url.pathname==='/onboarding-config.js'){res.setHeader('Content-Type','text/javascript');return res.end('window.MEDIPATH_ONBOARDING_CONFIG={mode:"preview"};');}
 if(url.pathname==='/flow-international-config.js'){
  res.setHeader('Content-Type','text/javascript');
  if(req.headers.referer?.includes('fixture=1')){
   const agreement={termsVersion:'fixture-terms',privacyVersion:'fixture-privacy',termsUrl:'/termos-de-uso/',privacyUrl:'/politica-de-privacidade/'};
   return res.end('window.MEDIPATH_INTERNATIONAL_PREVIEW='+JSON.stringify({enabled:true,hostname:'127.0.0.1',turnstileSiteKey:'fixture',eventsEnabled:true,agreements:{en:agreement,es:agreement,'pt-BR':agreement}})+';window.turnstile={render(el,o){o.callback("synthetic-token");return "widget"},remove(){},reset(){}};');
  }
 }
 if(url.pathname==='/api/public/commercial/pricing'){res.setHeader('Content-Type','application/json');return res.end(JSON.stringify({standardDisplayedPrice:99,websiteVisible:true,emergencyPaused:false}));}
 if(url.pathname==='/api/public/commercial/international-offer'){
  const country=url.searchParams.get('country');
  res.setHeader('Content-Type','application/json');
  if(!['US','MX','ES','PT'].includes(country)){res.statusCode=404;return res.end('{"available":false}');}
  return res.end(JSON.stringify({available:true,signupAvailable:true,environment:'sandbox',currency:'USD',monthlyAmountMinor:2400,trialDays:14}));
 }
 if(url.pathname==='/api/public/doctors/onboard'||url.pathname==='/api/public/website/international-event'){
  let raw='';for await(const chunk of req) raw+=chunk;requests.push({path:url.pathname,body:JSON.parse(raw)});
  res.statusCode=202;return res.end('{"accepted":true}');
 }
 if(url.pathname==='/fixture-requests'){res.setHeader('Content-Type','application/json');return res.end(JSON.stringify(requests));}
 let target=path.join(root,url.pathname);if(url.pathname.endsWith('/'))target=path.join(target,'index.html');
 if(!target.startsWith(root+path.sep)||!fs.existsSync(target)){res.statusCode=404;return res.end();}
 res.setHeader('Content-Type',mime[path.extname(target)]||'application/octet-stream');
 fs.createReadStream(target).pipe(res);
}).listen(4175,'127.0.0.1');
