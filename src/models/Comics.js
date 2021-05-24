const { Schema, model } = require('mongoose');

const comicsSchema = new Schema(
  {
    imageUrl: String,
    badge: String,
    publisher: { type: Schema.Types.ObjectId, ref: 'Publisher' },
    title: { type: String, required: true, unique: true },
    reviewCount: Number,
    rating: Number,
    characters: [{ type: Schema.Types.ObjectId, ref: 'Character' }],
  },
  { timestamps: true }
);

const Comics = model('Comics', comicsSchema);

module.exports = Comics;
