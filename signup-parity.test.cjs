const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
for(const path of ['en/flow/index.html','es/flow/index.html','en/flow/signup/index.html','es/flow/signup/index.html','flow/international/index.html'])test(path+' exposes only seven registration fields',()=>{
 const html=fs.readFileSync(path,'utf8').match(/<form[^>]*data-international-form[^>]*>([\s\S]*?)<\/form>/)[1];
 const names=[...html.matchAll(/<(?:input|select)\b[^>]*>/g)].map(m=>m[0]).filter(t=>!t.includes('type="hidden"')&&!t.includes('type="checkbox"')).map(t=>t.match(/name="([^"]+)"/)[1]);
 assert.deepEqual(names,['practiceCountry','doctorName','email','city','state','specialty','whatsapp']);
 assert.doesNotMatch(html,/name="(?:registration|issuingCountry|phoneCountry|dateRegion|jurisdiction)"/);
});
