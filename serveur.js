/***********import des modules nécessaires******/

require('dotenv').config(); // charge les variables depuis .env
 const express = require('express');
const cors = require('cors');

const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log("Connexion MongoDB réussie !"))
  .catch(err => console.error("Erreur de connexion :", err));




/**********initialisation de l api******* */

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


/************routes************** */

app.get('/', (req, res) => res.send('salut'));
app.use((req, res) => res.status(501).send('erreur'));



 app.listen(process.env.SERVER_PORT, () => {
      console.log(` Server is running on port ${process.env.SERVER_PORT}`);
    });


  