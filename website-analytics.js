(() => {
  "use strict";

  if (window.location.hostname !== "medipath-ai.com") {
    const robots = document.querySelector?.('meta[name="robots"]') || document.createElement?.("meta");
    if (robots) {
      robots.name = "robots";
      robots.content = "noindex, nofollow, noarchive, nosnippet";
      if (!robots.parentNode) document.head?.appendChild(robots);
    }
  }

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

  document.addEventListener?.("click", (event) => {
    const link = event.target.closest?.("[data-seo-cta]");
    if (!link) return;
    const sourcePath = link.dataset.sourcePath;
    const product = link.dataset.product;
    const placement = link.dataset.placement;
    if (!sourcePath || !product || !placement) return;
    try {
      void fetch(`${apiUrl}/api/public/website/cta`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        keepalive: true,
        body: JSON.stringify({ sourcePath, product, placement }),
      }).catch(() => {});
    } catch {
      // Conversion analytics must never block navigation.
    }
  });
})();
