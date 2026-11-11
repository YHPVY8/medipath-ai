# Signup reconciliation — isolated candidate

Root cause: the international metadata schema made professional registration, phone-country and date-region controls mandatory and deferred trial creation. These were application choices, not requirements of the existing Brazilian account lifecycle.

The seven visible registration fields are Country, Full Name, Email, City, State / Region, Specialty and WhatsApp. Consent and Turnstile remain. Legacy international URLs use the same reduced fields; main landing CTAs remain embedded.

International onboarding accepts top-level WhatsApp through the existing endpoint; practice country supplies phone normalization context. Optional old metadata remains accepted for older clients, but is neither requested nor fabricated by the website. Server-controlled country eligibility, agreement versions, origin auth, Turnstile, rate limits and Stripe offer mapping remain enforced. Agreement versions/acceptance remain necessary to prevent stale or missing consent; they are not licensing verification.

Both countries use onboardPublicDoctor, the same Supabase invitation/recovery path, and the same atomic repository transaction. New international trials now receive the same provisioning-time timestamps and 14-day duration as Brazilian trials. Historical pending-trial activation remains compatible and cannot extend already-started trials. No schema or billing-price change is needed.

Validation: 12 focused parser/provisioning/trial tests; 56 existing onboarding/security/billing/attribution checks; API typecheck and build. Website: 17 targeted tests. Browser: PT/EN/ES at390/1280, six versus seven fields, matching conversion columns and no overflow. One actual local synthetic form submission accepted by the real API parser, without licensing metadata. Closed-config UI stays disabled. Existing Brazilian main form remains unchanged.

Limits: browser transport/Turnstile and email were synthetic; no hosted account or live Stripe acceptance. Trusted country detection remains the existing undeployed handler; no hosting changes. Production gates/settings remain unchanged. No migrations, deployments, live accounts, AI/OCR or iOS changes.

Release after approval: compatible API first, then website; retain closed international gates. Check Brazilian signup plus seven-field synthetic international path. Country detection deployment and legal/commercial approval remain separate launch dependencies.
