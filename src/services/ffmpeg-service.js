const path = require('path');
const ffmpeg = require('ffmpeg-static');
const childProcess = require('child_process');
const { FILES_FOLDER_NAME } = require('../strings');
const { writeFile, deleteFile } = require('../helper/file-helper');
const { logInfoText } = require('../helper/log-helper');

const FILES_PATH = `./${FILES_FOLDER_NAME}`;

async function executeFfmpegCommands(commands) {
    logInfoText('ffmpeg process started!');
    await new Promise((resolve, reject) => {
        const ffmpegProcess = childProcess.spawn(ffmpeg, commands, { windowsHide: true });
        ffmpegProcess.on('close', () => { resolve(); });
        ffmpegProcess.on('error', error => { reject(error); });
        ffmpegProcess.stderr.on('data', data => {
            const output = data.toString();
            process.stdout.write(`\x1b[34m ${output} \x1b[0m`);
        });
    });
    logInfoText('ffmpeg process finished!');
}

async function addFadeInOut({
    outputName,
    amountSeconds,
    format, filename,
}) {
    const commands = [
        '-i', `${FILES_PATH}/${filename}`,
        '-vf', `fade=t=in:st=0:d=1.3,fade=t=out:st=${amountSeconds - 1.5}:d=1.3`,
        '-c:a', 'copy', '-y', path.join(FILES_PATH, `${outputName}.${format}`),
    ];

    await executeFfmpegCommands(commands);
}

async function createVideoFromImage({
    format, addFade,
    filename, outputName,
    amountSeconds, frameRate = '30',
}) {
    const commands = [
        '-loop', '1', '-framerate', frameRate, '-t',
        amountSeconds, '-i', `${FILES_PATH}/${filename}`,
        '-f', 'lavfi', '-i', 'anullsrc=r=44100',
        '-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p',
        '-auto-alt-ref', '0', '-c:a', 'libopus', '-shortest',
    ];

    if (addFade) {
        commands.push('-vf', `fade=t=in:st=0:d=1.3,fade=t=out:st=${amountSeconds - 1.5}:d=1.3`);
    }

    commands.push(path.join(FILES_PATH, `${outputName}.${format}`));

    await executeFfmpegCommands(commands);
}

async function mergeVideos(filesNames, outputName, format) {
    const videoName = `${outputName}.${format}`;
    const textFileLocation = `${FILES_PATH}/videosToMerge.txt`;
    const videosToMergeText = filesNames.map(filename => `file '${filename}'`).join('\n');

    await writeFile(textFileLocation, videosToMergeText);
    await executeFfmpegCommands([
        '-f', 'concat', '-safe', '0', '-i', textFileLocation, '-c', 'copy',
        '-y', path.join(FILES_PATH, videoName),
    ]);
    await deleteFile(textFileLocation);
}

module.exports = {
    mergeVideos,
    addFadeInOut,
    createVideoFromImage,
};
