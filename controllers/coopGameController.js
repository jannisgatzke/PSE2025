
const { CoopSession} = require("../models/coopSession");
const {pickAnswers, judgeAnswers, pickQuizQuestions} = require("./generellQuizFunctionality");



exports.coopGame = (socket)=> {
    socket.on("buildQuiz-event", (room)=>{
        //noch checken, dass keiner als dritter in einen Room joinen kann über URL
        socket.join(room);
    })
    
    socket.on("changeAnswer-event", (answers, room)=>{
        socket.to(room).emit("changeAnswer-event", answers);
        
        })
    
    socket.on("coopSubmit-event", async (room, cb)=>{
        handleSubmitEvent(socket, room, cb);
    })

    socket.on("reviseAnswers-event", (room)=>{
        socket.to(room).emit("reviseAnswers-event");
    })

    socket.on("judgeAnswers-event", (room)=>{
        socket.to(room).emit("judgeAnswers-event");
    })

    socket.on("leaveRoom-event", (room)=>{
        socket.to(room).emit("leaveRoom-event");
    })

    socket.on('chat message', (msg, room) => {
        socket.to(room).emit('chat message', msg);
      });
}


async function handleSubmitEvent(socket, room, cb){
    const coopSession = await CoopSession.findOne({room: room});
    if(!coopSession){cb(false, "room existiert nicht"); return;}

    socket.to(room).emit("coopSubmit-event");
    cb(true, "biite Warten");
}





exports.getCoopQuestions = async (req, res)=>{
    const coopSession = await CoopSession.findOne({room: req.body.room});
    if(!coopSession){return res.status(404).json({ message: 'Session not found.' })}
    
    res.send(coopSession.questions);
    
    }
 exports.getCoopPlayerIds = async (req, res)=>{
        const coopSession = await CoopSession.findOne({room: req.body.room});
        if(!coopSession){return res.status(404).json({ message: 'Session not found.' })}
      
        res.send(
            {player1Id: coopSession.player1Id,
             player2Id: coopSession.player2Id  
         });
        }
    

exports.deleteCoopSession = async (room)=> {
    const cS = !await CoopSession.deleteOne({room: room});
   if( !cS){ console.log(`Session with room name ${room} was not able to be deleted`);}

}