const { ref } = require('vue');
const VRChatApi = require('./vrchat-api.js');

class VRChatClient {
    constructor() {
        this.api = new VRChatApi();
        this.webSocket = null;
        this.isLoggedIn = ref(false);
        this.config = ref(null);
        this.currentUser = ref(null);
        this.currentUserUpdateTime = 0;
        this.isUpdatingCurrentUser = false;
        this.pollTimer = setTimeout(() => this.poll(), 1);
    }

    async pollCurrentUser() {
        if (this.pollCurrentUserTimer !== null) {
            return;
        }

        this.pollCurrentUserTimer = setTimeout(() => this.pollCurrentUser(), 5000);
    }

    dispose() {
        var { pollTimer } = this;
        if (pollTimer !== null) {
            this.pollTimer = null;
            clearTimeout(pollTimer);
        }
    }

    poll() {
        try {
            this.updateCurrentUser();
        } catch (err) {
            console.error(err);
        }
        this.pollTimer = setTimeout(() => this.poll(), 1000);
    }

    async updateCurrentUser() {
        if (this.isLoggedIn.value === false || this.isUpdatingCurrentUser === true) {
            return;
        }

        this.isUpdatingCurrentUser = true;

        try {
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

    async getConfig() {
        var json = await this.api.getConfig();

        this.config.value = json;
        this.api.apiKey = json.clientApiKey;

        return json;
    }

    /**
     * @param {string} username
     * @param {string} password
     */
    async login(username, password) {
        var json = await this.api.login(username, password);

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

        if (this.webSocket === null) {
            this.connectWebSocket();
        }

        return json;
    }

    async logout() {
        var json = await this.api.logout();

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
        var json = await this.api.verifyTwoFactorAuth(type, data);

        // {"verified": true}

        return json;
    }

    async getCurrentUser() {
        var json = await this.api.getCurrentUser();

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

        if (this.webSocket === null) {
            this.connectWebSocket();
        }

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
        var { token } = await this.api.getAuth();
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
            if (self.webSocket !== this) {
                return;
            }
            var { data } = event;
            try {
                var json = JSON.parse(data);
                json.content = JSON.parse(json.content);
                console.log('PIPELINE', json);
            } catch (err) {
                console.error(err);
            }
        };

        this.webSocket = webSocket;
    }
}

module.exports = VRChatClient;
