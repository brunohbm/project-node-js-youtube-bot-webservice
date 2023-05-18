const fs = require('fs');
const path = require('path');
const axios = require('axios');
const youtubeDl = require('youtube-dl-exec');
const { FILES_FOLDER_NAME } = require('../strings');
const { getAuthenticatedGoogleInstance } = require('./google-service');
const { logActionText } = require('../helper/log-helper');

async function createTagsFromText(text) {
    try {
        const { data } = await axios.get('https://rapidtags.io/api/generator', {
            params: {
                type: 'YouTube',
                query: text,
            },
        });

        return data.tags;
    } catch (error) {
        return [];
    }
}

async function uploadVideoAndThumbnail(params) {
    const {
        videoPath,
        videoContent,
        thumbnailPath,
        thumbnailType,
    } = params;
    const videoFileSize = fs.statSync(videoPath).size;

    const gooogleAuthClient = await getAuthenticatedGoogleInstance(['https://www.googleapis.com/auth/youtube']);
    const youtubeApi = gooogleAuthClient.youtube({ version: 'v3' });

    // TODO - Check if there isn't a way to add the default lenguage param and the "isn't for kids".
    const videoInsertionParams = {
        part: 'snippet, status',
        requestBody: {
            snippet: videoContent,
            status: {
                privacyStatus: 'unlisted',
            },
        },
        media: {
            body: fs.createReadStream(videoPath),
        },
    };

    const { data: uploadedVideoInfo } = await youtubeApi.videos.insert(videoInsertionParams, {
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        onUploadProgress: event => {
            const progress = Math.round((event.bytesRead / videoFileSize) * 100);
            logActionText(`VIDEO UPLOAD PROGRESS: ${progress}%`);
        },
    });

    await youtubeApi.thumbnails.set({
        videoId: uploadedVideoInfo.id,
        media: {
            mimeType: thumbnailType,
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
    createVideoUrl,
    getVideoFullInfo,
    createTagsFromText,
    downloadYoutubeVideo,
    getVideosInfoFromText,
    uploadVideoAndThumbnail,
};
