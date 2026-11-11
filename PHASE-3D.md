# Flow multilingual website and signup handoff

The indexable routes are `/flow/`, `/en/flow/` and `/es/flow/`.
Brazilian Portuguese is the x-default. The separate Portuguese international
form at `/flow/international/` is excluded from indexing and the sitemap.
Use an `X-Robots-Tag: noindex, nofollow` header in Preview. The existing
Brazilian landing page changes only in its SEO alternates and footer links.

## International Preview

Replace `flow-international-config.js` only on the existing isolated
Preview. Set `enabled: true`, the exact Preview `hostname`, a Preview
`turnstileSiteKey` and locale-specific `agreements` entries for `pt-BR`,
`en` and `es`. Each entry contains `termsUrl`, `privacyUrl`,
`termsVersion` and `privacyVersion`. Use approved documents and versions.
Production Medipath domains cannot enable this Preview form.

Route these paths through a trusted same-origin server proxy in Preview:

| Website request | Flow Phase 3C upstream |
| --- | --- |
| GET `/api/public/commercial/international-offer?country=XX` | Same path on isolated Flow Preview |
| POST `/api/public/doctors/onboard` | Same path on isolated Flow Preview |

The proxy adds the existing origin authentication header server-side and
forwards trusted client network information per the existing Flow security
configuration. Keep the origin secret out of the static website, and point
the proxy at an isolated Flow and Stripe sandbox. Do not reuse Production
settings. The frontend requires an eligible sandbox USD quote and a
14-day trial. It submits explicit country confirmation, independently
selected phone and date regions, professional registration and approved
agreements. Flow owns rate limiting, the authentication email, retry
handling, workspace provisioning and trial activation. The generic HTTP
202 acknowledgement covers first requests and retries.

Brazil continues to use its existing entry point and live contract.
International pages link to that unchanged form and to the current
Flow login and password recovery entry point. The legal links labeled PT
point to the existing Brazilian documents for reference. International
agreements require approved localized texts before enabling the form.

## Attribution

The form passes bounded source path, placement, UTM values and referral
through the signup request. Optional Preview events require
`eventsEnabled: true` and a same-origin receiver at
`POST /api/public/website/international-event`. The browser emits
`flow_landing_visit` and `signup_initiated` once per session, path and
country as applicable. It sends language, source path and selected
practice country only. The receiver should allowlist those fields and
keep personal data out of analytics.

The future Flow receiver should record `signup_completed` only after
successful workspace provisioning and `trial_activated` only after the
one-time trial starts. Deduplicate those server events by workspace and
milestone. HTTP 202 cannot distinguish completion from an existing account,
rate limit or safe retry, so the website does not emit either milestone
from that response. Server event ingestion remains to be connected.

## Launch dependencies

Connect the real Preview proxy and Turnstile, then run synthetic BR,
US, MX, ES and PT acceptance through invitation, sign-in, workspace,
trial and Stripe sandbox. Obtain approval for market-specific terms,
privacy, registration disclosures, recurring price, payment methods,
tax handling, cancellation and support. Phase 3C provides a sandbox
quote and checkout. Live international prices and activation require a
separate Flow release and explicit approval. The public website can keep
localized product content available with registration closed.
