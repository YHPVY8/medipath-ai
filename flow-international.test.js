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
    assert.match(html, new RegExp(`<html lang="${language}"`));
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

test("approved Brazilian main content, onboarding scripts and CTA links are identical", () => {
  const baseline = execFileSync("git", ["show", "49112a158aade875c6da51267067ff5ca17dcac9:flow/index.html"], { encoding: "utf8" });
  const current = read("/flow/").replace(/<!-- signup-handoff:start -->[\s\S]*?<!-- signup-handoff:end -->\n/, "").replace(/<!-- country-pricing:start -->[\s\S]*?<!-- country-pricing:end -->\n/, "").replace(/<!-- country-pricing-scripts:start -->[\s\S]*?<!-- country-pricing-scripts:end -->\n/, "");
  for (const region of [/<main[\s\S]*?<\/main>/, /<script[\s\S]*?<\/body>/, /<header[\s\S]*?<\/header>/]) {
    assert.equal(current.match(region)[0], baseline.match(region)[0]);
  }
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
      assert.doesNotMatch(html, /name="practiceCountry"|id="international-signup"/);
      assert.ok(html.includes(`href="${route}signup/"`));
    }
  }
  assert.match(readFileSync("flow-international-config.js", "utf8"), /enabled: false/);
  assert.match(read("/flow/international/"), /name="robots" content="noindex, follow"/);
});
