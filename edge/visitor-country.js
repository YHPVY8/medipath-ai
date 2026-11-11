// Mount only at /api/public/visitor-country on the existing Cloudflare route.
// request.cf is supplied by Cloudflare; never accept country from query/header input.
export default {async fetch(request) {
 if(request.method!=='GET')return new Response(null,{status:405,headers:{Allow:'GET'}});
 const country=request.cf?.country;
 return Response.json({country:typeof country==='string' && /^[A-Z]{2}$/.test(country) && country!=='XX'?country:null},
 {headers:{'Cache-Control':'no-store','Vary':'Cookie'}});
}};
