const _ = require("lodash");

const { OneVoneSession} = require("../models/oneVoneSession");
const { judgeAnswers} = require("./generellQuizFunctionality");


exports.oneVoneGame = (socket)=> {
    
    
    socket.on("load-event",async  (room, cb)=>{
        //noch checken, dass keiner als dritter in einen Room joinen kann über URL
        socket.join(room);
        cb(await isTwoPlayers(room));
    })
    
    socket.on("twoPlayers-event", (room)=>{
        socket.to(room).emit("twoPlayers-event");
    })
    
    socket.on("1v1Submit-event", async (room, cb)=>{
        socket.to(room).emit("1v1Submit-event")
    })

 
    socket.on("judgeAnswers-event", (room, judgedAnswers, answers)=>{
        
        socket.to(room).emit("judgeAnswers-event", judgedAnswers, answers);
    })

    
    
}


async function isTwoPlayers(room){
    const oneVoneSession = await OneVoneSession.findOne({room: room});
    if(!oneVoneSession){return false; }
    if(oneVoneSession.playerCount === 2){return true;}
    else{return false;}
}



exports.handleOneVoneResultNew = async (req, res) => {
    const answers = req.body.answers;
    const judgedAnswers = await judgeAnswers(answers, res);
    res.send(judgedAnswers);
}


exports.getOneVoneQuestions = async (req, res)=>{
    const oneVoneSession = await OneVoneSession.findOne({room: req.body.room});
    if(!oneVoneSession){return res.status(404).json({ message: 'Session not found.' })}
    
    res.send(oneVoneSession.questions);
    
    }
 exports.getOneVonePlayerIds = async (req, res)=>{
        const oneVoneSession = await OneVoneSession.findOne({room: req.body.room});
        if(!oneVoneSession){return res.status(404).json({ message: 'Session not found.' })}
      
        res.send(
            {player1Id: oneVoneSession.player1Id,
             player2Id: oneVoneSession.player2Id  
         });
        }
    

exports.deleteOneVoneSession = async (room)=> {
    const cS = !await OneVoneSession.deleteOne({room: room});
   if( !cS){ console.log(`Session with room name ${room} was not able to be deleted`);}

}

 exports.getOneVonePlayerIds = async (req, res)=>{
        const oneVoneSession = await OneVoneSession.findOne({room: req.body.room});
        if(!oneVoneSession){return res.status(404).json({ message: 'Session not found.' })}
      
        res.send(
            {player1Id: oneVoneSession.player1Id,
             player2Id: oneVoneSession.player2Id  
         });
        }