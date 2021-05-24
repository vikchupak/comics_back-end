const Character = require('../models/Character');

const character_get_all = async (req, res) => {
  try {
    const characters = await Character.find().sort({ nickname: 1 });
    res.json(characters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const character_get_one = async (req, res) => {
  try {
    const character = await Character.findById(req.params.id); // null

    if (!character) {
      return res.status(404).json({ message: 'Character with such an id not found' });
    }
    res.json({ character });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const character_post = async (req, res) => {
  try {
    const character = new Character({
      // eslint-disable-next-line no-underscore-dangle
      // _id: req.body._id,
      nickname: req.body.nickname,
      // image: `http://localhost:5000/${req.file.path}`,
      description: req.body.description,
      superpowers: req.body.superpowers,
      // role: req.body.role,
    });

    await character.save();

    res.status(201).json({ character });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const character_put = async (req, res) => {
  try {
    const character = await Character.findByIdAndUpdate(
      req.params.id,
      {
        nickname: req.body.nickname,
        // image: `http://localhost:5000/${req.file.path}`,
        description: req.body.description,
        superpowers: req.body.superpowers,
      },
      { new: true }
    );

    if (!character) {
      return res.status(404).json({ message: 'Character with such an id not found' });
    }

    res.json({ character });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const character_delete = async (req, res) => {
  try {
    const character = await Character.findByIdAndDelete(req.params.id);

    if (!character) {
      return res.status(404).json({ message: 'Character with such an id not found' });
    }
    res.json({ message: 'Character deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  character_get_all,
  character_get_one,
  character_post,
  character_put,
  character_delete,
};
