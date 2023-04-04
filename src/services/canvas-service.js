const { createCanvas } = require('canvas');
const fs = require('fs');
const { breakTextIntoManyLines } = require('../helper/text-helper');

function createImage(video, type) {
    const config = {
        leftPadding: 0,
        canvasWidth: 3840,
        leftBarWidth: 150,
        canvasHeight: 2160,
        maxWidthContent: 0,
        nameLengthLimit: 31,
        fontColor: '#ffffff',
        fontFamily: "'Sans'",
        backgroundColor: '#091118',
        descriptionLengthLimit: 80,
    };
    config.maxWidthContent = config.canvasWidth - (config.leftBarWidth * 4);
    config.leftPadding = config.leftBarWidth * 2;
    let nextTopPosition = 400;

    const canvas = createCanvas(config.canvasWidth, config.canvasHeight);
    const context = canvas.getContext('2d');

    context.fillStyle = config.backgroundColor;
    context.fillRect(0, 0, config.canvasWidth, config.canvasHeight);

    context.fillStyle = type.primaryColor;
    context.fillRect(0, 0, config.leftBarWidth, config.canvasHeight);

    context.fillStyle = config.fontColor;

    const nameTextInLines = breakTextIntoManyLines(video.name, config.nameLengthLimit);
    nameTextInLines.forEach(textLine => {
        context.font = `bold 150pt ${config.fontFamily}`;
        context.fillText(textLine, config.leftPadding, nextTopPosition, config.maxWidthContent);
        nextTopPosition += 250;
    });

    const descriptionInLines = breakTextIntoManyLines(video.description, config.descriptionLengthLimit);
    descriptionInLines.forEach(textLine => {
        context.font = `65pt ${config.fontFamily}`;
        context.fillText(textLine, config.leftPadding, nextTopPosition, config.maxWidthContent);
        nextTopPosition += 88;
    });

    nextTopPosition += 250;

    const drawTitleAndValue = (title, value) => {
        context.font = `600 80pt ${config.fontFamily}`;
        context.fillText(`${title}:`, config.leftPadding, nextTopPosition, config.maxWidthContent);

        context.font = `80pt ${config.fontFamily}`;
        const titleWidth = context.measureText(`${title}:`).width * 1.2;
        const leftPadding = config.leftPadding + titleWidth;

        context.fillText(value, leftPadding, nextTopPosition, config.maxWidthContent);
    };

    drawTitleAndValue('Evaluation', video.evaluation);
    nextTopPosition += 125;
    drawTitleAndValue('Release Year', video.releaseYear);
    nextTopPosition += 125;
    drawTitleAndValue('Genre', video.genre);

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(`${__dirname}/../../files/${video.trailerId}_info.png`, buffer);
}

module.exports = {
    createImage,
};
