const path = require('path');
const readline = require('readline');
const ffmpeg = require('ffmpeg-static');
const childProcess = require('child_process');
const { parseToMB } = require('../helper/parser-helper');
const { downloadAudio, downloadVideo } = require('./youtube-service');
const { getActionText, getErrorText, getSuccessText } = require('../helper/log-helper');

const DOWNLOAD_VIDEO_PATH = './files';
const AUDIO_VIDEO_STREAM_ARGS = [
    // Remove ffmpeg's console spamming
    '-loglevel', '8', '-hide_banner',
    // Set inputs
    '-i', 'pipe:3',
    '-i', 'pipe:4',
    // Map audio & video from streams
    '-map', '0:a',
    '-map', '1:v',
    // Keep encoding
    '-c:v', 'copy',
];
const AUDIO_VIDEO_STREAM_OPTIONS = {
    windowsHide: true,
    stdio: [
        /* Standard: stdin, stdout, stderr */
        'inherit', 'inherit', 'inherit',
        /* Custom: pipe:3, pipe:4 */
        'pipe', 'pipe',
    ],
};

function maskDownloadString({ total, downloaded }, type) {
    const percentage = total ? ((downloaded / total) * 100).toFixed(2) : 0;
    const finalText = getActionText(`${type} DOWNLOAD: ${percentage}% (${parseToMB(downloaded)}MB of ${parseToMB(total)}MB)`);
    return `${finalText}\n`;
}

async function downloadAndMergeYoutubeVideo(videoId) {
    return new Promise((resolve, reject) => {
        const tracker = {
            start: Date.now(),
            audio: { downloaded: 0, total: 0 },
            video: { downloaded: 0, total: 0 },
        };

        // TODO - 2 calls to the function don't console at the same time
        const progressbarHandle = setInterval(() => {
            readline.cursorTo(process.stdout, 0);

            process.stdout.write(`${getActionText(`DOWNLOAD AND MERGE OF VIDEO: ${videoId}`)}\n`);
            process.stdout.write(maskDownloadString(tracker.audio, 'AUDIO'));
            process.stdout.write(maskDownloadString(tracker.video, 'VIDEO'));
            process.stdout.write(`${getActionText(`RUNNING FOR: ${((Date.now() - tracker.start) / 1000 / 60).toFixed(2)} MINUTES`)}\n`);

            readline.moveCursor(process.stdout, 0, -4);
        }, 500);

        const ffmpegProcess = childProcess.spawn(ffmpeg, [
            ...AUDIO_VIDEO_STREAM_ARGS,
            path.join(DOWNLOAD_VIDEO_PATH, `${videoId}.mkv`),
        ], AUDIO_VIDEO_STREAM_OPTIONS);

        ffmpegProcess.on('close', () => {
            process.stdout.write('\n\n\n\n');
            process.stdout.write(`${getSuccessText('PROCESS FINISHED!')}\n`);
            clearInterval(progressbarHandle);
            resolve();
        });

        ffmpegProcess.on('error', error => {
            process.stdout.write('\n\n\n\n');
            process.stdout.write(`${getErrorText('PROCESS FAILED!')}\n`);
            clearInterval(progressbarHandle);
            reject(error);
        });

        downloadAudio(videoId)
            .on('progress', (_, downloaded, total) => { tracker.audio = { downloaded, total }; })
            .pipe(ffmpegProcess.stdio[3]);
        downloadVideo(videoId)
            .on('progress', (_, downloaded, total) => { tracker.video = { downloaded, total }; })
            .pipe(ffmpegProcess.stdio[4]);
    });
}

module.exports = {
    downloadAndMergeYoutubeVideo,
};
