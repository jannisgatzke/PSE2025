// Importiert Middleware zur Token-Authentifizierung
const { authenticateToken } = require("../middleware/authMiddleware");
// Importiert Express und erstellt einen Router
const express = require("express");
const router = express.Router();

// Importiert Controller-Funktionen für Solo-Quiz-Logik
const { handleSoloResultNew, getQuizQuestionsNew} = require("../controllers/soloGameController");
// Route: Ergebnis eines Solo-Quiz speichern
// Nur erreichbar mit gültigem Token
router.post("/resultNew", authenticateToken, handleSoloResultNew);
// Route: Neue Quizfragen abrufen
router.post("/getQuizNew/:anzahl", authenticateToken, getQuizQuestionsNew);

// Exportiert den Router für die Verwendung in der App
module.exports = router;
 


