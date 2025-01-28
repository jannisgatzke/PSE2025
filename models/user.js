const mongoose = require('mongoose'); // MongoDB-Objektdatenmodell
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema; // Schema-Konstruktor von Mongoose

// Benutzer-Schema definieren
const userSchema = new Schema({
    unique_id: Number, // Eindeutige ID für den Benutzer
    email: { type: String, required: true, unique: true }, // E-Mail
    username: { type: String, required: true }, // Username
    password: { type: String, required: true }, // Passwort
    passwordConf: String, // Passwortbestätigung (optional)
    role: { type: String, enum: ['user', 'admin'], default: 'user' } // Rollen: user, admin
});

// Middleware: Passwort vor dem Speichern hashen
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next(); // Nur hashen, wenn Passwort geändert wurde

    try {
        const salt = await bcrypt.genSalt(10); // Salt generieren
        this.password = await bcrypt.hash(this.password, salt); // Passwort hashen
        next();
    } catch (err) {
        next(err);
    }
});

// Methode zum Vergleichen von Passwörtern
userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Benutzer-Modell exportieren
// Überprüft, ob das Modell bereits existiert, bevor es registriert wird
module.exports = mongoose.models.User || mongoose.model('User', userSchema);
