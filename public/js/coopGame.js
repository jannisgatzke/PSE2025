window.addEventListener("load", buildQuiz); //Aufbau des Quizes auf html-Seite

let submitButton = document.getElementById("submit"); //Button für Submit des Quizes
submitButton.addEventListener("click", submitCoop);



const searchParams = new URLSearchParams(window.location.search);
const room = searchParams.get('room'); 
let currentPartnerAnswers = []; 
let partnerSubmitted = false; // geiiler Name
let questions; //enthält Fragen, alle Antworten (richtig und falsch unmarkiert) und ID

const socket = io("/coop");

async function buildQuiz() {
  
questions= await getCoopQuestions(); // Fragen werden vom Server geladen
 
let coopPlayerIds = await getCoopPlayerIds();

let myId = await getMyID();

 if(coopPlayerIds.message === "Session not found."){  window.location.href=`https://tranquil-peak-16169-0d0a26922e8b.herokuapp.com/coopLobby`} //Redirect zur Lobby für den Fall das die in der Url angebenen Session nicht existiert
if(myId !== coopPlayerIds.player1Id && myId !== coopPlayerIds.player2Id) {window.location.href=`https://tranquil-peak-16169-0d0a26922e8b.herokuapp.com/coopLobby`}


const quizDiv = document.getElementById("quiz"); //Element in dem alle Quizfragen und Antworten sind


for (let i = 0; i< questions.length; i++ ) { //Erstellt html für alle Fragen(10) die un questions sind
    
    let answers = questions[i].answers;
    
    currentPartnerAnswers.push({
        question: questions[i].questionId,
        answers: []
    })
    
    const questionParent = document.createElement("div"); //Div in dem eine Quizfrage mit ihren Antworten sein wird
    questionParent.id = `question${i}`;
    
    const questionParagraph = document.createElement("p"); //Paragraph mit Quizfrage
    questionParagraph.innerText= questions[i].question;

    questionParent.appendChild(questionParagraph); //Paragraph mit Frage wird an Div in dem eine Quizfrage mit ihren Antworten sein wird angehangen 

    const answersParent = document.createElement("div"); //Div in die, die vier Checkboxen mit Labels sein werden
    answersParent.classList = "answersParent";
    answersParent.id = `answerParent${i}`;

    
    const answer1 = document.createElement("input"); //Checkbox 0 für Antwort 0
    answer1.setAttribute("type", "checkbox");
    answer1.name = "answer1";
    answer1.value = answers[0];
    answer1.classList.add(`checkbox${i}`);
    answer1.classList.add(`checkbox`);
    answer1.setAttribute("onclick",`selectOnlyOne("checkbox${i}", this); changeAnswer();`); //Logik damit nur eine Antwort pro Frage ausgewählt werden kann wird hinzugefügt

  

    const answer1Label = document.createElement("label"); // Label 0 für Checkbox 0
    answer1Label.setAttribute("for", "answer1");
    answer1Label.innerText = answers[0];

    answersParent.appendChild(answer1);             // Checkbox 0 wird an Div die Checkboxen und Label enthält angehangen
    answersParent.appendChild(answer1Label);        // Label 0 wird an Div die Checkboxen und Label enthält angehangen

                                                    //Nun selbiges für Antworten 1 bis 3 
    const answer2 = document.createElement("input");
    answer2.setAttribute("type", "checkbox");
    answer2.name = "answer2";
    answer2.value = answers[1];
    answer2.classList.add(`checkbox${i}`);
    answer2.classList.add(`checkbox`);
    answer2.setAttribute("onclick",`selectOnlyOne("checkbox${i}", this); changeAnswer();`);

    const answer2Label = document.createElement("label");
    answer2Label.setAttribute("for", "answer2");
    answer2Label.innerText = answers[1];

    answersParent.appendChild(answer2);
    answersParent.appendChild(answer2Label);


    const answer3 = document.createElement("input");
    answer3.setAttribute("type", "checkbox");
    answer3.name = "answer3";
    answer3.value = answers[2];
    answer3.classList.add(`checkbox${i}`);
    answer3.classList.add(`checkbox`);
    answer3.setAttribute("onclick",`selectOnlyOne("checkbox${i}", this); changeAnswer();`);

    const answer3Label = document.createElement("label");
    answer3Label.setAttribute("for", "answer3");
    answer3Label.innerText = answers[2];

    answersParent.appendChild(answer3);
    answersParent.appendChild(answer3Label);


    const answer4 = document.createElement("input");
    answer4.setAttribute("type", "checkbox");
    answer4.name = "answer4";
    answer4.value = answers[3];
    answer4.classList.add(`checkbox${i}`);
    answer4.classList.add(`checkbox`);
    answer4.setAttribute("onclick",`selectOnlyOne("checkbox${i}", this); changeAnswer();`);

    const answer4Label = document.createElement("label");
    answer4Label.setAttribute("for", "answer4");
    answer4Label.innerText = answers[3];

    answersParent.appendChild(answer4);
    answersParent.appendChild(answer4Label);

    const wholeQuestion = document.createElement("div"); //Div in der eine ganze Frage aus Quizfrage, Antworten und später auch Erklärung hinzugefügt wird
    wholeQuestion.classList.add("wholeQuestion");
    
    wholeQuestion.appendChild(questionParent); //div mit Frage hinzufügen
    wholeQuestion.appendChild(answersParent); //div mit Antworten hinzufügen

    quizDiv.appendChild(wholeQuestion); //ein ganze Frage an die Div anhängen die alle ganzen Fragen enthält
    
    
};

socket.emit("buildQuiz-event", room);

}


