const { createCanvas } = require('canvas');
const fs = require('fs');
const { breakTextIntoManyLines } = require('../helper/text-helper');

function createCompilationVideoInfo(video, type) {
    const config = {
        leftPadding: 0,
        leftBarWidth: 150,
        canvasWidth: 3840,
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

    const drawTitleAndValue = (title, value) => {
        context.font = `600 80pt ${config.fontFamily}`;
        context.fillText(`${title}:`, config.leftPadding, nextTopPosition, config.maxWidthContent);

        context.font = `80pt ${config.fontFamily}`;
        const titleWidth = context.measureText(`${title}:`).width * 1.2;
        const leftPadding = config.leftPadding + titleWidth;

        context.fillText(value, leftPadding, nextTopPosition, config.maxWidthContent);
    };

    const drawText = text => {
        context.fillText(text, config.leftPadding, nextTopPosition, config.maxWidthContent);
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
        nextTopPosition += 250;
    });

    const descriptionInLines = breakTextIntoManyLines(video.description, config.descriptionLengthLimit);
    context.font = `65pt ${config.fontFamily}`;
    descriptionInLines.forEach(textLine => {
        drawText(textLine);
        nextTopPosition += 88;
    });

    nextTopPosition += 250;

    drawTitleAndValue('Evaluation', video.evaluation);
    nextTopPosition += 125;
    drawTitleAndValue('Release Year', video.releaseYear);
    nextTopPosition += 125;
    drawTitleAndValue('Genre', video.genre);

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(`${__dirname}/../../files/${video.trailerId}_info.png`, buffer);
}

module.exports = {
    createCompilationVideoInfo,
};
