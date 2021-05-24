const express = require('express');
const publisherController = require('../controllers/publisherController');

const router = express.Router();

router.get('/', publisherController.publisher_get_all);
router.get('/:id', publisherController.publisher_get_one);
router.post('/', publisherController.publisher_post);
router.put('/:id', publisherController.publisher_put);
router.delete('/:id', publisherController.publisher_delete);

module.exports = router;
