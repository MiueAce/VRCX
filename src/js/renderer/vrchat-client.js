const { ref, watch } = require('vue');
const { dispatchEvent } = require('../common/event-bus.js');
const api = require('./vrchat-api.js');

/** @type {?WebSocket} */
var webSocket_ = null;

var refIsLoggedIn_ = ref(false);
var refRemoteConfig_ = ref({});
var refCurrentUser_ = ref({});
var refFriends_ = ref([]);
var refUsers_ = ref({});

var isCheckingWebSocket_ = false;
var isPollingCurrentUser_ = false;
var currentUserPollTime_ = 0;

function onLogin() {
    console.log('onLogin');

    dispatchEvent('vrchat-client:login');
}

function onLogout() {
    console.log('onLogout');

    refCurrentUser_.value = {};
    refFriends_.value = [];

    closeWebSocket();

    dispatchEvent('vrchat-client:logout');
}

function updateFriends() {
    var prevFriends = new Set(refFriends_.value);

    refFriends_.value = refCurrentUser_.value?.friends ?? [];

    var currentFriends = new Set(refFriends_.value);

    var removedFriends = [];

    for (var userId of prevFriends) {
        if (currentFriends.has(userId) === false) {
            removedFriends.push(userId);
        }
    }

    var addedFriends = [];

    for (var userId of currentFriends) {
        if (prevFriends.has(userId) === false) {
            addedFriends.push(userId);
        }
    }

    console.log('updateFriends', addedFriends, removedFriends);
}

function applyCurrentUser(json) {
    // {"error":{"message":"\"Missing Credentials\"","status_code":401}}
    // {"error":{"message":"\"Invalid Username or Password\"","status_code":401}}
    // {"requiresTwoFactorAuth":["totp","otp"]}

    if ('error' in json) {
        if (json.error.status_code === 401) {
            refIsLoggedIn_.value = false;
        }
        return json;
    }

    if ('requiresTwoFactorAuth' in json) {
        refIsLoggedIn_.value = false;
        return json;
    }

    refIsLoggedIn_.value = true;

    var currentUser = refCurrentUser_.value;

    // apply
    for (var key in json) {
        currentUser[key] = json[key];
    }

    console.log('applyCurrentUser', currentUser);

    updateFriends();
}

async function getRemoteConfig() {
    var json = await api.getRemoteConfig();

    if ('clientApiKey' in json) {
        api.setApiKey(json.clientApiKey);
    }

    refRemoteConfig_.value = json;

    return json;
}

async function login(username, password) {
    var json = await api.login(username, password);

    currentUserPollTime_ = Date.now();

    applyCurrentUser(json);

    return json;
}

async function logout() {
    var json = await api.logout();

    // {"error":{"message":"\"Missing Credentials\"","status_code":401}}
    // {"success":{"message":"Ok!","status_code":200}}

    refIsLoggedIn_.value = false;

    return json;
}

async function verifyTotpCode(code) {
    var json = await api.verifyTotpCode(code);

    // {"verified":true}

    if ('verified' in json) {
        refIsLoggedIn_.value = true;
    }

    return json;
}

async function getCurrentUser() {
    var json = await api.getCurrentUser();

    currentUserPollTime_ = Date.now();

    applyCurrentUser(json);

    return json;
}

function closeWebSocket() {
    var webSocket = webSocket_;
    if (webSocket === null) {
        return;
    }

    webSocket_ = null;

    try {
        webSocket.close();
    } catch (err) {
        console.error(err);
    }
}

function onWebSocketError(event) {
    console.log('websocket error', event);

    if (webSocket_ === this) {
        webSocket_ = null;
    }

    try {
        this.close();
    } catch (err) {
        console.error(err);
    }
}

function onWebSocketClose(event) {
    console.log('websocket close', event);

    if (webSocket_ === this) {
        webSocket_ = null;
    }
}

function onWebSocketOpen(event) {
    console.log('websocket open', event);
}

function handleWebSocketNotification(json) {
    console.log('handleWebSocketNotification', json);
}

function handleWebSocketFriendAdd(json) {
    console.log('handleWebSocketFriendAdd', json);
}

function handleWebSocketFriendDelete(json) {
    console.log('handleWebSocketFriendDelete', json);
}

function handleWebSocketFriendOnline(json) {
    console.log('handleWebSocketFriendOnline', json);

    var { userId, user, location, instance, world, canRequestInvite } = json;
}

function handleWebSocketFriendActive(json) {
    console.log('handleWebSocketFriendActive', json);

    var { userId, user } = json;
}

