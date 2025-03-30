// Importiere Mongoose für MongoDB-Datenmodellierung
const mongoose = require("mongoose");
// Importiere Joi zur Validierung von Objekten (z. B. beim Erstellen/Bearbeiten von Fragen)
const Joi = require("joi");

// Definiere das Mongoose-Schema für eine Frage
const questionnSchema = new mongoose.Schema({
    question: { type: String, required: true },
    author : { type: String, required: true },
    rigthAnswers:{type: [String]},
    wrongAnswers: {type: [String] },
    explanation: { type: String },
    kurs: { type: String }
})

// Joi-Validierung beim Erstellen einer neuen Frage
function validateQuestion(question){
    const schema= Joi.object({
        question: Joi.string().min(1).max(255).required(),
        rigthAnswers: Joi.array().min(1).max(1).items(Joi.string().min(1).max(255).required()),
        wrongAnswers: Joi.array().min(3).max(3).items(Joi.string().min(1).max(255).required()),
        explanation: Joi.string().min(1).max(255),
        kurs: Joi.string().min(1).max(255)
    })
    return schema.validate(question);
}

// Joi-Validierung beim Aktualisieren (Update) einer Frage
function validateUpdateQuestion(question){
    const schema= Joi.object({
        question: Joi.string().min(1).max(255),
        rigthAnswers: Joi.array().min(1).items(Joi.string().min(1).max(255)),
        wrongAnswers: Joi.array().min(1).items(Joi.string().min(1).max(255)),
        explanation: Joi.string().min(5).max(255),
        kurs: Joi.string().min(5).max(255)
    })
    return schema.validate(question);
}

// Erstelle das Mongoose-Modell basierend auf dem Schema
const Question = mongoose.model("Question", questionnSchema);

// Exportiere das Modell und die Validierungsfunktionen
exports.Question = Question;
exports.validateQuestion = validateQuestion;
exports.validateUpdateQuestion = validateUpdateQuestion;
