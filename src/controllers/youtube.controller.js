const youtubeService = require('../services/youtube-service');

async function createTagsFromText(req, res) {
    const { text } = req.query;
    if (!text) {
        res.status(400).send('Missing param "text"');
    }

    const tags = await youtubeService.createTagsFromText(text);

    res.status(200).json(tags);
}

async function getVideosInfoFromText(req, res) {
    const { text } = req.query;
    if (!text) {
        res.status(400).send('Missing param "text"');
    }

    const videos = await youtubeService.getVideosInfoFromText(text);

    res.status(200).json(videos);
}
module.exports = {
    createTagsFromText,
    getVideosInfoFromText,
};
