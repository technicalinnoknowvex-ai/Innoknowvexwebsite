const assert = require("node:assert/strict");
const test = require("node:test");
const {
  createAssistantController,
  profileContext,
  extractReply,
  resolveCourseMatches,
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
  courses = [{
    title: "Artificial Intelligence",
    slug: "artificial-intelligence",
    category: "Data Science & AI",
    short_description: "Explore AI fundamentals.",
    curriculum: [{ title: "AI foundations", topics: ["Search", "Reasoning"] }],
    training_duration: "3 months",
    internship_duration: "3 months",
    internship: false,
  }],
  pricingRows = [{
    course_name: "Artificial Intelligence",
    self_actual_price: 25000,
    self_current_price: 19999,
    mentor_actual_price: 35000,
    mentor_current_price: 29999,
    professional_actual_price: 50000,
    professional_current_price: 44999,
    currency: "INR",
  }],
  faqs = [],
  storedConversations = [],
  storedMessages = [],
  historyInsertError = null,
  websitePages = [],
  fetchImpl,
} = {}) {
  let prompt;
  let providerMessages = [];
  const conversations = [...storedConversations];
  const messages = [...storedMessages];
  let generatedConversationId = 0;
  let generatedMessageId = 0;

  function userQuery(table) {
    let action = "select";
    let payload;
    const filters = [];
    const orders = [];
    let rowLimit = Number.POSITIVE_INFINITY;
    const query = {
      select() {
        if (action !== "insert") action = "select";
        return query;
      },
      insert(value) {
        action = "insert";
        payload = value;
        return query;
      },
      eq(column, value) {
        filters.push([column, value]);
        return query;
      },
      order(column, options = {}) {
        orders.push({ column, ascending: options.ascending !== false });
        return query;
      },
      limit(value) {
        rowLimit = value;
        return query;
      },
      async maybeSingle() {
        const result = await execute();
        return { data: result.data[0] || null, error: result.error };
      },
      async single() {
        const result = await execute();
        return { data: result.data[0] || null, error: result.error };
      },
      then(resolve, reject) {
        return execute().then(resolve, reject);
      },
    };

    function execute() {
      if (table === "orvexa_conversations" && action === "insert") {
        generatedConversationId += 1;
        const now = new Date(Date.UTC(2026, 0, 1, 0, 0, generatedConversationId)).toISOString();
        const row = {
          id: `00000000-0000-4000-8000-${String(generatedConversationId).padStart(12, "0")}`,
          created_at: now,
          updated_at: now,
          ...payload,
        };
        conversations.push(row);
        return Promise.resolve({ data: [row], error: null });
      }

      const source = table === "orvexa_conversations"
        ? conversations
        : table === "orvexa_messages"
          ? messages
          : [];
      let data = source.filter((row) =>
        filters.every(([column, value]) => row[column] === value),
      );
      if (orders.length) {
        data = [...data].sort((left, right) => {
          for (const { column, ascending } of orders) {
            const comparison = String(left[column] || "").localeCompare(String(right[column] || ""));
            if (comparison) return ascending ? comparison : -comparison;
          }
          return 0;
        });
      }
      data = data.slice(0, rowLimit);
      return Promise.resolve({ data, error: null });
    }

    return query;
  }

  const database = {
    from(table) {
      assert.ok(["programs_new", "program_pricing_new", "company_faq"].includes(table));
      return {
        select(fields) {
          if (table === "programs_new") assert.equal(fields, "*");
          else if (table === "program_pricing_new") assert.match(fields, /self_current_price/);
          else assert.match(fields, /keywords/);

          const query = {
            order: async () => ({
              data: table === "programs_new"
                ? courses
                : table === "program_pricing_new"
                  ? pricingRows
                  : faqs,
              error: table === "program_pricing_new" ? pricingError : null,
            }),
          };
          if (table === "company_faq") {
            query.eq = (column, value) => {
              assert.equal(column, "is_active");
              assert.equal(value, true);
              return query;
            };
          }
          return query;
        },
      };
    },
  };
  const providerFetch = async (url, options) => {
    assert.equal(url, "https://api.groq.com/openai/v1/chat/completions");
    assert.equal(options.headers.Authorization, `Bearer ${apiKey}`);
    const body = JSON.parse(options.body);
    assert.equal(body.model, "test-model");
    assert.equal(body.messages[0].role, "system");
    providerMessages = body.messages;
    prompt = body.messages.at(-1).content;
    if (fetchImpl) return fetchImpl(url, options);
    return providerResponse || {
      ok: true,
      json: async () => ({ choices: [{ message: { content: "Consider Artificial Intelligence because it matches your interest in AI." } }] }),
    };
  };
  const controller = createAssistantController({
    database,
    apiKey,
    model: "test-model",
    createProfileClient(accessToken) {
      assert.equal(accessToken, "learner-token");
      return {
        from(table) {
          if (table === "user_profiles_new") {
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
          }
          assert.ok(["orvexa_conversations", "orvexa_messages"].includes(table));
          return userQuery(table);
        },
      };
    },
    createHistoryClient() {
      return {
        from(table) {
          assert.equal(table, "orvexa_messages");
          return {
            insert(rows) {
              if (historyInsertError) return Promise.resolve({ error: historyInsertError });
              for (const row of rows) {
                generatedMessageId += 1;
                messages.push({
                  id: `message-${generatedMessageId}`,
                  created_at: new Date(Date.UTC(2026, 0, 1, 0, 0, generatedMessageId)).toISOString(),
                  ...row,
                });
              }
              return Promise.resolve({ error: null });
            },
          };
        },
      };
    },
    getWebsiteContent: async () => websitePages,
    fetchImpl: providerFetch,
  });

  return {
    chat: controller.chat,
    listConversations: controller.listConversations,
    getConversationMessages: controller.getConversationMessages,
    getPrompt: () => prompt,
    getProviderMessages: () => providerMessages,
    getConversations: () => conversations,
    getMessages: () => messages,
  };
}

