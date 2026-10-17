const express = require("express");
const blogController = require("../controllers/blogController");
const { authenticate, adminOnly } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.get("/blogs", blogController.listPublicBlogs);
router.get("/blogs/:id", blogController.getPublicBlog);

router.post("/admin/blogs", authenticate, adminOnly, upload.fields([
  { name: "image", maxCount: 1 },
]), blogController.createBlog);
router.get("/admin/blogs", authenticate, adminOnly, blogController.listAdminBlogs);
router.put("/admin/blogs/:id", authenticate, adminOnly, upload.fields([
  { name: "image", maxCount: 1 },
]), blogController.updateBlog);
router.delete("/admin/blogs/:id", authenticate, adminOnly, blogController.deleteBlog);

module.exports = router;
