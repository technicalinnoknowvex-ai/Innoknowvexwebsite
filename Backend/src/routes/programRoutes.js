const express = require("express");
const programController = require("../controllers/programController");
const categoryController = require("../controllers/categoryController");
const { authenticate, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/categories", categoryController.listCategories);
router.get("/programs", programController.listPublicPrograms);
router.get("/programs/:slug", programController.getPublicProgram);

router.post("/admin/programs", authenticate, adminOnly, programController.createProgram);
router.get("/admin/programs", authenticate, adminOnly, programController.listAdminPrograms);
router.get("/admin/programs/:id", authenticate, adminOnly, programController.getAdminProgram);
router.put("/admin/programs/:id", authenticate, adminOnly, programController.updateProgram);
router.delete("/admin/programs/:id", authenticate, adminOnly, programController.deleteProgram);

router.get("/admin/categories", authenticate, adminOnly, categoryController.listCategories);
router.post("/admin/categories", authenticate, adminOnly, categoryController.createCategory);
router.put("/admin/categories/:id", authenticate, adminOnly, categoryController.updateCategory);
router.delete("/admin/categories/:id", authenticate, adminOnly, categoryController.deleteCategory);

module.exports = router;