test("sends the named course curriculum and consented profile to Groq", async () => {
  const dependencies = createDependencies();
  const response = createResponse();

  await dependencies.chat({
    body: { message: "What does the Artificial Intelligence curriculum cover?" },
    user: { id: "learner-id" },
    accessToken: "learner-token",
  }, response);

  assert.equal(response.body.data.reply, "Consider Artificial Intelligence because it matches your interest in AI.");
  assert.match(dependencies.getPrompt(), /AI foundations/);
  assert.match(dependencies.getPrompt(), /skillsToLearn/);
  assert.match(dependencies.getPrompt(), /"selfLearning":\{"actualPrice":25000,"currentPrice":19999\}/);
  assert.match(dependencies.getPrompt(), /"currency":"INR"/);
  assert.doesNotMatch(dependencies.getPrompt(), /"slug"|"category"/);
  assert.doesNotMatch(dependencies.getPrompt(), /private\.example/);
  assert.match(response.body.data.conversationId, /^[0-9a-f-]{36}$/i);
  assert.deepEqual(
    dependencies.getMessages().map(({ role, content }) => [role, content]),
    [
      ["user", "What does the Artificial Intelligence curriculum cover?"],
      ["assistant", response.body.data.reply],
    ],
  );
  assert.equal(
    dependencies.getConversations()[0].title,
    "What does the Artificial Intelligence curriculum cover?",
  );
});

test("asks for concise, natural speech when the request uses voice mode", async () => {
  const dependencies = createDependencies();
  const response = createResponse();

  await dependencies.chat({
    body: { message: "What can I learn in this program?", voiceMode: true },
    user: { id: "learner-id" },
    accessToken: "learner-token",
  }, response);

  assert.match(dependencies.getProviderMessages()[0].content, /For voice-mode replies/);
  assert.match(dependencies.getProviderMessages()[0].content, /one to three short sentences/);
  assert.match(dependencies.getProviderMessages()[0].content, /ordinary conversation, general questions/);
  assert.match(dependencies.getPrompt(), /Answer greetings, small talk, general knowledge questions/);
  assert.match(dependencies.getPrompt(), /Do not use Markdown, headings, bullet points/);
  assert.equal(dependencies.getMessages().at(-1).content, response.body.data.reply);
});

