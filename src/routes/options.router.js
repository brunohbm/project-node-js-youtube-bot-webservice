const express = require('express');
const friendsController = require('../controllers/options.controller');

const friendsRouter = express.Router();

friendsRouter.get('/', friendsController.getOptions);

module.exports = friendsRouter;
