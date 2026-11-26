export function followUpPrompts(question = "") {
  const normalized = String(question).toLowerCase();
  if (/resume|cv|linkedin|interview|career|job/.test(normalized)) {
    return ["Can you help me improve my resume?", "How can I prepare for an interview?", "What should I focus on next?"];
  }
  if (/course|program|training|learn|skill/.test(normalized)) {
    return ["What would suit my goals?", "How long does it take?", "Can you compare my options?"];
  }
  if (/contact|email|phone|address|support/.test(normalized)) {
    return ["How can I get in touch?", "Can you help me write a message?", "What should I ask the team?"];
  }
  return ["Tell me a little more", "What should I do next?", "How does that fit my goals?"];
}

const INTERRUPT_COMMANDS = new Set([
  "stop", "wait", "hold", "pause", "quiet", "cancel", "shut",
  "excuse", "listen", "hang", "hush", "silence", "enough"
]);

const QUESTION_OR_INTERRUPT_STARTERS = new Set([
  "what", "whats", "how", "hows", "why", "where", "wheres", "when", "whens",
  "who", "which", "can", "could", "would", "will", "should", "tell", "explain",
  "is", "are", "do", "does", "did", "have", "has", "hey", "hello", "hi", "orvexa",
  "no", "nope", "actually", "sorry"
]);

function stemWord(word) {
  return String(word || "")
    .toLowerCase()
    .replace(/s$/, "")
    .replace(/(?:ing|edly|ed|es|ly|ment|tion)$/, "")
    .trim();
}

function wordsMatch(w1, w2) {
  return w1 === w2 || stemWord(w1) === stemWord(w2);
}

function findContiguousSubsequence(needle, haystack) {
  if (!needle.length || !haystack.length || needle.length > haystack.length) return false;
  for (let i = 0; i <= haystack.length - needle.length; i += 1) {
    let match = true;
    for (let j = 0; j < needle.length; j += 1) {
      if (!wordsMatch(needle[j], haystack[i + j])) {
        match = false;
        break;
      }
    }
    if (match) return true;
  }
  return false;
}

export function isLikelySpeechEcho(transcript = "", spokenText = "") {
  const normTranscript = String(transcript || "").toLowerCase().trim();
  const normSpoken = String(spokenText || "").toLowerCase().trim();
  if (!normTranscript || !normSpoken) return false;

  const tWords = normTranscript.match(/[a-z0-9]+/g) || [];
  const sWords = normSpoken.match(/[a-z0-9]+/g) || [];
  if (!tWords.length || !sWords.length) return false;

  const firstWord = tWords[0];
  const hasInterruptCommand = tWords.some((word) => INTERRUPT_COMMANDS.has(word));
  const isQuestionOrInterruptStarter = QUESTION_OR_INTERRUPT_STARTERS.has(firstWord) || hasInterruptCommand;

  // Check if transcript is an exact or stemmed contiguous segment of what the assistant is speaking
  const isContiguousEcho = findContiguousSubsequence(tWords, sWords);

  // If the user's transcript starts with an interruption command or question starter:
  if (isQuestionOrInterruptStarter) {
    // If the assistant was literally speaking these exact contiguous words at this moment, it is echo
    if (isContiguousEcho) {
      return true;
    }
    // Otherwise, the user is interrupting or asking a new question!
    return false;
  }

  // If the transcript matches a contiguous slice of assistant speech (at least 2 words), it's definitely echo
  if (tWords.length >= 2 && isContiguousEcho) {
    return true;
  }

  // 1 or 2 stray words without interrupt or question intent:
  // If they exist anywhere in the assistant's speech, treat as speaker bleed/click
  if (tWords.length <= 2) {
    const sWordSet = new Set(sWords.map(stemWord));
    const allMatch = tWords.every((word) => sWordSet.has(stemWord(word)));
    if (allMatch) return true;
    return false;
  }

  // For longer utterances (3+ words), check sequential bigrams
  let matchingBigrams = 0;
  for (let i = 0; i < tWords.length - 1; i += 1) {
    const pair = [tWords[i], tWords[i + 1]];
    if (findContiguousSubsequence(pair, sWords)) {
      matchingBigrams += 1;
    }
  }

  // If more than 60% of word pairs appear sequentially in assistant speech, it's echo
  const bigramRatio = matchingBigrams / (tWords.length - 1);
  if (bigramRatio >= 0.60) {
    return true;
  }

  return false;
}

function isTableSeparator(line) {
  return /^\s*\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
}

function tableCells(line) {
  return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
}

export function prepareSpeechText(content = "") {
  const lines = String(content)
    .replace(/```[\s\S]*?```/g, " Code snippet omitted. ")
    .replace(/\r\n?/g, "\n")
    .split("\n");
  const spokenLines = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (!line) continue;

    if (line.includes("|") && isTableSeparator(lines[index + 1] || "")) {
      const headers = tableCells(line);
      index += 2;
      while (index < lines.length && lines[index].includes("|")) {
        const cells = tableCells(lines[index]);
        if (!isTableSeparator(lines[index])) {
          spokenLines.push(cells.map((cell, cellIndex) => (
            headers[cellIndex] ? `${headers[cellIndex]}: ${cell}` : cell
          )).join(". "));
        }
        index += 1;
      }
      index -= 1;
      continue;
    }

    if (isTableSeparator(line) || /^\s*(?:[-*_]\s*){3,}$/.test(line)) continue;
    spokenLines.push(
      line
        .replace(/https?:\/\/\S+/gi, "")
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/^\s{0,3}#{1,6}\s*/, "")
        .replace(/^\s*(?:[-*+]|\d+[.)])\s+/, "")
        .replace(/(?:—|–|--+)/g, ", ")
        .replace(/[#*_`>|]/g, "")
        .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "")
        .trim(),
    );
  }

  const rawCleaned = spokenLines
    .filter(Boolean)
    .join(". ")
    .replace(/:\s*\./g, ".")
    .replace(/\s+([,.;!?])/g, "$1")
    .replace(/([.!?])(?:\s*[.!?])+/g, "$1")
    .replace(/\s+/g, " ")
    .trim();

  const allWords = rawCleaned.split(/\s+/).filter(Boolean);
  if (allWords.length <= 35) {
    return rawCleaned;
  }

  // Cap long text to concise spoken sentences (at most 2-3 sentences, max ~35 words)
  const sentences = rawCleaned.match(/[^.!?]+[.!?]+|\S+$/g) || [rawCleaned];
  const selected = [];
  let totalWords = 0;

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;
    const count = trimmed.split(/\s+/).filter(Boolean).length;
    if (selected.length >= 1 && (totalWords + count > 35 || (selected.length >= 2 && totalWords >= 15))) {
      break;
    }
    selected.push(trimmed);
    totalWords += count;
    if (totalWords >= 28 || (selected.length >= 3 && totalWords >= 15)) break;
  }

  const result = selected.join(" ").trim();
  return result || allWords.slice(0, 30).join(" ");
}
