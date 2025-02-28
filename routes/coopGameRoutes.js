const { authenticateToken } = require("../middleware/authMiddleware");
const express = require("express");
const router = express.Router();
const { handleCoopResultNew, getQuizQuestionsNew, getCoopQuestions, getCoopPlayerIds} = require("../controllers/coopGameController");
const {getPublicCoopSessions} = require("../controllers/coopLobbyController");

router.post("/resultNew", authenticateToken, handleCoopResultNew);

router.post("/getQuizNew/:anzahl", authenticateToken, getQuizQuestionsNew);

router.post("/getCoopQuestions", authenticateToken, getCoopQuestions);

router.post("/getCoopPlayerIds", authenticateToken, getCoopPlayerIds)

router.get("/getPublicCoopSessions", authenticateToken, getPublicCoopSessions);


module.exports = router;
 