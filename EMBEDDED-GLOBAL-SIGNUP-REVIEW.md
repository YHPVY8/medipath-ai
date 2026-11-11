# Completed embedded global signup — source review

Website base: 703a730ec28ca452ed4a6e76360240283a30a5bb.
Flow companion: codex/flow-global-signup-location, based on 583a84fd5ccaa47a74e08645db690d902187742a.

## Implemented
- EN/ES landing pages contain one embedded signup section, one country picker inside the international form, same-page CTA, and existing Brazilian conversion layout/classes.
- International city/region/specialty fields use the existing onboarding endpoint. Location persists in the existing private country contact JSON address, and compatible draft profile fields; no migration.
- Brazil selection reveals the original six-field Brazilian contract inline. Country switches preserve entered values; compatible names/email/city/region/specialty survive PT/EN/ES navigation for five minutes in same-tab storage. Credentials, tokens, consent and licensing are not persisted by the handoff.
- Existing authoritative quote endpoints provide BRL/USD display. No client Stripe IDs, FX or checkout activation.
- Country suggestion calls the same-origin /api/public/visitor-country route, with safe missing-signal fallback and manual-choice precedence. edge/visitor-country.js reads only trusted request.cf.country; request query/header country hints do not supply geolocation.
- English uses en-US. Existing Portuguese main signup form remains unchanged. Legacy signup URLs remain compatibility entry points; primary EN/ES CTAs stay on-page.

## Verified
- 12 focused website/edge/onboarding tests pass.
- 11 focused Flow parser/trial/provisioning tests pass against synthetic PGlite data, including stored city/region and idempotent workspace creation.
- Actual rendered EN/ES embedded forms and Portuguese page pass 390px/1280px overflow checks (6 viewport/page combinations). Three product tabs remain functional; same-page CTA scroll target verified.
- Synthetic AR and BR suggestions, manual override after a delayed AR response, missing-signal neutral fallback, country-switch draft retention, BRL99/USD24 quotes, and EN→ES→PT→EN country/draft preservation verified in browser.
- One actual rendered international submission produced exactly one local fixture onboarding request; updated Flow parser accepted its AR city/region.
- API typecheck and build pass. Website is buildless HTML/JS; no package or lockfile changes.

## Hosting limitation and release gates
The actual public https://medipath-ai.com/api/public/visitor-country route returned HTTP 404 during this task. Hosted automatic detection is NOT verified. No Cloudflare settings changed. On separate approval, integrate the exported handler into the existing Cloudflare worker's exact route dispatcher; preserve all existing proxy routes/secrets, and verify AR/BR through that hosting path. Do not replace the whole existing worker with this narrow handler.

Production configuration remains unchanged and international signup/checkout remain disabled. No real account, email, Turnstile provider or payment activity was tested. Synthetic preview success is not hosted/provider acceptance. Portuguese legal agreements remain authoritative; EN/ES drafts are not activated.

## Minimum release sequence after approval
1. Publish companion compatible Flow API source with current gates/secrets preserved; no migration.
2. Publish this website source with international activation still disabled.
3. Apply the separately reviewed exact Cloudflare country route addition, then verify hosted signal/fallback behavior.
4. Review legal/payment/support prerequisites separately before any international activation.

The legacy test-support/refinement-browser.cjs runner describes the prior intermediate-page milestone; it is historical and was not used as current browser acceptance evidence. Browser acceptance above was performed through the connected browser tool.
