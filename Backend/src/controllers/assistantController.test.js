const assert = require("node:assert/strict");
const test = require("node:test");
const {
  createAssistantController,
  profileContext,
  extractReply,
  selectRelevantCourses,
} = require("./assistantController");

const learnerProfile = {
  current_status: "student",
  education_level: "Undergraduate",
  skills: ["JavaScript"],
  learning_skills: ["Artificial intelligence"],
  projects: [{ title: "Portfolio", description: "A personal site", technologies: ["React"], url: "https://private.example" }],
  experience: [],
  interests: ["AI"],
  goals: ["Build useful software"],
  ai_personalization_consent: true,
  ai_personalization_consent_provider: "groq",
};

function createResponse() {
  return {
    body: null,
    json(body) {
      this.body = body;
      return this;
    },
  };
}

function createDependencies({
  profile = learnerProfile,
  apiKey = "test-key",
  providerResponse,
  pricingError = null,
  fetchImpl,
} = {}) {
  let prompt;
  const database = {
    from(table) {
      assert.ok(["programs_new", "program_pricing_new"].includes(table));
      return {
        select(fields) {
          if (table === "programs_new") assert.match(fields, /curriculum/);
          else assert.match(fields, /self_current_price/);
          return {
            order: async () => ({
              data: table === "programs_new"
                ? [{
                  title: "Artificial Intelligence",
                  slug: "artificial-intelligence",
                  category: "Data Science & AI",
                  short_description: "Explore AI fundamentals.",
                  curriculum: [{ title: "AI foundations", topics: ["Search", "Reasoning"] }],
                  internship: false,
                }]
                : [{
                  course_name: "Artificial Intelligence",
                  self_actual_price: 25000,
                  self_current_price: 19999,
                  mentor_actual_price: 35000,
                  mentor_current_price: 29999,
                  professional_actual_price: 50000,
                  professional_current_price: 44999,
                  currency: "INR",
                }],
              error: table === "program_pricing_new" ? pricingError : null,
            }),
          };
        },
      };
    },
  };
  const providerFetch = fetchImpl || (async (url, options) => {
    assert.equal(url, "https://api.groq.com/openai/v1/chat/completions");
    assert.equal(options.headers.Authorization, `Bearer ${apiKey}`);
    const body = JSON.parse(options.body);
    assert.equal(body.model, "test-model");
    assert.equal(body.messages[0].role, "system");
    prompt = body.messages[1].content;
    return providerResponse || {
      ok: true,
      json: async () => ({ choices: [{ message: { content: "Consider Artificial Intelligence because it matches your interest in AI." } }] }),
    };
  });
  const controller = createAssistantController({
    database,
    apiKey,
    model: "test-model",
    createProfileClient(accessToken) {
      assert.equal(accessToken, "learner-token");
      return {
        from(table) {
          assert.equal(table, "user_profiles_new");
          return {
            select(fields) {
              assert.match(fields, /learning_skills/);
              return {
                eq(column, userId) {
                  assert.equal(column, "id");
                  assert.equal(userId, "learner-id");
                  return { maybeSingle: async () => ({ data: profile, error: null }) };
                },
              };
            },
          };
        },
      };
    },
    fetchImpl: providerFetch,
  });

  return {
    chat: controller.chat,
    getPrompt: () => prompt,
  };
}

test("sends course curriculum and Groq-consented profile to Groq and returns its reply", async () => {
  const dependencies = createDependencies();
  const response = createResponse();

  await dependencies.chat({
    body: { message: "What course could fit my interests?" },
    user: { id: "learner-id" },
    accessToken: "learner-token",
  }, response);

  assert.equal(response.body.data.reply, "Consider Artificial Intelligence because it matches your interest in AI.");
  assert.match(dependencies.getPrompt(), /AI foundations/);
  assert.match(dependencies.getPrompt(), /skillsToLearn/);
  assert.match(dependencies.getPrompt(), /"selfLearning":\{"actualPrice":25000,"currentPrice":19999\}/);
  assert.match(dependencies.getPrompt(), /"currency":"INR"/);
  assert.match(dependencies.getPrompt(), /exact current and actual price/);
  assert.doesNotMatch(dependencies.getPrompt(), /private\.example/);
});

test("does not call Groq when the website pricing query fails", async () => {
  const dependencies = createDependencies({
    pricingError: new Error("Pricing table unavailable."),
    fetchImpl: async () => { throw new Error("Groq should not be called."); },
  });

  await assert.rejects(
    dependencies.chat({
      body: { message: "What is the course fee?" },
      user: { id: "learner-id" },
      accessToken: "learner-token",
    }, createResponse()),
    /Pricing table unavailable/,
  );
});

