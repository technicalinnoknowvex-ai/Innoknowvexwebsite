const express = require("express");
const testimonialController = require("../controllers/testimonialController");
const { authenticate, adminOnly } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.get("/testimonials", testimonialController.listTestimonials);

router.post("/admin/testimonials", authenticate, adminOnly, upload.fields([
	{ name: "profileImage", maxCount: 1 },
]), testimonialController.createTestimonial);
router.get("/admin/testimonials", authenticate, adminOnly, testimonialController.listAdminTestimonials);
router.put("/admin/testimonials/:id", authenticate, adminOnly, upload.fields([
	{ name: "profileImage", maxCount: 1 },
]), testimonialController.updateTestimonial);
router.delete("/admin/testimonials/:id", authenticate, adminOnly, testimonialController.deleteTestimonial);

module.exports = router;