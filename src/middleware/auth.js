const config = require('config');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const local_authentication = async (req, res, next) => {
  const token = req.cookies.jwt;

  if (token) {
    const decodedToken = jwt.verify(token, config.get('jwtSecret'));
    const user = await User.findById(decodedToken.id);
    req.appContext = { user };
  }
  next();
};

// double auth check, both local & google
const auth = async (req, res, next) => {
  try {
    // google auth
    const isAuthenticatedByGoogle = req.isAuthenticated(); // req.user

    if (isAuthenticatedByGoogle) {
      return next();
    }

    // local auth
    if (req.appContext) {
      return next();
    }

    res.status(401).json({ message: 'Unauthorized to access data' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

module.exports = {
  auth,
  local_authentication,
};
