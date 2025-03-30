// Asynchrone Funktion zum dynamischen Befüllen der Kursauswahl
async function fillKursSelect(){
    // Hole alle verfügbaren Kursnamen über eine API
    let courses = await fetch("api/questions/distinctCourses");
     // Konvertiere die Antwort in ein JSON-Array
    courses = await courses.json();
    // Referenz auf das HTML-Element mit der ID "kurse"
   const kurse = document.getElementById("kurse");
    for(let i = 0; i < courses.length; i++){
   
        const div = document.createElement("div");
        const p = document.createElement("p")
        const a = document.createElement("a");
        a.setAttribute("href", `soloGame?kurs=${courses[i]}`);
     
        p.innerText = courses[i];
        p.classList.add("kurs");
        div.append(p);
        div.classList.add("quadrat");
        
        a.append(div),
        kurse.append(a);


    }

}
// Starte die Funktion direkt beim Laden der Seite
fillKursSelect();