const tagService = require('../services/tag-service');

async function createTagsFromText(req, res) {
    const { theme } = req.query;
    if (!theme) {
        res.status(400).send('Missing param "theme"');
    }

    const tags = await tagService.createYoutubeTagsFromText(theme);

    res.status(200).json(tags);
}

module.exports = {
    createTagsFromText,
};
