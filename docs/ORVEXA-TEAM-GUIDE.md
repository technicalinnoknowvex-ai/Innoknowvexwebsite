# ORVEXA Team Collaboration & Workflow Guide

This guide defines how the engineering team, AI interns, course content reviewers, and product owners plan, develop, test, and deploy changes to **ORVEXA**.

For the detailed technical steps, resource needs, and role assignments for each roadmap phase, read the [ORVEXA Phase Implementation Guide](./ORVEXA-PHASE-IMPLEMENTATION-GUIDE.md).
For the AI intern onboarding guide, read [Backend/src/ai/README.md](../Backend/src/ai/README.md).

---

## 1. Team Ownership & Code Boundaries

ORVEXA is developed in a **unified monorepo** (`Innoknowvexwebsite`), organized into clean, isolated domains so team members can work simultaneously without conflicts:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        TEAM CODE OWNERSHIP                             │
├────────────────────┬─────────────────────────────┬─────────────────────┤
│ Directory          │ Primary Owner               │ Responsibilities    │
├────────────────────┼─────────────────────────────┼─────────────────────┤
│ website/src/       │ Web / Full-Stack Developer  │ React UI, canvas    │
│ components/orvexa/ │                             │ robot, audio orb,   │
│                    │                             │ styling & layouts   │
├────────────────────┼─────────────────────────────┼─────────────────────┤
│ Backend/src/ai/    │ AI Engineers & Interns      │ System prompts, RAG │
│                    │                             │ search, Groq calls, │
│                    │                             │ spoken replies      │
├────────────────────┼─────────────────────────────┼─────────────────────┤
│ Backend/tests/ai/  │ AI Engineers & Interns      │ Prompt & accuracy   │
│                    │                             │ test cases (Evals)  │
├────────────────────┼─────────────────────────────┼─────────────────────┤
│ Backend/src/       │ Full-Stack / Backend Dev    │ Express routes, JWT │
│ controllers/       │                             │ auth, Supabase RLS  │
├────────────────────┼─────────────────────────────┼─────────────────────┤
│ Supabase Tables    │ Course / Content Managers   │ programs_new, FAQ   │
│                    │                             │ & pricing data      │
└────────────────────┴─────────────────────────────┴─────────────────────┘
```

---

## 2. Why the Monorepo Structure?

In earlier iterations, ORVEXA was maintained as an external npm package on GitHub Packages (`@technicalinnoknowvex-ai/orvexa`). This created high friction:
- Every prompt tweak required git tagging, waiting for GitHub Actions to publish, generating personal access tokens (`NPM_TOKEN`), and running `npm install` in two separate projects.
- Deployed builds on Vercel and Render frequently broke when tokens expired.

**The modern unified structure solves this completely:**
- **Zero package publishing**: AI prompt changes take effect immediately on localhost.
- **Fast automated testing**: All AI tests run in ~130ms directly in the backend.
- **Instant deployment**: Standard git pushes deploy cleanly to Vercel and Render without private token secrets.

---

## 3. Step-by-Step Workflow for Making a Change

### Step 1: Create a Feature Branch
Always work on a dedicated branch; never push directly to `main`:

```powershell
git status
git switch -c feature/your-feature-name
```

### Step 2: Implement and Validate Locally

#### A. If you are an AI Engineer or Intern (Working on Prompts / AI Engine):
1. Make your changes in `Backend/src/ai/assistantController.js`.
2. Add corresponding test questions in `Backend/tests/ai/assistantController.test.js`.
3. Validate locally:
   ```powershell
   cd Backend
   npm run test:ai   # Runs all AI accuracy tests (~130ms)
   npm test          # Runs all backend tests
   ```

#### B. If you are a Web Developer (Working on Frontend UI / Audio Controls):
1. Make your changes in `website/src/components/orvexa/`.
2. Validate locally:
   ```powershell
   cd website
   npm test          # Runs frontend interaction tests
   npm run lint      # Checks for ESLint errors
   npm run build     # Verifies production build compiles
   ```

### Step 3: Open a Pull Request (PR)
1. Push your branch to GitHub:
   ```powershell
   git push -u origin feature/your-feature-name
   ```
2. Open a Pull Request with:
   - Summary of changes (what problem was solved).
   - Test results (confirming `npm test` or `npm run test:ai` passed).
   - Any database migrations needed (e.g., new FAQ entries in Supabase).
3. Request review from the area owner:
   - UI changes reviewed by the Web Developer.
   - Prompt / RAG changes reviewed by the AI Lead.
   - Pricing / course claims reviewed by the Course Content Manager.

### Step 4: Merge & Deployment
Once approved and automated checks pass:
1. Merge the PR into `main`.
2. Vercel automatically deploys the website frontend.
3. Render automatically deploys the Express backend.
4. Verify the live `/orvexa` route and backend logs.

---

## 4. Team Pre-Merge Checklist

Before merging any ORVEXA change, verify:

- [ ] Working on a feature branch (not directly on `main`).
- [ ] No secrets, passwords, or local `.env` files staged in Git.
- [ ] `npm run test:ai` passes 100% (38+ tests, 0 failures).
- [ ] `npm test` passes in `Backend/` (80+ tests, 0 failures).
- [ ] `npm run build` succeeds in `website/` (zero Next.js build errors).
- [ ] Course claims, pricing, or durations are grounded in official database records.
- [ ] Student data handling complies with consent and privacy rules.
- [ ] Appropriate team review received.
