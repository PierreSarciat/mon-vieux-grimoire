/*********** Import des modules nécessaires ***********/
const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');

/*********** Import des routes ***********/
const stuffRoutes = require('./routes/stuff'); // backend/routes/stuff.js
const userRoutes = require('./routes/user');   // backend/routes/user.js

/******************création de l 'application express*********** */

const app = express();

/*************configuration CORS************************* */

const corsOptions = {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
};



/*********** Connexion à MongoDB ***********/
mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log('Connexion MongoDB réussie !'))
  .catch(err => console.error('Erreur de connexion MongoDB :', err));


/***********  CORS ***********/

app.use(cors(corsOptions));

/*********** Middleware JSON ***********/
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/*********** Servir le dossier images en statique ***********/

app.use('/images', express.static(path.join(__dirname, 'images')));

/***********************debug************************* */

app.use((req, res, next) => {
  console.log(`Requête reçue : ${req.method} ${req.url}`);
  next();
});

/*********** Définition des routes ***********/

// Routes pour les livres (stuff)
app.use('/api/books', stuffRoutes);

// Routes pour l'authentification
app.use('/api/auth', userRoutes);

/*********** Démarrage du serveur ***********/

app.listen(process.env.SERVER_PORT, () => {
  console.log(`Serveur lancé sur le port ${process.env.SERVER_PORT}`);
});
