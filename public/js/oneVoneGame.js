

const socket = io("/1v1");

let score = 0;
let oppScore = 0;
let playersScored = 0;


let submitButton = document.getElementById("submit"); //Button für Submit des Quizes
submitButton.addEventListener("click", submit1v1);

const searchParams = new URLSearchParams(window.location.search);
const room = searchParams.get('room'); 
let questions; //enthält Fragen, alle Antworten (richtig und falsch unmarkiert) und ID

window.addEventListener("load", socket.emit("load-event", room, (isTwoPlayers)=>{
    if(isTwoPlayers === true){
        buildQuiz()
        socket.emit("twoPlayers-event", room);
    }
    else{document.getElementById("waiting").innerText= "Warten auf Gegner"}
})); //Aufbau des Quizes auf html-Seite

socket.on("twoPlayers-event", ()=>{
    buildQuiz();
    document.getElementById("waiting").innerText= "";
});

async function buildQuiz() {
  
 questions= await getOneVoneQuestions(); // Fragen werden vom Server geladen

 let oneVonePlayerIds = await getOneVonePlayerIds();

 let myId = await getMyID();
 //Kontrolle das nur Spieler in der Session in diesem Raum und auf dieser html Seite sein können
  if(oneVonePlayerIds.message === "Session not found."){  window.location.href=`https://tranquil-peak-16169-0d0a26922e8b.herokuapp.com/1v1Lobby`} //Redirect zur Lobby für den Fall das die in der Url angebenen Session nicht existiert
 if(myId !== oneVonePlayerIds.player1Id && myId !== oneVonePlayerIds.player2Id) {window.location.href=`https://tranquil-peak-16169-0d0a26922e8b.herokuapp.com/1v1Lobby`}

 


const quizDiv = document.getElementById("quiz"); //Element in dem alle Quizfragen und Antworten sind


for (let i = 0; i< questions.length; i++ ) { //Erstellt html für alle Fragen(10) die un questions sind
    
    let answers = questions[i].answers;
    
    
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
    answer1.setAttribute("onclick",`selectOnlyOne("checkbox${i}", this)`); //Logik damit nur eine Antwort pro Frage ausgewählt werden kann wird hinzugefügt

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
    answer2.setAttribute("onclick",`selectOnlyOne("checkbox${i}", this)`);

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
    answer3.setAttribute("onclick",`selectOnlyOne("checkbox${i}", this)`);

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
    answer4.setAttribute("onclick",`selectOnlyOne("checkbox${i}", this)`);

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


}


//Fragen aus angegebenem Kurs vom Server laden
async function  getOneVoneQuestions(){
    try {
        const response = await fetch("api/oneVoneGame/getOneVoneQuestions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ room })
        });
       
        return await response.json();
    }
    catch(error){console.log(error);}
}



//zum Abgeben und bewerten der Antworten
async function submit1v1(){
    //auslesen der eigenen Antworten
    const answers = readAnswers();

    socket.emit("1v1Submit-event", room) 

        let answersParents = document.getElementsByClassName("answersParent");
        for(let i = 0; i< answersParents.length; i++){
            let checkboxes = document.getElementsByClassName(`checkbox${i}`);
            for(let j = 0; j < checkboxes.length; j++){
                checkboxes[j].disabled = true;
                }  
            }
    

    let timeLeft = 10;
   const timerPara=  document.createElement("p");
   timerPara.innerText = timeLeft;
   document.getElementById("timer").append(timerPara);

   let timer = setInterval(()=>{
    if(timeLeft> 0) {
        timeLeft--;
        timerPara.innerText = timeLeft;
    }
    else{
        clearInterval(timer)
        let  answers =   readAnswers();
        judgeAnswers(answers);
    }
    }, 1000)
}

socket.on("1v1Submit-event", ()=>{
    submitButton.disabled = true;
    let timeLeft = 10;
   const timerPara=  document.createElement("p");
   timerPara.innerText = timeLeft;
   document.getElementById("timer").append(timerPara);

    let timer = setInterval(()=>{
    if(timeLeft> 0) {
        timeLeft--;
        timerPara.innerText = timeLeft;
    }
    else{
        clearInterval(timer)
        let answersParents = document.getElementsByClassName("answersParent");
        for(let i = 0; i< answersParents.length; i++){
            let checkboxes = document.getElementsByClassName(`checkbox${i}`);
            for(let j = 0; j < checkboxes.length; j++){
                checkboxes[j].disabled = true;
                }  
            }
        let  answers =   readAnswers();
        judgeAnswers(answers);   
    }
    }, 1000)
})

 socket.on("judgeAnswers-event", (judgedOppAnswers, answers)=>{
   
    showOpponendAnswers(answers);
    
    for(let i = 0; i< judgedOppAnswers.length; i++){
        if(judgedOppAnswers[i].isTrue === true){
            oppScore++;
        }
    }
  
   document.getElementById("oppScore").innerText=  `Opponent's Score: ${oppScore}/${judgedOppAnswers.length}`;
   playersScored++;
   if(playersScored >= 2){
   let gameMessage;
  if(score === oppScore){gameMessage = "Draw";}
   else if(score > oppScore) {gameMessage = "You Won";}
   else{gameMessage = "You Lost";}
   document.getElementById("result").innerText= gameMessage; 
   }
    

 })


//Auslesen der Antworten aus den Checkboxen
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

       socket.emit("judgeAnswers-event", room , judgedAnswers, answers);
    
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
   
    submitButton.remove();

    const leaveButton = document.createElement("button");
    leaveButton.id = "leaveButton";
    leaveButton.innerText = "Raum verlassen";

    document.getElementById("quizButtons").append(leaveButton);
     leaveButton.addEventListener("click", leaveRoom);

     
    for(let i = 0; i< judgedAnswers.length; i++){
        if(judgedAnswers[i].isTrue === true){
            score++;
        }
    }
    document.getElementById("score").innerText = `Your Score: ${score}/${judgedAnswers.length}`;
    playersScored++;
    if(playersScored >= 2){
        let gameMessage;
        if(score === oppScore){gameMessage = "Draw";}
         else if(score > oppScore) {gameMessage = "You Won";}
         else{gameMessage = "You Lost";}
         document.getElementById("result").innerText= gameMessage;   
         }
   
}

async function  getOneVonePlayerIds(){
    try {
        const response = await fetch("api/oneVoneGame/getOneVonePlayerIds", {
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

function leaveRoom(){
    window.location.href=`https://tranquil-peak-16169-0d0a26922e8b.herokuapp.com/1v1Lobby`
}

//Nimmt AnsersObjekt des Partners als Arg und zeigt diese Antworten im Quiz
//funktioniert für beleibige Anzahl von falschen Antworten und richtigen Antworten
function showOpponendAnswers(answersOrg){
    //deep Copy erstellen, weil Werte verändert werden
       let answersCop = JSON.parse(JSON.stringify(answersOrg));
        console.log(answersCop);
    
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
