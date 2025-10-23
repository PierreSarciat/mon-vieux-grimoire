const express = require('express');
const router = express.Router();
const Thing = require('../models/thing');
const auth = require('../middleware/auth'); // Middleware JWT

/**********route GET pour récupérer les livres***** */
router.get('/books', async (req, res) => {
  try {
    const books = await Thing.find();
    res.status(200).json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/*********route GET pour récupérer un livre par ID******* */
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
router.post('/books', auth, async (req, res) => {
  console.log('Requête POST reçue:', req.body);
  try {
    // Crée un nouveau livre avec l'ID de l'utilisateur depuis le token
    const newBook = new Thing({
      userId: req.auth.userId,
      title: req.body.title,
      author: req.body.author,
      imageUrl: req.body.imageUrl,
      year: req.body.year,
      genre: req.body.genre,
      ratings: req.body.ratings || [],
      averageRating: req.body.averageRating || 0
    });

    await newBook.save();

    res.status(201).json({
      message: 'Livre ajouté avec succès !',
      book: newBook
    });

  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

/*************route PUT************/
router.put('/books/:id', auth, async (req, res) => {
  try {
    // findByIdAndUpdate : modifie le document et retourne le nouveau
    const updatedBook = await Thing.findByIdAndUpdate(
      req.params.id,
      { ...req.body, userId: req.auth.userId }, // sécurisation avec l'ID utilisateur
      { new: true }
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
router.delete('/books/:id', auth, async (req, res) => {
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

/*************route POST pour ajouter une note************/
router.post('/books/:id/rating', auth, async (req, res) => {
  try {
    const book = await Thing.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Livre introuvable' });

    // Ajouter la note
    const { grade } = req.body;
    book.ratings.push({ userId: req.auth.userId, grade });

    // Recalculer la note moyenne
    book.averageRating = book.ratings.reduce((acc, cur) => acc + cur.grade, 0) / book.ratings.length;

    await book.save();

    res.status(200).json({
      message: 'Note ajoutée avec succès !',
      book
    });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**************route pour autres requêtes******* */
router.use((req, res) => res.status(404).send('Route non trouvée'));

/**********test route**************/
router.get('/', (req, res) => res.send('salut'));

module.exports = router;
