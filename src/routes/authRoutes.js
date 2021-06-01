const express = require('express');
const passport = require('passport');
const authController = require('../controllers/authController');
const UserOauth = require('../models/UserOauth');

const router = express.Router();

// ------- local auth -------- //

// /auth/signup
router.post('/signup', authController.auth_signup_post);

// /auth/login
router.post('/login', authController.auth_login_post);

// /auth/local-all
router.get('/local-all', authController.auth_local_all_get);

// ------- google auth -------- //

// /auth/google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// /auth/google/callback
router.get(
  '/google/callback',
  passport.authenticate('google', { failireRedirect: '/auth/login' }),
  (req, res) => {
    // this redirect makes the magic!!!
    // it sets cookies on port:3000, not 5000!!!
    res.redirect(process.env.FRONT_END_DOMAIN);
  }
);

// /auth/google-all
router.get('/google-all', async (req, res) => {
  try {
    const googleUsers = await UserOauth.find();
    res.json(googleUsers);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ------- local & google logout -------- //

// /auth/logout
router.get('/logout', (req, res) => {
  try {
    // google logout
    const isAuthenticatedByGoogle = req.isAuthenticated();
    if (isAuthenticatedByGoogle) {
      req.logOut();
    }
    // local logout
    const token = req.cookies.jwt;
    if (token) {
      res.cookie('jwt', '', { maxAge: 0 });
    }
    res.json({ message: 'Logout successful' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// -------- for init front-end auth render/check ----------- //

// /auth/me

router.get('/me', (req, res) => {
  if (req.user) {
    return res.json({
      email: req.user.email,
      displayName: req.user.displayName,
    });
  }

  if (req.appContext && req.appContext.user) {
    return res.json({
      email: req.appContext.user.email,
      displayName: req.appContext.user.displayName,
    });
  }

  res.status(401).json({ message: 'Unauthorized' });
});

module.exports = router;
