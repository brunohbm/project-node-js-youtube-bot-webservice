const { createCanvas } = require('canvas');
const fs = require('fs');
const { breakTextIntoManyLines } = require('../helper/text-helper');
const { FILES_FOLDER_NAME } = require('../strings');

function createVideoIntroImage(video, type) {
    const config = {
        leftPadding: 0,
        leftBarWidth: 150,
        canvasWidth: 3840,
        canvasHeight: 2160,
        maxWidthContent: 0,
        nameLengthLimit: 31,
        fontColor: '#ffffff',
        fontFamily: "'Sans'",
        bigTextSpacement: 250,
        titleValueLengthLimit: 66,
        backgroundColor: '#091118',
        descriptionLengthLimit: 80,
        descriptionTextSpacement: 125,
    };
    config.maxWidthContent = config.canvasWidth - (config.leftBarWidth * 4);
    config.leftPadding = config.leftBarWidth * 2;
    let nextTopPosition = 400;

    const canvas = createCanvas(config.canvasWidth, config.canvasHeight);
    const context = canvas.getContext('2d');

    const drawText = text => {
        context.fillText(text, config.leftPadding, nextTopPosition, config.maxWidthContent);
    };

    const drawTitleAndValue = (title, value) => {
        const formattedTitle = `${title}:`;

        context.font = `600 80pt ${config.fontFamily}`;
        context.fillText(formattedTitle, config.leftPadding, nextTopPosition, config.maxWidthContent);

        context.font = `80pt ${config.fontFamily}`;
        const titleWidth = context.measureText(formattedTitle).width * 1.2;
        const leftPadding = config.leftPadding + titleWidth;

        const firstLineLimit = config.titleValueLengthLimit - formattedTitle.length;
        const [firstLine, ...restOfLines] = breakTextIntoManyLines(value, firstLineLimit);
        context.fillText(firstLine, leftPadding, nextTopPosition, (config.maxWidthContent - titleWidth));

        if (restOfLines.length) {
            const linesAfterFirstOne = breakTextIntoManyLines(restOfLines.join(' '), config.titleValueLengthLimit);
            linesAfterFirstOne.forEach(textLine => {
                nextTopPosition += config.descriptionTextSpacement;
                drawText(textLine);
            });
        }
    };

    context.fillStyle = config.backgroundColor;
    context.fillRect(0, 0, config.canvasWidth, config.canvasHeight);

    context.fillStyle = type.primaryColor;
    context.fillRect(0, 0, config.leftBarWidth, config.canvasHeight);

    context.fillStyle = config.fontColor;

    const nameTextInLines = breakTextIntoManyLines(video.name, config.nameLengthLimit);
    context.font = `bold 150pt ${config.fontFamily}`;
    nameTextInLines.forEach(textLine => {
        drawText(textLine);
        nextTopPosition += config.bigTextSpacement;
    });

    const descriptionInLines = breakTextIntoManyLines(video.description, config.descriptionLengthLimit);
    context.font = `65pt ${config.fontFamily}`;
    descriptionInLines.forEach(textLine => {
        drawText(textLine);
        nextTopPosition += 88;
    });

    nextTopPosition += config.bigTextSpacement;

    drawTitleAndValue('Evaluation', video.evaluation);
    nextTopPosition += config.descriptionTextSpacement;
    drawTitleAndValue('Release Year', video.releaseYear);
    nextTopPosition += config.descriptionTextSpacement;
    drawTitleAndValue('Genre', video.genre);

    const buffer = canvas.toBuffer('image/png');
    const filename = `${video.trailerId}_intro.png`;
    fs.writeFileSync(`${__dirname}/../../${FILES_FOLDER_NAME}/${filename}`, buffer);
    return filename;
}

module.exports = {
    createVideoIntroImage,
};
