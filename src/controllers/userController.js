const User = require('../models/User');

const user_get_all = async (req, res) => {
  try {
    if (req.query.search === 'true' && req.query.firstName) {
      const user = await User.find({
        firstName: { $regex: req.query.firstName, $options: 'i' },
      }); // substring search
      return res.json({ user });
    }

    if (req.query.sort === 'asc') {
      const user = await User.find().sort({ firstName: 1 });
      return res.json({ user });
    }

    if (req.query.sort === 'desc') {
      const user = await User.find().sort({ firstName: -1 });
      return res.json({ user });
    }

    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const user_get_one = async (req, res) => {
  try {
    const user = await User.findById(req.params.id); // null

    if (!user) {
      return res.status(404).json({ message: 'User with such an id not found' });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const user_post = async (req, res) => {
  try {
    console.log(req.body);
    const user = new User({
      avatar: `http://localhost:5000/${req.file.path}`,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      credentials: req.body.credentials,
    });

    await user.save();

    res.status(201).json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT - fully overwrite a model, PATCH - just modifies a field of a model
const user_put = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        image: `http://localhost:5000/${req.file.path}`,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User with such an id not found' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const user_delete = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User with such an id not found' });
    }
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  user_get_all,
  user_get_one,
  user_post,
  user_put,
  user_delete,
};
