const textBotService = require('../services/text-bot');

async function generateVideosArray(req, res) {
    const { theme } = req.query;
    if (!theme) {
        res.status(400).send('Missing param "theme"');
    }

    const content = {};
    content.videoTheme = theme;
    content.list = await textBotService.createListFromText(content.videoTheme);

    res.status(200).json(content);
}

module.exports = {
    generateVideosArray,
};
