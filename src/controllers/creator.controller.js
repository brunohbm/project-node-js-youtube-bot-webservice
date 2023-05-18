const path = require('path');

const { logActionText, logSuccessText } = require('../helper/log-helper');
const { downloadYoutubeVideo, uploadVideoAndThumbnail } = require('../services/youtube-service');
const { createVideoIntroImage } = require('../services/canvas-service');
const { tinifyImage } = require('../services/tinify-service');
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

async function createVideosWithIntros(videos, type, format, allVideosAndThumbnails) {
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

    const allVideos = await createVideosWithIntros(
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

async function createIntroVideo(thumbnailName, outputName, format, amountSeconds) {
    await createVideoFromImage({
        format,
        outputName,
        addFade: true,
        amountSeconds,
        filename: thumbnailName,
    });

    logSuccessText('thumbnail created!');

    return `${outputName}.${format}`;
}

async function createVideoDescriptionText(title, videoData, initialTime) {
    const breakLine = '\n';
    let description = '0:00 - Intro';
    let videoTimeInSeconds = initialTime;

    let prompt = `
        A short medium description of a youtube video with the theme ${title}, without any 
        personal opinions, this video will contain the trailer, genre, release 
        year, and evaluation of each item ${videoData.map(v => v.name).join(', ')}
    `;

    if (prompt.length > 194) {
        prompt = `A short medium description of a youtube video with the theme ${title}`;
    }

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

async function createVideoThumbnail(thumbnailName) {
    const thumbnailType = thumbnailName.split('.').pop();
    const thumbnailPath = getFilePath(`tinified_thumbnail.${thumbnailType}`);
    await tinifyImage(getFilePath(thumbnailName), thumbnailPath);

    return {
        thumbnailPath,
        thumbnailType: `image/${thumbnailType}`,
    };
}

async function createVideoCompilation(videoData, introTimeInSeconds) {
    const {
        type,
        videos,
        image_name: thumbnailName,
    } = videoData;
    const format = 'webm';
    const videosToCompile = [];
    const finalVideoName = 'final_video';

    logActionText('Downloading videos and creating intro');
    // TODO - Add the posibility to remove seconds from the end and begin of the video
    const videosWithMetadata = await createVideosWithIntros(videos, type, format, []);
    const introVideoPath = await createIntroVideo(thumbnailName, 'thumbnail', format, introTimeInSeconds);
    logSuccessText('Videos downloaded and intros created!');

    videosToCompile.push(introVideoPath);
    videosWithMetadata.forEach(video => { videosToCompile.push(video.descriptionVideoFile, video.mainVideoFile); });
    await mergeVideos([...videosToCompile, '../assets/end_screen.webm'], finalVideoName, format);
    await Promise.all(videosToCompile.map(videoName => deleteFile(getFilePath(videoName))));
    logSuccessText('Main video created!');

    return {
        videosMetadata: videosWithMetadata,
        finalVideoPath: getFilePath(`${finalVideoName}.${format}`),
    };
}

async function createTextFileWithVideoInfo(title, tags, videoDescription) {
    let videoInfoTextFile = `TITLE: ${title.toUpperCase()}\n\n\n\n`;
    videoInfoTextFile += `TAGS: ${tags.join(', ')}\n\n\n\n`;
    videoInfoTextFile += videoDescription;
    await writeFile(getFilePath('video_info.txt'), videoInfoTextFile);
}

async function createAndUploadCompilationVideo(req, res) {
    try {
        const {
            title, tags,
            image_name: thumbnailName,
        } = req.body;
        const introTimeInSeconds = 5;

        const { videosMetadata, finalVideoPath } = await createVideoCompilation(req.body, introTimeInSeconds);
        const { thumbnailPath, thumbnailType } = await createVideoThumbnail(thumbnailName);
        const videoDescription = await createVideoDescriptionText(title, videosMetadata, introTimeInSeconds);
        await createTextFileWithVideoInfo(title, tags, videoDescription);

        await uploadVideoAndThumbnail({
            videoPath: finalVideoPath,
            videoContent: {
                tags,
                description: videoDescription,
                title: title.toUpperCase().trim(),
            },
            thumbnailPath,
            thumbnailType,
        });
        logSuccessText('Video uploaded!');
    } catch (error) {
        const errorMessage = error?.response?.data || error;
        console.info(getErrorText(JSON.stringify(errorMessage)));
        logErrorText('Video upload failed, you will have to upload it manually!');
    }

    res.status(200).json({});
}

module.exports = {
    createAndUploadCompilationVideo,
};
