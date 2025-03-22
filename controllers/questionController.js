const {Question, validateQuestion, validateUpdateQuestion} = require("../models/question");
const _ = require("lodash");
const mongoose = require("mongoose");

//Alle fragen abrufen
exports.getAllQuestions = async (req, res) => {
    try {
        const question = await Question.find();
        res.status(200).json(question);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// eine neue Frage erstellen
exports.createQuestion = async (req, res) => {
  if(req.user.role === "guest"){ res.status(403).send({"message" : "nicht autorisiert"});}
  else{
    const {error} = validateQuestion(req.body);
    if(error) return res.status(400).send(error.details[0].message);
        
    let question = new Question({
        question: req.body.question,
        author : req.user.username,
        rigthAnswers: req.body.rigthAnswers,
        wrongAnswers: req.body.wrongAnswers,
        explanation: req.body.explanation,
        kurs: req.body.kurs
    });
    
 res.send(await question.save());
  }
}

//gefilterte Liste aller Fragen nach kurs und author abrufen
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



//Eine Frage nach ID updaten, nur Admins oder dem Autor der Frage erlaubt
exports.updateQuestion = async (req, res) => {
  const {error} = validateUpdateQuestion(req.body);
  if(req.user.role = "guest"){ res.send({"message" : "nicht autorisiert"});}
  if(error) return res.status(400).send(error.details[0].message);
  
    try {
      const {author} = await Question.findById(req.params.id);
      if(!author) {return res.status(404).json({ message: 'Question not found.' });}
      if (req.user.role !== 'admin' && req.user.username !== author) {
        return res.status(403).json({ message: 'Access denied.' });
      }
      
        const question = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
        
        if (!question) return res.status(404).json({ message: "Question not found" });
        res.status(200).json({ message: "Question updated successfully", question });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
}

//Eine Frage nach ID löschen, nur Admins oder dem Autor der Frage erlaubt
exports.deleteQuestion = async (req, res) => {
  try {
    const {author} = await Question.findById(req.body.id);
    if(!author) {return res.status(404).json({ message: 'Question not found.' });}
    if (req.user.role !== 'admin' && req.user.username !== author) {
      return res.status(403).json({ message: 'Access denied.' });
    }
      console.log("Lösch-Request erhalten für ID:", req.body.id);

      if (!req.body.id) {
          return res.status(400).json({ message: "Fehlende ID für das Löschen!" });
      }

      // Falls die ID als String übergeben wird, in ObjectId umwandeln
      const questionId = mongoose.Types.ObjectId.isValid(req.body.id)
          ? new mongoose.Types.ObjectId(req.body.id)
          : req.body.id;

      

      const deletedQuestion = await Question.findByIdAndDelete(questionId);

      if (!deletedQuestion) {
          console.log("Frage nicht gefunden in der DB!");
          return res.status(404).json({ message: "Frage nicht gefunden oder bereits gelöscht." });
      }

  
      res.status(200).json({ message: "Frage erfolgreich gelöscht!" });
  } catch (error) {
      
      res.status(500).json({ message: "Fehler beim Löschen der Frage", error });
  }
};

exports.getDistinctCourses = async (req, res)=> {
  const distinctCourses = await Question.distinct("kurs");
  if(!distinctCourses){res.status(404).send("no Courses found")}
  res.send(distinctCourses);
}