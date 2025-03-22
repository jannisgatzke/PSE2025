var express = require("express");
var router = express.Router();
var { authenticateToken } = require("../middleware/authMiddleware");
var {
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getMyId,
  loginGuest
} = require("../controllers/userController");
const { getAdminPage, updateUserRole } = require('../controllers/adminController');
const User = require('../models/user');

// Registrierung eines neuen Benutzers
router.post("/register", registerUser);

// Benutzer-Login
router.post("/login", loginUser);

router.get("/loginGuest", loginGuest);

// Profilseite - rendert `data.ejs` mit Benutzerdaten
router.get("/profile", authenticateToken, (req, res) => {
  res.setHeader('Cache-Control', 'no-store'); // Deaktiviert das Caching
  console.log("Route /profile wurde aufgerufen");
  console.log("Daten für die View:", {
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
  });

  if (req.user) {
      res.setHeader('Content-Type', 'text/html');
      res.render("data", {
          username: req.user.username,
          email: req.user.email,
          role: req.user.role,
      });
  } else {
      res.status(401).redirect("/login");
  }
});


// Adminbereich anzeigen (nur für Admins)
router.get('/admin', authenticateToken, (req, res, next) => {
  next();
}, getAdminPage);

// Benutzerrolle ändern (nur für Admins)
router.post('/admin/update-role', authenticateToken, updateUserRole);

// Alle Benutzer abrufen
router.get("/", authenticateToken, getAllUsers);

router.get("/myId", authenticateToken, getMyId);

// Benutzer nach ID abrufen
router.get("/:id", authenticateToken, getUserById);

// Benutzer aktualisieren
router.put("/:id", authenticateToken, updateUser);

router.post('/admin/delete', authenticateToken, async (req, res) => {
  const { userId } = req.body;

  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).redirect('/api/users/admin');
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Benutzer ausloggen
router.post('/logout', (req, res) => {
  console.log("Logout-Route wurde aufgerufen"); // Debugging
  res.clearCookie('authToken'); // Token löschen
  console.log("Benutzer wurde ausgeloggt"); // Debugging
  res.status(200).redirect('/login'); // Weiterleitung zur Login-Seite
});


module.exports = router;
