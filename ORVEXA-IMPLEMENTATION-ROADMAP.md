# ORVEXA: A Simple Step-by-Step Build Plan

This plan is based on `ORVEXA-Complete-Documentation-v2.docx`.

It is written as a practical guide: what we build, how we check it, and when to save and push the work. **We will do one phase at a time.** We do not need to build every ORVEXA feature before showing the first useful version.

## ORVEXA in one sentence

ORVEXA will be a helper on the Innoknowvex website. A student can ask a question, get guidance based on approved Innoknowvex information, and later use voice and other learning tools.

## The first version we should aim for

Start with a small, useful version:

1. A student opens ORVEXA from the website.
2. They ask a question in chat.
3. ORVEXA answers using information Innoknowvex has checked and approved.
4. ORVEXA links to the relevant course or website page.
5. If it does not know an official answer, it says so instead of guessing.

After this works well, add a student profile and learning plan. Then add live voice. Resume help and payments can come after the basic assistant is reliable.

**What exists today:** the website has an ORVEXA introduction and a small voice greeting demo. The greeting is not an AI assistant: it does not answer questions or use an AI API.

## A few words in plain English

- **AI API:** A service the backend asks to write an answer. The secret key stays on our server, not in the student's browser.
- **Approved information:** Course and company facts checked by Innoknowvex staff. ORVEXA should use these for official answers.
- **Search and answer (RAG):** ORVEXA first finds the useful approved information, then asks the AI to explain it. This helps keep answers tied to real course details. It is not training our own AI.
- **Backend:** The server-side part of the website. It protects secret keys, checks users, and talks to the AI service.
- **Live voice:** The student starts a voice session once and talks naturally. The system detects when they finish a turn, sends it automatically, and speaks the response. There is no separate send button for every spoken question.
- **WebSocket:** A connection kept open so the browser and AI service can send small audio pieces back and forth with low delay.
- **Test:** A check that the feature works and has not broken something else.
- **Commit:** Save one completed set of code changes in Git.
- **Push:** Send those saved changes to the remote GitHub branch so they are backed up and can be reviewed.
- **Deploy:** Publish changes to the live website. Pushing code does not automatically mean we should deploy it.

## Before starting: things the owner needs to decide

We should not guess these answers. The owner and relevant reviewers should decide:

- Who can use ORVEXA at first, and whether there is a minimum age.
- Which language(s) to support in the first release.
- Which course information is official and who keeps it up to date.
- Which AI and voice services to use and how much monthly spending is allowed.
- What student information ORVEXA may save, how long to keep it, and how a student can delete it.
- Whether the first release needs sign-in.
- Whether the first release is free, and what any free-use limits are.
- Which support contact ORVEXA should offer when a student needs a person.
- Whether resume help and payments belong in the first public release or can wait.

If a decision is not ready, we can build a private demo with clearly labelled sample information. Do not show made-up course facts to real students.

## The phases

### Phase 0 — Agree on the small first release

**In simple terms:** Decide exactly what the first version will and will not do before building it.

**What we do**

- Confirm the first-release features: website entry, text chat, and answers based on approved course information.
- Choose who reviews course facts, who handles student support, and who approves privacy decisions.
- Choose an AI service and a spending limit. Keep its password/API key secret on the backend.
- Decide whether students must sign in for the first demo.
- Write down a few example questions students might ask and what a correct answer should contain.

**How we do this phase**

1. Check the Git branch and existing changes with `git status --short`; leave unrelated work untouched.
2. Meet with the product owner and reviewers to answer the decisions listed above.
3. Write the agreed features, exclusions, sample questions, owners, and pass/fail targets in the issue or PR.
4. Run the current tests once and record any pre-existing failures.
5. Create the feature branch once. Reuse it for all later phases.

**How we test/check it**

