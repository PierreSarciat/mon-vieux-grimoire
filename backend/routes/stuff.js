const express = require('express');

const router = express.Router();

const Thing = require('../models/thing');

/**********route GET pour récupérer les livres***** */

router.get('/books', async (req, res) => {
  try {
    const books = await Thing.find();
    res.status(200).json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/*********route GET pour récuperer un livre par ID******* */

router.get('/books/:id', async (req, res) => {
   console.log("ID reçu:", req.params.id);
  try {
    const book = await Thing.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Livre introuvable' });
    res.status(200).json(book);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/*****************route POST pour envoyer un livre*********** */


router.post('/books', async (req, res) => {
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

/*************route PUT************ */


router.put('/books/:id', async (req, res) => {
  try {

    // findByIdAndUpdate : modifie le document et retourne le nouveau

    const updatedBook = await Thing.findByIdAndUpdate(
      req.params.id, // ID du livre à modifier
      req.body,      // nouvelles données depuis le frontend
      { new: true }  // retourne le document mis à jour
    );

    if (!updatedBook) {
      return res.status(404).json({ message: 'Livre non trouvé !' });
    }

    res.status(200).json({
      message: 'Livre modifié avec succès !',
      book: updatedBook
    });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/*************route DELETE************/

router.delete('/books/:id', async (req, res) => {
  try {
    const deletedBook = await Thing.findByIdAndDelete(req.params.id);

    if (!deletedBook) {
      return res.status(404).json({ message: 'Livre non trouvé !' });
    }

    res.status(200).json({
      message: 'Livre supprimé avec succès !',
      book: deletedBook
    });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


/**************route pour autres requêtes******* */

router.use((req, res) => res.status(404).send('route non trouvée'));

/**********test routes************** */

router.get('/', (req, res) => res.send('salut'));

module.exports = router;