const path = require('path');
const ffmpeg = require('ffmpeg-static');
const childProcess = require('child_process');
const { FILES_FOLDER_NAME } = require('../strings');

const DOWNLOAD_VIDEO_PATH = `./${FILES_FOLDER_NAME}`;

const AUDIO_VIDEO_STREAM_OPTIONS = {
    windowsHide: true,
};

async function createVideoMp4FromImage(amountSeconds, filename, outputName) {
    return new Promise((resolve, reject) => {
        const videoName = `${outputName}.mp4`;
        const ffmpegProcess = childProcess.spawn(ffmpeg, [
            '-loop', '1', '-framerate', '1', '-t', amountSeconds, '-i', `${DOWNLOAD_VIDEO_PATH}/${filename}`,
            path.join(DOWNLOAD_VIDEO_PATH, videoName),
        ], AUDIO_VIDEO_STREAM_OPTIONS);

        ffmpegProcess.on('close', () => { resolve(videoName); });
        ffmpegProcess.on('error', error => { reject(error); });
    });
}

module.exports = {
    createVideoMp4FromImage,
};
