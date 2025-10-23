/***********import des modules nécessaires******/

require('dotenv').config(); // charge les variables depuis .env
 const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

/********import du modèle ***********/


const Thing = require('./backend/models/thing');


/*********connexion MongoDB********** */

mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log("Connexion MongoDB réussie !"))
  .catch(err => console.error("Erreur de connexion :", err));




/**********initialisation de l api******* */

const app = express();

/*app.use(cors());const cors = require('cors');*/

app.use(cors({
    origin: 'http://localhost:3000', // autorise le frontend React
    methods: ['GET','POST','PUT','DELETE'], // méthodes autorisées
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



/**********démarrage serveur********* */

 app.listen(process.env.SERVER_PORT, () => {
      console.log(` Server is running on port ${process.env.SERVER_PORT}`);
    });


  