//lädt Fragen der CoopSession (gespeichert in MongoDB)
async function  getCoopQuestions(){
    try {
        const response = await fetch("api/coopGame/getCoopQuestions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ room })
        });
       
        return await response.json();
    }
    catch(error){console.log(error);}
}

async function  getCoopPlayerIds(){
    try {
        const response = await fetch("api/coopGame/getCoopPlayerIds", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ room })
        });
       
        return await response.json();
    }
    catch(error){console.log(error);}
}

async function  getMyID(){
try{
    let userId = await fetch("api/users/myId");
    userId = await userId.json();
    return userId;
    }

    catch(error){console.log(error);}
}


//zum Abgeben und bewerten der Antworten
async function submitCoop(){
//auslesen der eigenen Antworten
const answers = readAnswers();

//überprüfen ob der Partner bereits Antworten eingereicht hat
if(partnerSubmitted === false){
 //Partner hat Antworten noch nicht eingericht:
    //Überprüfen ob Antworten des Partners und eigene Antworten überinstimmen
    for(let i = 0; i < answers.length; i++ ){
        if(answers[i].answers.sort().toString() !== currentPartnerAnswers[i].answers.sort().toString()) { return;}
    }
//falls nein ohne Aktion returnen, falls ja coopSubmit-event auslösen
    socket.emit("coopSubmit-event", room, (succes, message)=>{
   //Callback: nach bearbeitung des coopSubmit-event vom Server aufgerufen
        if(!succes){console.log(message); return;}
   //falls baerbeitung erfolgreich: Checkboxen disablen 
        let answersParents = document.getElementsByClassName("answersParent");
        for(let i = 0; i< answersParents.length; i++){
            let checkboxes = document.getElementsByClassName(`checkbox${i}`);
            for(let j = 0; j < checkboxes.length; j++){
                checkboxes[j].disabled = true;
            }  
        }
    })
}  
//falls Partner schon Antworten eingericht hat
else{
//judgeAnswer-event senden  
    socket.emit("judgeAnswers-event", room);
    //Antworten bewerten
    judgeAnswers(answers);
}
}

