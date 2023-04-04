const ffmpeg = require('ffmpeg-static');

const { logActionText, logSuccessText } = require('../helper/log-helper');
const { downloadYoutubeVideo } = require('../services/youtube-service');
const { createCompilationVideoInfo } = require('../services/canvas-service');

async function downloadVideo(video) {
    const metadata = await downloadYoutubeVideo(video.trailerId);
    logActionText(`${metadata.filename} downloaded!`);
    return { ...video, metadata };
}

async function createAndUploadCompilationVideo(req, res) {
    const {
        banner_id: bannerId,
        videos, title, tags,
        type,
    } = req.body;

    // logActionText('starting videos download');
    // const videosWithMetadata = await Promise.all(videos.map(downloadVideo));
    // logSuccessText('videos downloaded!');

    // logActionText('Creating info images');
    // videos.forEach(video => { createCompilationVideoInfo(video, type); });
    // logSuccessText('info images created!');

    // TODO - Merge videos and get start and finish time of each one.
    // IS this the right lib?
    // console.log(ffmpeg);
    // ffmpeg(`${__dirname}../../files/c0i88t0Kacs.webm`)
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
