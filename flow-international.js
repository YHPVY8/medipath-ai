import { countries } from "./flow-international-countries.js";

const copy = {
  en: {
    closed: "International registration is currently closed.",
    checking: "Checking availability…",
    unavailable: "Registration is unavailable for this practice country.",
    live: "Eligible doctors receive a 14-day Flow trial after verifying their email and signing in. A subscription starts billing immediately if purchased and renews monthly until canceled.",
    preview: "Internal preview only. Eligible doctors receive a 14-day Flow trial after verifying their email and signing in. A subscription, if chosen, starts billing immediately and renews monthly until canceled.",
    price: "{price} USD per month",
    sent: "If registration can proceed, check your email for instructions. If you already have an account, sign in or use account recovery.",
    invalid: "Check the highlighted field.",
    denied: "Registration is unavailable or the agreement versions have changed. Reload this page before trying again.",
    invalidPhone: "Enter a valid phone or WhatsApp number for the selected phone country.",
    invalidDetails: "Check the registration and contact fields before trying again.",
    failed: "We could not submit your request. Check the form and try again.",
    challenge: "Complete the security check before submitting.",
  },
  es: {
    closed: "El registro internacional está cerrado por ahora.",
    checking: "Consultando disponibilidad…",
    unavailable: "El registro no está disponible para este país.",
    live: "Los médicos elegibles reciben 14 días de prueba tras verificar su correo e iniciar sesión. Si contratas la suscripción, el cobro comienza de inmediato y se renueva cada mes hasta que la canceles.",
    preview: "Vista previa interna. Los médicos elegibles reciben 14 días de prueba después de verificar su correo e iniciar sesión. Si contratas la suscripción, el cobro comienza de inmediato y se renueva cada mes hasta que la canceles.",
    price: "{price} USD al mes",
    sent: "Si el registro puede continuar, recibirás instrucciones por correo. Si ya tienes una cuenta, inicia sesión o recupera el acceso.",
    invalid: "Revisa el campo indicado.",
    denied: "El registro no está disponible o los textos legales han cambiado. Actualiza la página antes de volver a intentarlo.",
    invalidPhone: "Introduce un teléfono o WhatsApp válido para el país del número.",
    invalidDetails: "Revisa los datos de contacto y del registro profesional antes de volver a intentarlo.",
    failed: "No pudimos enviar tu solicitud. Revisa el formulario e inténtalo de nuevo.",
    challenge: "Completa la verificación de seguridad antes de enviar.",
  },
  "pt-BR": {
    closed: "O cadastro internacional está fechado no momento.",
    checking: "Consultando disponibilidade…",
    unavailable: "O cadastro não está disponível para este país.",
    live: "Médicos elegíveis recebem 14 dias de teste após confirmar o e-mail e entrar no Flow. Se contratar a assinatura, a cobrança começa na hora e se renova mensalmente até o cancelamento.",
    preview: "Prévia interna. Médicos elegíveis recebem 14 dias de teste após confirmar o e-mail e entrar no Flow. Se contratar a assinatura, a cobrança começa na hora e se renova mensalmente até o cancelamento.",
    price: "{price} USD por mês",
    sent: "Se o cadastro puder prosseguir, você receberá instruções por e-mail. Se já tiver uma conta, entre ou recupere o acesso.",
    invalid: "Confira o campo destacado.",
    denied: "O cadastro está indisponível ou os termos mudaram. Atualize a página antes de tentar novamente.",
    invalidPhone: "Informe um telefone ou WhatsApp válido para o país do número.",
    invalidDetails: "Revise os dados de contato e do registro profissional antes de tentar de novo.",
    failed: "Não foi possível enviar sua solicitação. Confira o formulário e tente de novo.",
    challenge: "Conclua a verificação de segurança antes de enviar.",
  },
};

const routes = { en: "/en/flow/", es: "/es/flow/", "pt-BR": "/flow/" };
const queryFields = { utm_source: "utmSource", utm_medium: "utmMedium", utm_campaign: "utmCampaign", utm_content: "utmContent" };
const language = document.documentElement.lang;
const messages = copy[language];
const root = document.querySelector(".international-card");
const form = root.querySelector("form");
const practice = root.querySelector('[name="practiceCountry"]');
const fields = form.elements;
const status = root.querySelector("[data-signup-status]");
const offerText = root.querySelector("[data-offer]");
const feedback = root.querySelector("[data-signup-feedback]");
const button = form.querySelector('button[type="submit"]');
const params = new URLSearchParams(location.search);
const config = window.MEDIPATH_INTERNATIONAL ?? window.MEDIPATH_INTERNATIONAL_PREVIEW;
const environment = config?.environment ?? "sandbox";
const productionHost = location.hostname === "medipath-ai.com" && location.protocol === "https:";
const hostAllowed = environment === "live"
  ? productionHost
  : environment === "sandbox" && !/(^|\.)medipath-ai\.com\.?$/i.test(location.hostname);
