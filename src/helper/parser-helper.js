function parseToMB(value) {
    if (!value) return 0;
    return (value / 1024 / 1024).toFixed(2);
}

module.exports = {
    parseToMB,
};
