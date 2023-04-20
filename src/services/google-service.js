const { google } = require('googleapis');
const { startWebservice, stopWebservice } = require('./express-service');

const AUTH_PORT = 5000;

function createOAuthClient() {
    const { OAuth2 } = google.auth;
    const oAuthClient = new OAuth2(
        process.env.GOOGLE_CREDENCIAL_CLIENT_ID,
        process.env.GOOGLE_CREDENCIAL_CLIENT_SECRET,
        `http://localhost:${AUTH_PORT}/oauth2callback`,
    );

    return oAuthClient;
}

async function getAuthCode(oAuthClient, scopes) {
    const webServer = await startWebservice(AUTH_PORT);

    const consentUrl = oAuthClient.generateAuthUrl({
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

    await stopWebservice(webServer);

    return authCode;
}

async function getTokens(scopes, oAuthClient) {
    const authCode = await getAuthCode(oAuthClient, scopes);

    const authTokens = await new Promise((resolve, reject) => {
        oAuthClient.getToken(authCode, (error, tokens) => {
            if (error) return reject(error);
            return resolve(tokens);
        });
    });

    return authTokens;
}

async function getAuthenticatedGoogleInstance(scopes) {
    const oAuthClient = createOAuthClient();

    const authTokens = await getTokens(scopes, oAuthClient);
    oAuthClient.setCredentials(authTokens);

    google.options({ auth: oAuthClient });

    return google;
}

module.exports = {
    getAuthenticatedGoogleInstance,
};
