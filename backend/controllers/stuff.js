const Thing = require('../models/thing');
const path = require('path');
const fs = require('fs');
// Définir le chemin absolu vers le dossier images
/*const imagesPath = path.join(__dirname, '..', '..', 'src', 'images');*/

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
    // Si un fichier image a été envoyé, on reconstruit l'objet avec la nouvelle image
    const thingObject = req.file
      ? {
        ...JSON.parse(req.body.thing),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
      }
      : { ...req.body };

    // Supprimer les champs sensibles
    delete thingObject._userId;

    // Vérifier que le livre existe
    const thing = await Thing.findOne({ _id: req.params.id });
    if (!thing) {
      return res.status(404).json({ message: "L'être est en effet, mais le néant n'est pas: livre introuvable" });
    }

    // Vérifier que l'utilisateur connecté est bien le créateur
    if (thing.userId.toString() !== req.auth.userId) {
      return res.status(401).json({ message: 'Es-tu le gardien de la Porte ? ' });
    }

    // Mise à jour du livre

    // Met à jour uniquement les champs modifiables, sans inclure _id

    await Thing.updateOne(
      { _id: req.params.id }, // filtre pour trouver le document
      thingObject             // contient uniquement les champs à modifier
    );


    res.status(200).json({ message: 'Livre modifié avec succès !' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error });
  }
};


/********************** * Supprimer un livre **********************/

exports.deleteThing = async (req, res) => {
  try {
    // On récupère le livre dans la base
    const thing = await Thing.findOne({ _id: req.params.id });

    if (!thing) {
      return res.status(404).json({
        message: "L'être est, et le Non-Être n'est pas: livre introuvable"
      });
    }

    // Vérifier que l'utilisateur est bien le créateur
    if (thing.userId.toString() !== req.auth.userId) {
      return res.status(401).json({ message: 'Es-tu le gardien de la Porte ?' });
    }

    // Récupérer le nom du fichier depuis l'URL
    const filename = thing.imageUrl.split('/images/')[1];
    const imagePath = path.join(imagesPath, filename);

    // Supprimer le fichier image
    await fs.promises.unlink(imagePath).catch(err => {
      console.error('Erreur lors de la suppression de l’image :', err);
    });

    // Supprimer le livre de la base
    await Thing.deleteOne({ _id: req.params.id });

    res.status(200).json({ message: 'Livre supprimé avec succès !' });

  } catch (error) {
    console.error(error);
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
