const { Schema, model } = require('mongoose');

const userDataSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  avatar: String,
  firstName: String,
  lastName: String,
  reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
});

const UserData = model('UserData', userDataSchema);

module.exports = UserData;
