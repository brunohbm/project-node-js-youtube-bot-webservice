const model = require('../models/options.model');

function getOptions(req, res) {
    res.status(200).json(model);
}

module.exports = {
    getOptions,
};
