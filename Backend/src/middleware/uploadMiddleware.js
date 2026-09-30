const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (request, file, callback) => {
    if (file.mimetype.startsWith("image/") || file.mimetype === "application/pdf") {
      return callback(null, true);
    }

    const error = new Error("Only image files and PDF files are allowed.");
    error.statusCode = 400;
    return callback(error);
  },
});

module.exports = upload;