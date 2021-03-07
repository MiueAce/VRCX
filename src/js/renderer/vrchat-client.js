const { ref } = require('vue');
const api = require('./vrchat-api.js');

/** @type {?VRChatClient} */
var vrchatClient = null;

class VRChatClient {
    constructor() {
        this.isLoggedIn = ref(false);

        this.remoteConfig = ref(null);

        this.webSocket = null;
        this.isUpdatingWebSocket = false;

        this.currentUser = ref(null);
        this.currentUserUpdateTime = 0;
        this.isUpdatingCurrentUser = false;

        this.friends = ref([]);
        this.users = ref({});

        this.pollTimer = setInterval(() => this.poll(), 1000);
    }

    dispose() {
        var { pollTimer } = this;
        if (pollTimer !== null) {
            this.pollTimer = null;
            clearInterval(pollTimer);
        }
    }

    poll() {
        try {
            this.updateCurrentUser();
            this.updateWebSocket();
        } catch (err) {
            console.error(err);
        }
    }

    async updateWebSocket() {
        if (this.isLoggedIn.value === false || this.isUpdatingWebSocket === true) {
            return;
        }

        this.isUpdatingWebSocket = true;

        try {
            if (this.webSocket === null) {
                await this.connectWebSocket();
            }
        } catch (err) {
            console.error(err);
        }

        this.isUpdatingWebSocket = false;
    }

    async updateCurrentUser() {
        if (this.isLoggedIn.value === false || this.isUpdatingCurrentUser === true) {
            return;
        }

        this.isUpdatingCurrentUser = true;

        try {
            // official 180s
            if (Date.now() - this.currentUserUpdateTime >= 30 * 1000) {
                var json = await this.getCurrentUser();
                this.currentUserUpdateTime = Date.now();
                console.log('vrchat-client:current-user', json);
            }
        } catch (err) {
            console.error(err);
        }

        this.isUpdatingCurrentUser = false;
    }

    applyCurrentUser() {
        if (this.isLoggedIn.value === false) {
            return;
        }

        var prevFriends = new Set(this.friends.value);

        this.friends.value = this.currentUser.value?.friends ?? [];

        var currentFriends = new Set(this.friends.value);

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

        console.log('applyCurrentUser', addedFriends, removedFriends);
    }

    async getRemoteConfig() {
        var json = await api.getRemoteConfig();

        if ('clientApiKey' in json) {
            api.setApiKey(json.clientApiKey);
        }

        this.remoteConfig.value = json;

        return json;
    }

    async login(username, password) {
        var json = await api.login(username, password);

        // {"error":{"message":"\"Invalid Username or Password\"","status_code":401}}
        // {"requiresTwoFactorAuth":["totp","otp"]}

        if ('error' in json) {
            return json;
        }

        if ('requiresTwoFactorAuth' in json) {
            return json;
        }

        this.isLoggedIn.value = true;
        this.currentUser.value = json;
        this.currentUserUpdateTime = Date.now();
        this.applyCurrentUser();

        return json;
    }

    async logout() {
        var json = await api.logout();

        // {"error":{"message":"\"Missing Credentials\"","status_code":401}}
        // {"success":{"message":"Ok!","status_code":200}}

        this.isLoggedIn.value = false;
        this.closeWebSocket();

        return json;
    }

    async verifyTotpCode(code) {
        var json = await api.verifyTotpCode(code);

        // {"verified":true}

        if ('verified' in json) {
            this.isLoggedIn.value = true;
        }

        return json;
    }

    async getCurrentUser() {
        var json = await api.getCurrentUser();

        // {"error":{"message":"\"Missing Credentials\"","status_code":401}}

        if ('error' in json) {
            if (json.error.status_code === 401) {
                this.isLoggedIn.value = false;
                this.currentUser.value = null;
            }
            return json;
        }

        if ('requiresTwoFactorAuth' in json) {
            this.isLoggedIn.value = false;
            this.currentUser.value = null;
            return json;
        }

        this.isLoggedIn.value = true;
        this.currentUser.value = json;
        this.currentUserUpdateTime = Date.now();
        this.applyCurrentUser();

        return json;
    }

