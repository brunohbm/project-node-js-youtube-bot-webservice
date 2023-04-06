const path = require('path');
const ffmpeg = require('ffmpeg-static');
const { unlink } = require('node:fs/promises');

const { logActionText, logSuccessText } = require('../helper/log-helper');
const { downloadYoutubeVideo } = require('../services/youtube-service');
const { createVideoIntroImage } = require('../services/canvas-service');
const { createVideoFromImage, mergeVideos } = require('../services/ffmpeg-service');
const { FILES_FOLDER_NAME } = require('../strings');

async function downloadVideo(video) {
    const metadata = await downloadYoutubeVideo(video.trailerId);
    logActionText(`${metadata.filename} downloaded!`);
    return metadata;
}

async function createAndUploadCompilationVideo(req, res) {
    const {
        image_name: thumbnailName,
        videos, title, tags,
        type,
    } = req.body;

    // logActionText('Downloading videos and creating intro');
    // const videosPrommise = videos.map(async video => {
    //     const videoMetadata = await downloadVideo(video);
    //     const introImage = createVideoIntroImage(video, type);
    //     const introVideo = await createVideoFromImage('6', introImage, `${video.trailerId}_intro`, 'webm');
    //     await unlink(path.join(__dirname, `../../${FILES_FOLDER_NAME}/`, introImage));

    //     return {
    //         ...video,
    //         introVideo,
    //         metadata: videoMetadata,
    //     };
    // });
    // const videosWithMetadata = await Promise.all(videosPrommise);
    // const thumbnailVideoName = await createVideoFromImage('6', thumbnailName, 'thumbnail', 'webm');
    // logSuccessText('Videos downloaded and intros created!');

    // TODO - The videos need to have the same codek and format
    await mergeVideos(['c0i88t0Kacs_intro.mp4', 'c0i88t0Kacs.webm'], 'c0i88t0Kacs');

    // console.log(thumbnailVideoName);
    // console.log(videosWithMetadata);

    // IS this the right lib?
    // console.log(ffmpeg);
    // ffmpeg(`${__dirname}../../FILES_FOLDER_NAME/c0i88t0Kacs.webm`)
    //     .videoFilter('-filter_complex xfade=transition=fadeblack:duration=5:offset=0');

    res.status(200).json({});
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
