(function initializePublicDoctorOnboarding(root) {
  "use strict";

  const DEFAULT_ENDPOINT_PATH = "/api/public/doctors/onboard";
  const ALLOWED_PAYLOAD_KEYS = new Set([
    "doctorName",
    "email",
    "workspaceName",
    "turnstileToken",
  ]);

  function normalizedText(value) {
    return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
  }

  function buildPublicDoctorPayload(values, turnstileToken) {
    const payload = {
      doctorName: normalizedText(values.doctorName),
      email: normalizedText(values.email).toLowerCase(),
    };
    const workspaceName = normalizedText(values.workspaceName);
    const token = normalizedText(turnstileToken);
    if (workspaceName) payload.workspaceName = workspaceName;
    if (token) payload.turnstileToken = token;
    return payload;
  }

  function validatePayloadShape(payload) {
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) return false;
    return Object.keys(payload).every((key) => ALLOWED_PAYLOAD_KEYS.has(key));
  }

  function createPublicDoctorOnboardingClient(config = {}) {
    const mode = config.mode === "api" ? "api" : "preview";
    const endpointPath = config.endpointPath || DEFAULT_ENDPOINT_PATH;
    const apiUrl = (config.apiUrl || "").replace(/\/+$/, "");

    async function onboard(payload, fetchImplementation) {
      if (!validatePayloadShape(payload)) {
        throw new Error("Invalid public doctor onboarding payload");
      }

      if (mode !== "api") {
        return { accepted: true, preview: true };
      }

      const request = fetchImplementation || root.fetch;
      if (typeof request !== "function") {
        throw new Error("Public doctor onboarding transport is unavailable");
      }

      const response = await request(`${apiUrl}${endpointPath}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.status === 202) {
        return { accepted: true, preview: false };
      }

      const error = new Error("Public doctor onboarding was not accepted");
      error.status = response.status;
      throw error;
    }

    return { onboard };
  }

  const api = {
    ALLOWED_PAYLOAD_KEYS,
    DEFAULT_ENDPOINT_PATH,
    buildPublicDoctorPayload,
    createPublicDoctorOnboardingClient,
    validatePayloadShape,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.MedipathOnboarding = api;
})(typeof window !== "undefined" ? window : globalThis);
