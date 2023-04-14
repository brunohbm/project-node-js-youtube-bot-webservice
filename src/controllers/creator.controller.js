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

async function createVideosAndThumbnails(videos, type, format, allVideosAndThumbnails) {
    const [video] = videos;
    if (!video) return allVideosAndThumbnails;

    const introSeconds = 12;
    const imageVideoName = `${video.trailerId}_intro`;
    const videoWithFadeName = `${video.trailerId}_with_fade`;
    const introImage = createVideoIntroImage(video, type);
    const videoMetadata = await downloadYoutubeVideo(video.trailerId);

    logActionText(`Started ${introImage} intro creation!`);
    await createVideoFromImage({
        format,
        addFade: true,
        filename: introImage,
        outputName: imageVideoName,
        amountSeconds: introSeconds,
    });
    await deleteFile(getFilePath(introImage));
    logSuccessText(`${introImage} intro created!`);

    logActionText(`Started ${introImage} fade adition!`);
    await addFadeInOut({
        format,
        outputName: videoWithFadeName,
        filename: videoMetadata.filename,
        amountSeconds: videoMetadata.duration,
    });
    await deleteFile(getFilePath(videoMetadata.filename));
    logSuccessText(`Fade added to ${videoWithFadeName}!`);

    const allVideos = await createVideosAndThumbnails(
        videos.splice(1, videos.length),
        type,
        format,
        [
            ...allVideosAndThumbnails,
            {
                ...video,
                metadata: videoMetadata,
                mainVideoFile: `${videoWithFadeName}.${format}`,
                duration: videoMetadata.duration + introSeconds,
                descriptionVideoFile: `${imageVideoName}.${format}`,
            },
        ],
    );

    return allVideos;
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

    logSuccessText('thumbnail created!');

    return `${outputName}.${format}`;
}

async function createAndUploadCompilationVideo(req, res) {
    const {
        type,
        videos, title, tags,
        image_name: thumbnailName,
    } = req.body;
    const format = 'webm';

    logActionText('Downloading videos and creating intro');

    // |=>  DOWNLOADING VIDEOS AND CREATING INTRO
    // |=>  INTRO JSRTYPNRON0_INTRO.PNG CREATED!
    // |=>  FADE ADD TO JSRTYPNRON0_WITH_FADE!
    // |=>  INTRO C0I88T0KACS_INTRO.PNG CREATED!
    // |=>  FADE ADD TO C0I88T0KACS_WITH_FADE!
    // |=>  INTRO LX9SPQPJGJU_INTRO.PNG CREATED!
    // |=>  FADE ADD TO LX9SPQPJGJU_WITH_FADE!
    // |=>  INTRO QNDZJ9KZUV4_INTRO.PNG CREATED!

    const videosWithMetadata = await createVideosAndThumbnails(videos, type, format, []);
    const thumbnailVideoName = await createThumbnail(thumbnailName, 'thumbnail', format);

    const videosToCompile = [thumbnailVideoName];
    videosWithMetadata.forEach(videoData => {
        videosToCompile.push(videoData.descriptionVideoFile, videoData.mainVideoFile);
    });

    await mergeVideos([...videosToCompile, '../assets/end_screen.webm'], 'final_video', format);

    await Promise.all(videosToCompile.map(videoName => deleteFile(getFilePath(videoName))));

    logSuccessText('Videos downloaded and intros created!');

    res.status(200).json({});
}

module.exports = {
    createAndUploadCompilationVideo,
};

// 1 - Download youtube videos (see if video time is on return).
// 2 - Create video description as image.
// 3 - Join Intro with youtube video and description image.
// 4 - Create video description
// 5 - Upload video
