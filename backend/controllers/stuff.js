const Thing = require('../models/thing');
const path = require('path');
const fs = require('fs');
const imagesPath = path.join(__dirname, '../images');

/********************** * Récupérer tous les livres **********************/


exports.getAllThings = async (req, res) => {
  try {
    const books = await Thing.find();
    res.status(200).json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/********************** * Récupérer un livre par ID **********************/


exports.getOneThing = async (req, res) => {
  try {
    const book = await Thing.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Livre introuvable' });
    res.status(200).json(book);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**********************
 * Créer un livre (avec image via multer)
 **********************/

exports.createThing = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Veuillez ajouter une image.' });
    }

    let thingData = {};

    try {
      if (req.body.thing) {
        thingData = JSON.parse(req.body.thing);
      } else {
        return res.status(400).json({ message: 'Aucune donnée reçue.' });
      }
    } catch (error) {
      return res.status(400).json({ message: 'Format invalide pour les données du livre.' });
    }


    // Supprimer les champs sensibles si fournis
    delete thingData._id;
    delete thingData._userId;

    // Construire l'URL de l'image
    const imageUrl = req.file
      ? `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
      : thingData.imageUrl || '';

    // Créer le document
    const newThing = new Thing({
      ...thingData,
      userId: req.auth.userId,
      imageUrl,
      ratings: thingData.ratings || [],
      averageRating: thingData.averageRating || 0
    });

    await newThing.save();

    res.status(201).json({ message: 'Livre ajouté avec succès !', book: newThing });

  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};


/********************** * Modifier un livre **********************/

exports.modifyThing = async (req, res) => {
  try {
    const thingObject = req.file
      ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
      }
      : JSON.parse(req.body.book);

    delete thingObject._userId;
    delete thingObject._id;

    const thing = await Thing.findOne({ _id: req.params.id });

    if (!thing) {
      return res.status(404).json({ message: "Livre introuvable" });
    }

    if (thing.userId.toString() !== req.auth.userId) {
      return res.status(401).json({ message: 'Permission refusée' });
    }

    const updatedThing = await Thing.findByIdAndUpdate(
      req.params.id,
      { $set: thingObject },
      { new: true }
    );

    res.status(200).json({ message: 'Livre modifié avec succès !', updatedThing });
  } catch (error) {
    console.error('Erreur lors de la modification :', error);
    res.status(400).json({ error });
  }
};

/********************** * Supprimer un livre **********************/

exports.deleteThing = async (req, res) => {
  try {

    const thing = await Thing.findOne({ _id: req.params.id });

    if (thing.userId.toString() !== req.auth.userId) {
      return res.status(401).json({ message: 'Utilisateur non autorisé à supprimer ce livre' });
    }

    const filename = thing.imageUrl.split('/images/')[1];

    const imagePath = path.join(imagesPath, filename);

    const fileExists = await fs.promises.access(imagePath).then(() => true).catch(() => false);

    try {
      await fs.promises.unlink(imagePath);
      console.log('Image supprimée avec succès');
    } catch (err) {
      console.error('Erreur lors de la suppression de l’image :', err);

    }

    const result = await Thing.deleteOne({ _id: req.params.id });

    res.status(200).json({ message: 'Livre supprimé avec succès !' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**********************
 * Ajouter une note à un livre
 **********************/
exports.addRating = async (req, res) => {
  try {
    const book = await Thing.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Livre introuvable' });

    const { grade } = req.body;
    if (typeof grade !== 'number' || grade < 0 || grade > 5) {
      return res.status(400).json({ message: 'La note doit être un nombre entre 0 et 5' });
    }

    // Ajouter la note avec l'ID de l'utilisateur
    book.ratings.push({ userId: req.auth.userId, grade });

    // Recalculer la moyenne
    book.averageRating =
      book.ratings.reduce((acc, cur) => acc + cur.grade, 0) / book.ratings.length;

    await book.save();

    res.status(200).json({ message: 'Note ajoutée avec succès !', book });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};