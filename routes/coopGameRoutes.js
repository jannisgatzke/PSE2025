const { authenticateToken } = require("../middleware/authMiddleware");
const express = require("express");
const router = express.Router();
const { getCoopQuestions, getCoopPlayerIds} = require("../controllers/coopGameController");
const {getPublicCoopSessions} = require("../controllers/coopLobbyController");



router.post("/getCoopQuestions", authenticateToken, getCoopQuestions);

router.post("/getCoopPlayerIds", authenticateToken, getCoopPlayerIds)

router.get("/getPublicCoopSessions", authenticateToken, getPublicCoopSessions);


module.exports = router;
 