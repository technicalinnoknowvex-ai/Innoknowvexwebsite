const express = require("express");
const supabase = require("../config/supabaseClient");
const { createStudentLeadController } = require("../controllers/studentLeadController");

const router = express.Router();
const createStudentLead = createStudentLeadController({ supabase });

router.post("/", createStudentLead);

module.exports = router;
