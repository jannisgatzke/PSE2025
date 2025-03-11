async function fillKursSelect(){
    let courses = await fetch("api/questions/distinctCourses");
    courses = await courses.json();
   const kurse = document.getElementById("kurse");
    for(let i = 0; i < courses.length; i++){
       let colour  = stringToColour(courses[i]);
       
        const div = document.createElement("div");
        const p = document.createElement("p")
        const a = document.createElement("a");
        a.setAttribute("href", `soloGame?kurs=${courses[i]}`);
        a.style.color = invertColor(colour, true);
        p.innerText = courses[i];
        p.classList.add("kurs");
        div.append(p);
        div.classList.add("quadrat");
        div.style.backgroundColor = colour;
        a.append(div),
        kurse.append(a);


    }

}

function stringToColour (str) {
    let hash = 0;
    str.split('').forEach(char => {
      hash = char.charCodeAt(0) + ((hash << 5) - hash)
    })
    let colour = '#'
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff
      colour += value.toString(16).padStart(2, '0')
    }
    return colour
  }



  function invertColor(hex, bw) {
    if (hex.indexOf('#') === 0) {
        hex = hex.slice(1);
    }
    // convert 3-digit hex to 6-digits.
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length !== 6) {
        throw new Error('Invalid HEX color.');
    }
    var r = parseInt(hex.slice(0, 2), 16),
        g = parseInt(hex.slice(2, 4), 16),
        b = parseInt(hex.slice(4, 6), 16);
    if (bw) {
        // https://stackoverflow.com/a/3943023/112731
        return (r * 0.299 + g * 0.587 + b * 0.114) > 186
            ? '#000000'
            : '#FFFFFF';
    }
    // invert color components
    r = (255 - r).toString(16);
    g = (255 - g).toString(16);
    b = (255 - b).toString(16);
    // pad each with zeros and return
    return "#" + padZero(r) + padZero(g) + padZero(b);
}

function padZero(str, len) {
    len = len || 2;
    var zeros = new Array(len).join('0');
    return (zeros + str).slice(-len);
}

fillKursSelect();