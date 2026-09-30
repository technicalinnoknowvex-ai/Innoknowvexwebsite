const crypto = require("crypto");

function assertFileType(file, type) {
  const valid = type === "image"
    ? file.mimetype.startsWith("image/")
    : file.mimetype === "application/pdf";

  if (!valid) {
    const error = new Error(type === "image" ? "An image file is required." : "A PDF file is required.");
    error.statusCode = 400;
    throw error;
  }
}

function safeFileName(fileName) {
  return fileName.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
}

async function uploadToStorage({ client, bucket, folder, file }) {
  const filePath = `${folder}/${Date.now()}-${crypto.randomUUID()}-${safeFileName(file.originalname)}`;
  const { error } = await client.storage.from(bucket).upload(filePath, file.buffer, {
    contentType: file.mimetype,
    cacheControl: "3600",
    upsert: false,
  });

  if (error) throw error;

  const { data } = client.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
}

module.exports = { uploadToStorage, assertFileType };