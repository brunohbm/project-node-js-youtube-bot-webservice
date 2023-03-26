const { getErrorText } = require('../helper/log-helper');
const { downloadAndMergeYoutubeVideo } = require('../services/ffmpeg-service');

async function createAndUploadCompilationVideo(req, res) {
    const { videos } = req.body;
    await Promise.all([
        downloadAndMergeYoutubeVideo(videos[2].trailerId),
        downloadAndMergeYoutubeVideo(videos[3].trailerId),
    ]);

    // await downloadAndMergeYoutubeVideo(videos[0].trailerId);
    // await downloadAndMergeYoutubeVideo(videos[1].trailerId);
    // await downloadAndMergeYoutubeVideo(videos[4].trailerId);

    // TODO
    console.log(getErrorText('Fix error MinigetError: Status code: 410 on videos 0,1,4!'));

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
