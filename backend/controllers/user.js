const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const SECRET_KEY = process.env.JWT_SECRET || 'RANDOM_SECRET_KEY'; // à mettre dans .env

// ----------------------
// INSCRIPTION
// ----------------------
exports.signup = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Crée l'utilisateur (le hash est géré dans le modèle)
    const user = await User.create({ email, password });
    res.status(201).json({ message: 'Utilisateur créé avec succès', userId: user._id });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Cet email existe déjà' });
    }
    res.status(500).json({ error: 'Erreur serveur lors de la création du compte' });
  }
};

// ----------------------
// CONNEXION
// ----------------------
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Vérifie si l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Utilisateur non trouvé' });
    }

    // Compare le mot de passe avec le hash
    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({ error: 'Mot de passe incorrect' });
    }

    // Génère un token JWT valide 24h
    const token = jwt.sign(
      { userId: user._id },
      SECRET_KEY,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      userId: user._id,
      token,
      message: 'Connexion réussie'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur lors de la connexion' });
  }
};
