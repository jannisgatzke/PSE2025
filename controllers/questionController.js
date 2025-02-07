const {Question, validateQuestion} = require("../models/question");
const _ = require("lodash");

exports.getAllQuestions = async (req, res) => {
    try {
        const question = await Question.find();
        res.status(200).json(question);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};


exports.createQuestion = async (req, res) => {
  
    const {error} = validateQuestion(req.body);
    if(error) return res.status(400).send(error.details[0].message);
        
    let question = new Question({
        question: req.body.question,
        author : req.body.author,
        rigthAnswers: req.body.rigthAnswers,
        wrongAnswers: req.body.wrongAnswers,
        explanation: req.body.explanation,
        kurs: req.body.kurs
    });
    
 res.send(await question.save());
}


exports.filterQuestions = async (req, res) => {
    
    filterObj = {};
    if(req.body.kurs) {filterObj.kurs = req.body.kurs;}
    if(req.body.author) {filterObj.author = req.body.author;}

  try{
    res.send(await Question.find(filterObj));
  }
  catch(error){
    res.status(500).send({message: 'Server error', error

    })
  }
}

exports.getQuizQuestions = async (req, res) => {
    let anzahl = Number(req.params.anzahl);

    let kurs =   req.body.kurs
    let questionn;

    if(!kurs)  questionn = await Question.find();
    else  questionn = await Question.find({kurs: kurs});
    
    if(questionn.length <= anzahl) {res.send(_.shuffle(questionn))} //loaddasch benutzen un nich alles senden, 
    else{ 
        let result = [];
    
        for(i = 0; i < anzahl; i++){
        questionn = _.shuffle(questionn);
        result.push(questionn.shift() );  
        }
        res.send(result);}
}


exports.updateQuestion = async (req, res) => {
    try {
        const question = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!question) return res.status(404).json({ message: "Question not found" });
        res.status(200).json({ message: "Question updated successfully", question });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
}


exports.deleteQuestion = async (req, res) => {
    const { questionId } = req.body;
  
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied.' });
      }

      if (req.user.username !== req.question.author) {
        return res.status(403).json({ message: 'Du darfst nur deine eigenen Questionn löschen' });
      }
  
      const question = await Question.findByIdAndDelete(questionId);
      if (!question) {
        return res.status(404).json({ message: 'Question not found.' });
      }
  
      res.status(200).redirect('/api/questions/admin');
    } catch (error) {
      console.error('Error deleting question:', error);
      res.status(500).json({ message: 'Server error', error });
    }
  }