test("loads previous turns into Groq context and appends the next turn to that chat", async () => {
  const conversationId = "11111111-1111-4111-8111-111111111111";
  const dependencies = createDependencies({
    storedConversations: [{
      id: conversationId,
      user_id: "learner-id",
      title: "Machine Learning goals",
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    }],
    storedMessages: [
      {
        id: "message-1",
        conversation_id: conversationId,
        user_id: "learner-id",
        role: "user",
        content: "I want a career in machine learning.",
        created_at: "2026-01-01T00:00:01.000Z",
      },
      {
        id: "message-2",
        conversation_id: conversationId,
        user_id: "learner-id",
        role: "assistant",
        content: "I can use that goal to tailor suggestions in this chat.",
        created_at: "2026-01-01T00:00:02.000Z",
      },
    ],
  });
  const response = createResponse();

  await dependencies.chat({
    body: {
      message: "What course did I mention?",
      conversationId,
    },
    user: { id: "learner-id" },
    accessToken: "learner-token",
  }, response);

  assert.deepEqual(
    dependencies.getProviderMessages().slice(1, 3),
    [
      { role: "user", content: "I want a career in machine learning." },
      { role: "assistant", content: "I can use that goal to tailor suggestions in this chat." },
    ],
  );
  assert.equal(response.body.data.conversationId, conversationId);
  assert.equal(dependencies.getMessages().length, 4);
});

test("uses the previously discussed course for a follow-up price question", async () => {
  const conversationId = "33333333-3333-4333-8333-333333333333";
  const dependencies = createDependencies({
    courses: [
      { title: "Artificial Intelligence", slug: "artificial-intelligence" },
      { title: "Machine Learning", slug: "machine-learning" },
    ],
    pricingRows: [
      {
        course_name: "Artificial Intelligence",
        self_current_price: 19999,
        currency: "INR",
      },
      {
        course_name: "Machine Learning",
        self_current_price: 24999,
        currency: "INR",
      },
    ],
    storedConversations: [{
      id: conversationId,
      user_id: "learner-id",
      title: "Machine Learning",
    }],
    storedMessages: [{
      id: "message-1",
      conversation_id: conversationId,
      user_id: "learner-id",
      role: "user",
      content: "Tell me about the Machine Learning curriculum.",
      created_at: "2026-01-01T00:00:01.000Z",
    }],
    fetchImpl: async () => { throw new Error("Groq should not be called for a direct price lookup."); },
  });
  const response = createResponse();

  await dependencies.chat({
    body: { message: "And how much does it cost?", conversationId },
    user: { id: "learner-id" },
    accessToken: "learner-token",
  }, response);

  assert.match(response.body.data.reply, /Machine Learning/);
  assert.match(response.body.data.reply, /₹24,999\.00/);
  assert.doesNotMatch(response.body.data.reply, /Artificial Intelligence/);
});

test("lists and loads only conversations owned by the authenticated user", async () => {
  const conversationId = "22222222-2222-4222-8222-222222222222";
  const dependencies = createDependencies({
    storedConversations: [{
      id: conversationId,
      user_id: "learner-id",
      title: "My previous chat",
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    }],
    storedMessages: [{
      id: "message-1",
      conversation_id: conversationId,
      user_id: "learner-id",
      role: "user",
      content: "Previous question",
      created_at: "2026-01-01T00:00:01.000Z",
    }],
  });
  const request = {
    user: { id: "learner-id" },
    accessToken: "learner-token",
    params: { id: conversationId },
  };
  const listResponse = createResponse();
  await dependencies.listConversations(request, listResponse);
  assert.deepEqual(listResponse.body.data.conversations.map(({ id }) => id), [conversationId]);

  const messagesResponse = createResponse();
  await dependencies.getConversationMessages(request, messagesResponse);
  assert.equal(messagesResponse.body.data.messages[0].content, "Previous question");

  await assert.rejects(
    dependencies.getConversationMessages({
      ...request,
      user: { id: "another-user" },
    }, createResponse()),
    { statusCode: 404 },
  );
});

