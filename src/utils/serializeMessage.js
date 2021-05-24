function serializeMessage(author, type, data, chatRoom) {
  return {
    author,
    time: new Date(),
    type,
    data,
    chatRoom,
  };
}

module.exports = serializeMessage;
