const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const { createAssistantController } = require("../controllers/assistantController");

const router = express.Router();
const assistantController = createAssistantController();

router.post("/chat", authenticate, assistantController.chat);

module.exports = router;
