const path = require('path');

const { logActionText, logSuccessText } = require('../helper/log-helper');
const { downloadYoutubeVideo } = require('../services/youtube-service');
const { createVideoIntroImage } = require('../services/canvas-service');
const { createVideoFromImage, mergeVideos, addFadeInOut } = require('../services/ffmpeg-service');
const { FILES_FOLDER_NAME } = require('../strings');
const { deleteFile } = require('../helper/file-helper');

function getFilePath(filename) {
    return path.join(__dirname, `../../${FILES_FOLDER_NAME}/`, filename);
}

async function createVideo(video, type, format) {
    const introSeconds = 12;
    const imageVideoName = `${video.trailerId}_intro`;
    const videoWithFadeName = `${video.trailerId}_with_fade`;
    const introImage = createVideoIntroImage(video, type);
    const videoMetadata = await downloadYoutubeVideo(video.trailerId);

    await createVideoFromImage({
        format,
        addFade: true,
        filename: introImage,
        outputName: imageVideoName,
        amountSeconds: introSeconds,
    });
    await addFadeInOut({
        format,
        outputName: videoWithFadeName,
        filename: videoMetadata.filename,
        amountSeconds: videoMetadata.duration,
    });

    const imageVideoFile = `${imageVideoName}.${format}`;
    const videoWithFadeFile = `${videoWithFadeName}.${format}`;
    const finalVideoName = `${video.trailerId}_final`;
    await mergeVideos([imageVideoFile, videoWithFadeFile], finalVideoName, format);

    await deleteFile(getFilePath(introImage));
    await deleteFile(getFilePath(videoMetadata.filename));
    await deleteFile(getFilePath(imageVideoFile));
    await deleteFile(getFilePath(videoWithFadeFile));

    logActionText(`${finalVideoName} created!`);

    return {
        ...video,
        metadata: videoMetadata,
        filename: `${finalVideoName}.${format}`,
        duration: videoMetadata.duration + introSeconds,
    };
}

async function createThumbnail(thumbnailName, outputName, format) {
    await createVideoFromImage({
        format,
        outputName,
        addFade: true,
        amountSeconds: 6,
        filename: thumbnailName,
    });
    await deleteFile(getFilePath(thumbnailName));

    logActionText('thumbnail created!');

    return `${thumbnailName}.${format}`;
}

async function createAndUploadCompilationVideo(req, res) {
    const {
        type,
        videos, title, tags,
        image_name: thumbnailName,
    } = req.body;
    const format = 'webm';

    logActionText('Downloading videos and creating intro');

    const videosWithMetadata = await Promise.all(videos.map(video => createVideo(video, type, format)));
    const thumbnailVideoName = await createThumbnail(thumbnailName, 'thumbnail', format);

    const compilatedVideos = [thumbnailVideoName, ...videosWithMetadata.map(({ filename }) => filename)];
    await mergeVideos([...compilatedVideos, 'end_screen.webm'], 'final_video', format);

    await Promise.all(compilatedVideos.map(videoName => deleteFile(getFilePath(videoName))));

    logSuccessText('Videos downloaded and intros created!');

    res.status(200).json({});
}

module.exports = {
    createAndUploadCompilationVideo,
};

// 1 - Download youtube videos (see if video time is on return).
// - Merge videos
// 2 - Create video description as image.
// 3 - Join Intro with youtube video and description image.
// 4 - Create video description
// 5 - Upload video
