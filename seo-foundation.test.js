const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const test = require("node:test");
const { buildPublicDoctorPayload } = require("./onboarding-client.js");

const slugs = [
  "organizar-pacientes-internados",
  "organizar-procedimentos-medicos",
  "organizar-documentos-pacientes",
  "questionario-pre-consulta",
  "organizar-casos-clinicos",
  "aplicativo-casos-clinicos",
];

function match(html, pattern, label) {
  const value = html.match(pattern)?.[1]?.trim();
  assert.ok(value, label);
  return value;
}

test("all six resource pages have unique SEO fields, trailing canonicals and tracked CTAs", () => {
  const titles = new Set();
  const descriptions = new Set();
  const headings = new Set();
  for (const slug of slugs) {
    const html = readFileSync(`recursos/${slug}/index.html`, "utf8");
    const title = match(html, /<title>([^<]+)<\/title>/, `${slug} title`);
    const description = match(html, /<meta name="description" content="([^"]+)"/, `${slug} description`);
    const canonical = match(html, /<link rel="canonical" href="([^"]+)"/, `${slug} canonical`);
    const heading = match(html, /<h1>([^<]+)<\/h1>/, `${slug} h1`);
    assert.equal(canonical, `https://medipath-ai.com/recursos/${slug}/`);
    assert.match(html, /property="og:title"/);
    assert.match(html, /property="og:description"/);
    assert.match(html, /property="og:url"/);
    assert.match(html, /data-seo-cta/);
    assert.match(html, new RegExp(`data-source-path="/recursos/${slug}/"`));
    titles.add(title); descriptions.add(description); headings.add(heading);
  }
  assert.equal(titles.size, 6);
  assert.equal(descriptions.size, 6);
  assert.equal(headings.size, 6);
});

test("sitemap and index include all resource routes", () => {
  const sitemap = readFileSync("sitemap.xml", "utf8");
  const index = readFileSync("recursos/index.html", "utf8");
  for (const slug of slugs) {
    assert.match(sitemap, new RegExp(`https://medipath-ai.com/recursos/${slug}/`));
    assert.match(index, new RegExp(`href="/recursos/${slug}/"`));
  }
  assert.match(readFileSync("robots.txt", "utf8"), /Sitemap: https:\/\/medipath-ai\.com\/sitemap\.xml/);
});

test("Flow onboarding payload carries only bounded resource attribution fields", () => {
  const payload = buildPublicDoctorPayload({
    doctorName: "Dra. Exemplo",
    email: "DRA@EXAMPLE.COM",
    sourcePath: "/recursos/questionario-pre-consulta/",
    placement: "article_final",
    utmSource: "google",
    utmMedium: "organic",
    utmCampaign: "recursos",
    utmContent: "questionario-pre-consulta",
  });
  assert.equal(payload.email, "dra@example.com");
  assert.equal(payload.sourcePath, "/recursos/questionario-pre-consulta/");
  assert.equal(payload.utmContent, "questionario-pre-consulta");
});
