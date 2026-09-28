const express = require("express");
const authController = require("../controllers/authController");
const { requireAuth } = require("../middleware/authMiddleware");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.post("/register", asyncHandler(authController.register));
router.post("/login", asyncHandler(authController.login));
router.post("/logout", requireAuth, asyncHandler(authController.logout));
router.get("/me", requireAuth, asyncHandler(authController.currentUser));
router.post("/forgot-password", asyncHandler(authController.forgotPassword));
router.post("/reset-password", requireAuth, asyncHandler(authController.resetPassword));

module.exports = router;