const { google } = require('googleapis');
const express = require('express');

const AUTH_PORT = 5000;

function createOAuthClient() {
    const { OAuth2 } = google.auth;
    const client = new OAuth2(
        process.env.GOOGLE_CREDENCIAL_CLIENT_ID,
        process.env.GOOGLE_CREDENCIAL_CLIENT_SECRET,
        `http://localhost:${AUTH_PORT}/oauth2callback`,
    );

    return client;
}

async function startWebservice() {
    return new Promise((resolve, reject) => {
        const app = express();
        const server = app.listen(AUTH_PORT, () => { resolve({ app, server }); });
    });
}

async function getAuthCode(client, scopes) {
    const webServer = await startWebservice();

    const consentUrl = client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
    });

    const open = await import('open');
    await open.default(consentUrl);

    const authCode = await new Promise((resolve, reject) => {
        webServer.app.get('/oauth2callback', (req, res) => {
            res.send('<h1>Authenticated!</h1>');
            resolve(req.query.code);
        });
    });

    return authCode;
}

async function getTokens(scopes) {
    const client = createOAuthClient();
    const authCode = await getAuthCode(client, scopes);

    const authTokens = await new Promise((resolve, reject) => {
        client.getToken(authCode, (error, tokens) => {
            if (error) return reject(error);
            return resolve(tokens);
        });
    });

    return authTokens;
}

module.exports = {
    getTokens,
};
