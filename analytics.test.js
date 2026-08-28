const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const test = require("node:test");

const source = readFileSync("script.js", "utf8");

test("marketing page tracks every load without breaking the page", () => {
  assert.match(source, /trackWebsiteVisit/);
  assert.match(source, /credentials: "include"/);
  assert.match(source, /keepalive: true/);
  assert.match(source, /medipath_internal=1/);
  assert.match(source, /Analytics must never affect the website experience/);
});

test("waitlist uses the API path that triggers best-effort notification", () => {
  assert.match(source, /\/api\/public\/waitlist/);
  assert.doesNotMatch(source, /rest\/v1\/waitlist_signups/);
});
