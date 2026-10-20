const express = require("express");
const careerController = require("../controllers/careerController");
const { authenticate, adminOnly } = require("../middleware/authMiddleware");
const { resumeUpload } = require("../middleware/uploadMiddleware");

const router = express.Router();

router.get("/jobs", careerController.listPublicJobs);
router.post("/applications", resumeUpload.single("resume"), careerController.createApplication);

router.get("/admin", authenticate, adminOnly, careerController.listAdminJobs);
router.post("/admin", authenticate, adminOnly, careerController.createJob);
router.put("/admin/:id", authenticate, adminOnly, careerController.updateJob);
router.delete("/admin/:id", authenticate, adminOnly, careerController.deleteJob);

module.exports = router;
