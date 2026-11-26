# ORVEXA Phase-by-Phase Implementation Blueprint

> **A Practical Engineering and Product Execution Guide**  
> *Defines what gets built, how to implement it, required resources, and exact role ownership for each phase of ORVEXA.*

---

## 📌 Quick Phase Navigation

| Phase | Product Area | Target Result | Current Status |
| :---: | :--- | :--- | :---: |
| [**Phase 0**](#phase-0--assistant-foundation) | Assistant Foundation | Secure voice/chat architecture, Groq proxy, RAG engine | ✅ **Completed & Verified** |
| [**Phase 1**](#phase-1--learning--course-guidance) | Course Guidance | Program recommendations, comparisons, exact fees | 🔄 **Active / Expanding** |
| [**Phase 2**](#phase-2--student-guidance--progress) | Student Progress | Milestone learning plans, quizzes, project coach | 📋 **Next Up** |
| [**Phase 3**](#phase-3--resume--career-documents) | Resume Builder | Fact-checked resume drafts from student evidence | 📋 **Planned** |
| [**Phase 4**](#phase-4--linkedin-profile-guidance) | LinkedIn Advisor | Feedback on student-pasted profile sections | 📋 **Planned** |
| [**Phase 5**](#phase-5--career-readiness--mock-interviews) | Mock Interviews | Role-based interview practice & careers alignment | 📋 **Planned** |
| [**Phase 6**](#phase-6--employee-workspace--attendance) | Staff Workspace | Protected staff portal & explicit clock attendance | 🔒 **Internal Policy-Gated** |
| [**Phase 7**](#phase-7--internal-knowledge--work-assistant) | Internal SOP Bot | Role-filtered policy search & email drafting | 🔒 **Internal Role-Gated** |
| [**Phase 8**](#phase-8--governance-quality--scale) | Governance & Scale | Benchmark evaluations, prompt versioning, privacy | 🛡️ **Continuous** |

---

## Phase 0 — Assistant Foundation

### 🎯 Outcome
Establish a rock-solid, secure, voice-enabled assistant foundation connected to Innoknowvex data sources and Groq AI inference.

### 🛠️ How to Implement (Technical Steps)
1. Mount the frontend client at `/orvexa` in Next.js (`OrvexaClient.jsx`), embedding the transparent robot canvas, speech recognition, and audio synthesis controls.
2. Build authenticated Express routes: `POST /api/assistant/chat`, `GET /conversations`, `GET /conversations/:id/messages`.
3. Configure the backend Groq client using `llama-3.3-70b-versatile`, keeping API keys server-side.
4. Establish the multi-source RAG context pipeline (programs, pricing, company FAQ, public website scraper).
5. Build the unit test suite (`npm run test:ai`) to test accuracy, aliases, and edge cases in under 200ms.

### 👥 Who Works on What
- **💻 Web Developer**: Robot canvas animation, chat UI, voice orb, Web Speech API integration, Next.js page routes.
- **🧠 AI Engineer / Intern**: System prompt foundation, RAG context assembler, Groq completion handler, spoken reply generator.
- **📚 Content Manager**: Seed initial FAQs in `company_faq` and verified course details in `programs_new`.
- **🛡️ QA / Reviewer**: Validate token authorization, rate limits, audio interruption on mobile, and credential protection.

### 📦 Resources Required
- **People**: Web Developer, Backend Developer, AI Engineer, QA Tester.
- **Tools & Services**: Groq API key, Supabase database, Node.js 22+, Next.js 16.
- **Data / Schema**: `programs_new`, `program_pricing_new`, `company_faq`, `orvexa_conversations`, `orvexa_messages`.

### 🏁 Exit Criteria
- [x] Chat and voice replies return within 1.5 seconds.
- [x] Zero API keys exposed on frontend.
- [x] Prices and durations are pulled directly from database records without hallucination.
- [x] All 80 backend tests and 10 website tests pass 100%.

---

## Phase 1 — Learning & Course Guidance

### 🎯 Outcome
Help prospective and enrolled students discover the right program, compare options, understand prerequisites, and see exact plan pricing.

### 🛠️ How to Implement (Technical Steps)
1. **Course Aliases & Matching**: Refine `coursePhrases()` in `Backend/src/ai/assistantController.js` to derive aliases and acronyms (e.g., "Full-Stack" -> "Advanced Full-Stack Web Development", "DSA" -> "Data Structures & Algorithms").
2. **Ambiguity Resolution**: When a query matches multiple courses (e.g. "Python"), return a conversational clarification asking the student which specific course they mean.
3. **Course Comparisons**: Detect comparison keywords (`vs`, `compare`, `difference`) and feed both courses' syllabi and prerequisites into the model context.
4. **Direct Pricing & Durations**: Ensure exact plan pricing (Self-learning, Mentor-paced, Professional) is presented with currency and formatted tiers.

### 👥 Who Works on What
- **💻 Web Developer**: Course card preview chips in chat messages; one-click buttons to navigate to `/programs/[slug]`.
- **🧠 AI Engineer / Intern**: Tuning alias scoring weights in `courseMatchScore()`, comparison prompts, and adding 15+ student question evals in `assistantController.test.js`.
- **📚 Content Manager**: Audit all rows in `programs_new` and `program_pricing_new` for accurate prerequisites, tools taught, and duration.
- **🛡️ QA / Reviewer**: Verify that comparing two programs never calculates fake differences or misattributes tools.

### 📦 Resources Required
- **People**: AI Intern, Web Developer, Academic Program Lead.
- **Data / Schema**: Up-to-date syllabus JSON in `programs_new.curriculum` and verified prices in `program_pricing_new`.
- **Evidence / Evals**: 25 sample student inquiries across beginner, intermediate, and career-switcher personas.

### 🏁 Exit Criteria
- [x] Ambiguous queries ask a natural follow-up aloud and in text.
- [x] Pricing inquiries return exact table figures.
- [ ] Comparison inquiries accurately highlight differences in tools, duration, and prerequisites.

---

## Phase 2 — Student Guidance & Progress

### 🎯 Outcome
Empower learners to turn ambitious goals into actionable study milestones, test their knowledge with course-grounded quizzes, and get project coaching.

### 🛠️ How to Implement (Technical Steps)
1. **Student Milestone Plan Model**:
   - Create Supabase table `learner_milestones` (`id, user_id, program_id, title, status, target_date, created_at`).
   - Add prompt capability: When a student asks *"Can you build me a 6-week study schedule for Data Science?"*, ORVEXA generates a structured JSON milestone plan.
2. **Interactive Study Quizzes & Flashcards**:
   - Add endpoint `POST /api/assistant/quiz` that accepts a course slug and topic.
   - ORVEXA generates 3 multiple-choice practice questions grounded exclusively in that course's syllabus.
   - Clear disclaimer: Guidance and practice only; not formal certification.
3. **AI Project Coach**:
   - Student describes their project idea (e.g. *"I want to build an e-commerce website with React"*).
   - ORVEXA breaks it into 4 actionable phases: Architecture, Database Design, Frontend UI, and Testing.
4. **Mentor / Human Counselor Handoff**:
   - When a student asks questions beyond ORVEXA's scope or needs admissions approval, provide a direct handoff action: *"Connect with an academic counselor"* via WhatsApp/Email.

### 👥 Who Works on What
- **💻 Web Developer**: Milestone checklist UI in student dashboard, interactive quiz modal, copy-to-clipboard buttons.
- **🧠 AI Engineer / Intern**: Quiz generation prompt, structured milestone output format (`zod` schema validation), counselor handoff trigger detection.
- **📚 Content Manager**: Review quiz questions and milestone templates with course instructors.
- **🛡️ QA / Reviewer**: Test plan adjustments, skip/delete actions, and confirm student privacy consent covers milestone storage.

### 📦 Resources Required
- **People**: Web Developer, AI Intern, Course Instructors, Privacy Reviewer.
- **Data / Schema**: New tables: `learner_milestones`, `learner_quiz_attempts`.
- **Evidence / Evals**: 10 instructor-reviewed study plans and 50 validated quiz questions.

### 🏁 Exit Criteria
- [ ] Milestone plans are editable, actionable, and explicitly framed as guidance.
- [ ] Quizzes cite source course modules and provide clear explanations for wrong answers.
- [ ] Students can pause, edit, or delete their milestone plans at any time.

---

## Phase 3 — Resume & Career Documents

### 🎯 Outcome
Help students generate, structure, and refine professional tech resumes based purely on verified facts they supply.

### 🛠️ How to Implement (Technical Steps)
1. **Evidence-Grounded Resume Prompt**:
   - Input: Student's confirmed skills, projects, and work experience from `user_profiles_new`.
   - **Crucial Guardrail**: Strict instruction: *Never invent employers, degrees, GPA, dates, metrics, or technologies.* If metrics are missing, ORVEXA asks: *"Did your project improve performance or handle a specific number of users?"*
2. **Role-Tailored Gap Analysis**:
   - Student pastes a target job description.
   - ORVEXA analyzes the student's background against the job requirements, highlighting matched skills and recommended areas to highlight.
3. **Draft Preview & Export**:
   - Return clean Markdown sections (Summary, Technical Skills, Projects, Experience, Education).
   - Provide client-side export to PDF / TXT only after the student has reviewed and edited every section.

### 👥 Who Works on What
- **💻 Web Developer**: Resume review and editing interface, Markdown-to-PDF export utility.
- **🧠 AI Engineer / Intern**: Fact-anchoring prompt engineering, job-description gap analysis prompts, hallucination regression tests.
- **📚 Content / Career Specialist**: Review generated resume formats against modern industry ATS (Applicant Tracking System) standards.
- **🛡️ Privacy Reviewer**: Ensure uploaded resume drafts are kept private to the student account and can be permanently deleted.

### 📦 Resources Required
- **People**: AI Intern, Frontend Developer, Career Counselor, Privacy Officer.
- **Libraries**: Client-side document generation (e.g. `@react-pdf/renderer` or clean print CSS).
- **Evidence / Evals**: 20 synthetic student profiles tested against common tech job descriptions.

### 🏁 Exit Criteria
- [ ] Zero fabricated facts in generated resume drafts.
- [ ] Students can edit, accept, or reject every AI suggestion.
- [ ] Downloadable resumes are cleanly formatted and ATS-readable.

---

## Phase 4 — LinkedIn Profile Guidance

### 🎯 Outcome
Deliver actionable, constructive advice to improve a student's LinkedIn profile without ever requesting passwords or scraping LinkedIn.

### 🛠️ How to Implement (Technical Steps)
1. **Consent & Input Boundary**:
   - User pastes specific sections into the interface: Headline, About/Summary, or Experience bullet points.
   - Disclaimers displayed: ORVEXA does not connect directly to LinkedIn or store credentials.
2. **Profile Optimization Logic**:
   - Prompt evaluates:
     - **Headline**: Is it role-focused and keyword-rich (e.g. *"Full-Stack Developer \| React, Node.js, PostgreSQL"* vs *"Student at XYZ"*)?
     - **About Section**: Does it tell a compelling story and list key technical skills?
     - **Projects/Experience**: Do bullet points follow the Action-Verb + Task + Outcome framework?
3. **Prioritized Recommendations**:
   - Returns 3 prioritized, actionable recommendations with sample rewritten phrases the student can copy.

### 👥 Who Works on What
- **💻 Web Developer**: Text input panel with clear character counters and copy-to-clipboard buttons.
- **🧠 AI Engineer / Intern**: LinkedIn analysis prompt, tone tuning, output formatting (Headline suggestions, About section rewrites).
- **📚 Career Specialist**: Review suggested headlines and summary templates for modern recruiting trends.
- **🛡️ Legal / Privacy Reviewer**: Verify strict compliance with LinkedIn brand guidelines (no credential collection, no scraping).

### 📦 Resources Required
- **People**: AI Intern, Web Developer, Career Counselor.
- **Evidence / Evals**: 15 sample student LinkedIn profiles evaluated before and after AI suggestions.

### 🏁 Exit Criteria
- [ ] No scraping tools or account login flows implemented.
- [ ] Suggestions are structured as recommendations that require the student to manually apply them.
- [ ] Clear distinction between analysis observations and suggested text rewrites.

---

## Phase 5 — Career Readiness & Mock Interviews

### 🎯 Outcome
Prepare students for technical and behavioral job interviews through conversational practice and match them to verified Innoknowvex career opportunities.

### 🛠️ How to Implement (Technical Steps)
1. **Interactive Mock Interview Flow**:
   - Student selects a target role (e.g. *"Junior React Developer"* or *"Data Analyst"*).
   - ORVEXA generates 5 progressive questions (1 background, 3 technical concepts/coding scenarios, 1 behavioral).
   - Student types or speaks their response.
   - ORVEXA gives constructive feedback on clarity, key technical terms mentioned, and areas to improve before moving to the next question.
2. **Disclaimer Safeguard**:
   - Emphasize: *This is practice guidance to build confidence, not an official hiring assessment or employment guarantee.*
3. **Verified Careers Matching**:
   - Integrate with Innoknowvex's internal Careers database (`careers` table in Supabase).
   - When a student finishes training, recommend active open positions matching their verified skills.

### 👥 Who Works on What
- **💻 Web Developer**: Multi-step interview simulator UI, timer option, voice turn controls.
- **🧠 AI Engineer / Intern**: Technical question bank generator, answer feedback evaluator, careers role-matching algorithm.
- **📚 Technical / Recruiting Lead**: Validate technical accuracy of interview questions and grading rubrics.
- **🛡️ QA / Reviewer**: Verify that expired job postings are never recommended.

### 📦 Resources Required
- **People**: AI Engineer, Web Developer, Technical Interviewer, Hiring Coordinator.
- **Data / Schema**: Live careers feed from `careers` / `job_postings`.
- **Evidence / Evals**: 30 technical question/answer scenarios across Web Dev, AI, Python, and Data Science.

### 🏁 Exit Criteria
- [ ] Practice questions accurately reflect real-world technical interview standards.
- [ ] AI feedback explains why an answer was strong or what technical depth was missing.
- [ ] Job recommendations link only to active, verified postings.

---

## Phases 6 & 7 — Employee Tools (Internal Company Products)

> [!IMPORTANT]
> **Strict Isolation Boundary**: Phases 6 and 7 are internal corporate tools for Innoknowvex staff. They must be completely isolated behind employee role checks and never exposed to student accounts.

### Phase 6: Employee Workspace & Attendance
- **Outcome**: Role-gated employee dashboard with explicit, server-verified clock-in and clock-out actions.
- **Key Boundary**: No covert tracking, keyloggers, or background monitoring. Explicit employee actions with auditable correction request workflows.
- **Ownership**: HR Lead, Security Engineer, Backend Developer.

### Phase 7: Internal Knowledge & Work Assistant
- **Outcome**: Help staff find approved internal policies, SOPs, and prepare drafted client emails for review.
- **Key Boundary**: Draft-only email generation. ORVEXA drafts the text; the employee must review, copy, and send it manually. No automatic inbox reading or email sending.
- **Ownership**: Department Leads, AI Lead, Security Reviewer.

---

## Phase 8 — Governance, Quality & Scale (Continuous)

### 🎯 Outcome
Maintain high accuracy, fast response times, tight cost controls, and bulletproof security as user volume grows.

### 🛠️ How to Implement (Continuous Practices)
1. **Automated Evals in CI/CD**:
   - Every pull request in `Backend/` automatically runs `npm run test:ai` and `npm test`.
   - Test suite tests for regressions in prices, course prerequisites, and voice mode formatting.
2. **Token & Latency Monitoring**:
   - Track response latency and token usage per turn. Keep average completion tokens under 700 to ensure fast inference.
3. **Aggregated Feedback Loop**:
   - Collect thumbs-up / thumbs-down ratings on replies.
   - Aggregate unanswered questions to identify missing course FAQs without exposing individual student chat transcripts.

---

## 📋 Comprehensive Responsibility Matrix Across All Phases

| Phase | Web / Full-Stack Dev | AI Engineer / Intern | Content / Program Lead | QA & Compliance |
| :--- | :--- | :--- | :--- | :--- |
| **Phase 0: Foundation** | UI, Canvas Robot, Audio Orb, Next.js routes | Groq client, RAG context, prompts, voice replies | Initial FAQ & Course catalog data | Auth, security, zero secret leaks |
| **Phase 1: Course Guidance** | Program cards, comparison views, links | Alias scoring, ambiguity logic, prompt tuning | Verified fees, curriculum, prerequisites | Zero-hallucination fee audits |
| **Phase 2: Student Progress** | Milestone checklist, quiz modal, dashboard | Structured milestone generator, quiz prompt | Educator-reviewed question banks | Privacy consent for milestone data |
| **Phase 3: Resume Builder** | Document editor, PDF export utility | Fact-anchoring prompt, gap analysis | ATS resume formatting standards | Strict privacy & data deletion |
| **Phase 4: LinkedIn Advisor** | Text input UI, copy-to-clipboard | Profile review prompt, headline suggestions | Modern tech recruiting trends | Brand guidelines (no scraping) |
| **Phase 5: Mock Interviews** | Interactive interview simulator UI | Technical question generator, answer evaluator | Real-world interview question rubrics | Verify active job postings |
| **Phase 6: Staff Attendance** | Staff dashboard, clock-in/out UI | N/A (Pure infrastructure) | HR attendance policy & time zones | Role-based access control (RBAC) |
| **Phase 7: Internal SOPs** | Internal portal, email draft preview | Role-filtered document indexer, email drafter | Approved company SOPs and templates | Human-in-the-loop email review |
| **Phase 8: Governance** | CI/CD build scripts, performance audits | Benchmark test suites, latency optimization | Content freshness audits | Privacy compliance & audit logs |
