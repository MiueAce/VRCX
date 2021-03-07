const { WebRequest } = require('electron');

/** @param {WebRequest} webRequest */
module.exports = function (webRequest) {
    webRequest.onBeforeSendHeaders(
        {
            urls: ['https://api.vrchat.cloud/*', 'wss://pipeline.vrchat.cloud/*'],
        },
        function (details, callback) {
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
    );
    webRequest.onHeadersReceived(
        {
            urls: ['https://api.vrchat.cloud/*'],
        },
        function (details, callback) {
            var { responseHeaders } = details;

            if ('set-cookie' in responseHeaders) {
                var setCookies = responseHeaders['set-cookie'];
                for (var i = setCookies.length - 1; i >= 0; --i) {
                    var cookie = setCookies[i].split(';')[0];
                    setCookies[i] =
                        cookie + '; Path=/; Expires=Thu, 31 Dec 2037 23:55:55 GMT; HttpOnly; Secure; SameSite=None';
                }
            }

            responseHeaders['access-control-allow-origin'] = ['*'];

            callback({
                cancel: false,
                responseHeaders,
            });
        }
    );
};
