const tinify = require('tinify');

tinify.key = process.env.TINIFY_API_KEY;

async function tinifyImage(imagePath, outputPath) {
    await tinify.fromFile(imagePath).toFile(outputPath);
}

module.exports = {
    tinifyImage,
};
