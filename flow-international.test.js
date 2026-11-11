const assert = require("node:assert/strict");
const { readFileSync, existsSync } = require("node:fs");
const { execFileSync } = require("node:child_process");
const test = require("node:test");

const routes = { "pt-BR": "/flow/", en: "/en/flow/", es: "/es/flow/", "x-default": "/flow/" };
const host = "https://medipath-ai.com";
const read = route => readFileSync(`.${route}index.html`, "utf8");

test("localized pages are crawlable HTML with reciprocal alternates and unique titles", () => {
  const sitemap = readFileSync("sitemap.xml", "utf8");
  const titles = new Set();
  for (const [language, route] of Object.entries(routes).slice(0, 3)) {
    const html = read(route);
    assert.match(html, new RegExp(`<html lang="${language === "en" ? "en-US" : language}"`));
    assert.ok(html.includes(`rel="canonical" href="${host}${route}"`));
    assert.doesNotMatch(html, /<meta name="robots" content="noindex/);
    titles.add(html.match(/<title>([^<]+)<\/title>/)[1]);
    const entry = sitemap.match(new RegExp(`<url><loc>${host}${route}</loc>.*?</url>`))[0];
    for (const [alternate, href] of Object.entries(routes)) {
      assert.ok(html.includes(`hreflang="${alternate}" href="${host}${href}"`));
      assert.ok(entry.includes(`hreflang="${alternate}" href="${host}${href}"`));
    }
  }
  assert.equal(titles.size, 3);
  assert.doesNotMatch(sitemap, /\/flow\/international\//);
});

test("Brazilian Flow presents App Store and Web App access while preserving signup and login routes", () => {
  const baseline = execFileSync("git", ["show", "49112a158aade875c6da51267067ff5ca17dcac9:flow/index.html"], { encoding: "utf8" });
  const current = read("/flow/");
  const form = html => html.match(/<form class="access-form trial-signup-form"[\s\S]*?<\/form>/)?.[0];
  const hero = html => html.match(/<section class="section flow-intro"[\s\S]*?<\/section>/)?.[0];
  const footer = current.match(/<footer[\s\S]*?<\/footer>/)?.[0];
  assert.ok(footer, "Brazilian Flow footer remains present");
  assert.doesNotMatch(footer, /Idiomas da página do Flow|Cadastro internacional|>PT<|>EN<|>ES</);
  for (const expected of ["Medipath Tecnologia Ltda. · CNPJ 68.777.766/0001-10", "Instagram Medipath", ">Recursos<", ">Suporte<", "aria-label=\"WhatsApp Medipath\""]) {
    assert.ok(footer.includes(expected), `Brazilian Flow footer retains ${expected}`);
  }
  assert.equal((current.match(/data-flow-language/g) || []).length, 1, "header language selector remains available");
  assert.equal(form(current), form(baseline), "signup fields, validation, and submit markup stay unchanged");
  assert.doesNotMatch(current, /data-country-pricing|flow-country-pricing|País de atuação|Selecionar país|Selecione seu país de atuação/, "the Brazilian landing page has no country-selection section or integration");
  assert.equal((current.match(/class="flow-app-store-badge/g) || []).length, 1, "exactly one App Store badge is rendered");
  assert.doesNotMatch(form(current), /flow-app-store-badge/, "badge is outside the signup form");
  const currentHero = hero(current);
  assert.match(current, /href="\/flow-preview\.css\?v=20261111-cta-layout-fix"/, "Brazilian page requests the corrected responsive stylesheet");
  assert.match(currentHero, /14 dias de teste grátis nas duas opções/);
  assert.doesNotMatch(currentHero, /data-family-en="14 days free in both options\./, "the Brazilian trial message remains Portuguese regardless of saved language preference");
  assert.ok(currentHero.indexOf("flow-app-store-badge") < currentHero.indexOf("flow-access-button"), "App Store option comes before Web App option");
  assert.match(currentHero, /href="https:\/\/apps\.apple\.com\/br\/app\/medipath-flow\/id6824710389"[^>]*target="_blank" rel="noopener noreferrer" aria-label="Baixar o Medipath Flow na App Store"/);
  assert.match(currentHero, /href="#teste-gratuito" class="button primary flow-access-button"[^>]*aria-label="Web App \/ Android \/ Computador"><span aria-hidden="true">Web App<\/span><span class="flow-access-desktop-label" aria-hidden="true">Android \/ Computador<\/span><\/a>[\s\S]*?<p class="flow-access-devices">Android \/ Computador<\/p>\s*<p class="flow-access-description">App para Android em breve<\/p>/);
  assert.doesNotMatch(currentHero, /Android app coming soon|data-family-en="Android app coming soon"/, "Brazilian Android availability text always remains in Portuguese");
  assert.doesNotMatch(currentHero, /Para iPhone|Pelo navegador|14 dias gratuitos nas duas opções|iPhone, Android ou computador|Começar teste gratuito/);
  assert.equal((currentHero.match(/14 dias de teste grátis nas duas opções/g) || []).length, 1, "the shared trial reassurance appears once in the hero");
  assert.doesNotMatch(currentHero, /Entrar no Flow/);
  assert.match(current, /<a class="flow-header-login" href="https:\/\/app\.medipath-ai\.com\/" data-login-link/);
  assert.match(baseline, /<a href="https:\/\/app\.medipath-ai\.com\/" class="family-text-link" data-login-link/);
  assert.match(currentHero, /<img src="\/assets\/brand\/App-Store-Badge-Baixar-na-App-Store-pt-BR\.svg" alt="Baixar na App Store" \/>/);
  for (const [selector, region] of [[/\<h1 id="flow-title"[\s\S]*?<\/h1>/, currentHero], [/\<p class="flow-hero-lead"[\s\S]*?<\/p>/, currentHero], [/\<figure class="flow-dashboard-frame"[\s\S]*?<\/figure>/, currentHero]]) {
    assert.equal(region.match(selector)?.[0], hero(baseline).match(selector)?.[0], "headline, supporting copy, and dashboard remain unchanged");
  }
  const css = readFileSync("flow-preview.css", "utf8");
  assert.match(css, /\.flow-brazil-access-page \.flow-trial-note\{[^}]*color:#0b3157[^}]*font-weight:700[^}]*text-align:center/);
  assert.match(css, /\.flow-brazil-access-page \.flow-access-button\{[^}]*height:60px[^}]*white-space:nowrap/);
  assert.match(css, /\.flow-brazil-access-page \.flow-app-store-badge\{min-height:60px\}/);
  assert.match(css, /\.flow-brazil-access-page \.flow-app-store-badge img\{height:60px\}/);
  assert.match(css, /\.flow-brazil-access-page \.flow-intro\{grid-template-areas:"title" "lead" "visual" "note" "actions"\}/);
  assert.match(css, /\.flow-brazil-access-page \.flow-access-options\{[^}]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/, "mobile access controls use a two-column row");
  assert.match(css, /@media\(min-width:761px\)[\s\S]*\.flow-brazil-access-page \.flow-access-options\{grid-template-columns:180px 190px;gap:10px/);
  assert.match(css, /@media\(max-width:760px\)[\s\S]*\.flow-brazil-access-page \.flow-access-button \.flow-access-desktop-label\{display:none\}[\s\S]*\.flow-brazil-access-page \.flow-access-devices\{display:block\}/);
});

test("localized navigation and approved media resolve to existing website files", () => {
  for (const route of ["/en/flow/", "/es/flow/", "/en/flow/signup/", "/es/flow/signup/", "/flow/international/"]) {
    const html = read(route);
    for (const [, href] of html.matchAll(/(?:href|src|poster)="(\/[^"]+)"/g)) {
      const target = href.split(/[?#]/)[0];
      assert.ok(existsSync(`.${target}${target.endsWith("/") ? "index.html" : ""}`), `${route}: ${href}`);
    }
    if (route.endsWith("/signup/") || route === "/flow/international/") {
      assert.match(html, /href="\/flow\/#teste-gratuito"/);
      assert.match(html, /data-international-form="" hidden=""/);
    } else {
      assert.equal((html.match(/id="international-signup"/g) || []).length, 1);
      assert.equal((html.match(/name="practiceCountry"/g) || []).length, 1);
      assert.ok(html.includes(`href="#international-signup"`));
      assert.match(html, /data-brazil-inline hidden/);
      assert.match(html, /data-global-price/);
    }
  }
  assert.match(readFileSync("flow-international-config.js", "utf8"), /enabled: false/);
  for (const route of ["/en/flow/", "/es/flow/"]) {
    const html = read(route);
    assert.match(html, /flow-international-config\.js/);
    assert.match(html, /flow-international\.js/);
    assert.match(html, /name="practiceCountry"/);
  }
  assert.match(read("/flow/international/"), /name="robots" content="noindex, follow"/);
});

test("Flow language selectors stay compact, accessible, and on the existing routes", () => {
  const expected = [
    ["/flow/", "Selecionar idioma", "PT", "Português (Brasil)"],
    ["/en/flow/", "Select language", "EN", "English"],
    ["/es/flow/", "Seleccionar idioma", "ES", "Español"],
  ];
  for (const [route, label, selected, selectedName] of expected) {
    const html = read(route);
    assert.ok(html.includes('<link rel="stylesheet" href="/flow-international.css?v=20261111-flow-locale">'));
    assert.equal((html.match(/data-flow-language/g) || []).length, 1);
    assert.match(html, new RegExp(`<select aria-label="${label}" data-flow-language>`));
    assert.match(html, /<span class="sr-only">/);
    assert.match(html, new RegExp(`<option value="\\/flow\\/" aria-label="Português \\(Brasil\\)"${selected === "PT" ? " selected" : ""}>PT<\\/option>`));
    assert.match(html, new RegExp(`<option value="\\/en\\/flow\\/" aria-label="English"${selected === "EN" ? " selected" : ""}>EN<\\/option>`));
    assert.match(html, new RegExp(`<option value="\\/es\\/flow\\/" aria-label="Español"${selected === "ES" ? " selected" : ""}>ES<\\/option>`));
    assert.ok(html.includes(`<option value="${route}" aria-label="${selectedName}" selected>${selected}</option>`));
  }

  const css = readFileSync("flow-international.css", "utf8");
  assert.match(css, /\.flow-language-control \.sr-only\s*\{/);
  assert.match(css, /appearance:none; -webkit-appearance:none; -moz-appearance:none/);
  assert.match(css, /font-family:Inter,sans-serif; font-size:\.85rem; font-weight:500; line-height:1\.5/);
  assert.match(css, /@media\(max-width:760px\)[\s\S]*\.flow-language-control select \{ min-height:44px; font-size:\.76rem; \}/);
  assert.doesNotMatch(css, /\.flow-language-control select[^}]*min-height:36px|\.flow-language-control select:hover[^}]*outline:1px solid/);
});
