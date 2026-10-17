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

function existingObjectPath(publicUrl, { supabaseUrl, bucket }) {
  if (typeof publicUrl !== "string" || !publicUrl) return null;

  let fileUrl;
  let projectUrl;
  try {
    fileUrl = new URL(publicUrl);
    projectUrl = new URL(supabaseUrl);
  } catch {
    return null;
  }

  if (fileUrl.origin !== projectUrl.origin) return null;

  const bucketPrefix = `/storage/v1/object/public/${bucket}/`;
  if (!fileUrl.pathname.startsWith(bucketPrefix)) return null;

  let filePath;
  try {
    filePath = decodeURIComponent(fileUrl.pathname.slice(bucketPrefix.length));
  } catch {
    return null;
  }

  const pathSegments = filePath.split("/");
  if (!filePath || pathSegments.some((segment) => !segment || segment === "." || segment === "..")) {
    return null;
  }

  return filePath;
}

async function uploadToStorage({ client, bucket, folder, file, existingUrl, supabaseUrl }) {
  const previousPath = existingObjectPath(existingUrl, { supabaseUrl, bucket });
  const filePath = previousPath ||
    `${folder}/${Date.now()}-${crypto.randomUUID()}-${safeFileName(file.originalname)}`;
  const { error } = await client.storage.from(bucket).upload(filePath, file.buffer, {
    contentType: file.mimetype,
    cacheControl: previousPath ? "0" : "3600",
    upsert: Boolean(previousPath),
  });

  if (error) throw error;

  const { data } = client.storage.from(bucket).getPublicUrl(filePath);
  return previousPath
    ? `${data.publicUrl}${data.publicUrl.includes("?") ? "&" : "?"}v=${Date.now()}`
    : data.publicUrl;
}

module.exports = { uploadToStorage, assertFileType, existingObjectPath };