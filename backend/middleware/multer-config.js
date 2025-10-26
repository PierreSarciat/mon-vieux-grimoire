const multer = require('multer');
const path = require('path');


const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

// Définir le chemin vers le dossier images dans src
const imagesDir = path.join(__dirname, '../../src/images');


const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, imagesDir);
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_');
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + '.' + extension);
  }
});

module.exports = multer({ storage }).single('image');
