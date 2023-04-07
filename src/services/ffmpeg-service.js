const path = require('path');
const ffmpeg = require('ffmpeg-static');
const childProcess = require('child_process');
const { FILES_FOLDER_NAME } = require('../strings');
const { writeFile, deleteFile } = require('../helper/file-helper');

const FILES_PATH = `./${FILES_FOLDER_NAME}`;

const AUDIO_VIDEO_STREAM_OPTIONS = {
    windowsHide: true,
};

async function createVideoFromImage(amountSeconds, filename, outputName, format) {
    return new Promise((resolve, reject) => {
        const videoName = `${outputName}.${format}`;
        const ffmpegProcess = childProcess.spawn(ffmpeg, [
            '-loop', '1', '-framerate', '1', '-t', amountSeconds, '-i', `${FILES_PATH}/${filename}`,
            path.join(FILES_PATH, videoName),
        ], AUDIO_VIDEO_STREAM_OPTIONS);

        ffmpegProcess.on('close', () => { resolve(videoName); });
        ffmpegProcess.on('error', error => { reject(error); });
    });
}

async function mergeVideos(filesNames, outputName, format) {
    const videoName = `${outputName}.${format}`;
    const textFileLocation = `${FILES_PATH}/videosToMerge.txt`;
    const videosToMergeText = filesNames.map(filename => `file '${filename}'`).join('\n');

    // await writeFile(textFileLocation, videosToMergeText);
    // '-f', 'concat', '-safe', '0', '-i', textFileLocation, '-c', 'copy',

    // I'm having a problem that the first intro video doesn't have audio and don't have a sutitle.
    // And when merging the video, that is a problem.

    await new Promise((resolve, reject) => {
        const ffmpegProcess = childProcess.spawn(ffmpeg, [
            '-i', './files/c0i88t0Kacs_intro.webm',
            '-i', './files/c0i88t0Kacs.webm',
            '-map', '0:v',
            '-map', '1:v',
            '-c:v', 'copy',
            '-c:a', 'aac',
            '-y', path.join(FILES_PATH, videoName),
        ], AUDIO_VIDEO_STREAM_OPTIONS);

        ffmpegProcess.on('close', () => { resolve(videoName); });
        ffmpegProcess.on('error', error => { reject(error); });
    });

    // ffmpeg -i ./files/c0i88t0Kacs_intro.webm -i ./files/c0i88t0Kacs.webm -filter_complex "[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1[v][a]" -map "[v]" -map "[a]" -c:v copy -c:a aac -shortest output.mp4

    // await deleteFile(textFileLocation);
}

module.exports = {
    mergeVideos,
    createVideoFromImage,
};
