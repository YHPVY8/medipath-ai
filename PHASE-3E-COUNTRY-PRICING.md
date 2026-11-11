# Country-aware commercial pricing Preview

Based on website 08534c8bb32ffafd4b7395e98d76b66e6d98b63b and Flow
32307cfa7bd9c63dc32e7cac5d8f04215314c4dd. No Flow source change is needed.

All three Flow landing pages and the separate Portuguese international signup
page share an additive country quote control. Its initial HTML is neutral.
The unchanged Brazilian signup form, CTA, billing and existing eligibility
remain authoritative. R$49 is described only as the existing-account Founder
offer; country selection never grants that eligibility.

The component reads GET /api/public/commercial/pricing for Brazil and GET
/api/public/commercial/international-offer?country=XX for other countries.
It accepts only the approved 99 BRL or 2400 USD amounts and refuses missing,
closed, malformed, wrong-environment or unavailable quotes. It sends no price,
currency or Stripe ID. A same-origin read-only proxy must expose both existing
Flow endpoints on the website host; the Phase 3D signup proxy still owns its
origin-auth credential. Do not expose that credential in browser configuration.

Manual selection persists within the browser session and propagates to
localized links and the international signup selector. The explicit signup
country-confirmation checkbox is cleared by the existing form handler.
Selection never changes page language or an existing subscription.

No trusted geolocation source was available in this static website. The neutral
fallback is intentional. An existing trusted edge proxy may optionally inject
MEDIPATH_INTERNATIONAL.suggestedCountry as an ISO code. It is only a suggestion,
with manual/query/session selections taking precedence. No external location
service, permission request, redirect or country authorization was added.

Validation: node --test *.test.js (20 passed). The local synthetic Preview
harness under test-support uses port 4175 and an isolated headless Chrome CDP
port 9335. It verifies seven country/language cases at 390px and 1280px (14
passed), including BR in English, US, MX, ES, PT, unsupported AQ, signup sync,
unchecked confirmation and overflow. Its API and Turnstile responses are
fixtures, not hosted payment acceptance. Run the Preview server from the repo
root; never use this fixture server in Production.

Remaining launch actions: confirm account-specific USD recurring card charging
and BRL settlement, tax treatment, approved markets, legal versions, restricted
live portal, trusted website proxy, and hosted email/workspace/trial/sandbox
webhook acceptance. The owner reports the live Price environment value is saved.
The website remains disabled. No Production settings were changed here.

After separate approval: release compatible Flow code with signup/Checkout
gates disabled; publish the website and trusted proxy with registration closed;
verify matching server quotes; then explicitly approve coordinated allowed-market
signup/Checkout activation and minimum end-to-end acceptance. Preserve Brazilian
URLs, prices, subscriptions, localization/AI canaries and installed PWA behavior.