const approved = config?.agreements?.[language];
const seen = new Set();
let selection = 0;
let eligible = "";
let widget;
let token = "";
let busy = false;
let submitted = false;
let challengeScript;

function legalUrl(value) {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const url = new URL(value, location.origin);
    return url.protocol === "https:" || (url.origin === location.origin && location.protocol === "http:") ? url.href : null;
  } catch {
    return null;
  }
}

const registrationConfigured = config?.enabled === true &&
  config.hostname === location.hostname &&
  hostAllowed &&
  typeof config.turnstileSiteKey === "string" && config.turnstileSiteKey.trim() &&
  [approved?.termsVersion, approved?.privacyVersion].every(value => typeof value === "string" && value.trim() && value.length <= 80) &&
  legalUrl(approved?.termsUrl) && legalUrl(approved?.privacyUrl);

function record(event, country) {
  if (!registrationConfigured || config.eventsEnabled !== true) return;
  const eventKey = [event, routes[language], country || ""].join("|");
  if (seen.has(eventKey)) return;
  seen.add(eventKey);
  try {
    const key = `medipath-flow-preview:${eventKey}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
  } catch {
    // In-memory deduplication still applies if storage is unavailable.
  }
  void fetch("/api/public/website/international-event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    keepalive: true,
    body: JSON.stringify({ event, language, sourcePath: routes[language], ...(country ? { practiceCountry: country } : {}) }),
  }).catch(() => {});
}

const names = new Intl.DisplayNames([language], { type: "region" });
const countryOptions = Object.keys(countries).map(code => [code, names.of(code)]);
countryOptions.sort((a, b) => a[1].localeCompare(b[1], language));
for (const select of [practice, fields.phoneCountry, fields.issuingCountry]) {
  for (const [code, name] of countryOptions) {
    const suffix = select === fields.phoneCountry && countries[code] ? ` (${countries[code]})` : "";
    select.add(new Option(name + suffix, code));
  }
}
for (const option of fields.dateRegion.options) {
  const code = option.value;
  option.value = code;
  option.textContent = names.of(code);
}
fields.dateRegion.value = "";
for (const link of document.querySelectorAll('.flow-languages a, a[href="/flow/international/"], a[href="/flow/#teste-gratuito"]')) {
  const url = new URL(link.href);
  for (const key of [...Object.keys(queryFields), "ref"]) {
    const value = params.get(key);
    if (value && value.length <= 160) url.searchParams.set(key, value);
  }
  link.href = url.href;
}

// Remembered country is a suggestion only; confirmation remains unchecked.
let suggestedCountry = params.get("country");
try { suggestedCountry ||= sessionStorage.getItem("medipath-practice-country"); } catch {}
if (Object.hasOwn(countries, suggestedCountry)) {
  practice.value = suggestedCountry;
  queueMicrotask(() => practice.dispatchEvent(new Event("change")));
}

function clearChallenge() {
  token = "";
  if (widget !== undefined) window.turnstile.remove(widget);
  widget = undefined;
}

function loadChallenge() {
  if (window.turnstile) return Promise.resolve();
  if (!challengeScript) {
    challengeScript = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.onload = () => resolve();
      script.onerror = () => {
        script.remove();
        challengeScript = undefined;
        reject(new Error("Turnstile unavailable"));
      };
      document.head.append(script);
    });
  }
  return challengeScript;
}

practice.addEventListener("change", async () => {
  const request = ++selection;
  const country = practice.value;
  clearChallenge();
  eligible = "";
  form.hidden = true;
  offerText.hidden = true;
  fields.countryConfirmed.checked = false;
  fields.agreements.checked = false;
  feedback.textContent = "";
  if (submitted || !registrationConfigured || !country || country === "BR") {
    status.textContent = submitted ? messages.sent : messages.closed;
    return;
  }
  status.textContent = messages.checking;
  try {
    const response = await fetch(`/api/public/commercial/international-offer?country=${encodeURIComponent(country)}`, { cache: "no-store" });
    if (!response.ok) throw new Error("Offer unavailable");
    const offer = await response.json();
    if (request !== selection) return;
    if (offer.available !== true || offer.signupAvailable !== true || offer.environment !== environment ||
        offer.currency !== "USD" || !Number.isSafeInteger(offer.monthlyAmountMinor) || offer.monthlyAmountMinor <= 0 ||
        (environment === "live" && offer.monthlyAmountMinor !== 2400) || offer.trialDays !== 14) throw new Error("Invalid Preview offer");
    const price = new Intl.NumberFormat(language, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(offer.monthlyAmountMinor / 100);
    offerText.textContent = messages.price.replace("{price}", price);
    await loadChallenge();
    if (request !== selection) return;
    if (!fields.phoneCountry.value) fields.phoneCountry.value = country;
    if (!fields.issuingCountry.value) fields.issuingCountry.value = country;
    fields.phone.placeholder = countries[fields.phoneCountry.value] || "";
    root.querySelector("[data-terms]").href = legalUrl(approved.termsUrl);
    root.querySelector("[data-privacy]").href = legalUrl(approved.privacyUrl);
    form.hidden = false;
    offerText.hidden = false;
    status.textContent = environment === "live" ? messages.live : messages.preview;
    widget = window.turnstile.render(form.querySelector("[data-turnstile]"), {
      sitekey: config.turnstileSiteKey,
      action: "public_doctor_onboarding",
      language: language === "pt-BR" ? "pt-br" : language,
      callback: value => { if (request === selection) token = value; },
      "expired-callback": () => { if (request === selection) token = ""; },
      "error-callback": () => { if (request === selection) token = ""; },
    });
    eligible = country;
  } catch {
    if (request !== selection) return;
    form.hidden = true;
    offerText.hidden = true;
    status.textContent = messages.unavailable;
  }
});

fields.phoneCountry.addEventListener("change", () => { fields.phone.placeholder = countries[fields.phoneCountry.value] || ""; });
form.addEventListener("focusin", () => { if (eligible) record("signup_initiated", eligible); });
form.addEventListener("invalid", event => {
  event.target.setCustomValidity(messages.invalid);
}, true);
form.addEventListener("input", event => event.target.setCustomValidity?.(""));

function attribution() {
  const result = { sourcePath: routes[language], placement: "international_signup" };
  for (const [queryKey, field] of Object.entries(queryFields)) {
    const value = params.get(queryKey)?.trim();
    const max = field === "utmContent" ? 160 : 120;
    if (value?.length >= 2 && value.length <= max) result[field] = value;
  }
  return result;
}

form.addEventListener("submit", async event => {
  event.preventDefault();
  if (!registrationConfigured || busy || submitted || !eligible || eligible !== practice.value || !form.reportValidity()) return;
  if (!token) {
    feedback.textContent = messages.challenge;
    return;
  }
  const values = new FormData(form);
  const value = key => String(values.get(key) ?? "").trim();
  const referral = params.get("ref")?.trim();
  const payload = {
    doctorName: value("doctorName"),
    email: value("email"),
    practiceCountry: eligible,
    practiceCountryConfirmed: fields.countryConfirmed.checked,
    turnstileToken: token,
    ...attribution(),
    international: {
      language,
      dateRegion: value("dateRegion"),
      phoneCountry: value("phoneCountry"),
      phone: value("phone"),
      registration: {
        number: value("registration"),
        issuingCountry: value("issuingCountry"),
        ...(value("jurisdiction") ? { jurisdiction: value("jurisdiction") } : {}),
      },
      agreements: {
        accepted: fields.agreements.checked,
        termsVersion: approved.termsVersion,
        privacyVersion: approved.privacyVersion,
      },
      ...(referral && referral.length <= 120 ? { referral } : {}),
    },
  };
  busy = true;
  button.disabled = true;
  practice.disabled = true;
  try {
    const response = await fetch("/api/public/doctors/onboard", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (response.status !== 202) {
      const error = await response.json().catch(() => null);
      if (["invalid_phone", "phone_extension_not_supported", "unsupported_phone_country"].includes(error?.error)) {
        feedback.textContent = messages.invalidPhone;
        fields.phone.focus();
      } else if (response.status === 400 && error?.error !== "signup_agreements_outdated") {
        feedback.textContent = messages.invalidDetails;
      } else {
        feedback.textContent = [400, 403, 404].includes(response.status) ? messages.denied : messages.failed;
      }
      return;
    }
    submitted = true;
    form.reset();
    form.hidden = true;
    status.textContent = messages.sent;
    feedback.textContent = "";
  } catch {
    feedback.textContent = messages.failed;
  } finally {
    busy = false;
    button.disabled = false;
    practice.disabled = submitted;
    token = "";
    if (widget !== undefined) window.turnstile.reset(widget);
  }
});

record("flow_landing_visit");
