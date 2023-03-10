const express = require('express');
const youtubeController = require('../controllers/youtube.controller');

const youtubeRouter = express.Router();

youtubeRouter.get('/tags', youtubeController.createTagsFromText);
youtubeRouter.get('/videos', youtubeController.getVideosInfoFromText);

module.exports = youtubeRouter;
