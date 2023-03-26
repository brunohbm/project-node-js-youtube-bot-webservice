const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const imageController = require('../controllers/image.controller');

const imageRouter = express.Router();

imageRouter.post('/upload', upload.single('image'), imageController.uploadImage);

module.exports = imageRouter;
