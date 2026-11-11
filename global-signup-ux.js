// Presentation state never grants signup eligibility or supplies a Stripe price.
import {countries} from './flow-international-countries.js';
const country = document.querySelector('[name=practiceCountry]');
const legacy = document.querySelector('[data-brazil-inline]');
const body = document.querySelector('[data-global-fields]');
const price = document.querySelector('[data-global-price]');
const language = document.documentElement.lang.startsWith('en') ? 'en-US' : 'es';
const neutral = language === 'es' ? 'Selecciona tu país para consultar el plan.' : 'Choose your country to view the plan.';
price.textContent = neutral;
let manual = false, revision = 0;
const safeFields = ['doctorName','email','phone','jurisdiction','city','state','specialty'];
try {
 const draft = JSON.parse(sessionStorage.getItem('medipath-global-draft') || 'null');
 if(draft && Date.now()-draft.created >= 0 && Date.now()-draft.created < 300000) {
  for(const name of safeFields) {
   const input = document.querySelector(`[data-international-form] [name="${name}"]`);
   if(input && typeof draft[name] === 'string' && draft[name].length <= 254) input.value=draft[name];
  }
 }
} catch {}
for(const link of document.querySelectorAll('.flow-languages a')) link.addEventListener('click',()=>{
 const draft = {created:Date.now()};
 for(const name of safeFields) {const field=document.querySelector(`[data-international-form] [name="${name}"]`);if(field)draft[name]=field.value;}
 try {sessionStorage.setItem('medipath-global-draft',JSON.stringify(draft));}catch{}
 const url = new URL(link.href);url.hash='international-signup';link.href=url.href;
});
async function update() {
 const current = ++revision, selected=country.value;
 legacy.hidden=selected!=='BR';body.hidden=selected==='BR';
 price.textContent=neutral;
 if(!selected)return;
 try {
  const url=selected==='BR'?'/api/public/commercial/pricing':`/api/public/commercial/international-offer?country=${encodeURIComponent(selected)}`;
  const response=await fetch(url,{cache:'no-store'});if(!response.ok)throw Error();
  const quote=await response.json();if(current!==revision)return;
  if(selected==='BR') {
   if(quote.websiteVisible!==true || quote.emergencyPaused || !Number.isFinite(quote.standardDisplayedPrice) || quote.standardDisplayedPrice<=0)throw Error();
   price.textContent=new Intl.NumberFormat(language,{style:'currency',currency:'BRL'}).format(quote.standardDisplayedPrice)+(language==='es'?' / mes':' / month');
  } else {
   if(quote.available!==true || quote.currency!=='USD' || quote.monthlyAmountMinor!==2400 || quote.trialDays!==14)throw Error();
   price.textContent=new Intl.NumberFormat(language,{style:'currency',currency:'USD',currencyDisplay:'code'}).format(quote.monthlyAmountMinor/100)+(language==='es'?' / mes':' / month');
  }
 } catch { if(current===revision) price.textContent=language==='es'?'Precio no disponible por ahora.':'Pricing is currently unavailable.'; }
}
country.addEventListener('change',()=>{manual=true;void update();});
void update();
// A configured same-origin Cloudflare endpoint supplies country only, never precise location.
const endpoint=window.MEDIPATH_INTERNATIONAL?.visitorCountryPath;
if(typeof endpoint==='string' && endpoint.startsWith('/') && !endpoint.startsWith('//')) {
 const initial=country.value;
 void fetch(endpoint,{cache:'no-store'}).then(r=>r.ok?r.json():null).then(signal=>{
  if(manual || initial || country.value || !Object.hasOwn(countries,signal?.country))return;
  country.value=signal.country;country.dispatchEvent(new Event('change'));
 }).catch(()=>{});
}
