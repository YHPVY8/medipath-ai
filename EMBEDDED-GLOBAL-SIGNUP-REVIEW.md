# Embedded global signup — implementation checkpoint

Status: INCOMPLETE; not approved for publication.

Website base: 2bddc2baeabb61713bd974bb6b2dc38660daa6e2.
Flow inspected baseline: 583a84fd5ccaa47a74e08645db690d902187742a; no Flow changes.

Implemented: embedded EN/ES forms, same-page CTA, Brazilian conversion layout/classes, inline legacy Brazilian six-field form, server-quoted price presentation, disabled international submission pending existing commercial config, compact PT/EN/ES navigation, short-lived compatible draft handoff, American English document locale. Existing Portuguese form remains byte-identical.

Validation: 11 focused source/onboarding tests pass. Rendered EN/ES previews at 390 and 1280 had one signup section, visible form, same-page CTA, correct document locale and no horizontal overflow. Inline BR selection displayed BRL 99 from the synthetic server quote.

Open acceptance/dependencies:
- Cloudflare route not deployed or tested. edge/visitor-country.js trusts request.cf.country only; configure visitorCountryPath in existing website configuration after separate approval. Production config unchanged. No automatic detection claim.
- Need actual Cloudflare-hosted AR/BR and late-result/manual-override checks.
- International City/State fields are rejected by current Flow input parser. No discarded-field UI added. A targeted compatible location contract and its persistence tests are still needed to meet the complete brief; current international registration metadata remains unchanged.
- Full PT/EN/ES draft/country/pricing interaction acceptance and sandbox submission remain outstanding.
- Authoritative owner screenshot was not available in this attachment; existing Brazilian source layout used as reference, exact screenshot comparison outstanding.
- Historical standalone signup URLs remain available for compatibility but primary landing CTAs no longer use them.
- Existing broad browser runner still describes the former intermediate-page behavior; do not use it as current acceptance evidence.

No Production, Stripe, database, AI/OCR, iOS or activation changes.
