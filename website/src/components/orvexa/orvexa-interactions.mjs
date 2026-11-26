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
  "excuse", "listen", "hang"
]);

function stemWord(word) {
  return String(word || "")
    .toLowerCase()
    .replace(/(?:ing|edly|edly|ed|es|s|ly|ment|tion)$/, "")
    .trim();
}

function extractNGrams(words, n) {
  const ngrams = new Set();
  for (let index = 0; index <= words.length - n; index += 1) {
    ngrams.add(words.slice(index, index + n).join(" "));
  }
  return ngrams;
}

export function isLikelySpeechEcho(transcript = "", spokenText = "") {
  const normTranscript = String(transcript || "").toLowerCase().trim();
  const normSpoken = String(spokenText || "").toLowerCase().trim();
  if (!normTranscript || !normSpoken) return false;

  const tWords = normTranscript.match(/[a-z0-9]+/g) || [];
  const sWords = normSpoken.match(/[a-z0-9]+/g) || [];
  if (!tWords.length || !sWords.length) return false;

  const hasInterruptCommand = tWords.some((word) => INTERRUPT_COMMANDS.has(word));

  // Single or double stray words without an interrupt command are almost always speaker leak / mic clicks
  if (tWords.length <= 2 && !hasInterruptCommand) return true;

  // Bigram and trigram phrase overlap check
  const sBigrams = extractNGrams(sWords, 2);
  const sTrigrams = extractNGrams(sWords, 3);
  const tBigrams = extractNGrams(tWords, 2);

  let matchingBigrams = 0;
  for (const bigram of tBigrams) {
    if (sBigrams.has(bigram)) matchingBigrams += 1;
  }

  // If 2 or more bigrams match, or any trigram matches, it is definitely assistant speech
  if (matchingBigrams >= 2) return true;
  if (tWords.length >= 3) {
    const tTrigrams = extractNGrams(tWords, 3);
    for (const trigram of tTrigrams) {
      if (sTrigrams.has(trigram)) return true;
    }
  }

  // Check stemmed word overlap
  const sStemmed = new Set(sWords.map(stemWord));
  const tStemmed = tWords.map(stemWord);
  const matchingWords = tStemmed.filter((word) => sStemmed.has(word)).length;
  const overlapRatio = matchingWords / tWords.length;

  // If user says an interrupt command, ensure it's not just repeating assistant's words
  if (hasInterruptCommand) {
    // If the words accompanying the command match the assistant's speech, it is echo
    return overlapRatio >= 0.70;
  }

  // For general utterances without a command word, if >= 38% of words match assistant speech, it's echo
  if (overlapRatio >= 0.38) return true;

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

  return spokenLines
    .filter(Boolean)
    .join(". ")
    .replace(/\s+([,.;!?])/g, "$1")
    .replace(/([.!?])(?:\s*[.!?])+/g, "$1")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 5000);
}
