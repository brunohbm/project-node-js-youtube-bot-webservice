const axios = require('axios');

async function createYoutubeTagsFromText(text) {
    const { data } = await axios.get('https://rapidtags.io/api/generator', {
        params: {
            type: 'YouTube',
            query: text,
        },
    });

    return data.tags;
}

module.exports = {
    createYoutubeTagsFromText,
};
