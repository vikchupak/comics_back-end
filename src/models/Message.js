const { Schema, model } = require('mongoose');

const messageSchema = new Schema({
  author: {
    email: { type: String, required: true },
    displayName: String,
  },
  time: Date, // це робитимуть сокети
  type: { type: String, required: true },
  data: {
    text: String,
    emoji: String,
    url: String,
    fileName: String,
  },
  chatRoom: String,
});

const Message = model('Message', messageSchema);

module.exports = Message;
