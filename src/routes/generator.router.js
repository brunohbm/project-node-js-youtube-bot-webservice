const express = require('express');

const generatorController = require('../controllers/generator.controller');

const generatorRouter = express.Router();

generatorRouter.get('/', generatorController.generateVideosArray);

module.exports = generatorRouter;
