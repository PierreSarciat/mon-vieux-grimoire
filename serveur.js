/***********import des modules nécessaires******/

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const stuffRoutes = require('./backend/routes/stuff'); 

/*********connexion MongoDB**********/
mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log("Connexion MongoDB réussie !"))
  .catch(err => console.error("Erreur de connexion :", err));

const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET','POST','PUT','DELETE'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ ici on "monte" les routes
app.use('/api', stuffRoutes);

/**********démarrage serveur**********/
app.listen(process.env.SERVER_PORT, () => {
  console.log(`Server is running on port ${process.env.SERVER_PORT}`);
});
