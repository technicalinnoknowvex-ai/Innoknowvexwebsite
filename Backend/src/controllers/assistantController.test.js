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

function createDependencies({ profile = learnerProfile, apiKey = "test-key", providerResponse } = {}) {
  let prompt;
  const database = {
    from(table) {
      assert.equal(table, "programs_new");
      return {
        select(fields) {
          assert.match(fields, /curriculum/);
          return {
            order: async () => ({
              data: [{
                title: "Artificial Intelligence",
                slug: "artificial-intelligence",
                category: "Data Science & AI",
                short_description: "Explore AI fundamentals.",
                curriculum: [{ title: "AI foundations", topics: ["Search", "Reasoning"] }],
                internship: false,
              }],
              error: null,
            }),
          };
        },
      };
    },
  };
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
    async fetchImpl(url, options) {
      assert.match(url, /test-model:generateContent$/);
      assert.equal(options.headers["x-goog-api-key"], apiKey);
      prompt = JSON.parse(options.body).contents[0].parts[0].text;
      return providerResponse || {
        ok: true,
        json: async () => ({ candidates: [{ content: { parts: [{ text: "Consider Artificial Intelligence because it matches your interest in AI." }] } }] }),
      };
    },
  });

  return {
    chat: controller.chat,
    getPrompt: () => prompt,
  };
}

test("sends course curriculum and consented profile to Gemini and returns its reply", async () => {
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
  assert.doesNotMatch(dependencies.getPrompt(), /private\.example/);
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
      json: async () => ({ candidates: [] }),
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

test("profile context is omitted without explicit personalization consent", () => {
  assert.equal(profileContext({ ...learnerProfile, ai_personalization_consent: false }), null);
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
