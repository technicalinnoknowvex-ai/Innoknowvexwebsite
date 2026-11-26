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

test("recognizes partial bigrams and stemmed variations as echo", () => {
  assert.equal(isLikelySpeechEcho("the courses starting with foundation", "The course starts with foundations and projects"), true);
});

test("recognizes stop command as genuine user interruption", () => {
  assert.equal(isLikelySpeechEcho("stop", "The course starts with foundations and projects"), false);
});

test("recognizes questions on new topics as genuine user interruption", () => {
  assert.equal(isLikelySpeechEcho("what about python programming?", "The course starts with foundations and projects"), false);
});

test("recognizes echoes when assistant itself used wait or actually", () => {
  assert.equal(isLikelySpeechEcho("wait until tomorrow for the update", "Wait until tomorrow for the update on courses"), true);
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

test("recognizes questions about the course topic as genuine user interruptions", () => {
  assert.equal(
    isLikelySpeechEcho("how long is this machine learning course?", "The machine learning course covers deep learning and neural networks"),
    false,
  );
  assert.equal(
    isLikelySpeechEcho("what is the fee for machine learning?", "The machine learning course covers deep learning and neural networks"),
    false,
  );
  assert.equal(
    isLikelySpeechEcho("can you tell me more?", "The machine learning course covers deep learning and neural networks"),
    false,
  );
  assert.equal(
    isLikelySpeechEcho("hold on", "The machine learning course covers deep learning and neural networks"),
    false,
  );
});

test("caps long multi-paragraph content to concise spoken sentences", () => {
  const longContent = `Here are the current training and internship durations:

**Artificial Intelligence**
- Training duration: 8 weeks
- Internship duration: 4 weeks

**Machine Learning**
- Training duration: 10 weeks
- Internship duration: 6 weeks

**Web Development**
- Training duration: 12 weeks
- Internship duration: 8 weeks`;

  const spoken = prepareSpeechText(longContent);
  const wordCount = spoken.split(/\s+/).filter(Boolean).length;
  assert.ok(wordCount <= 35, `Expected word count <= 35, got ${wordCount}`);
  assert.match(spoken, /training and internship durations/i);
});
