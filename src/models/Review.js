const { Schema, model } = require('mongoose');

const reviewSchema = new Schema(
  {
    userData: { type: Schema.Types.ObjectId, ref: 'UserData' },
    comics: { type: Schema.Types.ObjectId, ref: 'Comics' },
    content: { type: String },
  },
  { timestamps: true }
);

const Review = model('Review', reviewSchema);

module.exports = Review;
