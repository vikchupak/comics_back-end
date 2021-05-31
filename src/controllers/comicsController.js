const mongoose = require('mongoose');
const Comics = require('../models/Comics');

const comics_get_all = async (req, res) => {
  try {
    const { title, character, publisher, sort } = req.query;

    const page = parseInt(req.query.page, 10) || 1; // +req.query.page
    const size = parseInt(req.query.size, 10) || 8;

    const filterOptions = {};

    if (character) {
      const characters = req.query.character.split(',');
      filterOptions.characters = { $in: characters.map(mongoose.Types.ObjectId) };
    }

    if (publisher) {
      const publishers = req.query.publisher.split(',');
      filterOptions.publisher = { $in: publishers.map(mongoose.Types.ObjectId) };
    }

    if (title) {
      filterOptions.title = { $regex: title, $options: 'i' };
    }

    // default desc order by rating. More popular first
    // reviewCount: -1; // More reviewable first
    let sortOptions = { reviewCount: -1, title: 1 };

    if (sort) {
      sortOptions = { [sort]: -1, title: 1 };
    }

    const comics = await Comics
      // 1 filtering
      .find(filterOptions)
      // 2 sorting
      .sort(sortOptions) // title/rating/reviews=популярність
      // 3 pagination
      .skip((page - 1) * size)
      .limit(size)
      // 4 population
      .populate('characters', 'nickname') // { _id: 0, nickname: 1 }
      .populate('publisher', 'name');

    const filteredComicsCount = await Comics.countDocuments(filterOptions);

    const totalPageCount = Math.ceil(filteredComicsCount / size);

    const result = {
      page,
      size,
      totalPageCount,
      comicsFound: filteredComicsCount,
      comics,
    };

    if (page > 1) {
      result.previous = page - 1;
    }

    if (filteredComicsCount - page * size > 0) {
      result.next = page + 1;
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const comics_get_one = async (req, res) => {
  try {
    const comics = await Comics.findById(req.params.id).populate('characters'); // null

    if (!comics) {
      return res.status(404).json({ message: 'Comics with such an id not found' });
    }
    res.json({ comics });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const comics_post = async (req, res) => {
  console.log(req.body);
  try {
    const comics = new Comics({
      imageUrl: req.body.imageUrl,
      // logo: `http://localhost:5000/${req.file.path}`,
      badge: req.body.badge,
      publisher: req.body.publisher,
      title: req.body.title,
      reviewCount: req.body.reviewCount,
      rating: req.body.rating,
      // characters: req.body.characters,
    });

    await comics.save();

    res.status(201).json({ comics });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const comics_put = async (req, res) => {
  try {
    const comics = await Comics.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        logo: `${process.env.BACK_END_DOMAIN}/${req.file.path}`,
        publisher: req.body.publisher,
        author: req.body.author,
        characters: req.body.characters,
        rating: req.body.rating,
      },
      { new: true }
    );

    if (!comics) {
      return res.status(404).json({ message: 'Comics with such an id not found' });
    }

    res.json({ comics });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const comics_delete = async (req, res) => {
  try {
    const comics = await Comics.findByIdAndDelete(req.params.id);

    if (!comics) {
      return res.status(404).json({ message: 'Comics with such an id not found' });
    }
    res.json({ message: 'Comics deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  comics_get_all,
  comics_get_one,
  comics_post,
  comics_put,
  comics_delete,
};
