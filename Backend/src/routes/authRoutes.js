const express = require("express");
const authController = require("../controllers/authController");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authenticate, authController.logout);
router.get("/me", authenticate, authController.currentUser);
router.put("/me", authenticate, authController.updateProfile);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authenticate, authController.resetPassword);

module.exports = router;