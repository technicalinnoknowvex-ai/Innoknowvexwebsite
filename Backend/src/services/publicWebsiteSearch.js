const SITE_ORIGIN = "https://www.innoknowvex.in";
const SITEMAP_URL = `${SITE_ORIGIN}/sitemap.xml`;
const CACHE_TTL_MS = 30 * 60 * 1000;
const FAILURE_RETRY_MS = 60 * 1000;
const REQUEST_TIMEOUT_MS = 5000;
const MAX_SITEMAP_URLS = 100;
const MAX_PAGE_CHARS = 40000;
const MAX_RESULTS = 4;
const MAX_EXCERPT_CHARS = 1600;
const PRIVATE_PATH = /^\/(?:api|auth|admin|dashboard|checkout|login|signup)(?:\/|$)/i;
const STOP_WORDS = new Set([
  "about", "after", "and", "are", "can", "could", "does", "for", "from",
  "have", "how", "into", "me", "more", "please", "tell", "that", "the",
  "their", "them", "there", "this", "what", "which", "with", "would", "you",
  "your",
]);

function decodeEntities(value) {
  return String(value || "")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;|&apos;|&#x27;/gi, "'");
}

function sitemapPageUrls(xml) {
  const locations = [...String(xml || "").matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)];
  const uniqueUrls = new Set();

  for (const [, location] of locations.slice(0, MAX_SITEMAP_URLS)) {
    try {
      const url = new URL(decodeEntities(location.trim()));
      if (
        url.protocol !== "https:" ||
        url.origin !== SITE_ORIGIN ||
        url.username ||
        url.password ||
        PRIVATE_PATH.test(url.pathname)
      ) continue;

      url.search = "";
      url.hash = "";
      uniqueUrls.add(url.toString());
    } catch {
      continue;
    }
  }

  return [...uniqueUrls];
}

function cleanHtml(html) {
  const body = String(html || "").match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] || html;
  return decodeEntities(
    String(body || "")
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<(script|style|noscript|svg|template)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  ).slice(0, MAX_PAGE_CHARS);
}

function pageTitle(html, url) {
  const title = String(html || "").match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]
    || String(html || "").match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1];
  const cleanTitle = decodeEntities(String(title || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim());
  return cleanTitle || (new URL(url).pathname.split("/").filter(Boolean).pop() || "Home")
    .replace(/[-_]+/g, " ");
}

function searchTerms(value) {
  return [...new Set(
    String(value || "")
      .toLowerCase()
      .match(/[a-z0-9@.+-]+/g) || [],
  )].filter((term) => term.length > 1 && !STOP_WORDS.has(term));
}

function excerptFor(text, terms) {
  if (text.length <= MAX_EXCERPT_CHARS) return text;
  const lowerText = text.toLowerCase();
  const candidatePositions = [0];

  for (const term of terms) {
    let position = lowerText.indexOf(term);
    while (position >= 0) {
      candidatePositions.push(position);
      position = lowerText.indexOf(term, position + term.length);
    }
  }

  let bestStart = 0;
  let bestScore = -1;
  for (const position of candidatePositions) {
    const start = Math.max(0, position - 250);
    const excerpt = lowerText.slice(start, start + MAX_EXCERPT_CHARS);
    const score = terms.filter((term) => excerpt.includes(term)).length;
    if (score > bestScore || (score === bestScore && start > bestStart)) {
      bestStart = start;
      bestScore = score;
    }
  }

  return text.slice(bestStart, bestStart + MAX_EXCERPT_CHARS);
}

function rankPages(pages, query, limit = MAX_RESULTS) {
  const terms = searchTerms(query);
  if (!terms.length) return [];

  return pages
    .map((page) => {
      const contentTerms = new Set(searchTerms(`${page.title} ${page.text}`));
      const titleTerms = new Set(searchTerms(page.title));
      const matches = terms.filter((term) => contentTerms.has(term));
      const score =
        matches.length * 3 +
        terms.filter((term) => titleTerms.has(term)).length * 5;
      return { page, score, matches };
    })
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit)
    .map(({ page, matches }) => ({
      title: page.title,
      content: excerptFor(page.text, matches),
    }));
}

function createPublicWebsiteSearch({
  fetchImpl = globalThis.fetch,
  now = Date.now,
  logger = console,
} = {}) {
  let cachedPages = [];
  let loadedAt = 0;
  let lastAttemptAt = null;
  let loadingPromise;

  async function fetchText(url) {
    const response = await fetchImpl(url, {
      redirect: "error",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!response.ok) throw new Error(`Public page request failed (HTTP ${response.status}).`);
    return response.text();
  }

  async function refresh() {
    const sitemap = await fetchText(SITEMAP_URL);
    const urls = sitemapPageUrls(sitemap);
    if (!urls.length) throw new Error("The public website sitemap contains no usable pages.");

    const pages = [];
    let failedPages = 0;
    const batchSize = 6;

    for (let start = 0; start < urls.length; start += batchSize) {
      const batch = await Promise.all(urls.slice(start, start + batchSize).map(async (url) => {
        try {
          const html = await fetchText(url);
          const text = cleanHtml(html);
          return text ? { title: pageTitle(html, url), text } : null;
        } catch {
          failedPages += 1;
          return null;
        }
      }));
      pages.push(...batch.filter(Boolean));
    }

    if (!pages.length) throw new Error("No public website pages could be indexed.");
    cachedPages = pages;
    loadedAt = now();

    if (failedPages) {
      logger.warn("Some ORVEXA public website pages could not be indexed.", {
        failedPages,
        indexedPages: pages.length,
      });
    }
    return cachedPages;
  }

  async function loadPages() {
    const currentTime = now();
    if (cachedPages.length && currentTime - loadedAt < CACHE_TTL_MS) return cachedPages;
    if (loadingPromise) return loadingPromise;
    if (
      !cachedPages.length &&
      lastAttemptAt !== null &&
      currentTime - lastAttemptAt < FAILURE_RETRY_MS
    ) return [];

    lastAttemptAt = currentTime;
    loadingPromise = refresh()
      .catch((error) => {
        logger.warn("Could not refresh ORVEXA's public website index.", error.message);
        return cachedPages;
      })
      .finally(() => {
        loadingPromise = null;
      });
    return loadingPromise;
  }

  async function search(query) {
    const pages = await loadPages();
    return rankPages(pages, query);
  }

  return { search };
}

const publicWebsiteSearch = createPublicWebsiteSearch();

module.exports = {
  createPublicWebsiteSearch,
  sitemapPageUrls,
  cleanHtml,
  rankPages,
  searchPublicWebsite: publicWebsiteSearch.search,
};
