const express = require('express');

const generatorController = require('../controllers/generator.controller');

const generatorRouter = express.Router();

generatorRouter.get('/video-compilation', generatorController.generateVideosArray);

module.exports = generatorRouter;
