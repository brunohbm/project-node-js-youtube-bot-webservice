const express = require('express');

const creatorController = require('../controllers/creator.controller');

const creatorRouter = express.Router();

creatorRouter.post('/compilation-video', creatorController.createAndUploadCompilationVideo);

module.exports = creatorRouter;
