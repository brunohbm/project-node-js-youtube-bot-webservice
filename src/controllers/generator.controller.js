const _uniq = require('lodash/uniq');

const chatGPTService = require('../services/chat-gpt-service');
const youtubeService = require('../services/youtube-service');

const VIDEO_JSON_CONFIG = {
    name: 'name',
    genre: 'genre',
    evaluation: 'evaluation',
    releaseYear: 'release year',
    description: 'big description',
};

async function getVideosTags(videos) {
    try {
        const tagsFromVideos = await Promise.all(videos.map(async ({ trailerId }) => {
            if (!trailerId) return [];

            const { tags: videoTags } = await youtubeService.getVideoFullInfo(trailerId);
            return videoTags;
        }));

        return tagsFromVideos;
    } catch (error) {
        return [];
    }
}

async function generateContentTags(content) {
    const { theme, videos } = content;

    let tags = videos
        .map(video => video.genre.split(','))
        .flat()
        .map(value => value.trim().toLowerCase());

    tags = _uniq(tags);

    const tagsFromVideos = await getVideosTags(videos);
    const tagsFromTheme = await youtubeService.createTagsFromText(theme);

    return [
        ...videos.map(video => video.name),
        ...tags,
        ...tagsFromVideos.flat(),
        ...tagsFromTheme,
    ].slice(0, 30);
}

async function addVideosTrailerLink(videos) {
    try {
        const videosPrommise = videos.map(async video => {
            const newVideo = { ...video };
            const { items } = await youtubeService.getVideosInfoFromText(`${video.name} trailer`);
            const { id: { videoId } } = items[0];
            newVideo.trailerId = videoId;

            return newVideo;
        });

        const allVideosTrailers = await Promise.all(videosPrommise);
        return allVideosTrailers;
    } catch (error) {
        return videos;
    }
}

async function generateVideosArray(req, res) {
    const { theme } = req.query;
    if (!theme) {
        res.status(400).send('Missing param "theme"');
    }

    const content = {};
    content.theme = theme;
    content.videos = await chatGPTService.createJSONListFromText(theme, VIDEO_JSON_CONFIG);
    content.videos = await addVideosTrailerLink(content.videos);
    content.tags = await generateContentTags(content);

    res.status(200).json(content);
}

module.exports = {
    generateVideosArray,
};