    closeWebSocket() {
        var { webSocket } = this;
        if (webSocket === null) {
            return;
        }

        this.webSocket = null;

        try {
            webSocket.close();
        } catch (err) {
            console.error(err);
        }
    }

    async connectWebSocket() {
        if (this.webSocket !== null) {
            return;
        }

        try {
            var { token } = await api.getAuth();
            if (typeof token !== 'string') {
                return;
            }

            var url = `wss://pipeline.vrchat.cloud/?auth=${token}`;
            if (this.webSocket !== null) {
                return;
            }

            var webSocket = new WebSocket(url);
            webSocket.onerror = (event) => this.onWebSocketError(event);
            webSocket.onclose = (event) => this.onWebSocketClose(event);
            webSocket.onopen = (event) => this.onWebSocketOpen(event);
            webSocket.onmessage = (event) => this.onWebSocketMesage(event);
            this.webSocket = webSocket;
        } catch (err) {
            console.error(err);
        }
    }

    onWebSocketError(event) {
        console.log('websocket error', event);
        var webSocket = event.target;
        if (this.webSocket === webSocket) {
            this.webSocket = null;
        }
        try {
            webSocket.close();
        } catch (err) {
            console.error(err);
        }
    }

    onWebSocketClose(event) {
        console.log('websocket close', event);
        var webSocket = event.target;
        if (this.webSocket === webSocket) {
            this.webSocket = null;
        }
    }

    onWebSocketOpen(event) {
        console.log('websocket open', event);
    }

    onWebSocketMesage(event) {
        console.log('websocket mesage', event);
        var webSocket = event.target;
        try {
            if (this.webSocket !== webSocket) {
                webSocket.close();
                return;
            }
            var { data } = event;
            var json = JSON.parse(data);
            switch (json.type) {
                case 'notification':
                    this.handleWebSocketNotification(JSON.parse(json.content));
                    break;
                case 'friend-add':
                    this.handleWebSocketFriendAdd(JSON.parse(json.content));
                    break;
                case 'friend-delete':
                    this.handleWebSocketFriendDelete(JSON.parse(json.content));
                    break;
                case 'friend-online':
                    this.handleWebSocketFriendOnline(JSON.parse(json.content));
                    break;
                case 'friend-active':
                    this.handleWebSocketFriendActive(JSON.parse(json.content));
                    break;
                case 'friend-offline':
                    this.handleWebSocketFriendOffline(JSON.parse(json.content));
                    break;
                case 'friend-update':
                    this.handleWebSocketFriendUpdate(JSON.parse(json.content));
                    break;
                case 'friend-location':
                    this.handleWebSocketFriendLocation(JSON.parse(json.content));
                    break;
                case 'user-update':
                    this.handleWebSocketUserUpdate(JSON.parse(json.content));
                    break;
                case 'user-location':
                    this.handleWebSocketUserLocation(JSON.parse(json.content));
                    break;
                default:
                    console.log('unknown socket event type', json);
                    break;
            }
        } catch (err) {
            console.error(err);
        }
    }

    handleWebSocketNotification(json) {}
    handleWebSocketFriendAdd(json) {}
    handleWebSocketFriendDelete(json) {}
    handleWebSocketFriendOnline(json) {}
    handleWebSocketFriendActive(json) {}
    handleWebSocketFriendOffline(json) {}
    handleWebSocketFriendUpdate(json) {}
    handleWebSocketFriendLocation(json) {}
    handleWebSocketUserUpdate(json) {}
    handleWebSocketUserLocation(json) {}
}

vrchatClient = new VRChatClient();
module.exports = vrchatClient;
