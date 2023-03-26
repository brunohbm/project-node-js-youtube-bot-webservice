function logAction(text) {
    console.warn('\x1b[45m%s\x1b[0m', `|=>     ${text}     `);
}

module.exports = logAction;
