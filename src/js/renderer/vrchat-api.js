const axios = require('axios');
const { dispatchEvent } = require('../common/event-bus.js');

var apiKey_ = '';

var axios_ = axios.create({
    baseURL: 'https://api.vrchat.cloud/api/1/',
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
    },
    onUploadProgress: function (progressEvent) {
        console.log('onUploadProgress', progressEvent);
    },
    validateStatus: null,
});

function setApiKey(apiKey) {
    apiKey_ = apiKey;
}

async function callApi(options) {
    var { status, data } = await axios_(options);
    console.log('callApi', { options, status, data });

    // {"error":{"message":"\"Missing Credentials\"","status_code":401}}

    // 403 (BAN)
    // {"data": {"reason":"","expires":"","target":""}}

    if (status !== 200) {
        var message = null;
        if (data === Object(data) && 'error' in data) {
            var { error } = data;
            if ('code' in data) {
                status = parseInt(data.code, 10);
                message = error;
            } else if ('message' in error) {
                status = parseInt(error.status_code, 10);
                message = error.message;
                try {
                    var json = JSON.parse(error.message);
                    if (json === Object(json)) {
                        if ('message' in json) {
                            message = json.message;
                        }
                    } else {
                        message = json;
                    }
                } catch (err) {}
            }
        }
        if (message === null) {
            if (status === 420 || status === 429) {
                message =
                    "(Rate Limit) Okay, okay, whatever you're trying to do, we did it already, now hold off for a second please.";
            } else if (status === 401 || status === 403) {
                message = "You're not allowed to do that.";
            } else if (status === 500) {
                message = 'A server error has occurred!';
            } else {
                message = 'An unknown error occurred';
            }
        }
        dispatchEvent('vrchat-api:error', { status, message });
    }

    return data;
}

async function getRemoteConfig() {
    var json = await callApi({
        url: 'config',
        method: 'get',
    });
    return json;
}

async function getAuth() {
    return await callApi({
        url: 'auth',
        params: {
            apiKey: apiKey_,
        },
    });
}

async function login(username, password) {
    return await callApi({
        url: 'auth/user',
        method: 'get',
        params: {
            apiKey: this.apiKey,
        },
        auth: {
            username,
            password,
        },
        maxRedirects: 0,
    });
}

async function logout() {
    return await callApi({
        url: 'logout',
        method: 'put',
        params: {
            apiKey: apiKey_,
        },
    });
}

async function verifyTotpCode(code) {
    return await callApi({
        url: 'auth/twofactorauth/totp/verify',
        method: 'post',
        params: {
            apiKey: this.apiKey,
        },
        data: {
            code,
        },
    });
}

async function verifyOtpCode(code) {
    return await callApi({
        url: 'auth/twofactorauth/otp/verify',
        method: 'post',
        params: {
            apiKey: this.apiKey,
        },
        data: {
            code,
        },
    });
}

async function getCurrentUser() {
    return await callApi({
        url: 'auth/user',
        method: 'get',
        params: {
            apiKey: apiKey_,
        },
    });
}

module.exports = {
    setApiKey,
    getRemoteConfig,
    getAuth,
    login,
    logout,
    verifyTotpCode,
    verifyOtpCode,
    getCurrentUser,
};
