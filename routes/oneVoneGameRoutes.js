const { authenticateToken } = require("../middleware/authMiddleware");
const express = require("express");
const router = express.Router();
const { getOneVoneQuestions, getOneVonePlayerIds} = require("../controllers/oneVoneGameController");
const {getPublicOneVoneSessions} = require("../controllers/oneVoneLobbyController");



router.post("/getOneVoneQuestions", authenticateToken, getOneVoneQuestions);


router.post("/getOneVonePlayerIds", authenticateToken, getOneVonePlayerIds);

router.get("/getPublicOneVoneSessions", authenticateToken, getPublicOneVoneSessions);


module.exports = router;
 