import { countries } from './flow-international-countries.js';
const root = document.querySelector('[data-country-pricing]');
const language = document.documentElement.lang;
const copy = {
  'pt-BR': {closed:'O cadastro não está disponível para este país no momento.', choose:'Selecione seu país de atuação.', month:'mês', signup:'Continuar com este país', br:'Cadastro brasileiro', founder:'Brasil: R$49/mês somente para contas existentes elegíveis ao plano Fundador.'},
  en: {closed:'Registration is currently unavailable for this country.', choose:'Select your practice country.', month:'month', signup:'Continue with this country', br:'Brazilian registration', founder:'Brazil: R$49/month only for eligible existing Founder accounts.'},
  es: {closed:'El registro no está disponible para este país por ahora.', choose:'Selecciona tu país de ejercicio.', month:'mes', signup:'Continuar con este país', br:'Registro brasileño', founder:'Brasil: R$49/mes solo para cuentas existentes elegibles al plan Fundador.'},
}[language];
const select = root.querySelector('[data-pricing-country]');
const quote = root.querySelector('[data-country-quote]');
const cta = root.querySelector('[data-country-cta]');
const signup = document.querySelector('[name=practiceCountry]');
const names = new Intl.DisplayNames([language], {type:'region'});
Object.keys(countries).map(code=>[code,names.of(code)]).sort((a,b)=>a[1].localeCompare(b[1],language)).forEach(([code,name])=>select.add(new Option(name,code)));
let sequence = 0;
function remember(country) {
  try { sessionStorage.setItem('medipath-practice-country',country); } catch {}
  for (const link of document.querySelectorAll('.flow-languages a')) {
    const url = new URL(link.href); country ? url.searchParams.set('country',country) : url.searchParams.delete('country'); link.href=url.href;
  }
}
async function refresh(country) {
  const request=++sequence; cta.hidden=true; quote.textContent=copy.choose;
  remember(country);
  if (!Object.hasOwn(countries,country)) return;
  quote.textContent=copy.closed;
  try {
    const brazil=country==='BR';
    // The proxy supplies trusted country hints; no geolocation service or location permission.
    const response=await fetch(brazil ? '/api/public/commercial/pricing' : `/api/public/commercial/international-offer?country=${encodeURIComponent(country)}`,{credentials:'same-origin',cache:'no-store'});
    const offer=await response.json(); if(request!==sequence||!response.ok)return;
    if (brazil) {
      if(offer.standardDisplayedPrice!==99||offer.websiteVisible!==true||offer.emergencyPaused!==false)return;
      quote.textContent=`R$99/${copy.month} — Standard. ${copy.founder}`;
      cta.href='/flow/#teste-gratuito'; cta.textContent=copy.br;
    } else {
      const environment=(window.MEDIPATH_INTERNATIONAL??window.MEDIPATH_INTERNATIONAL_PREVIEW)?.environment??'sandbox';
      if(offer.available!==true||offer.signupAvailable!==true||offer.currency!=='USD'||offer.monthlyAmountMinor!==2400||offer.trialDays!==14||offer.environment!==environment)return;
      quote.textContent=`US$24/${copy.month} — Standard. 14 ${language==='en'?'days trial':language==='es'?'días de prueba':'dias de teste'}.`;
      cta.href=signup?'#international-signup':`/flow/international/?country=${country}`; cta.textContent=copy.signup;
    }
    cta.hidden=false;
  } catch { /* An unavailable authoritative quote never opens registration. */ }
}
select.addEventListener('change',()=>{
  if(signup&&signup.value!==select.value){signup.value=select.value;signup.dispatchEvent(new Event('change'));}
  void refresh(select.value);
});
signup?.addEventListener('change',()=>{select.value=signup.value;void refresh(signup.value);});
let suggestion=new URLSearchParams(location.search).get('country');
try { suggestion ||= sessionStorage.getItem('medipath-practice-country'); } catch {}
suggestion ||= window.MEDIPATH_INTERNATIONAL?.suggestedCountry;
if(Object.hasOwn(countries,suggestion)){select.value=suggestion;void refresh(suggestion);} else quote.textContent=copy.choose;
