function formatSeconds(dateInSeconds) {
    const date = new Date(null);
    date.setSeconds(dateInSeconds);
    return date.toISOString().slice(11, 19);
}

module.exports = {
    formatSeconds,
};
