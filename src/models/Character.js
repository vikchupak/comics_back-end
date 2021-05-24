const { Schema, model } = require('mongoose');

const characterSchema = new Schema(
  {
    nickname: { type: String, required: true, unique: true },
    description: { type: String },
    superpowers: [{ type: String }],
  },
  { timestamps: true }
);

const Character = model('Character', characterSchema);

module.exports = Character;
