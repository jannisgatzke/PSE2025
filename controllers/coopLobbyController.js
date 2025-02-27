const {pickAnswers, judgeAnswers, pickQuizQuestions} = require("./generellQuizFunctionality");
const { CoopSession} = require("../models/coopSession")
const _ = require("lodash");

exports.createCoopSession =  (socket)=> {
  socket.on("createRoom-event", async (room, userId, kurs,  cb)=>{
    
    if( await CoopSession.findOne({room: room})){cb(false, "2"); return;} //suchen ob es Session mit dem Room schon gibt
        
    //Fragen und Antworten auswählen  
    let questions = await pickQuizQuestions(10, kurs);

    let quizQuestions = [];
    for(let i = 0; i< questions.length; i++){
        let questionObj = {};
        questionObj.questionId = questions[i]._id;
        questionObj.question = questions[i].question;
        questionObj.answers = pickAnswers(questions[i]);
        quizQuestions.push(questionObj);
   }
   
//neue CoopSession in MongoDB erstellen und Daten einfügen
    let coopSession = new CoopSession({
            room: room, 
            questions: quizQuestions,
            player1Id: userId,
            playerCount: 1
        })
        
       const cS  = await coopSession.save();
       if(!cS){cb(false, "3");}
        
        
        cb(true, "");
        })
       
    
}
//Überprüfen ob diese Session mit nur einem Spieler existiert und dann Sessiondaten auffüllen
exports.joinCoopSession = (socket)=>{
    socket.on("joinRoom-event", async (room, userId, cb)=>{
        const coopSession = await CoopSession.findOne({room: room});
        if(!coopSession){cb(false, "room existiert nicht"); return;}
        if(coopSession.playerCount !== 1){cb(false, "cant join room due to PlayerCount"); return;}

        coopSession.player2Id = userId;
        coopSession.playerCount = 2;
        const cS  = await coopSession.save();
       if(!cS){cb(false, "3");}
        
        
        cb(true, "");
    })
}

