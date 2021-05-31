const jsonwebtoken = require('jsonwebtoken');
const User = require('../models/User');

const localAuthenticationMiddleware = async (req, res, next) => {
  const token = req.cookies.jwt;

  if (token) {
    try {
      let user;
      // decoding jwt failere possible => error.message: jwt malformed
      const decodedToken = jsonwebtoken.verify(token, process.env.JWT_SECRET);

      if (decodedToken) {
        // user not found (null) possible
        user = await User.findById(decodedToken.id);
      }

      if (user) {
        req.appContext = { user };
      }
    } catch (e) {
      console.log('error: ', e.message);
    }
  }
  // test appContext.user not exist // block scheme // test coverage
  next();
};

// double auth check, both local & google
const isAuthenticatedMiddleware = async (req, res, next) => {
  try {
    // google auth
    const isAuthenticatedByGoogle = req.isAuthenticated(); // req.user

    if (isAuthenticatedByGoogle) {
      return next(); // return important here
    }

    // local auth // null safety ?.
    if (req.appContext && req.appContext.user) {
      return next(); // return important here
    }

    res.status(401).json({ message: 'Unauthorized to access data' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

module.exports = {
  isAuthenticatedMiddleware,
  localAuthenticationMiddleware,
};
