const assert = require("node:assert/strict");
const test = require("node:test");
const {
  createPublicWebsiteSearch,
  sitemapPageUrls,
} = require("../../src/ai/publicWebsiteSearch");

function response(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => body,
  };
}

test("accepts only HTTPS pages on the public company origin", () => {
  const urls = sitemapPageUrls(`
    <urlset>
      <url><loc>https://www.innoknowvex.in/about</loc></url>
      <url><loc>https://www.innoknowvex.in/programs/ai</loc></url>
      <url><loc>https://www.innoknowvex.in/auth/student/login</loc></url>
      <url><loc>https://www.innoknowvex.in/admin</loc></url>
      <url><loc>https://other.example/about</loc></url>
      <url><loc>http://www.innoknowvex.in/careers</loc></url>
    </urlset>
  `);

  assert.deepEqual(urls, [
    "https://www.innoknowvex.in/about",
    "https://www.innoknowvex.in/programs/ai",
  ]);
});

test("searches and caches public page text while excluding scripts", async () => {
  const requestedUrls = [];
  const logger = { warn() { assert.fail("Indexing the test website should succeed."); } };
  const { search } = createPublicWebsiteSearch({
    now: () => 100000,
    logger,
    fetchImpl: async (url, options) => {
      requestedUrls.push(url);
      assert.equal(options.redirect, "error");
      if (url.endsWith("/sitemap.xml")) {
        return response(`
          <urlset>
            <url><loc>https://www.innoknowvex.in/</loc></url>
            <url><loc>https://www.innoknowvex.in/about</loc></url>
            <url><loc>https://www.innoknowvex.in/auth/student/login</loc></url>
          </urlset>
        `);
      }

      const body = url.endsWith("/about")
        ? `<html><head><title>About Innoknowvex</title></head><body><main>Our company story. ${"General company information. ".repeat(100)}</main><footer>Contact support@innoknowvex.in at +91 9535788085. Office: Singasandra, Bengaluru.</footer><script>private prompt text</script></body></html>`
        : "<html><head><title>Home</title></head><body><main>Learn and grow.</main></body></html>";
      return response(body);
    },
  });

  const firstResults = await search("company contact phone");
  const secondResults = await search("company contact phone");

  assert.equal(firstResults[0].title, "About Innoknowvex");
  assert.match(firstResults[0].content, /support@innoknowvex\.in/);
  assert.match(firstResults[0].content, /\+91 9535788085/);
  assert.doesNotMatch(firstResults[0].content, /private prompt text/);
  assert.match(secondResults[0].content, /support@innoknowvex\.in/);
  assert.equal(requestedUrls.length, 3);
  assert.equal(requestedUrls.some((url) => url.includes("/auth/")), false);
});

test("continues without website facts when the public site is unavailable", async () => {
  let warnings = 0;
  const { search } = createPublicWebsiteSearch({
    now: () => 100000,
    logger: { warn() { warnings += 1; } },
    fetchImpl: async () => {
      throw new Error("Network unavailable.");
    },
  });

  assert.deepEqual(await search("company contact"), []);
  assert.deepEqual(await search("company contact"), []);
  assert.equal(warnings, 1);
});
