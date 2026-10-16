const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const test = require("node:test");
const { createPaymentController } = require("./paymentController");

const userId = "2a719d42-bd9b-4aa3-8c0e-b23e6228cd7d";
const enrollmentId = "387a2c10-79ad-4bec-951c-b3e8669f8f75";
const idempotencyKey = "36791d14-a178-465a-a095-3f8620175352";
const keySecret = "test-server-secret";
const webhookSecret = "test-webhook-secret";

function createStorage(initialRows = [], options = {}) {
  const rows = initialRows;
  const state = { updateCount: 0, insertCount: 0 };

  function table() {
    return {
      select() {
        const filters = {};
        const query = {
          eq(field, value) {
            filters[field] = value;
            return query;
          },
          async maybeSingle() {
            const row = rows.find((candidate) =>
              Object.entries(filters).every(([field, value]) => candidate[field] === value),
            );
            return { data: row || null, error: options.selectError || null };
          },
        };
        return query;
      },
      async insert(values) {
        state.insertCount += 1;
        if (options.insertError) return { error: options.insertError };
        rows.push({ ...values });
        return { error: null };
      },
      update(values) {
        const filters = {};
        const query = {
          eq(field, value) {
            filters[field] = value;
            return query;
          },
          select() {
            return query;
          },
          async maybeSingle() {
            state.updateCount += 1;
            if (options.updateError) return { data: null, error: options.updateError };
            const row = rows.find((candidate) =>
              Object.entries(filters).every(([field, value]) => candidate[field] === value),
            );
            if (!row) return { data: null, error: null };
            Object.assign(row, values);
            return { data: { id: row.id }, error: null };
          },
        };
        return query;
      },
    };
  }

  return {
    rows,
    state,
    from(name) {
      assert.equal(name, "program_enrollments");
      return table();
    },
  };
}

function createPricingClient(price = 5999) {
  return {
    from(name) {
      assert.equal(name, "program_pricing_new");
      return {
        select() {
          return {
            eq(field, value) {
              assert.equal(field, "course_name");
              assert.equal(value, "web-development");
              return {
                async maybeSingle() {
                  return {
                    data: {
                      course_name: "web-development",
                      self_current_price: price,
                      mentor_current_price: 9999,
                      professional_current_price: 11999,
                      currency: "INR",
                    },
                    error: null,
                  };
                },
              };
            },
          };
        },
      };
    },
  };
}

function createResponse() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

function checkoutRequest(overrides = {}) {
  return {
    user: { id: userId },
    body: {
      courseName: "web-development",
      planKey: "selfLearning",
      fullName: "Test Learner",
      email: "learner@example.com",
      phone: "+919876543210",
      idempotencyKey,
      amount: 1,
      currency: "USD",
      ...overrides,
    },
  };
}

function sign(secret, value) {
  return crypto.createHmac("sha256", secret).update(value).digest("hex");
}

function controllerFor({ storage, gateway, pricingClient, options } = {}) {
  return createPaymentController({
    pricingClient: pricingClient || createPricingClient(),
    createStorage: () => storage || createStorage(),
    getGateway: () => gateway || {
      orders: { create: async () => ({ id: "order_test_123", amount: 599900, currency: "INR" }) },
      payments: {
        fetch: async (paymentId) => ({
          id: paymentId,
          order_id: "order_test_123",
          amount: 599900,
          currency: "INR",
          status: "captured",
        }),
      },
    },
    keyId: "rzp_test_public",
    keySecret,
    webhookSecret,
    ...options,
  });
}

test("creates an order using server pricing and reuses it for duplicate requests", async () => {
  const storage = createStorage();
  let orderCount = 0;
  const gateway = {
    orders: {
      create: async (order) => {
        orderCount += 1;
        assert.equal(order.amount, 599900);
        assert.equal(order.currency, "INR");
        return { id: "order_test_123", amount: order.amount, currency: order.currency };
      },
    },
  };
  const controller = controllerFor({ storage, gateway });

  const firstResponse = createResponse();
  await controller.createPaymentOrder(checkoutRequest(), firstResponse);
  const secondResponse = createResponse();
  await controller.createPaymentOrder(checkoutRequest(), secondResponse);

  assert.equal(firstResponse.statusCode, 201);
  assert.equal(firstResponse.body.data.amount, 599900);
  assert.equal(secondResponse.statusCode, 200);
  assert.equal(orderCount, 1);
  assert.equal(storage.rows.length, 1);
  assert.equal(storage.rows[0].amount_paise, 599900);
});

