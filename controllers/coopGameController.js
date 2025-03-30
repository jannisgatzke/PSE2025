// Importiere die CoopSession Modellklasse
const { CoopSession} = require("../models/coopSession");
// Importiere Hilfsfunktionen für Quiz-Logik
const {pickAnswers, judgeAnswers, pickQuizQuestions} = require("./generellQuizFunctionality");

// Exportiere Hauptfunktion für das kooperative Spiel
exports.coopGame = (socket)=> {
    // Event-Listener: Spieler betritt einen Raum (Quiz wird erstellt)
    socket.on("buildQuiz-event", (room)=>{
        //noch checken, dass keiner als dritter in einen Room joinen kann über URL
        socket.join(room);
    })
    // Event-Listener: Antwortänderung eines Spielers wird an den Partner gesendet
    socket.on("changeAnswer-event", (answers, room)=>{
        socket.to(room).emit("changeAnswer-event", answers);
        })
    // Event-Listener: Antworten werden zur Bewertung eingereicht
    socket.on("coopSubmit-event", async (room, cb)=>{
        handleSubmitEvent(socket, room, cb);
    })
    // Event-Listener: Antworten sollen gemeinsam überarbeitet werden
    socket.on("reviseAnswers-event", (room)=>{
        socket.to(room).emit("reviseAnswers-event");
    })
    // Event-Listener: Antworten sollen beurteilt werden
    socket.on("judgeAnswers-event", (room)=>{
        socket.to(room).emit("judgeAnswers-event");
    })
    // Event-Listener: Ein Spieler verlässt den Raum
    socket.on("leaveRoom-event", (room)=>{
        socket.to(room).emit("leaveRoom-event");
    })
    // Event-Listener: Chatnachrichten werden im Raum weitergeleitet
    socket.on('chat message', (msg, room) => {
        socket.to(room).emit('chat message', msg);
      });
}

// Interne Funktion zur Verarbeitung der Antwort-Einreichung
async function handleSubmitEvent(socket, room, cb){
    const coopSession = await CoopSession.findOne({room: room});
    if(!coopSession){cb(false, "room existiert nicht"); return;}

    socket.to(room).emit("coopSubmit-event");
    cb(true, "biite Warten");
}

// Exportierte Funktion: Gibt die Fragen der kooperativen Session zurück
exports.getCoopQuestions = async (req, res)=>{
    const coopSession = await CoopSession.findOne({room: req.body.room});
    if(!coopSession){return res.status(404).json({ message: 'Session not found.' })}
    
    res.send(coopSession.questions);
    
    }

// Exportierte Funktion: Gibt die Spieler-IDs der Session zurück
 exports.getCoopPlayerIds = async (req, res)=>{
        const coopSession = await CoopSession.findOne({room: req.body.room});
        if(!coopSession){return res.status(404).json({ message: 'Session not found.' })}
      
        res.send(
            {player1Id: coopSession.player1Id,
             player2Id: coopSession.player2Id  
         });
        }
    
// Exportierte Funktion: Löscht eine kooperative Session anhand des Raumnamens
exports.deleteCoopSession = async (room)=> {
    const cS = !await CoopSession.deleteOne({room: room});
   if( !cS){ console.log(`Session with room name ${room} was not able to be deleted`);}

}