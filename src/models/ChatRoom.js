const { Schema, model } = require('mongoose');

const chatRoomSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    messageHistory: [{ type: Schema.Types.ObjectId, ref: 'Message' }],
  }
  //   { timestamps: true }
);

const ChatRoom = model('ChatRoom', chatRoomSchema);

module.exports = ChatRoom;