test("rejects invalid checkout input before contacting Razorpay", async () => {
  let orderCount = 0;
  const controller = controllerFor({
    gateway: { orders: { create: async () => { orderCount += 1; } } },
  });

  await assert.rejects(
    controller.createPaymentOrder(
      checkoutRequest({ planKey: "untrusted-plan" }),
      createResponse(),
    ),
    (error) => error.statusCode === 400,
  );
  assert.equal(orderCount, 0);
});

test("reports order persistence failures without a success response", async () => {
  const storage = createStorage([], {
    insertError: new Error("database unavailable"),
  });
  const controller = controllerFor({ storage });
  const response = createResponse();

  await assert.rejects(
    controller.createPaymentOrder(checkoutRequest(), response),
    (error) =>
      error.statusCode === 503 &&
      error.message.includes("saving the enrollment"),
  );
  assert.equal(response.body, null);
});

test("explains when the idempotency database migration has not been applied", async () => {
  const storage = createStorage([], {
    selectError: {
      code: "PGRST204",
      message: "Could not find the idempotency_key column in the schema cache",
    },
  });
  const controller = controllerFor({ storage });

  await assert.rejects(
    controller.createPaymentOrder(checkoutRequest(), createResponse()),
    (error) =>
      error.statusCode === 503 &&
      error.message.includes("program_enrollments.sql") &&
      error.diagnosticCode === "STORAGE_SCHEMA_OUTDATED",
  );
});

test("identifies Supabase connectivity failures without exposing raw errors", async () => {
  const storage = createStorage([], {
    selectError: new Error("fetch failed"),
  });
  const controller = controllerFor({ storage });

  await assert.rejects(
    controller.createPaymentOrder(checkoutRequest(), createResponse()),
    (error) =>
      error.statusCode === 503 &&
      error.diagnosticCode === "STORAGE_UNREACHABLE" &&
      error.message.includes("SUPABASE_URL") &&
      !error.message.includes("fetch failed"),
  );
});

test("identifies a Supabase service-role key rejected by the configured project", async () => {
  const storage = createStorage([], {
    selectError: new Error("Invalid API key"),
  });
  const controller = controllerFor({ storage });

  await assert.rejects(
    controller.createPaymentOrder(checkoutRequest(), createResponse()),
    (error) =>
      error.statusCode === 503 &&
      error.diagnosticCode === "STORAGE_SERVICE_KEY_REJECTED" &&
      error.message.includes("SUPABASE_SERVICE_ROLE_KEY") &&
      !error.message.includes("Invalid API key"),
  );
});

test("returns a clear error when Razorpay rejects the configured API key", async () => {
  const controller = controllerFor({
    gateway: {
      orders: {
        create: async () => {
          throw {
            statusCode: 401,
            error: { description: "Invalid API Key" },
          };
        },
      },
    },
  });

  await assert.rejects(
    controller.createPaymentOrder(checkoutRequest(), createResponse()),
    (error) =>
      error.statusCode === 502 &&
      error.message.includes("matching, active pair") &&
      !error.message.includes(keySecret),
  );
});

