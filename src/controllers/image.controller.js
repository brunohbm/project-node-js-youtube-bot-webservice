async function uploadImage(req, res) {
    res.status(200).json({ filename: req.file.filename });
}

module.exports = {
    uploadImage,
};
