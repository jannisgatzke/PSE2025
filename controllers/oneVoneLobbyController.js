const {pickAnswers,  pickQuizQuestions} = require("./generellQuizFunctionality");
const { OneVoneSession} = require("../models/oneVoneSession")
const _ = require("lodash");

exports.createOneVoneSession =  (socket)=> {
  socket.on("createRoom-event", async (room, userId, kurs, publicSwitchVal,  cb)=>{
    
    if( await OneVoneSession.findOne({room: room})){cb(false, "2"); return;} //suchen ob es Session mit dem Room schon gibt
        
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
   
//neue OneVoneSession in MongoDB erstellen und Daten einfügen
    let oneVoneSession = new OneVoneSession({
            room: room, 
            questions: quizQuestions,
            player1Id: userId,
            playerCount: 1,
            kurs: kurs,
            public: publicSwitchVal
        })
        
       const cS  = await oneVoneSession.save();
       if(!cS){cb(false, "3");}
        
        //um die OpenSession Liste neu zu laden
        socket.broadcast.emit("sessionChange-event");
        
        cb(true, "");
        })
       
    
}
//Überprüfen ob diese Session mit nur einem Spieler existiert und dann Sessiondaten auffüllen
exports.joinOneVoneSession = (socket)=>{
    socket.on("joinRoom-event", async (room, userId, cb)=>{
       
     

        const oneVoneSession = await OneVoneSession.findOne({room: room});
        if(!oneVoneSession){cb(false, "room existiert nicht"); return;}
        if(oneVoneSession.playerCount !== 1){cb(false, "cant join room due to PlayerCount"); return;}

        oneVoneSession.player2Id = userId;
        oneVoneSession.playerCount = 2;
        const cS  = await oneVoneSession.save();

        if(!cS){cb(false, "3");}
        
        //um die OpenSession Liste neu zu laden
        socket.broadcast.emit("sessionChange-event");
        
        cb(true, "");
    })
}


exports.getPublicOneVoneSessions = async (req, res)=>{
    publicOneVoneSessions = await OneVoneSession.find({public: true, playerCount: 1})
    res.send(publicOneVoneSessions);
}
