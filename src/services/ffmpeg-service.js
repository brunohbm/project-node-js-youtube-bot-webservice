const path = require('path');
const ffmpeg = require('ffmpeg-static');
const childProcess = require('child_process');
const { FILES_FOLDER_NAME } = require('../strings');

const DOWNLOAD_VIDEO_PATH = `./${FILES_FOLDER_NAME}`;

const AUDIO_VIDEO_STREAM_OPTIONS = {
    windowsHide: true,
};

async function createVideoFromImage(amountSeconds, filename, outputName, format) {
    return new Promise((resolve, reject) => {
        const videoName = `${outputName}.${format}`;
        const ffmpegProcess = childProcess.spawn(ffmpeg, [
            '-loop', '1', '-framerate', '1', '-t', amountSeconds, '-i', `${DOWNLOAD_VIDEO_PATH}/${filename}`,
            path.join(DOWNLOAD_VIDEO_PATH, videoName),
        ], AUDIO_VIDEO_STREAM_OPTIONS);

        ffmpegProcess.on('close', () => { resolve(videoName); });
        ffmpegProcess.on('error', error => { reject(error); });
    });
}

async function mergeVideos(filesNames, outputName) {
    return new Promise((resolve, reject) => {
        const videoName = `${outputName}.mp4`;
        const videosToMerge = filesNames.map(filename => `${DOWNLOAD_VIDEO_PATH}/${filename}`).join('|');

        const ffmpegProcess = childProcess.spawn(ffmpeg, [
            //     '-i', 'concat:./src/services/c0i88t0Kacs.webm', '-c', 'copy',
            '-f', 'concat', '-safe', '0', '-i', 'src/services/merge.txt', '-c', 'copy',
            'mergedVideo.webm',
        ], AUDIO_VIDEO_STREAM_OPTIONS);

        ffmpegProcess.on('close', () => {
            resolve(videoName);
        });
    });
}

module.exports = {
    mergeVideos,
    createVideoFromImage,
};
