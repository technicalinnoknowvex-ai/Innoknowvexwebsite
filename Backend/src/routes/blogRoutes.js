const express = require("express");
const blogController = require("../controllers/blogController");
const { authenticate, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/blogs", blogController.listPublicBlogs);
router.get("/blogs/:id", blogController.getPublicBlog);

router.post("/admin/blogs", authenticate, adminOnly, blogController.createBlog);
router.get("/admin/blogs", authenticate, adminOnly, blogController.listAdminBlogs);
router.put("/admin/blogs/:id", authenticate, adminOnly, blogController.updateBlog);
router.delete("/admin/blogs/:id", authenticate, adminOnly, blogController.deleteBlog);

module.exports = router;
