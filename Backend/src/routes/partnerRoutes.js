const express = require("express");
const partnerController = require("../controllers/partnerController");
const { authenticate, adminOnly } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.get("/partners", partnerController.listPartners);
router.post("/admin/partners", authenticate, adminOnly, upload.fields([
	{ name: "logo", maxCount: 1 },
]), partnerController.createPartner);
router.delete("/admin/partners/:id", authenticate, adminOnly, partnerController.deletePartner);

module.exports = router;