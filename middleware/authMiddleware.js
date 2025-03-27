const jwt = require('jsonwebtoken'); // Importiert JSON Web Token (JWT) für Token-Verwaltung und Authentifizierung

// Middleware zur Authentifizierung von Benutzern
const authenticateToken = (req, res, next) => {
    const token = req.cookies.authToken; // Token aus Cookie lesen
    console.log("Extracted Token:", token);

    // Prüfen, ob das Token vorhanden ist
    if (!token) {
        console.error("Kein Token bereitgestellt."); // Debugging
        return res.status(401).redirect('/login'); // Weiterleitung zur Login-Seite
    }

    try {
        // Token validieren und dekodieren
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Dekodierter Token:", decoded); // Debugging
        req.user = decoded; 
        
        // Benutzerdaten in req.user speichern
        console.log("Middleware erfolgreich: Weiter zu nächster Route");
        next(); // Anquestion an die nächste Middleware oder Route weitergeben
    } catch (error) {
        // Fehler bei der Token-Validierung
        console.error("Fehler bei der Token-Überprüfung:", error); // Debugging
        return res.status(403).redirect('/login'); // Weiterleitung zur Login-Seite
    }
};

//Exporte
module.exports = { authenticateToken };