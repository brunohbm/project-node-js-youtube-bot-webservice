const express = require('express');
const multer = require('multer');

const imageController = require('../controllers/image.controller');

const imageRouter = express.Router();

const upload = multer({
    storage: multer.diskStorage({
        destination(req, file, cb) {
            cb(null, 'files/');
        },
        filename(req, file, cb) {
            const extensaoArquivo = file.originalname.split('.')[1];
            cb(null, `thumbnail.${extensaoArquivo}`);
        },
    }),
});

imageRouter.post('/upload', upload.single('image'), imageController.uploadImage);

module.exports = imageRouter;
