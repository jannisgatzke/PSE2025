async function fillKursSelect(){
    let courses = await fetch("api/questions/distinctCourses");
    courses = await courses.json();
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

fillKursSelect();