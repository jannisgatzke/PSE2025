window.addEventListener("load", buildQuiz); //Aufbau des Quizes auf html-Seite

let submitButton = document.getElementById("submit"); //Button für Submit des Quizes
submitButton.addEventListener("click", submitNew);



async function buildQuiz() {
  
 questions= await getQuestionsNew(); // Fragen werden vom Server geladen

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
async function  getQuestionsNew(){
    let kurs = null; // Kurs noch hardcoded
    try {
        const response = await fetch("/api/soloGame/getQuizNew/10", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ kurs })
        });
       
        return await response.json();
    }
    catch(error){console.log(error);}
}


//Antworten zu Server schicken, kontrollierte Fragen mit Erklärungen erhalten ... und Erklärungen und Richtigkeit der Antworten in html anzeigen
async function submitNew(){
    const answers = readAnswers();
    
    let judgedAnswers = await fetch("/api/soloGame/resultNew", {
     method: "POST",
     headers: { "Content-Type": "application/json" },
     body: JSON.stringify({ answers })
     });
     
    judgedAnswers=  await judgedAnswers.json();
                                                                        // ... und Erklärungen und Richtigkeit der Antworten in html anzeigen
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




 


//Auslesen der Antworten aus den Checkboxen
 function readAnswers(){
    let answers =[];

    let answersParents = document.getElementsByClassName("answersParent");
     for(let i = 0; i< answersParents.length; i++){
         let answerObj = {};
         answerObj.questionID = questions[i]._id;
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