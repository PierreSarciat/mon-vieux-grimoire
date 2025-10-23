const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // On récupère le token envoyé dans l’en-tête Authorization : "Bearer token"
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Token manquant' });
    }

    const token = authHeader.split(' ')[1]; // récupère la partie après "Bearer"
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    // Ajoute l'ID utilisateur au corps de la requête pour les contrôleurs
    req.auth = { userId: decodedToken.userId };
    next();
  } catch (error) {
    console.error('Erreur d’authentification :', error);
    res.status(401).json({ error: 'Requête non authentifiée !' });
  }
};
