const readline = require('readline-sync');

const QUESTION_TEXT = 'Type your video theme:';

function askVideoTheme() {
    return readline.question(QUESTION_TEXT);
}

module.exports = {
    askVideoTheme,
};