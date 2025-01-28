const jwt = require('jsonwebtoken'); // JSON Web Token für Authentifizierung
const User = require('../models/User'); // Benutzermodell importieren

// Benutzer registrieren
exports.registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Überprüfen, ob Benutzer bereits existiert
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Neuen Benutzer erstellen
        const user = new User({
            username,
            email,
            password, // Passwort wird im Modell gehasht
        });

        await user.save(); // Benutzer speichern
        res.status(201).json({ message: 'User created successfully', user });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Benutzer einloggen
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Token erstellen und den username hinzufügen
        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                username: user.username, // username hinzufügen
                role: user.role,
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Token als HTTP-Cookie setzen
        res.cookie('authToken', token, {
            httpOnly: true,
            secure: false,
            maxAge: 3600000,
        });

        res.status(200).json({
            message: 'Login successful',
            role: user.role,
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Alle Benutzer abrufen
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// Benutzer abrufen
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// Benutzer aktualisieren
exports.updateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json({ message: "User updated successfully", user });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// Benutzer löschen
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};