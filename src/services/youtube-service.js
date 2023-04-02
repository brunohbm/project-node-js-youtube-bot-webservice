const axios = require('axios');
const youtubeDl = require('youtube-dl-exec');

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

async function downloadYoutubeVideo(videoId) {
    const videoUrl = createVideoUrl(videoId);
    const videoValues = await youtubeDl.exec(videoUrl, {
        output: `${__dirname}/../../files/${videoId}`,
        printJson: true,
        embedSubs: true,
    });
    const metadata = JSON.parse(videoValues.stdout);

    return {
        ...metadata,
        filename: `${videoId}.${metadata.ext}`,
    };
}

module.exports = {
    createVideoUrl,
    createTagsFromText,
    downloadYoutubeVideo,
    getVideosInfoFromText,
};
