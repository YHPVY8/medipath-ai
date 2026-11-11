# Direct global signup review

Baseline website 81476b18f66a146a52b6a94d2b437ba0007e7f61.
EN/ES landing signup/availability sections removed from markup. Trial CTA now
links to /en/flow/signup/ or /es/flow/signup/. These pages reuse the existing
international form and script and existing POST contract. Country selector is
only on signup. PT international signup removes duplicate pricing component.
No backend or public activation configuration changed.

All 249 catalog entries remain selectable. Country uses localized names and ISO
values. Explicit checkbox confirmation is reset whenever it changes. Manual
query/session choice takes precedence over an optional trusted edge-injected
MEDIPATH_INTERNATIONAL.suggestedCountry hint. No trusted country hint currently
exists on static GitHub Pages; neutral fallback applies. No new geo provider.

Brazil link uses the established /flow/#teste-gratuito route, regardless of
international gates. Name/email alone can transfer via one-time same-tab session
storage, expiring in five minutes; empty Brazilian fields only are prefilled.
Licensing, phone, consent, eligibility and currency are not transferred between
incompatible schemas. Existing form/validation/POST/security remain unchanged.

Related Flow policy branch replaces fixture-country limits with a reviewed
exclusions configuration for global rollout. Existing deployed explicit lists
remain backward compatible until global policy is selected. Missing/invalid
restrictions review closes access. No real prohibited-jurisdiction list has
been asserted or approved by this implementation. Commercial launch still needs
actual payment/legal/support exclusions and review, Stripe USD/BRL settlement,
approved agreements, trusted proxy and hosted end-to-end acceptance.

20 existing website tests pass; 16 mobile/desktop rendered-page checks pass plus
trusted synthetic CA hint, manual override to MX, retained name and reset consent.
27 focused Flow signup/policy/billing tests and TypeScript project build pass.
Browser responses are fixtures. No live account creation/payment acceptance.
Legal drafts remain noindex and excluded from sitemap, never binding signup
agreements. Landing SEO metadata and sitemap preserved. New signup routes are
noindex, follow. No publication, activation or Production changes authorized here.
