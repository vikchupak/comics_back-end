const Publisher = require('../models/Publisher');

const publisher_get_all = async (req, res) => {
  try {
    if (req.query.search === 'true' && req.query.name) {
      const publisher = await Publisher.find({
        name: { $regex: req.query.name, $options: 'i' },
      });
      return res.json({ publisher });
    }

    if (req.query.sort === 'asc') {
      const publishers = await Publisher.find().sort({ name: 1 });
      return res.json(publishers);
    }

    if (req.query.sort === 'desc') {
      const publishers = await Publisher.find().sort({ name: -1 });
      return res.json(publishers);
    }

    const publishers = await Publisher.find();
    res.json(publishers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const publisher_get_one = async (req, res) => {
  try {
    const publisher = await Publisher.findById(req.params.id); // null

    if (!publisher) {
      return res.status(404).json({ message: 'Publisher with such an id not found' });
    }
    res.json({ publisher });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const publisher_post = async (req, res) => {
  try {
    console.log(req);
    const publisher = new Publisher({
      name: req.body.name,
      dateFounded: req.body.dateFounded,
      parantCompany: req.body.parantCompany,
      countryOfOrigin: req.body.countryOfOrigin,
    });

    await publisher.save();

    res.status(201).json({ publisher });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const publisher_put = async (req, res) => {
  try {
    const publisher = await Publisher.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        dateFounded: req.body.dateFounded,
        parantCompany: req.body.parantCompany,
        countryOfOrigin: req.body.countryOfOrigin,
      },
      { new: true }
    );

    if (!publisher) {
      return res.status(404).json({ message: 'Publisher with such an id not found' });
    }

    res.json({ publisher });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const publisher_delete = async (req, res) => {
  try {
    const publisher = await Publisher.findByIdAndDelete(req.params.id);

    if (!publisher) {
      return res.status(404).json({ message: 'Publisher with such an id not found' });
    }
    res.json({ message: 'Publisher deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  publisher_get_all,
  publisher_get_one,
  publisher_post,
  publisher_put,
  publisher_delete,
};
