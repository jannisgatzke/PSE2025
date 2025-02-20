window.addEventListener("load", buildQuiz); //Aufbau des Quizes auf html-Seite

let submitButton = document.getElementById("submit"); //Button für Submit des Quizes
submitButton.addEventListener("click", submitCoop);

const searchParams = new URLSearchParams(window.location.search);
const room = searchParams.get('room'); 
let currentPartnerAnswers = []; 
let partnerSubmitted = false; // geiiler Name

const socket = io();

async function buildQuiz() {
  
 questions= await getQuestionsNew(); // Fragen werden vom Server geladen

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
    
    socket.emit("buildQuiz-event", room);
};

    

}


//Fragen aus angegebenem Kurs vom Server laden
async function  getQuestionsNew(){
    
    
    
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



async function submitCoop(){
    const answers = readAnswers();

if(partnerSubmitted === false){
    for(let i = 0; i < answers.length; i++ ){
        if(answers[i].answers.sort().toString() !== currentPartnerAnswers[i].answers.sort().toString()) { return;}
    }

    socket.emit("coopSubmit-event", room, (succes, message)=>{
   
        if(!succes){console.log(message); return;}
   
        let answersParents = document.getElementsByClassName("answersParent");
        for(let i = 0; i< answersParents.length; i++){
            let checkboxes = document.getElementsByClassName(`checkbox${i}`);
            for(let j = 0; j < checkboxes.length; j++){
                checkboxes[j].disabled = true;
            }  
        }
    })
}  
else{
    socket.emit("judgeAnswers-event", room);
    judgeAnswers(answers);
}
}
     

socket.on("judgeAnswers-event", ()=>{
    const answers = readAnswers();
    judgeAnswers(answers);
})
 




 


//Auslesen der Antworten aus den Checkboxen
 function readAnswers(){
    let answers =[];

    let answersParents = document.getElementsByClassName("answersParent");
     for(let i = 0; i< answersParents.length; i++){
         let answerObj = {};
         answerObj.questionID = questions[i].questionId;
         answerObj.answers = [];
         
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


async function judgeAnswers(answers){
    console.log(answers);
    
    let judgedAnswers = await fetch("/api/soloGame/resultNew", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers })
        });
        
       judgedAnswers=  await judgedAnswers.json();

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


//Socket Zeug, ich bin unzufrieden it den ganzen Codewiederhoungen aber ich implementiere erstmal die Funkitionalitäten


function changeAnswer(){
    socket.emit("changeAnswer-event", readAnswers(), room);
   
}

socket.on("changeAnswer-event", (answers)=>{
 
    currentPartnerAnswers = answers;
    
    showTeamAnswers(answers);
  
});


socket.on("coopSubmit-event", ()=>{
    if(partnerSubmitted === false){
        partnerSubmitted = true;
        
        let answersParents = document.getElementsByClassName("answersParent");
        for(let i = 0; i< answersParents.length; i++){
             let checkboxes = document.getElementsByClassName(`checkbox${i}`);
             for(let j = 0; j < checkboxes.length; j++){
                  checkboxes[j].disabled = true;}  
          }
       const reviseAnswersButton = document.createElement("button");
       reviseAnswersButton.innerText = "Antworten nochmal überdenken";
       reviseAnswersButton.id = "reviseAnswersButton";
       const body = document.getElementsByTagName("body")[0];
       body.append(reviseAnswersButton);
       reviseAnswersButton.addEventListener("click", reviseAnswers);
    }
})


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


function reviseAnswers(){
    socket.emit("reviseAnswers-event", room);
    let answersParents = document.getElementsByClassName("answersParent");
        for(let i = 0; i< answersParents.length; i++){
             let checkboxes = document.getElementsByClassName(`checkbox${i}`);
             for(let j = 0; j < checkboxes.length; j++){
                  checkboxes[j].disabled = false;}  
          }
    document.getElementById("reviseAnswersButton").remove();
}

socket.on("reviseAnswers-event", ()=>{
    let answersParents = document.getElementsByClassName("answersParent");
        for(let i = 0; i< answersParents.length; i++){
             let checkboxes = document.getElementsByClassName(`checkbox${i}`);
             for(let j = 0; j < checkboxes.length; j++){
                  checkboxes[j].disabled = false;}  
          }
})