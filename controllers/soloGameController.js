

const {pickAnswers, judgeAnswers, pickQuizQuestions} = require("./generellQuizFunctionality");
//const {Question} = require("../models/question");




exports.handleSoloResultNew = async (req, res) => {
   //Validation notwendig

    const answers = req.body.answers;
    const judgedAnswers = await judgeAnswers(answers, res);
    res.send(judgedAnswers);
}

exports.getQuizQuestionsNew = async (req, res)=>{
   let questions = await pickQuizQuestions(Number(req.params.anzahl), req.body.kurs);

   let quizQuestions = [];
   for(let i = 0; i< questions.length; i++){
    let questionObj = {};
    questionObj._id = questions[i]._id;
    questionObj.question = questions[i].question;
    questionObj.answers = pickAnswers(questions[i]);
    quizQuestions.push(questionObj);
   }
   res.send(quizQuestions);
}
