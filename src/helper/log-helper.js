function getActionText(text) {
    return `\x1b[45m|=>  ${text}\x1b[0m`;
}

function getErrorText(text) {
    return `\x1b[41m|=>  ${text}\x1b[0m`;
}

function getSuccessText(text) {
    return `\x1b[42m|=>  ${text}\x1b[0m`;
}

module.exports = {
    getErrorText,
    getActionText,
    getSuccessText,
};
