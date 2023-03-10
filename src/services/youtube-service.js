const axios = require('axios');

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

module.exports = {
    createTagsFromText,
    getVideosInfoFromText,
};