test("verifies captured payment signatures and makes repeated verification idempotent", async () => {
  const storage = createStorage([
    {
      id: enrollmentId,
      user_id: userId,
      idempotency_key: idempotencyKey,
      course_name: "web-development",
      plan_key: "selfLearning",
      razorpay_order_id: "order_test_123",
      amount_paise: 599900,
      currency: "INR",
      status: "pending",
      razorpay_payment_id: null,
    },
  ]);
  let paymentFetchCount = 0;
  const controller = controllerFor({
    storage,
    gateway: {
      payments: {
        fetch: async (paymentId) => {
          paymentFetchCount += 1;
          return {
            id: paymentId,
            order_id: "order_test_123",
            amount: 599900,
            currency: "INR",
            status: "captured",
          };
        },
      },
    },
  });
  const request = {
    user: { id: userId },
    body: {
      enrollmentId,
      razorpay_order_id: "order_test_123",
      razorpay_payment_id: "pay_test_123",
      razorpay_signature: sign(keySecret, "order_test_123|pay_test_123"),
    },
  };

  const firstResponse = createResponse();
  await controller.verifyPayment(request, firstResponse);
  const secondResponse = createResponse();
  await controller.verifyPayment(request, secondResponse);

  assert.equal(firstResponse.body.data.status, "paid");
  assert.equal(secondResponse.body.data.status, "paid");
  assert.equal(storage.state.updateCount, 1);
  assert.equal(paymentFetchCount, 1);
  assert.equal(storage.rows[0].razorpay_payment_id, "pay_test_123");
});

test("rejects invalid Razorpay signatures without fetching or persisting payment", async () => {
  const storage = createStorage();
  let fetchCount = 0;
  const controller = controllerFor({
    storage,
    gateway: { payments: { fetch: async () => { fetchCount += 1; } } },
  });

  await assert.rejects(
    controller.verifyPayment(
      {
        user: { id: userId },
        body: {
          enrollmentId,
          razorpay_order_id: "order_test_123",
          razorpay_payment_id: "pay_test_123",
          razorpay_signature: "not-a-valid-signature",
        },
      },
      createResponse(),
    ),
    (error) => error.statusCode === 400,
  );
  assert.equal(fetchCount, 0);
  assert.equal(storage.state.updateCount, 0);
});

test("processes duplicate signed captured-payment webhook deliveries once", async () => {
  const storage = createStorage([
    {
      id: enrollmentId,
      user_id: userId,
      course_name: "web-development",
      plan_key: "selfLearning",
      razorpay_order_id: "order_test_123",
      amount_paise: 599900,
      currency: "INR",
      status: "pending",
      razorpay_payment_id: null,
    },
  ]);
  const controller = controllerFor({ storage });
  const rawBody = Buffer.from(
    JSON.stringify({
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: "pay_test_123",
            order_id: "order_test_123",
            amount: 599900,
            currency: "INR",
            status: "captured",
          },
        },
      },
    }),
  );
  const request = {
    body: rawBody,
    get: () => sign(webhookSecret, rawBody),
  };

  const firstResponse = createResponse();
  await controller.handleWebhook(request, firstResponse);
  const secondResponse = createResponse();
  await controller.handleWebhook(request, secondResponse);

  assert.equal(firstResponse.statusCode, 200);
  assert.equal(secondResponse.statusCode, 200);
  assert.equal(storage.state.updateCount, 1);
  assert.equal(storage.rows[0].status, "paid");
});

test("rejects webhook deliveries with an invalid signature", async () => {
  const controller = controllerFor();
  const rawBody = Buffer.from(JSON.stringify({ event: "payment.captured" }));
  const response = createResponse();

  await assert.rejects(
    controller.handleWebhook(
      {
        body: rawBody,
        get: () => sign("wrong-webhook-secret", rawBody),
      },
      response,
    ),
    (error) => error.statusCode === 400,
  );
  assert.equal(response.body, null);
});

test("does not return success when payment persistence fails", async () => {
  const storage = createStorage(
    [
      {
        id: enrollmentId,
        user_id: userId,
        course_name: "web-development",
        plan_key: "selfLearning",
        razorpay_order_id: "order_test_123",
        amount_paise: 599900,
        currency: "INR",
        status: "pending",
        razorpay_payment_id: null,
      },
    ],
    { updateError: new Error("database unavailable") },
  );
  const controller = controllerFor({ storage });
  const response = createResponse();

  await assert.rejects(
    controller.verifyPayment(
      {
        user: { id: userId },
        body: {
          enrollmentId,
          razorpay_order_id: "order_test_123",
          razorpay_payment_id: "pay_test_123",
          razorpay_signature: sign(keySecret, "order_test_123|pay_test_123"),
        },
      },
      response,
    ),
    (error) =>
      error.statusCode === 503 &&
      error.message.includes("confirming the enrollment"),
  );
  assert.equal(response.body, null);
});
