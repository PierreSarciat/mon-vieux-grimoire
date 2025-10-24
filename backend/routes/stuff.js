const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const stuffCtrl = require('../controllers/stuff');

// Routes CRUD sécurisées
router.get('/', auth, stuffCtrl.getAllThings);
router.post('/', auth, multer, stuffCtrl.createThing);
router.get('/:id', auth, stuffCtrl.getOneThing);
router.put('/:id', auth, multer, stuffCtrl.modifyThing);
router.delete('/:id', auth, stuffCtrl.deleteThing);

// Route pour ajouter une note à un livre
router.post('/:id/rating', auth, stuffCtrl.addRating);

module.exports = router;
