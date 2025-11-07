const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const { upload, compressImage } = require('../middleware/multer-config');
const stuffCtrl = require('../controllers/stuff');

// route pour les livres les mieux notés
router.get('/bestrating', stuffCtrl.getBestRatedBooks);


// Routes CRUD
router.get('/', stuffCtrl.getAllThings);
router.post('/', auth, upload.single('image'), compressImage, stuffCtrl.createThing);
router.get('/:id', stuffCtrl.getOneThing);
router.put('/:id', auth, upload.single('image'), compressImage, stuffCtrl.modifyThing);
router.delete('/:id', auth, stuffCtrl.deleteThing);

// Ajouter une note
router.post('/:id/grade', auth, stuffCtrl.addRating);

module.exports = router;
