# ORVEXA AI Engine — Complete Guide for AI Engineers & Interns

Welcome to the **ORVEXA AI Engine** codebase! This guide is written for AI engineers, data scientists, and interns joining the Innoknowvex team. It provides a complete map of how ORVEXA is built, what has been completed, what is planned across upcoming phases, and how you will work on prompts, retrieval, and testing every day.

---

## 1. What is ORVEXA?

**ORVEXA** is Innoknowvex's AI learning and career companion. It helps prospective and enrolled students discover courses, understand curricula, check exact fees, get personalized learning recommendations based on their background, and prepare for career moves—both through interactive text chat and live natural voice.

---

## 2. What Has Been Built Up to Now (Current State)

The foundational architecture (**Phase 0** and initial capabilities of **Phase 1**) is live, tested, and working in production:

| Feature Area | Current Status | Implementation Details |
| :--- | :--- | :--- |
| **Conversational Chat & Voice** | ✅ Live & Working | Dual text (`reply`) and voice-optimized (`spokenReply`) output with browser Speech Synthesis. |
| **Zero-Hallucination Pricing** | ✅ Live & Working | Direct database pricing queries from `program_pricing_new`; never guessed by AI. |
| **Course & Duration Lookup** | ✅ Live & Working | Direct matching against `programs_new` for training and internship durations. |
| **RAG Retrieval Engine** | ✅ Live & Working | Context assembled from 4 sources: courses, pricing tables, active company FAQs, and live public website indexing. |
| **Privacy-Safe Personalization** | ✅ Live & Working | Learner profiles (`user_profiles_new`) are included in prompt context **only** when explicit Groq consent is verified. |
| **Conversation History** | ✅ Live & Working | Chats saved in `orvexa_conversations` and `orvexa_messages`; gracefully degrades if storage is offline. |
| **Automated AI Test Suite** | ✅ Live & Working | 38+ unit tests verifying accuracy, guardrails, aliases, speech, and edge cases in under 150ms. |

---

## 3. The 9-Phase Product Roadmap

Development follows the official **ORVEXA Product Roadmap**. We build and validate one phase at a time:

> 📘 **Detailed Implementation Blueprint**: For the complete engineering steps, required resources, and role assignments for each phase, see the [ORVEXA Phase Implementation Guide](../../docs/ORVEXA-PHASE-IMPLEMENTATION-GUIDE.md).

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ORVEXA ROADMAP PHASES                           │
├─────────┬──────────────────────────────────┬───────────────────────────┤
│ Phase 0 │ Assistant Foundation             │ ✅ Completed & Verified   │
│ Phase 1 │ Learning & Course Guidance       │ 🔄 Live (Expanding)       │
│ Phase 2 │ Student Guidance & Progress      │ 📋 Planned (Milestones)   │
│ Phase 3 │ Resume & Career Documents        │ 📋 Planned (Verified facts│
│ Phase 4 │ LinkedIn Profile Guidance        │ 📋 Planned (Pasted text)  │
│ Phase 5 │ Career Readiness & Mock Interview│ 📋 Planned (Interview QA) │
│ Phase 6 │ Employee Workspace & Attendance  │ 🔒 Internal (Policy-gated)│
│ Phase 7 │ Internal Knowledge & Work Asst   │ 🔒 Internal (Role-gated)  │
│ Phase 8 │ Governance, Quality & Scale      │ 🛡️ Ongoing Across Phases │
└─────────┴──────────────────────────────────┴───────────────────────────┘
```

### Detailed Phase Breakdown:

- **Phase 0 — Assistant Foundation (Complete)**:
  - Authenticated `/api/assistant/chat`, `/conversations`, and `/conversations/:id/messages` endpoints.
  - Safe backend proxying to Groq (`llama-3.3-70b-versatile`); no secret keys on the frontend.
  - Database persistence and regression test suite.

- **Phase 1 — Learning & Course Guidance (Active)**:
  - Helping learners compare courses, understand prerequisites, and choose next learning steps.
  - Resolving course aliases (e.g., "ML" -> Machine Learning, "DSA" -> Data Structures & Algorithms).
  - Explicit ambiguity detection when queries match multiple programs (e.g. Python vs Advanced Python).

- **Phase 2 — Student Guidance & Progress (Next)**:
  - Lightweight conversational skill checks (explaining they are guidance, not formal certification).
  - Milestone-based learning plans tailored to student goals and available study time.
  - Course-grounded quizzes and flashcards with source links.
  - Project coach helping break down student project ideas without claiming the AI wrote them.

- **Phase 3 — Resume & Career Documents**:
  - Structured extraction of student-provided education, projects, skills, and experience.
  - Formatted resume draft suggestions.
  - **Strict rule**: Never invent employers, degrees, dates, metrics, or accomplishments. Missing details trigger questions, not hallucinations.

- **Phase 4 — LinkedIn Profile Guidance**:
  - Reviews student-pasted headlines, summaries, and experience sections.
  - Suggests clearer wording and alignment with target job roles.
  - **Boundary rule**: Never scrape LinkedIn or ask for student LinkedIn credentials.

- **Phase 5 — Career Readiness & Mock Interviews**:
  - Conversational mock interview practice for target tech roles.
  - Constructive feedback on clarity and technical depth.
  - Recommending open opportunities from verified Innoknowvex careers data.

- **Phases 6 & 7 — Employee Tools (Separate Staff Products)**:
  - Protected internal workspace, explicit clock-in/out attendance, internal SOP search, and reviewed email drafting.
  - *Must be completely role-isolated from student accounts.*

- **Phase 8 — Governance, Quality & Scale**:
  - Continuous benchmark evals, prompt versioning, token cost tracking, and privacy metrics.

---

## 4. File Architecture & Where Your Code Lives

You work strictly in **`Backend/src/ai/`** and **`Backend/tests/ai/`**:

```
Backend/
├── src/
│   └── ai/
│       ├── assistantController.js   # 🧠 System prompt, Groq calling, RAG context assembly
│       ├── publicWebsiteSearch.js   # 🔍 Sitemap scraper & live website content ranker
│       ├── index.js                 # Export entry point
│       ├── supabase/                # SQL tables for chat history, FAQ & consent
│       └── README.md                # This onboarding guide
└── tests/
    └── ai/
        ├── assistantController.test.js  # 🧪 All prompt, course, and guardrail test cases
        └── publicWebsiteSearch.test.js  # 🧪 Search & indexing test cases
```

> [!IMPORTANT]
> **Separation of Work**: You do **not** need to touch React components (`website/src/components/orvexa/`) or Next.js pages. The web developer owns frontend UI and styling; you own the AI prompt intelligence and backend test accuracy.

---

## 5. How Context is Assembled (RAG Pipeline)

When a student asks a question, [assistantController.js](file:///c:/Users/Company/Desktop/Innoknowvexwebsite/Backend/src/ai/assistantController.js) constructs private supporting information before calling Groq:

```
Learner Question
      │
      ├── 1. Course Matcher (Resolves aliases like "AI", "ML", "DSA" against programs_new)
      │
      ├── 2. Pricing Lookup (Exact plan fees from program_pricing_new)
      │
      ├── 3. Company FAQ Search (Scores keyword matches against company_faq)
      │
      ├── 4. Live Public Website Search (Excerpts from indexed innoknowvex.in pages)
      │
      ├── 5. Learner Profile (Skills, goals, status from user_profiles_new IF consented)
      │
      └── 6. Conversation Context (Last 20 messages for multi-turn conversational memory)
```

All 6 sources are combined into `SUPPORTING INFORMATION (JSON)` and passed to the model alongside the **System Prompt**.

---

## 6. Daily Intern Workflow: How to Test Your Changes

You do **not** need the frontend website or a live database running to iterate on prompts! All external calls are mocked in the test suite.

### Step 1: Make your changes
- To refine prompts or guardrails: edit [assistantController.js](file:///c:/Users/Company/Desktop/Innoknowvexwebsite/Backend/src/ai/assistantController.js).
- To add test questions: edit [assistantController.test.js](file:///c:/Users/Company/Desktop/Innoknowvexwebsite/Backend/tests/ai/assistantController.test.js).

### Step 2: Run the test suite
Open a terminal in `Backend/` and run:

```powershell
# Run AI tests only (takes ~150 milliseconds):
npm run test:ai

# Run all backend tests:
npm test
```

### Step 3: Add new test cases (Evals)
Whenever you introduce a new prompt behavior or fix an edge case, add a test case at the bottom of `tests/ai/assistantController.test.js`:

```javascript
test("answers student question about prerequisites accurately", async () => {
  const dependencies = createDependencies();
  const response = createResponse();

  await dependencies.chat({
    body: { message: "What do I need to know before joining Data Science?" },
    user: { id: "test-student" },
    accessToken: "test-token",
  }, response);

  assert.ok(response.body.data.reply);
  assert.match(response.body.data.reply, /Python|math|programming/i);
});
```

---

## 7. Strict Guardrail Rules

Every AI engineer and intern must observe these 5 non-negotiable rules:

1. **Grounded Truth Only**:
   - Course fees, duration, and curriculum details must come exclusively from the supplied database context. Never calculate, estimate, or guess fees.
2. **Never Mention Internal Sources**:
   - Never say *"according to the database"*, *"as listed in the table"*, or *"based on the FAQ"*. ORVEXA must speak naturally as a human team member.
3. **Handle Missing Facts Conversationally**:
   - If an official answer is not in the context, say: *"I don't have that confirmed right now. Which course are you interested in?"* rather than making up facts.
4. **No Third-Party Credentials or Scraping**:
   - Never scrape LinkedIn, GitHub, or any website. Never ask for student passwords.
5. **No Secrets in Commits**:
   - Never put API keys, passwords, or personal student data in code or Git commits.
