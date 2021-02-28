module.exports = function(webRequest) {
    var filter = {
        urls: ['https://api.vrchat.cloud/*'],
    };

    webRequest.onBeforeSendHeaders(filter, function(details, callback) {
        var { requestHeaders } = details;

        requestHeaders['Cache-Control'] = 'no-cache';

        callback({
            cancel: false,
            requestHeaders,
        });
    });

    webRequest.onHeadersReceived(filter, function(details, callback) {
        var { responseHeaders } = details;

        if ('set-cookie' in responseHeaders) {
            var setCookies = responseHeaders['set-cookie'];
            for (var i = setCookies.length - 1; i >= 0; --i) {
                setCookies[i] = setCookies[i].replace(/; SameSite=(Strict|Lax)/gi, '') + '; SameSite=None';
            }
        }

        responseHeaders['access-control-allow-origin'] = ['*'];

        callback({
            cancel: false,
            responseHeaders,
        });
    });
};
