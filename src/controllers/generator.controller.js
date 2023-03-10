const _uniq = require('lodash/uniq');

const chatGPTService = require('../services/chat-gpt-service');
const youtubeService = require('../services/youtube-service');

const VIDEO_JSON_CONFIG = {
    name: 'name',
    genre: 'genre',
    evaluation: 'evaluation',
    release_year: 'release year',
    description: 'big description',
};

async function generateContentTags(content) {
    const { theme, videos } = content;

    let tags = videos
        .map(video => video.genre.split(','))
        .flat()
        .map(value => value.trim().toLowerCase());

    tags = _uniq(tags);

    const tagsFromTheme = await youtubeService.createTagsFromText(theme);

    return [
        ...tags,
        ...tagsFromTheme,
    ];
}

async function addVideosTrailerLink(videos) {
    const videosPrommise = videos.map(async video => {
        const newVideo = { ...video };
        const { items } = await youtubeService.getVideosInfoFromText(`${video.name} trailer`);
        const { id } = items[0];
        newVideo.trailerId = id.videoId;

        return newVideo;
    });

    const allVideosTrailers = await Promise.all(videosPrommise);
    return allVideosTrailers;
}

// TODO - test this function
async function oderVideosByEvaluationAsc(videos) {
    return videos.sort((videoA, videoB) => videoA.evaluation - videoB.evaluation);
}

async function generateVideosArray(req, res) {
    const { theme } = req.query;
    if (!theme) {
        res.status(400).send('Missing param "theme"');
    }

    const content = {};
    content.theme = theme;
    content.videos = await chatGPTService.createJSONListFromText(theme, VIDEO_JSON_CONFIG);
    content.videos = oderVideosByEvaluationAsc(content.videos);
    content.tags = await generateContentTags(content);
    content.videos = await addVideosTrailerLink(content.videos);

    res.status(200).json(content);
}

module.exports = {
    generateVideosArray,
};
