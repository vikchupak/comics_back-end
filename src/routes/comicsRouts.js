const express = require('express');
const upload = require('../middleware/multer');
const comicsController = require('../controllers/comicsController');

const router = express.Router();

router.get('/', comicsController.comics_get_all);
router.get('/:id', comicsController.comics_get_one);
router.post('/', upload.single('logo'), comicsController.comics_post);
router.put('/:id', upload.single('logo'), comicsController.comics_put);
router.delete('/:id', comicsController.comics_delete);

module.exports = router;
