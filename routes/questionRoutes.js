const { authenticateToken } = require("../middleware/authMiddleware");

const { xss } = require('express-xss-sanitizer');
const express = require("express");
const router = express.Router();
const {
    getAllQuestions,
    createQuestion,
    filterQuestions,
    getQuizQuestions,
    updateQuestion,
    deleteQuestion,
    getDistinctCourses
} = require("../controllers/questionController");



router.get("/",authenticateToken  , getAllQuestions);

router.get("/distinctCourses", authenticateToken, getDistinctCourses);


router.post("/", [authenticateToken, xss()] ,createQuestion);

router.post("/filtern",[authenticateToken, xss()] , filterQuestions);

router.post("/quiz/:anzahl",authenticateToken , getQuizQuestions); //diese Route wahrscheinlich in anderen Quiz Router und Controller verschieben

router.post('/delete', authenticateToken, deleteQuestion);


router.put("/update/:id",[authenticateToken, xss()] , updateQuestion);






module.exports = router;