test("resolves ML and Machine Learning aliases to one course and only its data", async () => {
  const courses = [
    {
      title: "Artificial Intelligence",
      slug: "artificial-intelligence",
      category: "Data Science & AI",
      short_description: "Explore AI fundamentals.",
      curriculum: [{ title: "AI foundations" }],
      internship: false,
    },
    {
      title: "Machine Learning",
      slug: "machine-learning",
      category: "Data Science & AI",
      short_description: "Build machine learning models.",
      curriculum: [{ title: "Machine learning models" }],
      internship: true,
    },
  ];
  const pricingRows = [
    {
      course_name: "Artificial Intelligence",
      self_actual_price: 25000,
      self_current_price: 19999,
      mentor_actual_price: 35000,
      mentor_current_price: 29999,
      professional_actual_price: 50000,
      professional_current_price: 44999,
      currency: "INR",
    },
    {
      course_name: "Machine Learning",
      self_actual_price: 30000,
      self_current_price: 24999,
      mentor_actual_price: 40000,
      mentor_current_price: 34999,
      professional_actual_price: 55000,
      professional_current_price: 49999,
      currency: "INR",
    },
  ];
  const dependencies = createDependencies({ courses, pricingRows });
  const response = createResponse();

  await dependencies.chat({
    body: { message: "What does the ML course curriculum cover?" },
    user: { id: "learner-id" },
    accessToken: "learner-token",
  }, response);

  const prompt = dependencies.getPrompt();
  assert.match(prompt, /"title":"Machine Learning"/);
  assert.match(prompt, /Machine learning models/);
  assert.match(prompt, /"currentPrice":24999/);
  assert.doesNotMatch(prompt, /AI foundations/);
  assert.doesNotMatch(prompt, /"currentPrice":19999/);
  assert.equal(
    resolveCourseMatches(courses, "How much is the Machine Learning course?").courses[0].slug,
    "machine-learning",
  );
});

test("returns exact pricing-table options for general price questions without Groq", async () => {
  const dependencies = createDependencies({
    apiKey: "",
    courses: [
      { title: "Artificial Intelligence", slug: "artificial-intelligence", curriculum: [] },
      { title: "Machine Learning", slug: "machine-learning", curriculum: [] },
    ],
    pricingRows: [
      {
        course_name: "Artificial Intelligence",
        self_current_price: 19999,
        currency: "INR",
      },
      {
        course_name: "Machine Learning",
        self_current_price: 24999,
        currency: "INR",
      },
    ],
  });
  const response = createResponse();

  await dependencies.chat({
    body: { message: "What is the proce for Orvexa training?" },
    user: { id: "learner-id" },
    accessToken: "learner-token",
  }, response);

  assert.match(response.body.data.reply, /Artificial Intelligence/);
  assert.match(response.body.data.reply, /Machine Learning/);
  assert.match(response.body.data.reply, /₹19,999\.00/);
  assert.match(response.body.data.reply, /₹24,999\.00/);
  assert.match(response.body.data.reply, /Which course or plan/);
  assert.doesNotMatch(response.body.data.reply, /\b(?:catalog|database|table|listed|according to)\b/i);
  assert.equal(dependencies.getPrompt(), undefined);
});

test("returns the matched course price directly from program_pricing_new", async () => {
  const dependencies = createDependencies({
    courses: [
      { title: "Artificial Intelligence", slug: "artificial-intelligence" },
      { title: "Machine Learning", slug: "machine-learning" },
    ],
    pricingRows: [
      {
        course_name: "Artificial Intelligence",
        self_current_price: 19999,
        currency: "INR",
      },
      {
        course_name: "Machine Learning",
        self_actual_price: 30000,
        self_current_price: 24999,
        currency: "INR",
      },
    ],
    fetchImpl: async () => { throw new Error("Groq should not be called for a price lookup."); },
  });
  const response = createResponse();

  await dependencies.chat({
    body: { message: "What is the ML price?" },
    user: { id: "learner-id" },
    accessToken: "learner-token",
  }, response);

  assert.match(response.body.data.reply, /Machine Learning/);
  assert.match(response.body.data.reply, /₹24,999\.00/);
  assert.match(response.body.data.reply, /₹30,000\.00/);
  assert.doesNotMatch(response.body.data.reply, /Artificial Intelligence/);
  assert.doesNotMatch(response.body.data.reply, /\b(?:catalog|database|table|listed|according to)\b/i);
  assert.equal(dependencies.getPrompt(), undefined);
});

