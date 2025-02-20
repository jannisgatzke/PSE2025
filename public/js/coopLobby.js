const socket = io();

const roomInput = document.getElementById("roomInput");
const createRoom = document.getElementById("createRoom");
const joinRoom = document.getElementById("joinRoom");


createRoom.addEventListener("click", create);
joinRoom.addEventListener("click", join);

async function  create(){
    
    const room = roomInput.value;
   
    if(room === ""){return;}
try{
    let userId = await fetch("api/users/myId");
    userId = await userId.json();

    const kurs = "DemoFragen"
    
    socket.emit("createRoom-event", room, userId, kurs, (created, message)=>{
     
         if(created){
            window.location.href=`http://localhost:3000/coopGame?room=${room}`}
        else {alert("could not create Room");
            console.log(message);
        }
    })}


    catch(error){console.log(error);}
}


async function join(){
    const room = roomInput.value;
    if(room === ""){return;}
    try{
        let userId = await fetch("api/users/myId");
        userId = await userId.json();
        
       
        
        socket.emit("joinRoom-event", room, userId, (created, message)=>{
         
             if(created){
                window.location.href=`http://localhost:3000/coopGame?room=${room}`}
            else {alert("could not join Room");
                console.log(message);
            }
        })}
    
    
        catch(error){console.log(error);}
}