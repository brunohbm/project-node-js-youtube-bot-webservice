const path = require('path');

const { logActionText, logSuccessText } = require('../helper/log-helper');
const { downloadYoutubeVideo, uploadVideoAndThumbnail } = require('../services/youtube-service');
const { createVideoIntroImage } = require('../services/canvas-service');
const { createVideoFromImage, mergeVideos, addFadeInOut } = require('../services/ffmpeg-service');
const { FILES_FOLDER_NAME } = require('../strings');
const { deleteFile, writeFile } = require('../helper/file-helper');
const { fetchContentFromChatGPT } = require('../services/chat-gpt-service');
const { formatSeconds } = require('../helper/date-helper');
const { logErrorText } = require('../helper/log-helper');
const { getErrorText } = require('../helper/log-helper');

function getFilePath(filename) {
    return path.join(__dirname, `../../${FILES_FOLDER_NAME}/`, filename);
}

async function createVideosAndThumbnails(videos, type, format, allVideosAndThumbnails) {
    const [video] = videos;
    if (!video) return allVideosAndThumbnails;

    const introSeconds = 9;
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

async function createThumbnail(thumbnailName, outputName, format, amountSeconds) {
    await createVideoFromImage({
        format,
        outputName,
        addFade: true,
        amountSeconds,
        filename: thumbnailName,
    });
    await deleteFile(getFilePath(thumbnailName));

    logSuccessText('thumbnail created!');

    return `${outputName}.${format}`;
}

async function createVideoDescription(title, videoData, initialTime) {
    const breakLine = '\n';
    let description = `0:00 - Intro${breakLine}`;
    let videoTimeInSeconds = initialTime;

    const prompt = `
        A short medium description of a youtube video with the theme ${title}, without any 
        personal opinions, this video will contain the trailer, genre, release 
        year, and evaluation of each item. The items will be ${videoData.map(v => v.name).join(', ')}
    `;
    const intro = await fetchContentFromChatGPT(prompt);
    description += `${intro.replace('5\n', '')}${breakLine}`;

    videoData.forEach(video => {
        description += breakLine;
        description += `${formatSeconds(videoTimeInSeconds)} - ${video.name}`;
        description += (breakLine + breakLine);
        description += `Description: ${video.description}${breakLine}`;
        description += `Genre(s): ${video.genre}${breakLine}`;
        description += `Release Year: ${video.releaseYear}${breakLine}`;
        description += `Evaluation: ${video.evaluation}${breakLine}`;
        description += `Original video: https://www.youtube.com/watch?v=${video.trailerId}${breakLine}`;
        videoTimeInSeconds += video.duration;
    });

    return description;
}

async function createAndUploadCompilationVideo(req, res) {
    const {
        type,
        videos, title, tags,
        image_name: thumbnailName,
    } = req.body;
    const format = 'webm';
    const finalVideoName = 'final_video';
    const introTimeInSeconds = 5;
    logActionText('Downloading videos and creating intro');

    const videosWithMetadata = await createVideosAndThumbnails(videos, type, format, []);
    const thumbnailVideoName = await createThumbnail(thumbnailName, 'thumbnail', format, introTimeInSeconds);
    logSuccessText('Videos downloaded and intros created!');

    const videosToCompile = [thumbnailVideoName];
    videosWithMetadata.forEach(videoData => {
        videosToCompile.push(videoData.descriptionVideoFile, videoData.mainVideoFile);
    });

    await mergeVideos([...videosToCompile, '../assets/end_screen.webm'], finalVideoName, format);
    logSuccessText('Main video created!');

    const thumbnailType = `image/${thumbnailName.split('.').pop()}`;
    const description = await createVideoDescription(title, videosWithMetadata, introTimeInSeconds);

    try {
        await uploadVideoAndThumbnail({
            videoPath: getFilePath(`${finalVideoName}.${format}`),
            videoContent: {
                tags,
                title,
                description,
            },
            thumbnailType,
            thumbnailPath: getFilePath(thumbnailName),
        });
        await Promise.all(videosToCompile.map(videoName => deleteFile(getFilePath(videoName))));
        logSuccessText('Video uploaded!');
    } catch (error) {
        let videoInfoTextFile = `TITLE: ${title}\n\n\n\n`;
        videoInfoTextFile += `TAGS: ${tags.join(', ')}\n\n\n\n`;
        videoInfoTextFile += description;

        await writeFile(getFilePath('video_info.txt'), videoInfoTextFile);

        console.info(getErrorText(JSON.stringify(error.response.data)));
        logErrorText('Video upload failed, you will have to upload it manually!');
    }

    res.status(200).json({});
}

module.exports = {
    createAndUploadCompilationVideo,
};