test("returns course duration from programs_new without Groq", async () => {
  const dependencies = createDependencies({
    courses: [
      {
        title: "Machine Learning",
        slug: "machine-learning",
        category: "Data Science & AI",
        training_duration: "3 months",
        internship_duration: "3 months",
      },
    ],
    fetchImpl: async () => { throw new Error("Groq should not be called for a duration lookup."); },
  });
  const response = createResponse();

  await dependencies.chat({
    body: { message: "How long is the ML course?" },
    user: { id: "learner-id" },
    accessToken: "learner-token",
  }, response);

  assert.match(response.body.data.reply, /Machine Learning/);
  assert.match(response.body.data.reply, /Training duration: 3 months/);
  assert.match(response.body.data.reply, /Internship duration: 3 months/);
  assert.doesNotMatch(response.body.data.reply, /machine-learning|Data Science & AI/);
  assert.doesNotMatch(response.body.data.reply, /\b(?:catalog|database|table|listed|according to)\b/i);
  assert.equal(dependencies.getPrompt(), undefined);
});

test("lists training and internship durations for every course when no course is named", async () => {
  const dependencies = createDependencies({
    courses: [
      {
        title: "Artificial Intelligence",
        training_duration: "3 months",
        internship_duration: "2 months",
      },
      {
        title: "Machine Learning",
        training_duration: "4 months",
        internship_duration: "3 months",
      },
    ],
    fetchImpl: async () => { throw new Error("Groq should not be called for a duration lookup."); },
  });
  const response = createResponse();

  await dependencies.chat({
    body: { message: "Show me the course durations." },
    user: { id: "learner-id" },
    accessToken: "learner-token",
  }, response);

  assert.match(response.body.data.reply, /Artificial Intelligence/);
  assert.match(response.body.data.reply, /Training duration: 3 months/);
  assert.match(response.body.data.reply, /Internship duration: 2 months/);
  assert.match(response.body.data.reply, /Machine Learning/);
  assert.match(response.body.data.reply, /Training duration: 4 months/);
  assert.match(response.body.data.reply, /Internship duration: 3 months/);
  assert.doesNotMatch(response.body.data.reply, /\b(?:catalog|database|table|listed|according to)\b/i);
});

