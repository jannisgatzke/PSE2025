const { required } = require("joi");
const mongoose = require("mongoose");



const question = new mongoose.Schema({
    questionId: {type: String, required: true},
    question: {type: String, required: true},
    answers: {type: [String], required: true}
})

const coopSessionSchema = new mongoose.Schema({
    room: {type: String, required: true },
    questions: {type: [question], required: true},
    player1Id: {type: String},
    player2Id: {type: String},
    playerCount: {type: Number},
    submitEventCount: {type: Number, default: 0}
});


exports.CoopSession = mongoose.model("CoopSession", coopSessionSchema);