const mongoose = require('mongoose');

const thingSchema = mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  author: { type: String, required: true },
  imageUrl: { type: String, required: true },
  year: { type: Number, required: true },
  genre: { type: String, required: true },
 ratings: {
    type: [
      {
        userId: { type: String, required: true },
        grade: { type: Number, required: true }
      }
    ],
    default: []
  },
  averageRating: { type: Number, default: 0 }
});

module.exports = mongoose.model('Thing', thingSchema);
