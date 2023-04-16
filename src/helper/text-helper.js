function breakTextIntoManyLines(fullText, lengthLimit) {
    const wordsArray = String(fullText).trim().split(' ');

    const textWithLineBreak = wordsArray.reduce((textLines, word) => {
        const linesAmount = textLines.length;
        const lastLineIndex = linesAmount ? (linesAmount - 1) : 0;
        const lastLine = textLines[lastLineIndex];

        if (lastLine.length >= lengthLimit) return [...textLines, word];

        const newArray = [...textLines];
        newArray[lastLineIndex] = `${lastLine} ${word}`.trim();
        return newArray;
    }, ['']);

    return textWithLineBreak;
}

module.exports = {
    breakTextIntoManyLines,
};