//kann nur Empfangen werden, wenn Partner submitted und man selber noch nicht submitted hat 
socket.on("coopSubmit-event", ()=>{
    if(partnerSubmitted === false){ //deshalb unnötig
        partnerSubmitted = true;
    //Checkboxen disablen 
        let answersParents = document.getElementsByClassName("answersParent");
        for(let i = 0; i< answersParents.length; i++){
             let checkboxes = document.getElementsByClassName(`checkbox${i}`);
             for(let j = 0; j < checkboxes.length; j++){
                  checkboxes[j].disabled = true;}  
          }
    //reviseAnswer Button einfügen 
       const reviseAnswersButton = document.createElement("button");
       reviseAnswersButton.innerText = "Antworten nochmal überdenken";
       reviseAnswersButton.id = "reviseAnswersButton";
       const quizButtonsDiv = document.getElementById("quizButtons");
       quizButtonsDiv.append(reviseAnswersButton);
       reviseAnswersButton.addEventListener("click", reviseAnswers);
    }
})


//kann nur empfnagen werden, wenn man dchon selber Antworen eingereicht hat
socket.on("judgeAnswers-event", ()=>{
    //Antworten auslesen und bewerten 
    const answers = readAnswers();
    judgeAnswers(answers);
    //Button zum Verlassen in die Lobby einfügen
    const leaveButton = document.createElement("button");
    leaveButton.id = "leaveButton";
    leaveButton.innerText = "Raum verlassen";
     document.getElementById("quizButtons").append(leaveButton);
     leaveButton.addEventListener("click", leaveRoom);

     submitButton.remove();
})
 




 


//Auslesen der Antworten aus den Checkboxen
//funktioniert für beleibige Anzahl von falschen Antworten und richtigen Antworten
 function readAnswers(){
    let answers =[];
//für jede einzelne Frage AnswerObjekt erstellen
    let answersParents = document.getElementsByClassName("answersParent");
     for(let i = 0; i< answersParents.length; i++){
         let answerObj = {};
         answerObj.questionID = questions[i].questionId;
         answerObj.answers = [];
         //Antworten aus den Checkboxen auslesen
         let checkboxes = document.getElementsByClassName(`checkbox${i}`);
         for(let j = 0; j < checkboxes.length; j++){
             if( checkboxes[j].checked === true){
                 answerObj.answers.push(checkboxes[j].value);
             }
         }
         answers.push(answerObj);
     }
    return answers; 
}

//Fragen bewerten und Bewerteung anzeigen
async function judgeAnswers(answers){
    //Objekt mit allen Antworten vom Server bewerten lassen
    let judgedAnswers = await fetch("/api/soloGame/resultNew", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers })
        });
    //enthält Objekt mit FragenIds und booleans
       judgedAnswers=  await judgedAnswers.json();
    //Style verändern, Eklärungen einfügen und Buttons verändern
       const wholeQuestions = document.getElementsByClassName("wholeQuestion");
       for (let i = 0; i < judgedAnswers.length; i++) {
           if(judgedAnswers[i].isTrue){ wholeQuestions[i].classList.add("rigth");}
           else{wholeQuestions[i].classList.add("wrong");}
  
          const explanationDiv = document.createElement("div");
          const explanationParagraph = document.createElement("p");
          explanationParagraph.innerText = judgedAnswers[i].explanation;
  
          explanationDiv.append(explanationParagraph);
          wholeQuestions[i].append(explanationDiv);
       }
       document.getElementById("reviseAnswersButton").remove();
       submitButton.remove();

       const leaveButton = document.createElement("button");
       leaveButton.id = "leaveButton";
       leaveButton.innerText = "Raum verlassen";

       document.getElementById("quizButtons").append(leaveButton);
        leaveButton.addEventListener("click", leaveRoom);
       
}



//Logik damit maximal eine Checkbox gleichzeitig ausgewählt werden kann
function selectOnlyOne(className, checkbox){
   //=== false, weil zu erst die checkboxe-native onClick function aufgerufen wird die den checked-Wert verändert
    if(checkbox.checked === false){
        checkbox.checked = false;
    }
     else {let checkboxes = document.getElementsByClassName(className);
    for(let i = 0; i< checkboxes.length; i++ ){
        checkboxes[i].checked= false;
    }
    checkbox.checked = true;
     }
}



