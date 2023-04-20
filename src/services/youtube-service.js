const fs = require('fs');
const path = require('path');
const axios = require('axios');
const youtubeDl = require('youtube-dl-exec');
const { FILES_FOLDER_NAME } = require('../strings');
const { getAuthenticatedGoogleInstance } = require('./google-service');
const { logActionText } = require('../helper/log-helper');

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
    const gooogleAuthClient = await getAuthenticatedGoogleInstance(['https://www.googleapis.com/auth/youtube']);
    const youtubeApi = gooogleAuthClient.youtube({ version: 'v3' });

    const videoFilePath = path.join(__dirname, `../../${FILES_FOLDER_NAME}/`, 'final_video.webm');
    const thumbnailPath = path.join(__dirname, `../../${FILES_FOLDER_NAME}/`, 'thumbnail.png');
    const videoFileSize = fs.statSync(videoFilePath).size;

    const videoInsertionParams = {
        part: 'snippet, status',
        requestBody: {
            snippet: {
                title: 'Um título muito bonito Um título muito bonito',
                description: 'Um título muito bonitoUm título muito bonitoUm título muito bonitoUm título muito bonitoUm título muito bonito',
                tags: ['título', 'bonito', 'video', 'testes', 'aqui_tess'],
            },
            status: {
                privacyStatus: 'unlisted',
            },
        },
        media: {
            body: fs.createReadStream(videoFilePath),
        },
    };

    const { data: uploadedVideoInfo } = await youtubeApi.videos.insert(videoInsertionParams, {
        onUploadProgress: event => {
            const progress = Math.round((event.bytesRead / videoFileSize) * 100);
            logActionText(`UPLOADING VIDEO ${progress}%`);
        },
    });

    await youtubeApi.thumbnails.set({
        videoId: uploadedVideoInfo.id,
        media: {
            mimeType: 'image/png',
            body: fs.createReadStream(thumbnailPath),
        },
    });
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
