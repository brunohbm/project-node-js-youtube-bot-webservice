const { createCanvas } = require('canvas');
const fs = require('fs');

function createImage(type) {
    const post = {
        author: 'Sean C Davis',
        title: 'The Elder Scrolls V: Skyrim',
    };

    const config = {
        canvasWidth: 3840,
        leftBarWidth: 150,
        canvasHeight: 2160,
        maxWidthContent: 0,
        titleLengthLimit: 31,
    };
    config.maxWidthContent = config.canvasWidth - (config.leftBarWidth * 4);
    let nextTopPosition = 400;

    const canvas = createCanvas(config.canvasWidth, config.canvasHeight);
    const context = canvas.getContext('2d');

    context.fillStyle = type.backgroungColor;
    context.fillRect(0, 0, config.canvasWidth, config.canvasHeight);

    context.fillStyle = type.mainColor;
    context.fillRect(0, 0, config.leftBarWidth, config.canvasHeight);

    const drawText = (text, top, maxWidth) => {
        context.font = "bold 150pt 'Sans'";
        context.fillStyle = type.mainColor;
        context.fillText(text, config.leftBarWidth * 2, top, maxWidth);
    };

    const words = post.title.trim().split(' ').reduce((allWords, word) => {
        const totalAmount = allWords.length;
        const lastWordIndex = totalAmount ? totalAmount - 1 : 0;
        const lastWord = allWords[lastWordIndex];

        if (lastWord.length >= config.titleLengthLimit) return [...allWords, word];

        const newArray = [...allWords];
        newArray[lastWordIndex] = `${lastWord} ${word}`.trim();
        return newArray;
    }, ['']);

    words.forEach(word => {
        drawText(word, nextTopPosition, config.maxWidthContent);
        nextTopPosition += 250;
    });

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(`${__dirname}/../../files/image.png`, buffer);
}

module.exports = {
    createImage,
};
