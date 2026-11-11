# Multilingual refinement review

Base: approved main 0b28662cbb55c8b22193addb784a6254b1927378, verified remotely before development.

EN/ES hero, procedure and collaboration descriptions refined. EN hero supporting
copy matches the owner wording. Three existing tabs, media and layout preserved.
Main CTAs are Start Free Trial / Comenzar prueba gratuita and link to the existing
#international-signup section. This destination visibly states registration is
closed; no eligibility or activation configuration changed. Brazilian-only
signup is offered only by the existing explicitly Brazilian link.

Removed country-pricing component, its stylesheet and module references only
from EN/ES landing pages. Signup country selection remains. PT landing page,
all Brazilian onboarding scripts, Turnstile, BRL pricing and signup links are
unchanged from the release baseline.

Prepared /en/terms/, /en/privacy/, /es/terms/ and /es/privacy/. Complete legal
provisions are translated into the corresponding original sections; adjacent
paragraphs and list items are combined into prose in some sections. Effective
source dates remain August 30, 2026 for Terms and August 2026 / version 1.1 for
Privacy. Company identity, CNPJ and contacts retained. Original Portuguese pages
match published documents byte for byte. No international legal commitments or
new commercial conditions added.

All translations require legal review before publication or use in signup:
particularly data-processing roles, LGPD terminology, liability exclusions,
Brazilian governing law, subscriptions/cancellation, retention/deletion and
Brazil-based storage/backup disclosures. Review draft banners and noindex,
nofollow are present. EN/ES footer links identify them as translation drafts.
They are excluded from sitemap and are not used as accepted signup agreements.
Do not publish this branch before legal/Lead approval. Existing canonical,
hreflang and x-default for Flow are unchanged.

Validation: 20 existing website tests PASS. 12 synthetic headless-browser page
checks PASS at 390px/1280px across both landing pages and all four legal drafts;
three tab interactions, absent duplicate country component, closed signup,
CTA destination, section counts and no horizontal overflow verified. Harness:
node test-support/country-pricing-preview.cjs plus an isolated Chrome on CDP
port 9335, then node test-support/refinement-browser.cjs. No hosted account or
payment acceptance claimed. No Production publication or configuration changes.

Remaining launch dependencies from Phase 3E remain, including legal approval,
trusted signup/quote proxy, approved markets and USD/BRL settlement confirmation.
