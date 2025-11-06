const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

// Dossier de destination
const imagesDir = path.join(__dirname, '../images');

// Multer avec stockage en mémoire 
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Middleware de compression Sharp
const compressImage = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const name = path.parse(req.file.originalname).name.replace(/\s+/g, '_');
    const filename = `${name}_${Date.now()}.webp`;
    const filepath = path.join(imagesDir, filename);

    // Compression & conversion
    await sharp(req.file.buffer)
      .webp({ quality: 60 }) 
      .toFile(filepath);

    // Mise à jour des infos de fichier 
    req.file.filename = filename;
    req.file.path = `images/${filename}`;
    req.file.mimetype = 'image/webp';

    next();
  } catch (err) {
    console.error('Erreur Sharp :', err);
    res.status(500).json({ message: "Erreur lors du traitement de l'image." });
  }
};

// Export des deux middlewares à chaîner dans les routes
module.exports = { upload, compressImage };
