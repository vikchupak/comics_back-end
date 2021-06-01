const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth_signup_post = async (req, res) => {
  try {
    const { email, password, displayName } = req.body;

    const candidate = await User.findOne({ email });

    if (candidate) {
      return res.status(400).json({ message: 'Such a user already exists' });
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({ email, password: hashedPassword, displayName });

    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET /* , { expiresIn: '1h' } */);

    res.cookie('jwt', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year in milliseconds // or null possible
      SameSite: 'none',
      secure: true,
    });

    res.status(201).json({
      email: user.email,
      displayName: user.displayName,
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

const auth_login_post = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Such a user not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Password is wrong' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET /* , { expiresIn: '1h' } */);

    res.cookie('jwt', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1year in milliseconds // or null possible
      SameSite: 'none',
      secure: true,
    });

    res.json({
      email: user.email,
      displayName: user.displayName,
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// /auth/local-all
const auth_local_all_get = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

module.exports = {
  auth_signup_post,
  auth_login_post,
  auth_local_all_get,
};
