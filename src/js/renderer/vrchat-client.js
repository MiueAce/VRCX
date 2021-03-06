const { ref } = require('vue');
const VRChatApi = require('./vrchat-api.js');

class VRChatClient {
    constructor() {
        this.api = new VRChatApi();
        this.isLoggedIn = ref(false);
        this.config = ref(null);
        this.currentUser = ref(null);
        console.log(this.isLoggedIn);
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

        return json;
    }

    async logout() {
        var json = await this.api.logout();

        // {"error":{"message":"\"Missing Credentials\"","status_code":401}}
        // {"success":{"message":"Ok!","status_code":200}}

        this.isLoggedIn.value = false;

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

        return json;
    }
}

// (function () {
//     var lastUpdateTime = 0;
//     (async function updateCurrentUser() {
//         try {
//             if (vrchatApi.isLoggedIn.value === true && Date.now() - lastUpdateTime >= 30 * 1000) {
//                 await vrchatApi.getCurrentUser();
//                 lastUpdateTime = Date.now();
//                 eventEmitter.emit('vrchat-api:current-user', vrchatApi.currentUser.value);
//             }
//         } catch (err) {
//             console.error(err);
//         }
//         setTimeout(updateCurrentUser, 5000);
//     })();
// })();

module.exports = VRChatClient;