function handleWebSocketFriendOffline(json) {
    console.log('handleWebSocketFriendOffline', json);

    var { userId } = json;
}

function handleWebSocketFriendUpdate(json) {
    console.log('handleWebSocketFriendUpdate', json);

    var { userId, user } = json;
}

function handleWebSocketFriendLocation(json) {
    console.log('handleWebSocketFriendLocation', json);

    var { userId, user, location, instance, world, canRequestInvite } = json;
}

function handleWebSocketUserUpdate(json) {
    console.log('handleWebSocketUserUpdate', json);

    var { userId, user } = json;
    var currentUser = refCurrentUser_.value;

    // apply
    for (var key in user) {
        currentUser[key] = user[key];
    }
}

function handleWebSocketUserLocation(json) {
    console.log('handleWebSocketUserLocation', json);

    var { userId, location, instance, world } = json;
}

function onWebSocketMesage(event) {
    try {
        if (webSocket_ !== this) {
            this.close();
            return;
        }

        var { data } = event;
        var json = JSON.parse(data);

        switch (json.type) {
            case 'notification':
                handleWebSocketNotification(JSON.parse(json.content));
                break;

            case 'friend-add':
                handleWebSocketFriendAdd(JSON.parse(json.content));
                break;

            case 'friend-delete':
                handleWebSocketFriendDelete(JSON.parse(json.content));
                break;

            case 'friend-online':
                handleWebSocketFriendOnline(JSON.parse(json.content));
                break;

            case 'friend-active':
                handleWebSocketFriendActive(JSON.parse(json.content));
                break;

            case 'friend-offline':
                handleWebSocketFriendOffline(JSON.parse(json.content));
                break;

            case 'friend-update':
                handleWebSocketFriendUpdate(JSON.parse(json.content));
                break;

            case 'friend-location':
                handleWebSocketFriendLocation(JSON.parse(json.content));
                break;

            case 'user-update':
                handleWebSocketUserUpdate(JSON.parse(json.content));
                break;

            case 'user-location':
                handleWebSocketUserLocation(JSON.parse(json.content));
                break;

            default:
                console.log('unknown socket event type', json);
                break;
        }
    } catch (err) {
        console.error(err);
    }
}

async function connectWebSocket() {
    if (webSocket_ !== null) {
        return;
    }

    try {
        var { token } = await api.getAuth();
        if (typeof token !== 'string') {
            return;
        }

        if (webSocket_ !== null) {
            return;
        }

        var url = `wss://pipeline.vrchat.cloud/?auth=${token}`;
        var webSocket = new WebSocket(url);
        webSocket_ = webSocket;

        webSocket.onerror = onWebSocketError;
        webSocket.onclose = onWebSocketClose;
        webSocket.onopen = onWebSocketOpen;
        webSocket.onmessage = onWebSocketMesage;
    } catch (err) {
        console.error(err);
    }
}

async function checkWebSocket() {
    if (refIsLoggedIn_.value === false || isCheckingWebSocket_ === true) {
        return;
    }

    isCheckingWebSocket_ = true;

    try {
        if (webSocket_ === null) {
            await connectWebSocket();
        }
    } catch (err) {
        console.error(err);
    }

    isCheckingWebSocket_ = false;
}

async function pollCurrentUser() {
    if (refIsLoggedIn_.value === false || isPollingCurrentUser_ === true) {
        return;
    }

    isPollingCurrentUser_ = true;

    try {
        // official 180s
        if (Date.now() - currentUserPollTime_ >= 30 * 1000) {
            await getCurrentUser();
            currentUserPollTime_ = Date.now();
        }
    } catch (err) {
        console.error(err);
    }

    isPollingCurrentUser_ = false;
}

setInterval(function poll() {
    try {
        checkWebSocket();
        pollCurrentUser();
    } catch (err) {
        console.error(err);
    }
}, 1000);

watch(refIsLoggedIn_, function (isLoggedIn, prevIsLoggedIn) {
    if (isLoggedIn === prevIsLoggedIn) {
        return;
    }
    if (isLoggedIn === true) {
        onLogin();
    } else if (isLoggedIn === false) {
        onLogout();
    }
});

module.exports = {
    refIsLoggedIn: refIsLoggedIn_,
    refRemoteConfig: refRemoteConfig_,
    refCurrentUser: refCurrentUser_,
    getRemoteConfig,
    login,
    logout,
    verifyTotpCode,
    getCurrentUser,
};
