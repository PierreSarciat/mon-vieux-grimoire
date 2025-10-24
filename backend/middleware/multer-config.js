const multer = require('multer');

const MIME_TYPES = {  //dictionnaire MIME_TYPES
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

const storage = multer.diskStorage({//objet de configuration pour multer
  destination: (req, file, callback) => {//premier argument
    callback(null, 'images');
  },
  filename: (req, file, callback) => {//deuxième argument
    const name = file.originalname.split(' ').join('_');
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + '.' + extension);
  }
});

module.exports = multer({storage: storage}).single('image');