const express = require('express');

async function startWebservice(port) {
    return new Promise((resolve, reject) => {
        const app = express();
        const server = app.listen(port, () => { resolve({ app, server }); });
    });
}

async function stopWebservice(webservice) {
    return new Promise((resolve, reject) => {
        webservice.server.close(() => { resolve(); });
    });
}

module.exports = {
    stopWebservice,
    startWebservice,
};
