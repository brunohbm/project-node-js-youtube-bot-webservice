const express = require('express');
const multer = require('multer');

const upload = multer({ dest: 'files/' });

const imageController = require('../controllers/image.controller');

const imageRouter = express.Router();

imageRouter.post('/files', upload.single('image'), imageController.uploadImage);

module.exports = imageRouter;
