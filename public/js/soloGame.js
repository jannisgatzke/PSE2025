//Vielleicht in SessionStorage speichern, Problematisch auch, dass es in der Console abrufbar ist und die richtigen Antworten enthält
//Nur für clientseitige Verarbeitung nötig
let questions;

window.addEventListener("load", buildQuiz);

let submitButton = document.getElementById("submit");
submitButton.addEventListener("click", submit);



async function buildQuiz() {
  
 questions= await getQuestions();

const quizDiv = document.getElementById("quiz");
//Element in dem alle Quizfragen und Antworten sind
const questionsDiv = document.createElement("div");
questionsDiv.id =("questionsDiv");


for (let i = 0; i< questions.length; i++ ) {
    
    let answers = pickAnswers(questions[i].rigthAnswers, questions[i].wrongAnswers);
    
    //Element in dem eine Quizfrage mit ihren Antworten ist
    const questionParent = document.createElement("div");
    questionParent.id = `question${i}`;
    const questionParagraph = document.createElement("p");
    questionParagraph.innerText= questions[i].question;

    questionParent.appendChild(questionParagraph);

    const answersParent = document.createElement("div");
    answersParent.classList = "answersParent";
    answersParent.id = `answerParent${i}`;

    const answer1 = document.createElement("input");
    answer1.setAttribute("type", "checkbox");
    answer1.name = "answer1";
    answer1.value = answers[0];
    answer1.classList.add(`checkbox${i}`);
    answer1.setAttribute("onclick",`selectOnlyOne("checkbox${i}", this)`);

    const answer1Label = document.createElement("label");
    answer1Label.setAttribute("for", "answer1");
    answer1Label.innerText = answers[0];

    answersParent.appendChild(answer1);
    answersParent.appendChild(answer1Label);


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

    const wholeQuestion = document.createElement("div");
    wholeQuestion.appendChild(questionParent);
    wholeQuestion.appendChild(answersParent);

    questionsDiv.appendChild(wholeQuestion);
   
};

quizDiv.appendChild(questionsDiv);

}




 //Funktionen für clientseitige Verarbeitung
async function  getQuestions(){
    let kurs = "DemoFragen";
    try {
        const response = await fetch("/api/soloGame/getQuiz/10", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ kurs })
        });
       
        return await response.json();
    }
    catch(error){console.log(error);}
}


async function submit(){
    const answers = readAnswers();
    const judgedAnswers = judgeAnswers(answers);
    //await eigentlich nichtnötig glaube ich
    fetch("/api/soloGame/result", {
     method: "POST",
     headers: { "Content-Type": "application/json" },
     body: JSON.stringify({ judgedAnswers })
     });
 
     const questions = document.getElementById("questionsDiv").children;
     for (let i = 0; i < judgedAnswers.length; i++) {
         if(judgedAnswers[i].isTrue){ questions[i].classList.add("rigth");}
         else{questions[i].classList.add("wrong");}
     }
 }
 

//Unterfunktionen für Client- und Serverseitige Verarbeitung

 function readAnswers(){
    let answers =[];

    let answersParents = document.getElementsByClassName("answersParent");
     for(let i = 0; i< answersParents.length; i++){
         let answerObj = {};
         answerObj.questionID = questions[i]._id;
         answerObj.answers = [];
         
         let checkboxes = answersParents[i].children;
         for(let j = 0; j < checkboxes.length; j++){
             if(checkboxes[j].getAttribute("type")=== "checkbox" && checkboxes[j].checked === true){
                 answerObj.answers.push(checkboxes[j].value);
             }
         }
         answers.push(answerObj);
     }
    return answers; 
}





//Unterfunktionen für Clienseitige Verarbeitung

function shuffleArray(array){
    let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
}


//gibt Array mit 4 Antworten in zufälliger Reihenfolge zurück, in dem alle richtigen Antworten enthalten sind
function pickAnswers(rigthAnswers, wrongAnswers){
    let wACopy = [];
    let result = [];
    
    //wenn vier oder mehr richtige Antworten übergeben werden
    if(rigthAnswers.length >= 4){
        shuffleArray(rigthAnswers);
        for(let i =0; i < 4; i++){
            result.push(rigthAnswers[i]);
        }
        return result;
    }
    
    wrongAnswers.forEach(element => {
        wACopy.push(element);
    });
    shuffleArray(wACopy);

    rigthAnswers.forEach(element => {
        result.push(element);
    });

    for(let i = 0; i < 4-rigthAnswers.length; i++){
        result.push(wACopy[i]);
    }
    shuffleArray(result);
    return result;
}


function judgeAnswers(answers){
    let judgedAnswers = [];
    
    for(let i = 0; i< answers.length; i++ ) {
        if(answers[i].questionID === questions[i]._id){
            let judgedAnswer = {};
            judgedAnswer.frage = answers[i].questionID;
            if(answers[i].answers.sort().toString() === questions[i].rigthAnswers.sort().toString()){
                judgedAnswer.isTrue = true;
            }
            else {judgedAnswer.isTrue = false;}
            judgedAnswers.push(judgedAnswer);
        }
        else {console.log("du bist dumm");}
    }
    return judgedAnswers;
}

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