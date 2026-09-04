const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const test = require("node:test");
const vm = require("node:vm");

const homepage = readFileSync("index.html", "utf8");
const source = readFileSync("website-analytics.js", "utf8");

function runTracker({ cookie = "", fetchImpl }) {
  const context = {
    document: { cookie },
    fetch: fetchImpl,
    window: {
      MEDIPATH_ONBOARDING_CONFIG: { apiUrl: "https://app.medipath-ai.com" },
      location: { pathname: "/", search: "?source=test" },
    },
  };

  vm.runInNewContext(source, context);
}

test("production homepage loads the dedicated analytics tracker", () => {
  assert.equal((homepage.match(/website-analytics\.js/g) || []).length, 1);
  assert.ok(
    homepage.indexOf("onboarding-config.js") < homepage.indexOf("website-analytics.js"),
    "analytics must load after the current API configuration",
  );
});

test("one normal homepage load makes one website visit POST attempt", () => {
  const requests = [];

  runTracker({
    fetchImpl: (url, options) => {
      requests.push({ url, options });
      return Promise.resolve({ ok: true });
    },
  });

  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, "https://app.medipath-ai.com/api/public/website/visit");
  assert.deepEqual(
    JSON.parse(requests[0].options.body),
    { path: "/?source=test" },
  );
  assert.equal(requests[0].options.method, "POST");
  assert.equal(requests[0].options.headers["content-type"], "application/json");
  assert.equal(requests[0].options.credentials, "include");
  assert.equal(requests[0].options.keepalive, true);
});

test("medipath_internal=1 suppresses tracking", () => {
  let requestCount = 0;

  runTracker({
    cookie: "preference=pt; medipath_internal=1",
    fetchImpl: () => {
      requestCount += 1;
      return Promise.resolve({ ok: true });
    },
  });

  assert.equal(requestCount, 0);
});

test("analytics failures never break the page", async () => {
  assert.doesNotThrow(() => {
    runTracker({
      fetchImpl: () => {
        throw new Error("network unavailable");
      },
    });
  });

  assert.doesNotThrow(() => {
    runTracker({ fetchImpl: () => Promise.reject(new Error("request failed")) });
  });

  await new Promise((resolve) => setImmediate(resolve));
});