test("does not include profile details when personalization consent is absent", async () => {
  const dependencies = createDependencies({
    profile: { ...learnerProfile, ai_personalization_consent: false },
  });
  const response = createResponse();

  await dependencies.chat({
    body: { message: "Explain the AI course." },
    user: { id: "learner-id" },
    accessToken: "learner-token",
  }, response);

  assert.match(dependencies.getPrompt(), /"learner":null/);
  assert.doesNotMatch(dependencies.getPrompt(), /Undergraduate/);
});

test("rejects empty or oversized messages before making provider requests", async () => {
  const controller = createAssistantController({
    apiKey: "test-key",
    database: { from() { throw new Error("Course lookup should not run."); } },
    fetchImpl: async () => { throw new Error("Provider should not be called."); },
  });

  for (const message of [" ", "x".repeat(4001)]) {
    await assert.rejects(
      controller.chat({ body: { message } }, createResponse()),
      { statusCode: 400 },
    );
  }
});

test("reports missing API key as a service configuration error", async () => {
  const controller = createAssistantController({ apiKey: "" });

  await assert.rejects(
    controller.chat({ body: { message: "Hello" } }, createResponse()),
    { statusCode: 503 },
  );
});

test("handles missing or blocked provider output explicitly", async () => {
  assert.equal(extractReply({ candidates: [] }), "");
  const dependencies = createDependencies({
    providerResponse: {
      ok: true,
      json: async () => ({ choices: [] }),
    },
  });

  await assert.rejects(
    dependencies.chat({
      body: { message: "Hello" },
      user: { id: "learner-id" },
      accessToken: "learner-token",
    }, createResponse()),
    { statusCode: 502 },
  );
});

test("reports actionable messages for Groq credentials, model, and quota failures", async () => {
  const cases = [
    [400, /rejected the chat request/],
    [401, /rejected the API key or account access/],
    [403, /rejected the API key or account access/],
    [404, /model "test-model" was not found or is unavailable/],
    [429, /quota or rate limit/],
  ];

  for (const [status, message] of cases) {
    const dependencies = createDependencies({
      providerResponse: {
        ok: false,
        status,
        json: async () => ({ error: { message: "provider detail intentionally not exposed" } }),
      },
    });

    await assert.rejects(
      dependencies.chat({
        body: { message: "Hello" },
        user: { id: "learner-id" },
        accessToken: "learner-token",
      }, createResponse()),
      (error) => {
        assert.equal(error.statusCode, status === 429 ? 503 : 502);
        assert.match(error.message, message);
        assert.match(error.publicMessage, message);
        assert.doesNotMatch(error.publicMessage, /provider detail intentionally not exposed/);
        return true;
      },
    );
  }
});

test("reports a Groq timeout separately from a network connection failure", async () => {
  const cases = [
    [
      Object.assign(new Error("timed out"), { name: "TimeoutError" }),
      504,
      /did not respond within 30 seconds/,
    ],
    [
      Object.assign(new TypeError("fetch failed"), { cause: { code: "ENOTFOUND" } }),
      502,
      /outbound network and DNS\/TLS connectivity/,
    ],
  ];

  for (const [failure, statusCode, publicMessage] of cases) {
    const dependencies = createDependencies({
      fetchImpl: async () => { throw failure; },
    });

    await assert.rejects(
      dependencies.chat({
        body: { message: "Hello" },
        user: { id: "learner-id" },
        accessToken: "learner-token",
      }, createResponse()),
      (error) => {
        assert.equal(error.statusCode, statusCode);
        assert.match(error.publicMessage, publicMessage);
        if (failure.cause?.code) {
          assert.equal(error.providerFailure.code, "ENOTFOUND");
        }
        return true;
      },
    );
  }
});

test("profile context is omitted without explicit personalization consent", () => {
  assert.equal(profileContext({ ...learnerProfile, ai_personalization_consent: false }), null);
});

test("does not reuse consent given to a different AI provider", () => {
  assert.equal(
    profileContext({
      ...learnerProfile,
      ai_personalization_consent_provider: "gemini",
    }),
    null,
  );
});

test("course selection prioritizes matching course details and caps curriculum context", () => {
  const courses = [
    {
      title: "Artificial Intelligence",
      slug: "artificial-intelligence",
      category: "Data Science & AI",
      short_description: "Explore AI fundamentals.",
      curriculum: [{ title: "AI foundations" }],
      internship: false,
    },
    ...Array.from({ length: 10 }, (_, index) => ({
      title: `Unrelated Program ${index}`,
      slug: `unrelated-${index}`,
      category: "Other",
      short_description: "A general AI program.",
      curriculum: [{ title: "AI topics" }],
      internship: false,
    })),
  ];

  const selected = selectRelevantCourses(courses, "Explain the AI course", null);

  assert.equal(selected[0].title, "Artificial Intelligence");
  assert.equal(selected.length, 8);
  assert.deepEqual(selected[0].curriculum, [{ title: "AI foundations" }]);
});
