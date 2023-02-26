const _uniq = require('lodash/uniq');

const chatGPTService = require('../services/chat-gpt-service');
const tagService = require('../services/tag-service');

const VIDEO_JSON_CONFIG = {
    name: 'name',
    description: 'big description',
    release_year: 'release year',
    genre: 'genre',
    evaluation: 'evaluation',
};

async function generateContentTags(content) {
    const { theme, videos } = content;

    let tags = videos
        .map(video => video.genre.split(','))
        .flat()
        .map(value => value.trim().toLowerCase());

    tags = _uniq(tags);

    const tagsFromTheme = await tagService.createYoutubeTagsFromText(theme);

    return [
        ...tags,
        ...tagsFromTheme,
    ];
}

async function generateVideosArray(req, res) {
    const { theme } = req.query;
    if (!theme) {
        res.status(400).send('Missing param "theme"');
    }

    const content = {};
    content.theme = theme;
    content.videos = await chatGPTService.createJSONListFromText(theme, VIDEO_JSON_CONFIG);
    content.tags = await generateContentTags(content);

    res.status(200).json(content);
}

module.exports = {
    generateVideosArray,
};
