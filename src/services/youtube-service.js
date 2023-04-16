const fs = require('fs');
const path = require('path');
const axios = require('axios');
const youtubeDl = require('youtube-dl-exec');
const { FILES_FOLDER_NAME } = require('../strings');
const { getTokens } = require('./google-service');

async function createTagsFromText(text) {
    const { data } = await axios.get('https://rapidtags.io/api/generator', {
        params: {
            type: 'YouTube',
            query: text,
        },
    });

    return data.tags;
}

async function uploadVideo() {
    const { access_token: token } = await getTokens(['https://www.googleapis.com/auth/youtube']);
    console.log(token);
    const videoFilePath = path.join(__dirname, `../../${FILES_FOLDER_NAME}/`, 'final_video.webm');
    const thumbnailPath = path.join(__dirname, `../../${FILES_FOLDER_NAME}/`, 'thumbnail.png');
    const videoFileSize = fs.statSync(videoFilePath).size;

    const { data: videoData } = await axios.post('https://www.googleapis.com/upload/youtube/v3/videos', {
        part: 'snippet, status',
        notifySubscribers: true,
        requestBody: {
            snippet: {
                title: 'teste',
                description: 'teste',
                defaultLanguage: 'US',
                tags: ['teste', 'teste1'],
            },
            status: {
                privacyStatus: 'unlisted',
            },
        },
        media: {
            body: fs.createReadStream(videoFilePath),
        },
    }, {
        onUploadProgress: event => {
            const progress = Math.round((event.bytesRead / videoFileSize) * 100);
            console.log(progress);
        },
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'video/*',
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
    });

    await axios.post('https://www.googleapis.com/upload/youtube/v3/thumbnails/set', {
        videoId: videoData.id,
        media: {
            mimeType: 'image/jpeg',
            body: fs.createReadStream(thumbnailPath),
        },
    });

    return videoData;
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

async function getVideoFullInfo(videoId) {
    const videoUrl = createVideoUrl(videoId);
    const data = await youtubeDl(videoUrl, {
        noWarnings: true,
        dumpSingleJson: true,
        noCheckCertificates: true,
    });

    return data;
}

async function downloadYoutubeVideo(videoId) {
    const videoUrl = createVideoUrl(videoId);
    const videoValues = await youtubeDl.exec(videoUrl, {
        printJson: true,
        output: path.join(__dirname, `../../${FILES_FOLDER_NAME}/`, videoId),
    });
    const metadata = JSON.parse(videoValues.stdout);

    return {
        ...metadata,
        filename: `${videoId}.${metadata.ext}`,
    };
}

module.exports = {
    uploadVideo,
    createVideoUrl,
    getVideoFullInfo,
    createTagsFromText,
    downloadYoutubeVideo,
    getVideosInfoFromText,
};
