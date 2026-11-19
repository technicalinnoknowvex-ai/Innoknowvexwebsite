const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const { createAssistantController } = require("../controllers/assistantController");

const router = express.Router();
const assistantController = createAssistantController();

router.post("/chat", authenticate, assistantController.chat);
router.get("/conversations", authenticate, assistantController.listConversations);
router.get(
  "/conversations/:id/messages",
  authenticate,
  assistantController.getConversationMessages,
);

module.exports = router;
