/*********** Import des modules nécessaires ***********/
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

/*********** Import des routes ***********/
const stuffRoutes = require('./backend/routes/stuff');
const userRoutes = require('./backend/routes/user'); // <-- ajout des routes utilisateur (auth)

/*********** Connexion à MongoDB ***********/
mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log('✅ Connexion MongoDB réussie !'))
  .catch(err => console.error('❌ Erreur de connexion MongoDB :', err));

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

/*********** Définition des routes ***********/
// Routes pour les livres (stuff)
app.use('/api', stuffRoutes);

// Routes pour l'authentification
app.use('/api/auth', userRoutes);

/*********** Démarrage du serveur ***********/
const PORT = process.env.SERVER_PORT || 1515;

app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});

