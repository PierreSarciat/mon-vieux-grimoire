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


/**********test routes************** */

app.get('/', (req, res) => res.send('salut'));


/**********route GET pour récupérer les livres***** */

app.get('/api/books', async (req, res) => {
  try {
    const books = await Thing.find();
    res.status(200).json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/*****************route POST pour envoyer un livre*********** */


app.post('/api/books', async (req, res) => {
  console.log('Requête POST reçue:', req.body);
  try {

    // Crée un nouveau livre
    
    const newBook = new Thing({
      userId: req.body.userId,
      title: req.body.title,
      author: req.body.author,
      imageUrl: req.body.imageUrl,
      year: req.body.year,
      genre: req.body.genre,
      ratings: req.body.ratings || [],
      averageRating: req.body.averageRating || 0
    });

    // Sauvegarde dans MongoDB

    await newBook.save();

    // Répond au frontend avec le livre créé

    res.status(201).json({
      message: 'Livre ajouté avec succès !',
      book: newBook
    });

  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});



/**************route pour autres requêtes******* */

app.use((req, res) => res.status(404).send('route non trouvée'));

/**********démarrage serveur********* */

 app.listen(process.env.SERVER_PORT, () => {
      console.log(` Server is running on port ${process.env.SERVER_PORT}`);
    });


  