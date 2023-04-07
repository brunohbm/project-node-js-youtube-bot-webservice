const fs = require('fs');

async function writeFile(location, content) {
    await new Promise((resolve, reject) => {
        fs.writeFile(
            location,
            content,
            {},
            err => {
                if (err) reject(err);
                resolve();
            },
        );
    });
}

async function deleteFile(filePath) {
    await new Promise((resolve, reject) => {
        fs.unlink(
            filePath,
            err => {
                if (err) reject(err);
                resolve();
            },
        );
    });
}

module.exports = {
    writeFile,
    deleteFile,
};
