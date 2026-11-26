import assert from "node:assert/strict";
import test from "node:test";
import {
  followUpPrompts,
  isLikelySpeechEcho,
  prepareSpeechText,
} from "../src/components/orvexa/orvexa-interactions.mjs";

test("suggests career follow-ups for resume questions", () => {
  assert.match(followUpPrompts("Can you review my resume?")[0], /resume/i);
});

test("suggests course follow-ups for learning questions", () => {
  assert.match(followUpPrompts("Which course should I learn?")[2], /compare/i);
});

test("uses general follow-ups when no topic is recognized", () => {
  assert.equal(followUpPrompts("Hello")[0], "Tell me a little more");
});

test("recognizes speech that matches ORVEXA's spoken answer", () => {
  assert.equal(isLikelySpeechEcho("The course starts with foundations", "The course starts with foundations and projects"), true);
});

test("does not mistake an unrelated interruption for assistant echo", () => {
  assert.equal(isLikelySpeechEcho("wait, I have a question", "The course starts with foundations and projects"), false);
});

test("turns Markdown tables into speech without reading separator dashes", () => {
  assert.equal(
    prepareSpeechText("| Plan | Price |\n| --- | --- |\n| Self-learning | ₹19,999 |"),
    "Plan: Self-learning. Price: ₹19,999",
  );
});

test("removes Markdown list and horizontal-rule syntax but preserves hyphenated words", () => {
  assert.equal(
    prepareSpeechText("## Career support\n\n- Resume-building help\n---\n- Interview preparation"),
    "Career support. Resume-building help. Interview preparation",
  );
});

test("strips raw URLs and emojis from spoken text", () => {
  assert.equal(
    prepareSpeechText("Check details at https://innoknowvex.in/programs/ai 🚀! Welcome 👋"),
    "Check details at! Welcome",
  );
});
