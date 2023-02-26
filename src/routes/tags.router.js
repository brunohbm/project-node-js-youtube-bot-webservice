const express = require('express');
const tagsController = require('../controllers/tags.controller');

const tagsRouter = express.Router();

tagsRouter.get('/', tagsController.createTagsFromText);

module.exports = tagsRouter;
