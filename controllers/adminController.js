const User = require("../models/user"); // Importiert das User-Modell für Datenbankabfragen
const mongoose = require('mongoose'); // Importiert Mongoose für die Datenbankverbindung und Modellierung

// Laden der Admin-Seite
exports.getAdminPage = async (req, res) => {
    try {
        console.log("Benutzerrolle:", req.user.role); // Debugging

        // Überprüfen, ob der Benutzer ein Admin ist
        if (req.user.role !== "admin") {
            return res.status(403).send("Access denied.");
        }

        // Benutzerliste abrufen
        const users = await User.find({}, "username email role");
        res.status(200).render("admin", { users, username: req.user.username });
    } catch (error) {
        console.error("Fehler beim Abrufen der Adminseite:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

// Benutzerrolle aktualisieren
exports.updateUserRole = async (req, res) => {
    const { userId, newRole } = req.body;

    try {
        if (req.user.role !== 'admin') {
            return res.status(403).send('Access denied.');
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID.' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send('Benutzer nicht gefunden.');
        }

        if (!['user', 'admin'].includes(newRole)) {
            return res.status(400).send('Ungültige Rolle.');
        }

        user.role = newRole;
        await user.save();

        // Weiterleitung zur Admin-Seite
        res.redirect('/api/users/admin');
    } catch (error) {
        console.error('Fehler beim Aktualisieren der Benutzerrolle:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};
