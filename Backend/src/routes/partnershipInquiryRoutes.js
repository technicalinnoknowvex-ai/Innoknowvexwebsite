const express = require("express");
const supabase = require("../config/supabaseClient");
const {
  createPartnershipInquiryController,
} = require("../controllers/partnershipInquiryController");

const router = express.Router();
const createPartnershipInquiry = createPartnershipInquiryController({ supabase });

router.post("/", createPartnershipInquiry);

module.exports = router;
