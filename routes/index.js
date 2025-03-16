// Express und Router-Instanz importieren
var express = require('express');
var router = express.Router();

// Benutzermodell importieren
var User = require('../models/user');

// Hauptseite rendern
router.get('/', function (req, res, next) {
    return res.render('index.ejs');
});

// Middleware zur Authentifizierung
const { authenticateToken } = require('../middleware/authMiddleware');

// Benutzerprofil anzeigen
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        // Benutzer anhand der ID aus dem Token abrufen
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Profilinformationen zurückgeben
        res.status(200).json({ username: user.username, email: user.email });
    } catch (error) {
        // Fehlerbehandlung
        res.status(500).json({ message: "Server error", error });
    }
});

// Benutzer ausloggen
router.get('/logout', function (req, res, next) {
    console.log("logout");
    if (req.session) {
        req.session.destroy(function (err) {
            if (err) {
                return next(err); // Fehler beim Zerstören der Sitzung
            } else {
                return res.redirect('/'); // Weiterleitung zur Hauptseite
            }
        });
    }
});

// Login-Seite rendern
router.get('/login', function (req, res, next) {
    res.render('login.ejs');
});

// Passwort vergessen Seite
router.get('/forgetpass', function (req, res, next) {
    res.render("forget.ejs");
});

// Fragenkatalog-Seite rendern
router.get('/fragenkatalog', authenticateToken, (req, res) => {
    res.render('fragenkatalog');
});

// Passwort zurücksetzen
router.post('/forgetpass', function (req, res, next) {
    User.findOne({ email: req.body.email }, function (err, data) {
        if (!data) {
            res.send({ "Success": "This Email Is not registered!" });
        } else {
            if (req.body.password === req.body.passwordConf) {
                data.password = req.body.password;
                data.passwordConf = req.body.passwordConf;

                data.save(function (err) {
                    if (err) console.log(err);
                    else res.send({ "Success": "Password changed!" });
                });
            } else {
                res.send({ "Success": "Password does not match! Both passwords should be the same." });
            }
        }
    });
});

// Route für die Spielmodus-Auswahlseite
router.get('/game-mode', (req, res) => {
    res.render('gameMode'); // Rendert die neue Seite gameMode.ejs
});

//SoloGame Seite
router.get("/soloGame", (req, res)=>{
    res.render("soloGame.ejs");
})
//CoopGame Seite
router.get("/coopGame", (req, res)=>{
    res.render("coopGame.ejs");
})

router.get("/coopLobby", (req, res)=>{
    res.render("coopLobby.ejs");
})

router.get("/1v1Game", (req, res)=>{
    res.render("oneVoneGame.ejs");
})

router.get("/1v1Lobby", (req, res)=>{
    res.render("oneVoneLobby.ejs");
})

router.get("/soloLobby", (req, res)=>{
    res.render("soloLobby.ejs");
})
//Exporte
module.exports = router;
