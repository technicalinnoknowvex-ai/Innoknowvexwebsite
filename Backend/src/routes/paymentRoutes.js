const express = require("express");
const paymentController = require("../controllers/paymentController");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/orders", authenticate, paymentController.createPaymentOrder);
router.post("/verify", authenticate, paymentController.verifyPayment);

module.exports = router;
