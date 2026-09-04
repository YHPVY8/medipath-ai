(() => {
  "use strict";

  const apiUrl = window.MEDIPATH_ONBOARDING_CONFIG?.apiUrl;
  if (!apiUrl || document.cookie.includes("medipath_internal=1")) return;

  try {
    void fetch(`${apiUrl}/api/public/website/visit`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      keepalive: true,
      body: JSON.stringify({ path: `${window.location.pathname}${window.location.search}` }),
    }).catch(() => {
      // Analytics must never affect the website experience.
    });
  } catch {
    // Analytics must never affect the website experience.
  }
})();
