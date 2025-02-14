const { authenticateToken } = require("../middleware/authMiddleware");
const express = require("express");
const router = express.Router();
const {handleSoloResult, getQuizQuestions, handleSoloResultNew, getQuizQuestionsNew} = require("../controllers/soloGameController");

router.post("/resultNew", authenticateToken, handleSoloResultNew);

router.post("/getQuizNew/:anzahl", authenticateToken, getQuizQuestionsNew);



module.exports = router;
 


