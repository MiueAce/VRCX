const { ref } = require('vue');
const vrchatApi = require('./vrchat-api.js');

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

        this.pollTimer = setTimeout(() => this.poll(), 1);
    }

    dispose() {
        var { pollTimer } = this;
        if (pollTimer !== null) {
            this.pollTimer = null;
            clearTimeout(pollTimer);
        }
    }

    poll() {
        this.pollTimer = setTimeout(() => this.poll(), 1000);
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
                // await this.connectWebSocket();
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
                var json = await this.loadCurrentUser();
                this.currentUserUpdateTime = Date.now();
                console.log('vrchat-client:current-user', json);
            }
        } catch (err) {
            console.error(err);
        }

        this.isUpdatingCurrentUser = false;
    }

    async getConfig() {
        var json = await vrchatApi.getConfig();

        this.remoteConfig.value = json;
        vrchatApi.apiKey = json.clientApiKey;

        return json;
    }

    /**
     * @param {string} username
     * @param {string} password
     */
    async login(username, password) {
        var json = await vrchatApi.login(username, password);

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

        return json;
    }

    async logout() {
        var json = await vrchatApi.logout();

        // {"error":{"message":"\"Missing Credentials\"","status_code":401}}
        // {"success":{"message":"Ok!","status_code":200}}

        this.isLoggedIn.value = false;
        this.closeWebSocket();

        return json;
    }

    /**
     * @param {string} type 'otp'|'totp'
     * @param {object} data { code: string }
     */
    async verifyTwoFactorAuth(type, data) {
        var json = await vrchatApi.verifyTwoFactorAuth(type, data);

        // {"verified": true}

        return json;
    }

    async loadCurrentUser() {
        var json = await vrchatApi.loadCurrentUser();

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

        var { token } = await vrchatApi.getAuth();
        if (typeof token !== 'string') {
            return;
        }

        var url = `wss://pipeline.vrchat.cloud/?auth=${token}`;
        if (this.webSocket !== null) {
            return;
        }

        var self = this;
        var webSocket = new WebSocket(url);

        webSocket.onerror = function (event) {
            console.log('websocket error', event);
            if (self.webSocket === this) {
                self.webSocket = null;
            }
            try {
                this.close();
            } catch (err) {
                console.error(err);
            }
        };

        webSocket.onclose = function (event) {
            console.log('websocket close', event);
            if (self.webSocket === this) {
                self.webSocket = null;
            }
        };

        webSocket.onmessage = function (event) {
            try {
                if (self.webSocket !== this) {
                    this.close();
                    return;
                }
                var { data } = event;
                var json = JSON.parse(data);
                console.log('PIPELINE', json);
                switch (json.type) {
                    case 'notification':
                        console.log('notification', JSON.parse(json.content));
                        break;
                    case 'friend-add':
                        console.log('friend-add', JSON.parse(json.content));
                        break;
                    case 'friend-delete':
                        console.log('friend-delete', JSON.parse(json.content));
                        break;
                    case 'friend-online':
                        console.log('friend-online', JSON.parse(json.content));
                        break;
                    case 'friend-active':
                        console.log('friend-active', JSON.parse(json.content));
                        break;
                    case 'friend-offline':
                        console.log('friend-offline', JSON.parse(json.content));
                        break;
                    case 'friend-update':
                        console.log('friend-update', JSON.parse(json.content));
                        break;
                    case 'friend-location':
                        console.log('friend-location', JSON.parse(json.content));
                        break;
                    case 'user-update':
                        console.log('user-update', JSON.parse(json.content));
                        break;
                    case 'user-location':
                        console.log('user-location', JSON.parse(json.content));
                        break;
                    default:
                        console.log('unknown socket event type');
                        break;
                }
            } catch (err) {
                console.error(err);
            }
        };

        this.webSocket = webSocket;
    }
}

vrchatClient = new VRChatClient();
module.exports = vrchatClient;
