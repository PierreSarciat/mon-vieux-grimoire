/*********** Import des modules nécessaires ***********/
const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');

/*********** Import des routes ***********/
const stuffRoutes = require('./routes/stuff'); // backend/routes/stuff.js
const userRoutes = require('./routes/user');   // backend/routes/user.js

/*********** Connexion à MongoDB ***********/
mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log('✅ Connexion MongoDB réussie !'))
  .catch(err => console.error('Erreur de connexion MongoDB :', err));

const app = express();

/*********** Configuration CORS ***********/
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

/*********** Middleware JSON ***********/
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/*********** Servir le dossier images en statique ***********/
// Comme images est dans src/images par rapport à la racine du projet
app.use('/images', express.static(path.join(__dirname, '../src/images')));

/*********** Définition des routes ***********/
// Routes pour les livres (stuff)
app.use('/api/books', stuffRoutes);

// Routes pour l'authentification
app.use('/api/auth', userRoutes);

/*********** Démarrage du serveur ***********/

app.listen(process.env.SERVER_PORT, () => {
  console.log(`Serveur lancé sur le port ${process.env.SERVER_PORT}`);
});
