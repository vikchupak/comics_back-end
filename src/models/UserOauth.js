const { Schema, model } = require('mongoose');

const userOauthSchema = new Schema({
  googleId: { type: String, required: true },
  email: { type: String, required: true },
  displayName: { type: String, required: true }, // firstName + lastName
  image: String,
});

const UserOauth = model('UserOauth', userOauthSchema);

module.exports = UserOauth;
