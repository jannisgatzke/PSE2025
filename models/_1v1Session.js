const { required } = require("joi");
const mongoose = require("mongoose");



const question = new mongoose.Schema({
    questionId: {type: String, required: true},
    question: {type: String, required: true},
    answers: {type: [String], required: true}
})

const _1v1SessionSchema = new mongoose.Schema({
    room: {type: String, required: true },
    questions: {type: [question], required: true},
    player1Id: {type: String, default: null},
    player2Id: {type: String, default: null},
    playerCount: {type: Number, default: null},
    public: {type: Boolean, required: true},
    kurs: {type: String}
});


exports.CoopSession = mongoose.model("_1v1Session", _1v1SessionSchema);