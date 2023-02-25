const textBotService = require('../services/text-bot');

async function generateVideosArray(req, res) {
    const content = {};
    content.videoTheme = req.param.theme;
    content.list = await textBotService.createListFromText(content.videoTheme);

    res.status(200).json(content);
}

module.exports = {
    generateVideosArray,
};