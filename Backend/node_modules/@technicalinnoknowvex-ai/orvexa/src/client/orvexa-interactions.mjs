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

export function isLikelySpeechEcho(transcript = "", spokenText = "") {
  if (/\b(?:stop|wait|hold on|excuse me|actually|one second)\b/i.test(transcript)) return false;
  const transcriptWords = String(transcript).toLowerCase().match(/[a-z0-9]+/g) || [];
  const spokenWords = new Set(String(spokenText).toLowerCase().match(/[a-z0-9]+/g) || []);
  if (!transcriptWords.length || !spokenWords.size) return false;
  const matchingWords = transcriptWords.filter((word) => spokenWords.has(word)).length;
  return matchingWords / transcriptWords.length >= 0.75;
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
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/^\s{0,3}#{1,6}\s*/, "")
        .replace(/^\s*(?:[-*+]|\d+[.)])\s+/, "")
        .replace(/(?:—|–|--+)/g, ", ")
        .replace(/[#*_`>|]/g, "")
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
