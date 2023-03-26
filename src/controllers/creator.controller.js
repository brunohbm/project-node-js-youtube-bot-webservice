const fs = require('fs');
const path = require('path');
const ytdl = require('ytdl-core');
const logAction = require('../helper/log-helper');

const DOWNLOAD_VIDEO_PATH = './videos';

// TODO - download in 1080p.

async function saveVideo(videoId) {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    const streamDirection = path.join(DOWNLOAD_VIDEO_PATH, `${videoId}.mp4`);
    await ytdl(url).pipe(fs.createWriteStream(streamDirection));
    logAction(`VIDEO: ${videoId} DOWNLOADED!`);
}

async function createAndUploadCompilationVideo(req, res) {
    await saveVideo('kpGo2_d3oYE');

    res.status(200).json();
}

module.exports = {
    createAndUploadCompilationVideo,
};

// 1 - Download youtube videos (see if video time is on return).
// - Download video.
// - Get video time
// 2 - Create video description as image.
// 3 - Join Intro with youtube video and description image.
// 4 - Create video description
// 5 - Upload video
