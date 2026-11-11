const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const worker=import('data:text/javascript;base64,'+Buffer.from(fs.readFileSync('edge/visitor-country.js','utf8')).toString('base64'));
test('trusted Cloudflare country is a suggestion; spoofed headers and query do not supply it',async()=>{
 const handler=(await worker).default;
 for(const country of ['AR','BR']){
  const req=new Request('https://example.test/api/public/visitor-country');Object.defineProperty(req,'cf',{value:{country}});
  const res=await handler.fetch(req);assert.deepEqual(await res.json(),{country});assert.equal(res.headers.get('cache-control'),'no-store');
 }
 const spoof=new Request('https://example.test/api/public/visitor-country?country=BR',{headers:{'cf-ipcountry':'AR'}});
 assert.deepEqual(await(await handler.fetch(spoof)).json(),{country:null});
 assert.equal((await handler.fetch(new Request('https://example.test/',{method:'POST'}))).status,405);
});
