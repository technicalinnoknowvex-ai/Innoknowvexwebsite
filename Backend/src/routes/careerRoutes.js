const express = require("express");
const careerController = require("../controllers/careerController");
const { authenticate, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/jobs", careerController.listPublicJobs);
router.post("/applications", careerController.createApplication);

router.get("/admin", authenticate, adminOnly, careerController.listAdminJobs);
router.post("/admin", authenticate, adminOnly, careerController.createJob);
router.put("/admin/:id", authenticate, adminOnly, careerController.updateJob);
router.delete("/admin/:id", authenticate, adminOnly, careerController.deleteJob);

module.exports = router;
