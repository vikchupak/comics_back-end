const express = require('express');
const userController = require('../controllers/userController');
const upload = require('../middleware/multer');

const router = express.Router();

router.get('/', userController.user_get_all);
router.get('/:id', userController.user_get_one);
router.post('/', upload.single('avatar'), userController.user_post);
router.put('/:id', upload.single('avatar'), userController.user_put);
router.delete('/:id', userController.user_delete);

module.exports = router;
