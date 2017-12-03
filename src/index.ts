const express = require('express');
const {startBot} = require('./start_bot');
const proxy = require('express-http-proxy');

const app = express();
startServer();

async function startServer() {
    // Static website
    app.use(express.static('./public'));

    // Bot webhooks redirect
    const {pathToFetchFrom, urlToRedirectTo} = await startBot();
    app.use(pathToFetchFrom, proxy(urlToRedirectTo));

    const listener = app.listen(process.env.PORT, function () {
        console.log('Your app is listening on port ' + listener.address().port);
    });
}