test("handles missing prices and durations conversationally", async () => {
  const priceDependencies = createDependencies({
    pricingRows: [],
    fetchImpl: async () => { throw new Error("Groq should not be called for a price lookup."); },
  });
  const priceResponse = createResponse();
  await priceDependencies.chat({
    body: { message: "What is the AI course price?" },
    user: { id: "learner-id" },
    accessToken: "learner-token",
  }, priceResponse);
  assert.match(priceResponse.body.data.reply, /I don't have confirmed pricing details/);
  assert.doesNotMatch(priceResponse.body.data.reply, /\b(?:catalog|database|table|listed|according to|program_pricing_new)\b/i);

  const durationDependencies = createDependencies({
    courses: [{ title: "Artificial Intelligence" }],
    fetchImpl: async () => { throw new Error("Groq should not be called for a duration lookup."); },
  });
  const durationResponse = createResponse();
  await durationDependencies.chat({
    body: { message: "How long is the AI course?" },
    user: { id: "learner-id" },
    accessToken: "learner-token",
  }, durationResponse);
  assert.match(durationResponse.body.data.reply, /I don't have that confirmed right now/);
  assert.doesNotMatch(durationResponse.body.data.reply, /\b(?:catalog|database|table|listed|according to|programs_new)\b/i);
});

test("retrieves relevant company FAQ facts as references, not canned replies", async () => {
  const dependencies = createDependencies({
    faqs: [
      {
        category: "company",
        question: "How does Innoknowvex teach?",
        answer: "Training uses hands-on learning and expert mentorship.",
        keywords: ["teaching", "learning", "mentorship"],
      },
      {
        category: "payments",
        question: "How can I pay?",
        answer: "Payment details are available at checkout.",
        keywords: ["payment", "checkout"],
      },
    ],
  });

  await dependencies.chat({
    body: { message: "How does the learning and mentorship work?" },
    user: { id: "learner-id" },
    accessToken: "learner-token",
  }, createResponse());

  assert.match(dependencies.getPrompt(), /hands-on learning and expert mentorship/);
  assert.match(dependencies.getPrompt(), /Answer the user's actual question in fresh wording/);
  assert.doesNotMatch(dependencies.getPrompt(), /Payment details are available at checkout/);
});

test("retrieves company facts for broad and misspelled company questions", async () => {
  const dependencies = createDependencies({
    faqs: [
      {
        category: "company",
        question: "What is Innoknowvex?",
        answer: "Innoknowvex connects learners and institutions through practical learning and career opportunities.",
        keywords: ["company", "about", "who we are", "what we do", "innoknowvex"],
      },
      {
        category: "company",
        question: "What is Innoknowvex's mission?",
        answer: "The mission is to make industry-ready education and career opportunities accessible to everyone.",
        keywords: ["mission", "purpose", "company"],
      },
      {
        category: "payments",
        question: "How can I pay?",
        answer: "Payment details are available at checkout.",
        keywords: ["payment", "checkout"],
      },
    ],
  });

  for (const message of [
    "Tell me about the company",
    "What does Innoknowvex do?",
    "Tell me about the compmnay",
  ]) {
    await dependencies.chat({
      body: { message },
      user: { id: "learner-id" },
      accessToken: "learner-token",
    }, createResponse());

    assert.match(dependencies.getPrompt(), /connects learners and institutions/);
    assert.match(dependencies.getPrompt(), /When relevant company information is supplied/);
    assert.match(dependencies.getPrompt(), /Answer directly in natural language/);
    assert.doesNotMatch(dependencies.getPrompt(), /Payment details are available at checkout/);
  }
});

test("provides the published company email, phone, and office address for contact questions", async () => {
  const dependencies = createDependencies({
    faqs: [{
      category: "company",
      question: "How can I contact Innoknowvex?",
      answer: "Email support@innoknowvex.in or call +91 9535788085. The office is at Aratt Girija Towers, Survey 157/1, 2nd Floor, Manipal County Club Road, opposite Lake View County Apartment, Singasandra, Bengaluru, Karnataka - 560068, above Star Market.",
      keywords: ["contact", "email", "phone", "address", "company"],
    }],
  });

  await dependencies.chat({
    body: { message: "Can you give me any contact details of the company?" },
    user: { id: "learner-id" },
    accessToken: "learner-token",
  }, createResponse());

  assert.match(dependencies.getPrompt(), /support@innoknowvex\.in/);
  assert.match(dependencies.getPrompt(), /\+91 9535788085/);
  assert.match(dependencies.getPrompt(), /Aratt Girija Towers/);
  assert.match(dependencies.getPrompt(), /Singasandra, Bengaluru, Karnataka - 560068/);
  assert.match(dependencies.getProviderMessages()[0].content, /never reveal or mention where the information came from/);
});

test("adds relevant public website page details to ORVEXA's supporting information", async () => {
  const dependencies = createDependencies({
    websitePages: [{
      title: "Contact Us",
      content: "Email support@innoknowvex.in or call +91 9535788085. Our office is in Bengaluru.",
    }],
  });

  await dependencies.chat({
    body: { message: "How do I contact your team?" },
    user: { id: "learner-id" },
    accessToken: "learner-token",
  }, createResponse());

  assert.match(dependencies.getPrompt(), /"title":"Contact Us"/);
  assert.match(dependencies.getPrompt(), /support@innoknowvex\.in/);
  assert.match(dependencies.getPrompt(), /\+91 9535788085/);
});

test("answers resume questions as general career support instead of one course's curriculum", async () => {
  const conversationId = "00000000-0000-4000-8000-000000000101";
  const dependencies = createDependencies({
    courses: [
      {
        title: "Clinical Training & Research",
        slug: "clinical-training-research",
        short_description: "Clinical training and research skills.",
        curriculum: [{
          title: "Career & Industry Readiness",
          topics: ["Resume Preparation and Profile Building"],
        }],
      },
      {
        title: "Artificial Intelligence",
        slug: "artificial-intelligence",
        short_description: "Learn artificial intelligence.",
        curriculum: [],
      },
    ],
    faqs: [
      {
        category: "career",
        question: "What career support is available?",
        answer: "Resume-building training and LinkedIn profile guidance are general support across all Innoknowvex training sessions, not unique to one course.",
        keywords: ["career", "resume", "linkedin", "profile building", "support"],
      },
    ],
    storedConversations: [{
      id: conversationId,
      user_id: "learner-id",
      title: "Clinical program",
    }],
    storedMessages: [{
      id: "message-1",
      conversation_id: conversationId,
      user_id: "learner-id",
      role: "user",
      content: "Tell me about Clinical Training & Research",
      created_at: "2026-01-01T00:00:00.000Z",
    }],
  });

  await dependencies.chat({
    body: {
      message: "Can you help me with resume building?",
      conversationId,
    },
    user: { id: "learner-id" },
    accessToken: "learner-token",
  }, createResponse());

  assert.match(dependencies.getPrompt(), /general support across all Innoknowvex training sessions/);
  assert.match(dependencies.getPrompt(), /not exclusive to one course/);
  assert.doesNotMatch(dependencies.getPrompt(), /Clinical Training & Research/);
  assert.doesNotMatch(dependencies.getPrompt(), /Resume Preparation and Profile Building/);
});

test("asks for clarification when one course alias matches multiple courses", async () => {
  const courses = [
    {
      title: "Machine Learning",
      slug: "machine-learning",
      curriculum: [],
    },
    {
      title: "AI and Machine Learning",
      slug: "ai-machine-learning",
      curriculum: [],
    },
  ];
  const dependencies = createDependencies({
    courses,
    fetchImpl: async () => { throw new Error("Groq should not be called for an ambiguous course."); },
  });
  const response = createResponse();

  await dependencies.chat({
    body: { message: "What is the machine learning price?" },
    user: { id: "learner-id" },
    accessToken: "learner-token",
  }, response);

  assert.match(response.body.data.reply, /Machine Learning, AI and Machine Learning/);
  assert.match(response.body.data.reply, /Which course do you mean/);
});

test("keeps all courses in an explicit comparison", async () => {
  const courses = [
    {
      title: "Artificial Intelligence",
      slug: "artificial-intelligence",
      curriculum: [{ title: "AI foundations" }],
    },
    {
      title: "Machine Learning",
      slug: "machine-learning",
      curriculum: [{ title: "Machine learning models" }],
    },
  ];
  const dependencies = createDependencies({ courses, pricingRows: [] });
  const response = createResponse();

  await dependencies.chat({
    body: { message: "Compare ML vs AI curriculum" },
    user: { id: "learner-id" },
    accessToken: "learner-token",
  }, response);

  assert.match(dependencies.getPrompt(), /AI foundations/);
  assert.match(dependencies.getPrompt(), /Machine learning models/);
});

test("derives aliases from every course title and slug", () => {
  const courses = [
    { title: "Full Stack Web Development", slug: "web-development" },
    { title: "Cyber Security", slug: "cyber-security" },
    { title: "Data Science", slug: "data-science" },
  ];

  assert.equal(resolveCourseMatches(courses, "How much is FSWD?").courses[0].title, "Full Stack Web Development");
  assert.equal(resolveCourseMatches(courses, "What is the web development curriculum?").courses[0].title, "Full Stack Web Development");
  assert.equal(resolveCourseMatches(courses, "What does cybersecurity cost?").courses[0].title, "Cyber Security");
  assert.equal(resolveCourseMatches(courses, "Tell me about DS").courses[0].title, "Data Science");
});

test("uses a delivery modifier to distinguish similarly named courses", () => {
  const courses = [
    { title: "Online Machine Learning", slug: "machine-learning-online" },
    { title: "Offline Machine Learning", slug: "machine-learning-offline" },
  ];

  const result = resolveCourseMatches(courses, "What is the offline ML price?");

  assert.equal(result.ambiguous, false);
  assert.deepEqual(result.courses.map((course) => course.title), ["Offline Machine Learning"]);
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
