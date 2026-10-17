const assert = require("node:assert/strict");
const test = require("node:test");
const { existingObjectPath, uploadToStorage } = require("./storageUpload");

const supabaseUrl = "https://example.supabase.co";

test("extracts an existing object path from the matching public bucket URL", () => {
  assert.equal(
    existingObjectPath(
      "https://example.supabase.co/storage/v1/object/public/program-images/web-development/course%20image.png",
      { supabaseUrl, bucket: "program-images" },
    ),
    "web-development/course image.png",
  );
});

test("does not reuse paths from another project or bucket", () => {
  assert.equal(
    existingObjectPath(
      "https://other.supabase.co/storage/v1/object/public/program-images/course.png",
      { supabaseUrl, bucket: "program-images" },
    ),
    null,
  );
  assert.equal(
    existingObjectPath(
      "https://example.supabase.co/storage/v1/object/public/partner-logos/course.png",
      { supabaseUrl, bucket: "program-images" },
    ),
    null,
  );
});

test("replaces an existing object in place and returns a cache-busted public URL", async () => {
  const uploads = [];
  const client = {
    storage: {
      from(bucket) {
        return {
          async upload(path, body, options) {
            uploads.push({ bucket, path, body, options });
            return { error: null };
          },
          getPublicUrl(path) {
            return { data: { publicUrl: `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}` } };
          },
        };
      },
    },
  };

  const result = await uploadToStorage({
    client,
    bucket: "program-images",
    folder: "new-folder",
    file: { originalname: "replacement.png", mimetype: "image/png", buffer: Buffer.from("image") },
    existingUrl: `${supabaseUrl}/storage/v1/object/public/program-images/old-folder/current.png`,
    supabaseUrl,
  });

  assert.equal(uploads.length, 1);
  assert.equal(uploads[0].bucket, "program-images");
  assert.equal(uploads[0].path, "old-folder/current.png");
  assert.equal(uploads[0].options.upsert, true);
  assert.equal(uploads[0].options.cacheControl, "0");
  assert.match(result, new RegExp(`${supabaseUrl}/storage/v1/object/public/program-images/old-folder/current\\.png\\?v=\\d+$`));
});

test("creates a new object when there is no existing object in the managed bucket", async () => {
  const uploads = [];
  const client = {
    storage: {
      from(bucket) {
        return {
          async upload(path, body, options) {
            uploads.push({ bucket, path, options });
            return { error: null };
          },
          getPublicUrl(path) {
            return { data: { publicUrl: `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}` } };
          },
        };
      },
    },
  };

  const result = await uploadToStorage({
    client,
    bucket: "program-images",
    folder: "web-development",
    file: { originalname: "course image.png", mimetype: "image/png", buffer: Buffer.from("image") },
    supabaseUrl,
  });

  assert.equal(uploads.length, 1);
  assert.match(uploads[0].path, /^web-development\/\d+-[0-9a-f-]+-course-image\.png$/);
  assert.equal(uploads[0].options.upsert, false);
  assert.equal(uploads[0].options.cacheControl, "3600");
  assert.equal(result, `${supabaseUrl}/storage/v1/object/public/program-images/${uploads[0].path}`);
});
