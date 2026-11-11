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
async function update() {
 const current = ++revision, selected=country.value;
 // Switching country changes presentation only; preserve both modes' drafts.
 const pairs=[['doctorName','full_name'],['email','email'],['city','city'],['state','state'],['specialty','specialty']];
 const from=selected==='BR'?document.querySelector('[data-international-form]'):legacy;
 const to=selected==='BR'?legacy:document.querySelector('[data-international-form]');
 for(const [internationalName,brazilName]of pairs){
  const source=from.querySelector(`[name="${selected==='BR'?internationalName:brazilName}"]`);
  const target=to.querySelector(`[name="${selected==='BR'?brazilName:internationalName}"]`);
  if(source?.value && target && !target.value && (internationalName!=='state' || selected!=='BR' || /^[a-z]{2}$/i.test(source.value)))target.value=source.value;
 }
 legacy.hidden=selected!=='BR';body.hidden=selected==='BR';
 document.querySelector('[data-signup-status]').hidden=selected==='BR';
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
const endpoint=(window.MEDIPATH_INTERNATIONAL ?? window.MEDIPATH_INTERNATIONAL_PREVIEW)?.visitorCountryPath ?? '/api/public/visitor-country';
if(typeof endpoint==='string' && endpoint.startsWith('/') && !endpoint.startsWith('//')) {
 const initial=country.value;
 void fetch(endpoint,{cache:'no-store'}).then(r=>r.ok?r.json():null).then(signal=>{
  if(manual || initial || country.value || !Object.hasOwn(countries,signal?.country))return;
  country.value=signal.country;country.dispatchEvent(new Event('change'));
 }).catch(()=>{});
}