- The owner agrees to the first-release scope and names the reviewers.
- Someone checks the example questions and confirms the source information is accurate.
- Run the current project checks once so we know whether existing tests already fail:
  - In `Backend\`: `npm test`
  - In `website\`: `npm run lint` and `npm run build`

**Save and push**

- Create a separate branch called `feature/orvexa-mvp`.
- Save and push the agreed scope/initial work on that branch.
- Do not put passwords, `.env` files, or real student information into GitHub.

**Do not move on until:** we know what information ORVEXA is allowed to use and who checks it.

### Phase 1 — Add the ORVEXA chat screen

**In simple terms:** Give students a place on the website to type a question.

**What we do**

- Add an “Ask ORVEXA” entry point and a clear chat page or panel.
- Show a short explanation of what ORVEXA can help with and what it cannot guarantee.
- Build the message box, send button, conversation area, loading state, and readable error message.
- At this point, use sample answers only if needed; do not pretend the AI integration is finished.

**How we do this phase**

1. Follow the existing ORVEXA route, header, colors, and responsive layout patterns.
2. Build the screen with sample data first: conversation, text input, send action, loading state, and error state.
3. Clearly mark sample answers as demo content; do not imply they came from a working AI.
4. Review the screen on phone and desktop, then adjust accessibility and layout before connecting an AI provider.

**How we test it**

- Open the chat on desktop and mobile.
- Send a message, send an empty message, and test the loading and error states.
- Try keyboard-only navigation and check that buttons and messages are understandable.
- Run `npm run lint` and `npm run build` inside `website\`.

**Save and push**

- Commit the chat-screen changes with a clear message, for example `feat(orvexa): add chat screen`.
- Push the `feature/orvexa-mvp` branch and check the changes on GitHub.

**Do not move on until:** the chat screen works on phone and desktop and the website still builds.

### Phase 2 — Connect chat to the backend and AI

**In simple terms:** When a student sends a message, the website sends it to our server; the server asks the AI service and returns the answer.

**What we do**

- Add an ORVEXA API route to the existing Express backend.
- Validate the student's message and set sensible message-size and request limits.
- Call the chosen AI service from the backend only.
- Show the answer in the chat. Show a helpful error if the AI service is down.
- Do not put the AI secret key in the website or browser.

**How we do this phase**

1. Add a dedicated ORVEXA route/controller in Express, following the existing backend patterns.
2. Add request validation and a small AI-provider service so the controller stays easy to test.
3. Read the provider key from backend environment settings; never commit it.
4. Have the website send the message to the backend and render the returned answer, loading state, or recoverable error.
5. Mock the AI provider in automated tests so tests do not make real, paid API calls.

**How we test it**

- Send a normal question and confirm an answer comes back.
- Try empty or very long messages and confirm they are handled safely.
- Test an invalid/missing API key and a temporary AI-service failure; the student should see an error, not a fake answer.
- Check logs to ensure they do not expose API keys or unnecessary personal information.
- Run `npm test` inside `Backend\`; run website lint and build.

**Save and push**

- Commit and push the backend and website changes after the tests pass.
- Configure the API key in local/deployment secret settings, never in a committed file.

**Do not move on until:** the server can call the AI safely and failures are shown honestly.

### Phase 3 — Teach ORVEXA about Innoknowvex courses

**In simple terms:** Give ORVEXA checked course information to look up before it answers questions about our programs.

**What we do**

- Collect the real program details from an approved Innoknowvex source.
- Ask the academic/course owner to check titles, duration, fees, eligibility, prerequisites, and other official claims.
- Make the backend find the relevant course details for each question and send only those details to the AI.
- Ask ORVEXA to link to the source page and say when it cannot find an official answer.
- Start with a simple search method. Do not add a complicated vector database unless testing proves it is needed.

**How we do this phase**

1. Get course details from an approved Innoknowvex source; do not invent missing fields.
2. Ask the academic/course owner to review the content and identify stale or missing facts.
3. Store approved records with a source link and review date in the selected backend data source.
4. Search those records for each question and send only relevant details to the AI.
5. Return source links. If approved information does not answer the question, ask a follow-up or direct the student to a person.
6. Start with ordinary database/keyword search. Add vector search only if test questions show it is needed.

**How we test it**

- Ask questions with answers present in the approved information.
- Ask about missing information, incorrect assumptions, fees, eligibility, and policies.
- Check that answers link to the right page and that ORVEXA does not invent missing details.
- Have the course owner review a sample of answers.
- Run backend tests, website lint, and website build.

**Save and push**

- Commit and push the approved content/search changes and their tests.
- Do not commit private student data or provider secrets.

**Do not move on until:** course-related answers are checked, linked to sources, and do not make up official facts.

### Phase 4 — Add sign-in and a small student profile

**In simple terms:** Let a student tell ORVEXA a little about their goal so guidance can be more useful.

**What we do**

- Reuse the website's existing sign-in system rather than making a separate account.
- Ask only a few useful questions, such as the student's current stage and what they want help with.
- Let the student skip questions, correct answers, and review information before it is saved.
- Save conversations/profile only if the owner has approved the privacy and deletion rules.
- Make sure each student can access only their own profile and conversation.

**How we do this phase**

1. Reuse the website's existing sign-in instead of making a second account system.
2. Confirm how the website reads the signed-in session and sends its access token to Express.
3. Agree on profile fields and deletion rules before changing the database.
4. Add profile records and access policies using the project's confirmed migration process.
5. Build backend profile routes that use the authenticated user identity, not a user ID trusted from the browser.
6. Build the form and connect it to those routes; ask only relevant questions and allow skipping.
7. Test with two accounts and verify neither can read the other's profile or messages.

**How we test it**

- Try a signed-out user, a signed-in user, and two different accounts.
- Confirm one account cannot see another account's profile or messages.
- Test editing and deleting information.
- Test skip/not-sure options, mobile layout, and keyboard navigation.
- Run backend tests, website lint, and website build.

**Save and push**

- Commit and push only after the account-isolation checks pass.
- Review any database changes before applying them to the live system.

**Do not move on until:** student information is private, editable, and deletable under the agreed rules.

### Phase 5 — Add a simple learning plan

**In simple terms:** Let ORVEXA suggest a few next steps based on the student's goal.

**What we do**

- Ask ORVEXA to suggest a small, realistic learning plan using the student's confirmed goal and approved course facts.
- Explain why each course or activity is suggested.
- Let the student edit or confirm the plan before saving it.
- Do not promise a job, salary, admission, or placement.

**How we do this phase**

1. Agree on sample learning plans with a career/course reviewer.
2. Send the student's confirmed goal, available study time, and relevant approved course facts through the backend.
3. Ask the AI for a structured draft with steps, reasons, and unknowns.
4. Let the student edit or confirm the draft before saving it.
5. Save the confirmed plan to that student's account and allow later edits or deletion.
6. Test unsuitable/missing course information; the assistant should explain the limitation instead of forcing a recommendation.

**How we test it**

- Try different goals, a beginner, a student with limited study time, and a goal with no matching course.
- Confirm missing information leads to a question or an honest limitation.
- Ask a career/course reviewer to check sample plans.
- Run the usual backend and website checks.

**Save and push**

- Commit and push after the plan is editable, reviewed, and tested.

**Do not move on until:** the student can understand, correct, and choose whether to save the suggested plan.

### Phase 6 — Add live, natural voice conversation

**In simple terms:** This is the Gemini-style experience you described. The student taps **Start voice chat** once and grants microphone permission. ORVEXA listens while the session is active. When the student pauses at the end of a question, the system detects the end of that turn and sends it automatically—there is no separate Send button for each spoken question. ORVEXA replies aloud, and the student can interrupt while it is speaking. The student taps **End voice chat** to close the session.

This is different from the current welcome-greeting demo and from push-to-talk transcription. It uses a real-time audio service. Gemini Live is one candidate, not a final provider decision. Before choosing it, check current access, region and language support, pricing, privacy terms, and usage limits.

**What we build**

- A **Start voice chat** button. A student action and browser microphone permission are still required; the mic never starts automatically.
- A live audio connection: the browser streams the student's voice and receives ORVEXA's spoken reply.
- Automatic turn detection: after the student finishes speaking, ORVEXA responds without a separate send action.
- Interruption support: if the student speaks during ORVEXA's reply, stop that reply and listen to the new question.
- **End voice chat**, mute/unmute, connection status, and optional captions. Keep text chat as a fallback.
- Short-lived session access created by the backend; never send the permanent provider API key to the browser.
- A safe connection to approved course information. Live course lookups must go through a limited backend function that returns reviewed content—not direct database access by the AI.
- Session time and cost limits. Do not retain raw audio unless there is an approved need and clear consent.

**How we implement this phase**

1. **Choose the provider.** Compare Gemini Live and alternatives. Check pricing, India availability, supported languages/voices, privacy terms, session limits, response speed, and whether short-lived browser credentials are supported.
2. **Build a small private proof first.** Connect a test page to the provider, stream microphone audio, hear the answer, verify automatic end-of-turn, and test interruption. Use a spending cap.
3. **Secure the connection.** Recommended flow: student taps Start → browser asks for mic permission → website asks the Express backend for a signed-in, short-lived voice session → browser connects to the voice provider using that limited session. Keep the permanent provider key on the backend. If safe short-lived sessions are not supported, proxy audio through the backend and measure the extra delay and server cost.
4. **Connect approved course lookup.** Reuse the tested course-answer logic. If the AI needs course facts during the conversation, it requests a narrowly defined backend lookup. The backend checks permission, searches approved content, and returns only relevant facts and source links.
5. **Build the controls.** Add Start, End, mute, connecting/listening/speaking indicators, optional captions, and a visible switch to text. Every turn is automatic after the session begins; the student does not press Send after each voice question.
6. **Handle interruptions and errors.** When the student starts speaking during a reply, cancel playback and accept the new turn. If mic permission, connection, provider, or playback fails, explain the issue and offer text chat.
7. **Apply limits and privacy.** Cap session length and spending, close idle sessions, stop the mic immediately on End or leaving the page, and follow the approved audio retention policy.
8. **Pilot on real devices.** Keep voice behind a controlled rollout while the team tests the agreed phones, browsers, languages, and network conditions.

**How we test it**

- Ask multiple questions in one session and confirm ORVEXA responds without a manual Send after each one.
- Interrupt a spoken answer and confirm ORVEXA stops and listens to the new question.
- Test mic permission denied, mute, End, navigation away, silence, background noise, network loss/reconnect, and provider outage.
- Confirm the mic is not active before Start or after End, and session access expires.
- Check text fallback, captions, approved course sources, response delay, session duration, and cost on the agreed devices/languages.
- Run `npm test` in `Backend\`, and `npm run lint` plus `npm run build` in `website\`.

**Save and push**

- Commit and push the private voice proof before integrating it into the main ORVEXA chat.
- Push the integrated feature separately after privacy, access, cost, interruption, and device checks pass.
- Keep the feature disabled for general students until reviewers approve it.

**Do not move on until:** voice turns are automatic, interruptions work, the student controls when the mic is active, and text chat remains usable.

### Phase 7 — Decide whether resume help is in the first release

**In simple terms:** Resume support is a separate feature. It needs more privacy and accuracy work, so it can wait until chat is reliable.

**If approved, what we do**

- Choose which resume file types are supported and who reviews the resume advice.
- Keep uploaded files private and let the student delete them.
- Ask the student to check any details ORVEXA reads from a resume.
- Never invent jobs, projects, skills, dates, or achievements.
- Let the student review and edit the result before downloading.

**How we do this phase**

1. Agree on file types, upload size limits, privacy/retention rules, review checklist, and download format.
2. Upload files to private storage through the backend; never make student resumes public.
3. Extract resume text on the server and show the extracted facts to the student for correction.
4. Generate feedback only from facts the student confirmed; ask questions instead of inventing missing details.
5. Show a preview, allow edits and approval, then create the download.
6. Add deletion and test access with separate accounts before enabling real uploads.

**How we test it**

- Test a normal file, unsupported file, large file, and file that cannot be read.
- Check the generated result against what the student actually supplied.
- Download and open the result; check that the text is in the right order.
- Confirm another account cannot access the file.
- Run backend tests, website lint, and website build.

**Save and push**

- Commit and push only after private-file and factual-accuracy checks pass.

**Do not move on until:** reviewers verify the output is truthful and private.

### Phase 8 — Add free-use limits, payments, and support tools

**In simple terms:** Only charge students after the rules and prices are clear and the free experience is tested.

**What we do**

- Decide exactly what is free, what costs money, and what happens when a request fails.
- Check usage on the backend so a student cannot bypass limits by changing the webpage.
- Add payment processing only after the owner approves prices and refund rules.
- Make sure a repeated payment notification does not give credits twice.
- Add a clear way to contact a real person. Ask permission before sharing a student's conversation.

**How we do this phase**

1. The owner publishes exact free/paid limits, prices, expiry rules, and what happens if a request fails.
2. Build a usage ledger on the backend; the webpage must not decide whether a request is free or paid.
3. Before paid work starts, show the price and reserve the student's allowance on the server.
4. On success, charge once. On eligible failure, release the reservation under the approved policy.
5. Add payment checkout in test mode; verify payment notifications and ensure duplicate notifications do not grant credits twice.
6. Add a small admin/support screen for approved staff, and record sensitive admin changes.
7. Add monitoring for failures, usage, cost, and payment errors before a pilot.

**How we test it**

- Use the payment test/sandbox mode, not real charges.
- Test successful payment, failed payment, repeated notifications, insufficient balance, and AI failure during a paid request.
- Confirm failed work does not lead to an incorrect charge.
- Confirm human support is not reported as contacted unless a request was actually sent.
- Run backend tests, website lint, and website build.

**Save and push**

- Commit and push after payment and support tests pass.
- Never test with a real charge without explicit approval.

**Do not move on until:** limits, payment retries, refunds/failures, and support handoff work as agreed.

### Phase 9 — Test the whole experience and invite a small pilot group

**In simple terms:** Test the complete journey with a small number of invited students before opening it to everyone.

**What we do**

- Test from opening ORVEXA through chat, course answers, profile, learning plan, voice, and any approved resume/payment features.
- Invite a small, agreed group of students. The source document suggests 30–50; the owner should choose the actual number.
- Watch for wrong answers, confusing screens, voice issues, privacy problems, support requests, and unexpected costs.
- Fix serious problems before inviting more students.

**How we do this phase**

1. Deploy the candidate branch to a staging/test website, not production.
2. Run automated tests and a manual checklist using test accounts and non-sensitive data.
3. Ask academic/career reviewers to check sample answers and resume results; ask privacy/support owners to check deletion and handoff.
4. Invite students in small batches, tell them this is a pilot, and provide a way to report issues.
5. Watch answer accuracy, user feedback, voice failures, support needs, and costs. Avoid unnecessary access to conversation content.
6. Pause the pilot for serious privacy, payment, safety, or factual errors; fix and retest before continuing.
7. Compare results with the pass/fail targets agreed in Phase 0. The owner decides whether to improve, continue a limited pilot, or approve wider launch.

**How we test it**

- Run `npm test` inside `Backend\`.
- Run `npm run lint` and `npm run build` inside `website\`.
- Manually test on real phones and desktop browsers.
- Check that students cannot see each other's data.
- Compare pilot results to the success targets agreed in Phase 0.

**Save, push, and launch**

- Commit and push the final pilot fixes to the ORVEXA feature branch.
- Ask for review before merging.
- Deploy to a test/staging environment first.
- Go live only after the owner and reviewers approve the pilot results.

## How to save and push a phase (developer steps)

Use a separate branch so unfinished ORVEXA work does not go straight to the live website. Run these commands from the repository folder in PowerShell:

```powershell
git status --short
git switch -c feature/orvexa-mvp
```

Create that branch once. After each phase is complete and tested:

```powershell
git add <the-files-for-this-phase>
git diff --cached --check
git diff --cached
git commit -m "feat(orvexa): describe the completed phase"
git push -u origin feature/orvexa-mvp
```

For later phases, use `git push` after making the new phase commit.

Before staging, check the file list carefully. **Never add `.env` files, API keys, passwords, private student files, or real student messages.** If a test fails, fix it before saying the phase is complete. A pushed branch is saved on GitHub; it is not automatically approved or ready to deploy.

## What can wait until later

These are not part of the earliest text-chat release. Live voice is planned for Phase 6, after text chat and approved course answers work:

- Automatic job applications or live job listings.
- Mock interviews, project grading, or running student-submitted code.
- Complex integrations or training a custom AI model.
- Claims that ORVEXA can guarantee a job, salary, admission, or selection.

For the real-time voice approach, see Google's [Gemini Live API documentation](https://ai.google.dev/gemini-api/docs/live-api). It describes streamed, two-way voice, automatic turn handling, interruptions, and short-lived credentials for browser connections. Provider features, availability, and pricing can change, so verify them again before implementation.

## When can we say the first version is ready?

The controlled pilot is ready only when:

- ORVEXA answers course questions from approved information and links to its sources.
- It admits when it does not know an official answer.
- Student accounts and personal information are kept separate.
- Students can use text even if voice is unavailable.
- Any resume output is checked by the student and does not invent facts.
- Free limits and any charges are clear and tested before public launch.
- The main tests pass, the owner/reviewers approve the results, and there is a way to stop or roll back a bad release.

**Recommended order:** first make course-question chat work well; then add profiles and learning plans; then voice; then decide if resume and payments are ready. Build and test one step at a time.

## What a student experiences in the planned live voice phase

1. The student opens ORVEXA and taps **Start voice chat**.
2. The browser asks permission to use the microphone. If permission is denied, the student can use text chat.
3. While the voice session is active, the student speaks naturally. ORVEXA detects when the student has finished a turn and answers without a separate Send button.
4. ORVEXA speaks its answer. The student can interrupt to ask a follow-up; ORVEXA stops speaking and listens.
5. The student taps **End voice chat** to close the session. The microphone must stop immediately.

This does **not** mean ORVEXA secretly listens whenever the website is open. A user must start the session and grant permission; voice ends when they stop it or leave the session.
