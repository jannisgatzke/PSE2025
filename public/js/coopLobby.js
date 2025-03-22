
const socket = io("/coop");

const roomInput = document.getElementById("roomInput");
const createRoom = document.getElementById("createRoom");
const joinRoom = document.getElementById("joinRoom");
const kursSelect = document.getElementById("kursSelect");
const publicSwitch = document.getElementById("publicSwitch");



window.addEventListener("load", fillKursSelect);
window.addEventListener("load", buildPublicSessionList);

createRoom.addEventListener("click", create);
joinRoom.addEventListener("click", join);

async function  create(){
    
    const room = roomInput.value;
   
    if(room === ""){return;}
try{
    let userId = await fetch("api/users/myId");
    userId = await userId.json();

    let kurs = kursSelect.value;
    if(kurs === "all"){kurs = null;}
    
    socket.emit("createRoom-event", room, userId, kurs, publicSwitchVal,  (created, message)=>{
     
         if(created){
            window.location.href=`/coopGame?room=${room}`}
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
                window.location.href=`/coopGame?room=${room}`}
            else {alert("could not join Room");
                console.log(message);
            }
        })}
    
    
        catch(error){console.log(error);}
}

async function fillKursSelect(){
    let courses = await fetch("api/questions/distinctCourses");
    courses = await courses.json();
    for(let i = 0; i < courses.length; i++){
        const option = document.createElement("option");
        option.innerText = courses[i];
        option.value  = courses[i];
        kursSelect.append(option);
    }
}

let publicSwitchVal = true;

function publicSwitchToggle(){
    if(publicSwitch.innerText === "public"){
        publicSwitch.innerText = "private"
        publicSwitchVal = false;
    }
    else {
        publicSwitch.innerText = "public"
        publicSwitchVal = true;
    }

}

publicSwitch.addEventListener("click", publicSwitchToggle);


socket.on("sessionChange-event", ()=>{
    buildPublicSessionList();
})

async function  buildPublicSessionList(){
    
    try{
        let openSessions = await fetch("/api/coopGame/getPublicCoopSessions");
        openSessions= await openSessions.json();

        const list =  document.createElement("ul");
        list.id= "list";
        for(let i= 0; i < openSessions.length; i++){
          const item = document.createElement("li");

        let player = await fetch(`/api/users/${openSessions[i].player1Id}`);
        player = await player.json();

          if(openSessions[i].kurs === null){ openSessions[i].kurs = "Alle Kurse";}
          let itemString = `Raum: ${openSessions[i].room}, Kurs: ${openSessions[i].kurs}, Player: ${player.username}`
          item.innerText = itemString;
          list.append(item);

        }
        let oldList = document.getElementById("list");
        if(oldList){oldList.remove();}
        document.getElementById("div3").append(list);
    }
        catch(error){console.log(error);}

 
    
}
