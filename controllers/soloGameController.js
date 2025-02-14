const {validateSoloResult, SoloResult} = require("../models/soloGameResult.js");
const _ = require("lodash");
const { getQuizQuestions } = require("./questionController");
const {Question} = require("../models/question");




exports.handleSoloResultNew = async (req, res) => {
   //Validation notwendig

    const answers = req.body.answers;
    const judgedAnswers = await judgeAnswers(answers);
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

async function judgeAnswers(answers){
    let judgedAnswers = [];
    
    for(let i = 0; i< answers.length; i++ ) {
    
      let question = await Question.findById(answers[i].questionID);
    if(!question) {res.status(404).json({ message: "Question not found" });}
    
            let judgedAnswer = {};
            judgedAnswer.frage = answers[i].questionID;
            judgedAnswer.explanation = question.explanation;
            if(answers[i].answers.sort().toString() === question.rigthAnswers.sort().toString()){
                judgedAnswer.isTrue = true;
            }
            else {judgedAnswer.isTrue = false;}
            judgedAnswers.push(judgedAnswer);
        
       
    }
    return judgedAnswers;
}

pickQuizQuestions = async (anzahl, kurs) => {
    
    let questions;

    if(!kurs)  questions = await Question.find();
    else  questions = await Question.find({kurs: kurs});
    
    if(questions.length <= anzahl) { return _.shuffle(questions);} //loddasch benutzen un nich alles senden, 
    else{ 
        let result = [];
    
        for(i = 0; i < anzahl; i++){
        questions = _.shuffle(questions);
        result.push(questions.shift() );  
        }
        return result;}
}

function pickAnswers(question){
     let rigthAnswers = question.rigthAnswers;
     let wrongAnswers = question.wrongAnswers;

    let wACopy = [];
    let result = [];
    
    //wenn vier oder mehr richtige Antworten übergeben werden
    if(rigthAnswers.length >= 4){
        rigthAnswers = _.shuffle(rigthAnswers);
        for(let i =0; i < 4; i++){
            result.push(rigthAnswers[i]);
        }
        return result;
    }
    
    wrongAnswers.forEach(element => {
        wACopy.push(element);
    });
    wACopy = _.shuffle(wACopy);

    rigthAnswers.forEach(element => {
        result.push(element);
    });

    for(let i = 0; i < 4-rigthAnswers.length; i++){
        result.push(wACopy[i]);
    }
    result = _.shuffle(result);
    return result;
}


