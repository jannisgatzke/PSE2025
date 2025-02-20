const { authenticateToken } = require("../middleware/authMiddleware");
const express = require("express");
const router = express.Router();
const { handleCoopResultNew, getQuizQuestionsNew, getCoopQuestions} = require("../controllers/coopGameController");

router.post("/resultNew", authenticateToken, handleCoopResultNew);

router.post("/getQuizNew/:anzahl", authenticateToken, getQuizQuestionsNew);

router.post("/getCoopQuestions", authenticateToken, getCoopQuestions);

module.exports = router;
 