// Five-minute, same-tab draft. Never persist credentials, agreements, tokens or licensing.
(() => {
 const key='medipath-signup-language-draft';
 const fields={name:['full_name','doctorName'],email:['email'],city:['city'],state:['state'],specialty:['specialty']};
 const visibleInput=names=>[...document.querySelectorAll(names.map(n=>`input[name="${n}"]`).join(','))].find(e=>e.getClientRects().length);
 try {
  const draft=JSON.parse(sessionStorage.getItem(key)||'null');
  if(draft && Date.now()-draft.created>=0 && Date.now()-draft.created<300000) {
   for(const [name,names]of Object.entries(fields))for(const field of document.querySelectorAll(names.map(n=>`input[name="${n}"]`).join(',')))if(!field.value && typeof draft[name]==='string' && draft[name].length<=120)field.value=draft[name];
  } else sessionStorage.removeItem(key);
 } catch {}
 const saveDraft=()=>{
  const draft={created:Date.now()};for(const [name,names]of Object.entries(fields)){const input=visibleInput(names);if(input)draft[name]=input.value;}
  try {sessionStorage.setItem(key,JSON.stringify(draft));}catch{}
  return draft;
 };
 for(const link of document.querySelectorAll('.flow-languages a'))link.addEventListener('click',()=>{saveDraft(); const url=new URL(link.href);if(location.hash==='#international-signup' || location.hash==='#teste-gratuito')url.hash=url.pathname==='/flow/'?'teste-gratuito':'international-signup';
  for(const key of ['utm_source','utm_medium','utm_campaign','utm_content','ref']){const value=new URLSearchParams(location.search).get(key);if(value && value.length<=160)url.searchParams.set(key,value);}
  link.href=url.href;
 });
 document.querySelector('[data-flow-language]')?.addEventListener('change',event=>{saveDraft();const url=new URL(event.target.value,location.origin);if(location.hash==='#international-signup'||location.hash==='#teste-gratuito')url.hash=url.pathname==='/flow/'?'teste-gratuito':'international-signup';for(const key of ['utm_source','utm_medium','utm_campaign','utm_content','ref']){const value=new URLSearchParams(location.search).get(key);if(value&&value.length<=160)url.searchParams.set(key,value);}location.assign(url.href);});
})();
