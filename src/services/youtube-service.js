const axios = require('axios');
const ytdl = require('ytdl-core');

async function createTagsFromText(text) {
    const { data } = await axios.get('https://rapidtags.io/api/generator', {
        params: {
            type: 'YouTube',
            query: text,
        },
    });

    return data.tags;
}

async function getVideosInfoFromText(text, params = {}) {
    const { data } = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
            type: 'video',
            part: 'snippet',
            regionCode: 'US',
            chart: 'mostPopular',
            ...params,
            q: text,
            key: process.env.YOUTUBE_API_KEY,
        },
    });

    return data;
}

function createVideoUrl(videoId) {
    return `https://www.youtube.com/watch?v=${videoId}`;
}

function downloadAudio(videoId) {
    return ytdl(
        createVideoUrl(videoId),
        { quality: 'highestaudio', filter: 'audioonly' },
    );
}

function downloadVideo(videoId) {
    return ytdl(
        createVideoUrl(videoId),
        {
            filter: 'videoonly',
            quality: 'highestvideo',
        },
    );
}

module.exports = {
    downloadVideo,
    downloadAudio,
    createVideoUrl,
    createTagsFromText,
    getVideosInfoFromText,
};