//sendet Objekt mit allen Antworten für allen Fragen an Server, der leiter weiter an Partner
function changeAnswer(){
    socket.emit("changeAnswer-event", readAnswers(), room);
}
//empfängt Antworten des Partners
socket.on("changeAnswer-event", (answers)=>{
 
    currentPartnerAnswers = answers;
    showTeamAnswers(answers);
  
});



//Nimmt AnsersObjekt des Partners als Arg und zeigt diese Antworten im Quiz
//funktioniert für beleibige Anzahl von falschen Antworten und richtigen Antworten
function showTeamAnswers(answersOrg){
//deep Copy erstellen, weil Werte verändert werden
   let answersCop = JSON.parse(JSON.stringify(answersOrg));


    for(let i = 0; i< answersCop.length; i++){
        let checkboxes = document.getElementsByClassName(`checkbox${i}`);
        for(let j = 0; j< checkboxes.length; j++){
           for(let k = 0; k < answersCop[i].answers.length; k++){
            checkboxes[j].nextSibling.classList.remove("ansPartner");
            if(checkboxes[j].value === answersCop[i].answers[k]){
                checkboxes[j].nextSibling.classList.add("ansPartner");
                answersCop[i].answers[k] = null;
            }
           }
        }
    }
}

//nur aufrufbar wenn Partner submitted hat
//sendet reviseAnswers-event und enabled Checkboxes
function reviseAnswers(){
    socket.emit("reviseAnswers-event", room);
    let answersParents = document.getElementsByClassName("answersParent");
        for(let i = 0; i< answersParents.length; i++){
             let checkboxes = document.getElementsByClassName(`checkbox${i}`);
             for(let j = 0; j < checkboxes.length; j++){
                  checkboxes[j].disabled = false;}  
          }
    document.getElementById("reviseAnswersButton").remove();
    partnerSubmitted = false;
}
//nur erhaltbar wenn man selber submitted hat
//enabled die Checkboxen
socket.on("reviseAnswers-event", ()=>{
    let answersParents = document.getElementsByClassName("answersParent");
        for(let i = 0; i< answersParents.length; i++){
             let checkboxes = document.getElementsByClassName(`checkbox${i}`);
             for(let j = 0; j < checkboxes.length; j++){
                  checkboxes[j].disabled = false;}  
          }
})

//beim Verlassen des Raumes nach Bewertung
function leaveRoom(){
    socket.emit("leaveRoom-event", room);
    window.location.href=`https://tranquil-peak-16169-0d0a26922e8b.herokuapp.com/coopLobby`
}

//stellt sicher das kein weiters leaveRoom-Wvent ohne Addressante versendet wird, wahrscheinlich unnötig
socket.on("leaveRoom-event",()=>{
    console.log("Partner left the room");
    const leaveButton = document.getElementById("leaveButton");
    leaveButton.removeEventListener("click", leaveRoom);
    leaveButton.addEventListener("click", ()=>{
        window.location.href=`https://tranquil-peak-16169-0d0a26922e8b.herokuapp.com/coopLobby`
    })
});



//Chatbox

let messages = document.getElementById('messages');
let form = document.getElementById('form');
let input = document.getElementById('input');

//Ließt Nachicht aus, sendet sie mit event an Server und stellt sie in eigener Chatbox da
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    let msg = input.value;
    if (msg) {
      socket.emit('chat message', msg, room);
      input.value = '';
    }
    let item = document.createElement('li');
    item.textContent =`ich: ${msg}`;
    messages.appendChild(item);
  });

  //Empfängt Nachricht und zeigt sie in Chatbox
  socket.on('chat message', function(msg) {
    let item = document.createElement('li');
    item.textContent = `Partner: ${msg}`;
    messages.appendChild(item);
  });
