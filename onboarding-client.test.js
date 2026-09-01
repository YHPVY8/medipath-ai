const assert = require("node:assert/strict");
const test = require("node:test");

const {
  buildPublicDoctorPayload,
  createPublicDoctorOnboardingClient,
  validatePayloadShape,
} = require("./onboarding-client.js");

test("builds the finalized public doctor onboarding payload", () => {
  assert.deepEqual(
    buildPublicDoctorPayload(
      {
        doctorName: "  Dra. Marina   Albuquerque ",
        email: " MARINA@EXAMPLE.COM ",
        city: " Recife ",
        state: " pe ",
        specialty: " Pneumologia ",
        whatsapp: " 81999998888 ",
        workspaceName: " Clínica Respirar Recife ",
      },
      " turnstile-token ",
    ),
    {
      doctorName: "Dra. Marina Albuquerque",
      email: "marina@example.com",
      city: "Recife",
      state: "PE",
      specialty: "Pneumologia",
      whatsapp: "81999998888",
      workspaceName: "Clínica Respirar Recife",
      turnstileToken: "turnstile-token",
    },
  );
});

test("omits empty optional fields", () => {
  assert.deepEqual(
    buildPublicDoctorPayload(
      {
        doctorName: "Dra. Marina Albuquerque",
        email: "marina@example.com",
        city: "",
        state: "",
        specialty: "",
        whatsapp: "",
        workspaceName: "",
      },
      "",
    ),
    {
      doctorName: "Dra. Marina Albuquerque",
      email: "marina@example.com",
    },
  );
});

test("allows only the finalized browser contract", () => {
  assert.equal(
    validatePayloadShape({
      doctorName: "Dra. Marina Albuquerque",
      email: "marina@example.com",
      city: "Recife",
      state: "PE",
      specialty: "Pneumologia",
      whatsapp: "81999998888",
      workspaceName: "Clínica Respirar Recife",
      turnstileToken: "token",
    }),
    true,
  );
  assert.equal(
    validatePayloadShape({
      doctorName: "Dra. Marina Albuquerque",
      email: "marina@example.com",
      priceId: "price_forbidden",
    }),
    false,
  );
});

test("accepts only HTTP 202 and keeps failures generic", async () => {
  const payload = {
    doctorName: "Dra. Marina Albuquerque",
    email: "marina@example.com",
    turnstileToken: "token",
  };
  const client = createPublicDoctorOnboardingClient({
    mode: "api",
    apiUrl: "https://app.medipath-ai.com",
  });

  assert.deepEqual(
    await client.onboard(payload, async () => ({ status: 202 })),
    { accepted: true, preview: false },
  );

  for (const status of [400, 409, 429, 500]) {
    await assert.rejects(
      () => client.onboard(payload, async () => ({ status })),
      (error) =>
        error.message === "Public doctor onboarding was not accepted" &&
        error.status === status,
    );
  }
});
