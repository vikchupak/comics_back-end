const users = [];

// (socketId, email, username, room)

// Join user to chat
function userJoin(id, username, room) {
  const existingUser = users.find(
    (user) => user.room === room && user.username === username && user.id === id
  );
  const user = { id, username, room };

  if (!existingUser) {
    users.push(user);
  }

  return user;
}

// Get current user
function getCurrentUser(id) {
  return users.find((user) => user.id === id);
}

// User leaves chat
function userLeave(id) {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

// Get room users
function getRoomUsers(room) {
  return users.filter((user) => user.room === room);
}

module.exports = {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
};
