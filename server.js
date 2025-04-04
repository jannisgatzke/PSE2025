let express = require('express'); // Express-Framework importieren
let env = require('dotenv').config() // Umgebungsvariablen laden
let ejs = require('ejs'); // EJS als View-Engine verwenden
let path = require('path'); // Für Dateipfade
let mongoose = require('mongoose'); // MongoDB-Verbindung
let cookieParser = require('cookie-parser'); // Cookie parsen
require('dotenv').config(); // Umgebungsvariablen aus der .env-Datei laden



let app = express(); // Express-Anwendung initialisieren
const http = require("http");
const server = http.createServer(app);
//Socket.io Setup
const {Server} = require("socket.io");
const io = new Server(server);


//Coop Function imports
const {coopGame, deleteCoopSession} = require("./controllers/coopGameController.js");
const{createCoopSession, joinCoopSession} = require("./controllers/coopLobbyController.js");

const coopIo = io.of("/coop");
coopIo.on('connection', (socket) => {
 createCoopSession(socket);
 joinCoopSession(socket);
  coopGame(socket);
});

coopIo.adapter.on("delete-room", (room)=>{
  deleteCoopSession(room);
   
  //um die OpenSession Liste neu zu laden
   coopIo.emit("sessionChange-event");
})


const {createOneVoneSession, joinOneVoneSession} = require("./controllers/oneVoneLobbyController.js")
const {oneVoneGame, deleteOneVoneSession} = require("./controllers/oneVoneGameController.js")
const oneVoneIo = io.of("/1v1");
oneVoneIo.on("connection", (socket) =>{
  createOneVoneSession(socket);
  joinOneVoneSession(socket);
  oneVoneGame(socket);
})

oneVoneIo.adapter.on("delete-room", (room)=>{
  deleteOneVoneSession(room);
   
  //um die OpenSession Liste neu zu laden, noch nicht implementiert
  oneVoneIo.emit("sessionChange-event");
})


// Verbindung zur MongoDB-Datenbank herstellen

mongoose.connect('mongodb+srv://jannisgatzke:fJ4q9kqejLYiVokk@quiz-app.6mahg.mongodb.net/?retryWrites=true&w=majority&appName=quiz-app', {

  useNewUrlParser: true,
  useUnifiedTopology: true
}, (err) => {
  if (!err) {
    console.log('MongoDB Connection Succeeded.');
  } else {
    console.log('Error in DB connection : ' + err);
  }
});



// MongoDB-Verbindungsfehler-Handling
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
});

// View-Engine und Views-Pfad konfigurieren
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');	

// Middleware zur Verarbeitung von HTTP-Anquestionn
app.use(cookieParser()); //Cookies verarbeiten
app.use(express.json()); // JSON-Parser
app.use(express.urlencoded({ extended: false })); // URL-codierte Daten

// Statische Dateien bereitstellen
app.use(express.static(__dirname + '/public'));

// Routen importieren
let index = require('./routes/index'); //Haupt-Routen
app.use('/', index);

const userRoutes = require("./routes/userRoutes"); // Benutzerbezogene Routen
app.use("/api/users", userRoutes); // Präfix für Benutzer-Routen

const questionRoutes = require("./routes/questionRoutes");
app.use("/api/questions", questionRoutes);

const soloGameRoutes = require("./routes/soloGameRoutes");
app.use("/api/soloGame", soloGameRoutes );

const coopGameRoutes = require("./routes/coopGameRoutes");
app.use("/api/coopGame", coopGameRoutes );

const oneVoneGameRoutes = require("./routes/oneVoneGameRoutes.js");
app.use("/api/oneVoneGame", oneVoneGameRoutes);

// Fehlerbehandlung für nicht gefundene Dateien (404)
app.use(function (req, res, next) {
  let err = new Error('File Not Found');
  err.status = 404;
  next(err);
});

// Globaler Fehler-Handler
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.send(err.message);
});


// Server starten (Änderung von app.listen zu server.listen für socket.io)
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', function () {
  console.log('Server is started on port ' + PORT);
});
