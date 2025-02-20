const { CoopSession} = require("../models/coopSession")
const _ = require("lodash");

exports.createCoopSession =  (socket)=> {
  
    socket.on("createRoom-event", async (room, userId, kurs,  cb)=>{
        
       
       
        if( await CoopSession.findOne({room: room})){cb(false, "2"); return;} //suchen ob es Session mit dem Room schon gibt
        
        //Fragen und Antworten auswähelen
    let questions = await pickQuizQuestions(10, kurs);

    console.log("1", questions);
   let quizQuestions = [];
   for(let i = 0; i< questions.length; i++){
    let questionObj = {};
    questionObj.questionId = questions[i]._id;
    questionObj.question = questions[i].question;
    questionObj.answers = pickAnswers(questions[i]);
    quizQuestions.push(questionObj);
   }
   
//JOI Validation
        let coopSession = new CoopSession({
                room: room, 
                questions: quizQuestions,
                player1Id: userId,
                playerCount: 1
        })
        
       const cS  = await coopSession.save();
        console.log("after Save",cS.questions)
       if(!cS){cb(false, "3");}
        
        
        cb(true, "");
        })
       
    
}

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
