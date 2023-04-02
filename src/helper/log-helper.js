function getActionText(text) {
    return `\x1b[45m|=>  ${text.toUpperCase()}  \x1b[0m`;
}

function logActionText(text) {
    console.info(getActionText(text));
}

function getErrorText(text) {
    return `\x1b[41m|=>  ${text.toUpperCase()}  \x1b[0m`;
}

function logErrorText(text) {
    console.info(getErrorText(text));
}

function getSuccessText(text) {
    return `\x1b[42m|=>  ${text.toUpperCase()}  \x1b[0m`;
}

function logSuccessText(text) {
    console.info(getSuccessText(text));
}

module.exports = {
    getErrorText,
    logErrorText,
    getActionText,
    logActionText,
    getSuccessText,
    logSuccessText,
};
