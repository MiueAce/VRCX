const { WebRequest } = require('electron');

function onWebRequestBeforeSendHeaders(details, callback) {
    var { requestHeaders } = details;

    requestHeaders['Cache-Control'] = 'no-cache';

    delete requestHeaders['Sec-Fetch-Site'];
    delete requestHeaders['Sec-Fetch-Mode'];
    delete requestHeaders['Sec-Fetch-Dest'];
    delete requestHeaders['Accept-Language'];
    delete requestHeaders['Origin'];

    callback({
        cancel: false,
        requestHeaders,
    });
}

function onWebRequestHeadersReceived(details, callback) {
    var { responseHeaders } = details;

    if ('set-cookie' in responseHeaders) {
        var headers = responseHeaders['set-cookie'];
        for (var i = headers.length - 1; i >= 0; --i) {
            var cookie = headers[i].split(';')[0];
            headers[i] = cookie + '; Path=/; Expires=Thu, 31 Dec 2037 23:55:55 GMT; HttpOnly; Secure; SameSite=None';
        }
    }

    responseHeaders['access-control-allow-origin'] = ['*'];

    callback({
        cancel: false,
        responseHeaders,
    });
}

/** @param {WebRequest} webRequest */
function interceptWebRequest(webRequest) {
    webRequest.onBeforeSendHeaders(
        {
            urls: ['https://api.vrchat.cloud/*', 'wss://pipeline.vrchat.cloud/*'],
        },
        onWebRequestBeforeSendHeaders
    );
    webRequest.onHeadersReceived(
        {
            urls: ['https://api.vrchat.cloud/*'],
        },
        onWebRequestHeadersReceived
    );
}

module.exports = interceptWebRequest;
