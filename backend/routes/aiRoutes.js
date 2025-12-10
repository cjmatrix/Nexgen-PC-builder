const express = require("express");

const router = express.Router();

const { aiController } = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.post("/generate-pc", aiController);

module.exports = router;
