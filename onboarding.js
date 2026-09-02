(() => {
  "use strict";

  const copy = {
    pt: {
      "nav.login": "Entrar",
      "hero.eyebrow": "Plataforma para médicos e equipes",
      "hero.title": "Organize exames, melhore o fluxo de pacientes e simplifique a operação.",
      "hero.text": "Centralize procedimentos, receba informações com o Presença Online e reduza tarefas administrativas em um ambiente desenvolvido para dados sensíveis de saúde.",
      "trial.eyebrow": "Teste gratuito",
      "trial.title": "Experimente o Medipath.AI por 14 dias.",
      "trial.body": "Crie sua conta e comece a organizar seus procedimentos, pacientes e Presença Online em poucos minutos.",
      "trial.support": "14 dias gratuitos. Sem cartão de crédito. Depois, R$99/mês. Cancele quando quiser.",
      "pricing.eyebrow": "Plano",
      "pricing.title": "Um plano simples. Tudo incluído.",
      "pricing.body": "Organize procedimentos, pacientes e sua rotina de atendimento, com Presença Online incluída.",
      "pricing.price": "R$99 por mês",
      "pricing.feature1": "Gestão de pacientes, exames e procedimentos",
      "pricing.feature2": "Presença Online personalizada",
      "pricing.feature3": "Acesso para sua equipe",
      "pricing.feature4": "Backups e recursos de segurança",
      "pricing.trial": "14 dias grátis · Sem cartão de crédito · Cancele quando quiser",
      "pricing.cta": "Começar teste gratuito",
      "presence.proofCaption": "Exemplo real de uma Presença Online personalizada",
      "value.procedures.title": "Procedimentos organizados",
      "value.procedures.text": "Acompanhe pendentes, agendados e concluídos em um só fluxo.",
      "value.presence.title": "Presença Online",
      "value.presence.text": "Receba informações, documentos e respostas antes do atendimento.",
      "value.team.title": "Rotina mais simples",
      "value.team.text": "Mantenha médico e equipe trabalhando com o mesmo contexto.",
      "form.name": "Nome Completo",
      "form.workspaceName": "Consultório ou clínica (opcional)",
      "form.email": "Email",
      "form.city": "Cidade",
      "form.state": "Estado",
      "form.specialty": "Especialidade",
      "form.whatsapp": "WhatsApp",
      "form.legalBefore": "Ao continuar, você concorda com os",
      "form.legalAnd": "e a",
      "form.submit": "Começar teste gratuito",
      "form.submitting": "Enviando cadastro…",
      "form.whatsappError": "Informe um celular brasileiro válido com DDD.",
      "form.error": "Não foi possível concluir o cadastro agora. Tente novamente em alguns minutos.",
      "form.turnstileRequired": "Conclua a verificação de segurança para continuar.",
      "form.turnstileError": "A verificação de segurança expirou. Tente novamente.",
      "legal.terms": "Termos de Uso",
      "legal.privacy": "Política de Privacidade",
      "success.label": "Cadastro recebido",
      "success.title": "Confira seu e-mail para continuar.",
      "success.text": "Enviamos um e-mail para você criar sua senha e acessar o Medipath.AI. Verifique também sua caixa de spam ou lixo eletrônico.",
      "success.home": "Voltar ao início",
    },
    en: {
      "nav.login": "Log in",
      "hero.eyebrow": "Platform for doctors and teams",
      "hero.title": "Organize exams, improve patient flow, and simplify operations.",
      "hero.text": "Centralize procedures, collect information with Online Presence, and reduce administrative work in an environment designed for sensitive health data.",
      "trial.eyebrow": "Free trial",
      "trial.title": "Try Medipath.AI free for 14 days.",
      "trial.body": "Create your account and start organizing procedures, patients, and Online Presence in just a few minutes.",
      "trial.support": "14 days free. No credit card required. Then R$99/month. Cancel anytime.",
      "pricing.eyebrow": "Plan",
      "pricing.title": "One simple plan. Everything included.",
      "pricing.body": "Organize procedures, patients, and your care routine, with Online Presence included.",
      "pricing.price": "R$99 per month",
      "pricing.feature1": "Patient, exam, and procedure management",
      "pricing.feature2": "Personalized Online Presence",
      "pricing.feature3": "Access for your team",
      "pricing.feature4": "Backups and security features",
      "pricing.trial": "14 days free · No credit card required · Cancel anytime",
      "pricing.cta": "Start free trial",
      "presence.proofCaption": "A real example of a personalized Online Presence",
      "value.procedures.title": "Organized procedures",
      "value.procedures.text": "Track pending, scheduled, and completed work in one flow.",
      "value.presence.title": "Online Presence",
      "value.presence.text": "Receive information, documents, and responses before care.",
      "value.team.title": "A simpler routine",
      "value.team.text": "Keep doctors and staff working with the same context.",
      "form.name": "Full Name",
      "form.workspaceName": "Practice or clinic (optional)",
      "form.email": "Email",
      "form.city": "City",
      "form.state": "State",
      "form.specialty": "Specialty",
      "form.whatsapp": "WhatsApp",
      "form.legalBefore": "By continuing, you agree to the",
      "form.legalAnd": "and",
      "form.submit": "Start free trial",
      "form.submitting": "Sending signup…",
      "form.whatsappError": "Enter a valid Brazilian mobile number with area code.",
      "form.error": "We could not complete your signup right now. Please try again in a few minutes.",
      "form.turnstileRequired": "Complete the security check to continue.",
      "form.turnstileError": "The security check expired. Please try again.",
      "legal.terms": "Terms of Use",
      "legal.privacy": "Privacy Policy",
      "success.label": "Signup received",
      "success.title": "Check your email to continue.",
      "success.text": "We sent an email so you can create your password and access Medipath.AI. Please also check your spam or junk folder.",
      "success.home": "Back to the top",
    },
  };

  const config = window.MEDIPATH_ONBOARDING_CONFIG || {};
  const onboarding = window.MedipathOnboarding;
  const form = document.querySelector("#trial-signup-form");
  const confirmation = document.querySelector("#trial-confirmation");
  const submitButton = form?.querySelector('button[type="submit"]');
  const formStatus = form?.querySelector("[data-form-status]");
  const whatsappInput = form?.elements.whatsapp;
  const turnstileSlot = document.querySelector("[data-turnstile-slot]");
  let currentLanguage = document.documentElement.lang.startsWith("en") ? "en" : "pt";
  let turnstileToken = "";
  let turnstileWidgetId = null;
  let submitting = false;
  let commercialPricing = null;

  function translate(key) {
    return copy[currentLanguage]?.[key] || copy.pt[key] || key;
  }

  function applyLanguage(language) {
    currentLanguage = copy[language] ? language : "pt";
    document.documentElement.lang = currentLanguage === "pt" ? "pt-BR" : "en";
    document.querySelectorAll("[data-preview-i18n]").forEach((element) => {
      element.textContent = translate(element.dataset.previewI18n);
    });
    applyCommercialPricing();
    setSubmittingState(submitting);
  }

  function validCommercialPricing(value) {
    return Boolean(
      value &&
        Number.isFinite(value.standardDisplayedPrice) &&
        value.standardDisplayedPrice > 0 &&
        Number.isFinite(value.launchDisplayedPrice) &&
        value.launchDisplayedPrice > 0 &&
        Number.isInteger(value.trialDays) &&
        value.trialDays >= 0 &&
        typeof value.founderHeadline === "string" &&
        typeof value.founderCopy === "string",
    );
  }

  function formatReais(value) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  function applyCommercialPricing() {
    if (!validCommercialPricing(commercialPricing)) return;
    const pricing = commercialPricing;
    const offerVisible = pricing.effectiveLaunchOfferActive === true;
    const displayedPrice = offerVisible ? pricing.launchDisplayedPrice : pricing.standardDisplayedPrice;
    const month = currentLanguage === "pt" ? "por mês" : "per month";
    const standardPrefix = currentLanguage === "pt" ? "Preço padrão" : "Standard price";
    const trialSummary = currentLanguage === "pt"
      ? `${pricing.trialDays} dias grátis · Sem cartão de crédito · Cancele quando quiser`
      : `${pricing.trialDays} days free · No credit card required · Cancel anytime`;
    const trialTitle = currentLanguage === "pt"
      ? `Experimente o Medipath.AI por ${pricing.trialDays} dias.`
      : `Try Medipath.AI free for ${pricing.trialDays} days.`;
    const trialSupport = currentLanguage === "pt"
      ? `${pricing.trialDays} dias gratuitos. Sem cartão de crédito. Depois, ${formatReais(pricing.standardDisplayedPrice)}/mês. Cancele quando quiser.`
      : `${pricing.trialDays} days free. No credit card required. Then ${formatReais(pricing.standardDisplayedPrice)}/month. Cancel anytime.`;

    const price = document.querySelector("[data-pricing-price]");
    if (price) price.textContent = `${formatReais(displayedPrice)} ${month}`;
    const standard = document.querySelector("[data-pricing-standard]");
    if (standard) {
      standard.hidden = !offerVisible;
      standard.textContent = `${standardPrefix}: ${formatReais(pricing.standardDisplayedPrice)} ${month}`;
    }
    const launchOffer = document.querySelector("[data-pricing-launch-offer]");
    if (launchOffer) launchOffer.hidden = !offerVisible;
    const headline = document.querySelector("[data-pricing-founder-headline]");
    if (headline) headline.textContent = pricing.founderHeadline;
    const founderCopy = document.querySelector("[data-pricing-founder-copy]");
    if (founderCopy) founderCopy.textContent = pricing.founderCopy;
    const summary = document.querySelector("[data-pricing-trial-summary]");
    if (summary) summary.textContent = trialSummary;
    const title = document.querySelector("[data-trial-title]");
    if (title) title.textContent = trialTitle;
    const support = document.querySelector("[data-trial-support]");
    if (support) support.textContent = trialSupport;
  }

  async function loadCommercialPricing() {
    if (!config.apiUrl) return;
    try {
      const response = await fetch(`${config.apiUrl}/api/public/commercial/pricing`, {
        headers: { accept: "application/json" },
        credentials: "include",
      });
      if (!response.ok) return;
      const value = await response.json();
      if (!validCommercialPricing(value)) return;
      commercialPricing = value;
      applyCommercialPricing();
    } catch {
      // The approved HTML copy is the safe R$99 fallback.
    }
  }

  function setFormStatus(message = "") {
    if (!formStatus) return;
    formStatus.textContent = message;
    formStatus.hidden = !message;
  }

  function setSubmittingState(active) {
    submitting = active;
    if (!submitButton) return;
    submitButton.disabled = active;
    submitButton.textContent = translate(active ? "form.submitting" : "form.submit");
  }

  function getBrazilianMobileDigits(value = "") {
    let digits = String(value).replace(/\D/g, "");
    if (digits.startsWith("55") && digits.length > 11) digits = digits.slice(2);
    return digits.slice(0, 11);
  }

  function formatBrazilianMobile(value = "") {
    const digits = getBrazilianMobileDigits(value);
    if (!digits) return "";
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  function validateWhatsAppInput() {
    if (!whatsappInput) return true;
    const valid = /^[1-9]\d9\d{8}$/.test(getBrazilianMobileDigits(whatsappInput.value));
    whatsappInput.setCustomValidity(valid ? "" : translate("form.whatsappError"));
    return valid;
  }

  function getFormValues() {
    const data = new FormData(form);
    return {
      full_name: data.get("full_name")?.toString().trim() || "",
      workspace_name: data.get("workspace_name")?.toString().trim() || "",
      email: data.get("email")?.toString().trim() || "",
      city: data.get("city")?.toString().trim() || "",
      state: data.get("state")?.toString().trim().toUpperCase() || "",
      specialty: data.get("specialty")?.toString().trim() || "",
      whatsapp: data.get("whatsapp") ? getBrazilianMobileDigits(data.get("whatsapp")) : "",
    };
  }

  function showConfirmation(preview) {
    form.hidden = true;
    confirmation.hidden = false;
    confirmation.querySelector("[data-preview-only-note]")?.toggleAttribute("hidden", !preview);
    confirmation.focus?.();
  }

  function resetTurnstileToken() {
    turnstileToken = "";
    if (turnstileWidgetId !== null && window.turnstile?.reset) {
      window.turnstile.reset(turnstileWidgetId);
    }
  }

  function renderTurnstile() {
    if (!config.turnstileSiteKey || !turnstileSlot || !window.turnstile) return;
    turnstileSlot.hidden = false;
    turnstileWidgetId = window.turnstile.render(turnstileSlot, {
      sitekey: config.turnstileSiteKey,
      action: config.turnstileAction || "public_doctor_onboarding",
      theme: "light",
      callback(token) {
        turnstileToken = token;
        setFormStatus();
      },
      "expired-callback"() {
        setFormStatus(translate("form.turnstileError"));
        resetTurnstileToken();
      },
      "timeout-callback"() {
        setFormStatus(translate("form.turnstileError"));
        resetTurnstileToken();
      },
      "error-callback"() {
        setFormStatus(translate("form.turnstileError"));
        resetTurnstileToken();
      },
    });
  }

  function configureTurnstile() {
    if (!config.turnstileSiteKey || !turnstileSlot) return;
    turnstileSlot.hidden = false;
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.addEventListener("load", renderTurnstile, { once: true });
    document.head.append(script);
  }

  document.querySelectorAll("[data-lang]").forEach((button) => {
    button.addEventListener("click", () => applyLanguage(button.dataset.lang));
  });

  document.querySelectorAll("[data-login-link]").forEach((link) => {
    link.href = config.loginUrl || "https://app.medipath-ai.com/";
  });

  whatsappInput?.addEventListener("input", () => {
    whatsappInput.value = formatBrazilianMobile(whatsappInput.value);
    validateWhatsAppInput();
  });
  whatsappInput?.addEventListener("blur", validateWhatsAppInput);

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submitting || !validateWhatsAppInput() || !form.reportValidity()) {
      whatsappInput?.reportValidity();
      return;
    }
    if (config.turnstileSiteKey && !turnstileToken) {
      setFormStatus(translate("form.turnstileRequired"));
      return;
    }

    const values = getFormValues();
    const onboardingPayload = onboarding.buildPublicDoctorPayload({
      doctorName: values.full_name,
      email: values.email,
      city: values.city,
      state: values.state,
      specialty: values.specialty,
      whatsapp: values.whatsapp,
      workspaceName: values.workspace_name,
    }, turnstileToken);
    const client = onboarding.createPublicDoctorOnboardingClient(config);
    setFormStatus();
    setSubmittingState(true);

    try {
      const result = await client.onboard(onboardingPayload);
      form.reset();
      showConfirmation(result.preview);
    } catch {
      setFormStatus(translate("form.error"));
    } finally {
      resetTurnstileToken();
      setSubmittingState(false);
    }
  });

  document.querySelector("[data-return-home]")?.addEventListener("click", () => {
    confirmation.hidden = true;
    form.hidden = false;
    setFormStatus();
  });

  applyLanguage(currentLanguage);
  void loadCommercialPricing();
  configureTurnstile();
})();
