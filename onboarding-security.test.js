const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const test = require("node:test");

const configSource = readFileSync("onboarding-config.js", "utf8");
const formSource = readFileSync("onboarding.js", "utf8");
const htmlSource = readFileSync("index.html", "utf8");

test("uses the production Turnstile site key and exact action", () => {
  assert.match(configSource, /0x4AAAAAAEj6QeTEn2o_3nZm/);
  assert.match(configSource, /public_doctor_onboarding/);
  assert.doesNotMatch(configSource, /secret/i);
});

test("resets Turnstile after expiry, timeout, error, and submission", () => {
  assert.match(formSource, /"expired-callback"/);
  assert.match(formSource, /"timeout-callback"/);
  assert.match(formSource, /"error-callback"/);
  assert.match(formSource, /resetTurnstileToken\(\)/);
  assert.match(formSource, /finally\s*{[\s\S]*resetTurnstileToken\(\)/);
});

test("contains no payment collection or Stripe browser integration", () => {
  assert.doesNotMatch(htmlSource, /stripe\.com|card-element|payment-element/i);
  assert.doesNotMatch(formSource, /stripe|cardNumber|paymentMethod/i);
});

test("does not log or persist the Turnstile token", () => {
  assert.doesNotMatch(formSource, /console\.|localStorage|sessionStorage|indexedDB/);
});
