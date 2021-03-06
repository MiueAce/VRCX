const { ref, reactive } = require('vue');
const axios = require('axios');
const eventEmitter = require('./event-emitter.js');

/** @type {?VRChatApi} */
var vrchatApi = null;

class VRChatApi {
    constructor() {
        this.isLoggedIn = ref(false);
        this.config = ref(null);
        this.currentUser = ref(null);
        this.client = axios.create({
            baseURL: 'https://api.vrchat.cloud/api/1/',
            validateStatus: null,
        });
    }

    async call(options, withApiKey = true) {
        if (withApiKey === true) {
            var { value } = this.config;
            if (value === Object(value)) {
                var { clientApiKey } = value;
                if (typeof clientApiKey === 'string') {
                    options.params = {
                        apiKey: clientApiKey,
                        organization: 'vrchat',
                        ...options.params,
                    };
                }
            }
        }

        var { status, data } = await this.client(options);
        console.log('VRChatApi@call', { options, status, data });

        // {"error":{"message":"\"Missing Credentials\"","status_code":401}}
        if (status === 401) {
            this.isLoggedIn.value = false;
        }

        return data;
    }

    /**
     * @returns {object}
     */
    async getConfig() {
        var json = await this.call(
            {
                url: 'config',
            },
            false
        );

        this.config.value = json;

        return json;
    }

    /**
     * @param {string} username
     * @param {string} password
     * @returns {object}
     */
    async login(username, password) {
        var json = await this.call({
            url: 'auth/user',
            auth: {
                username,
                password,
            },
        });

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

    /**
     * @returns {object}
     */
    async logout() {
        var json = await this.call({
            method: 'put',
            url: 'logout',
        });

        // {"error":{"message":"\"Missing Credentials\"","status_code":401}}
        // {"success":{"message":"Ok!","status_code":200}}

        this.isLoggedIn.value = false;

        return json;
    }

    /**
     * @param {string} type 'otp'|'totp'
     * @param {object} data { code: string }
     * @returns {object}
     */
    async verifyTwoFactorAuth(type, data) {
        var json = await this.call({
            method: 'post',
            url: `auth/twofactorauth/${type}/verify`,
            data,
        });

        // {"verified": true}

        return json;
    }

    async getCurrentUser() {
        var json = await this.call({
            url: 'auth/user',
        });

        // {"error":{"message":"\"Missing Credentials\"","status_code":401}}

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
}

vrchatApi = new VRChatApi();

(function () {
    var lastUpdateTime = 0;
    (async function updateCurrentUser() {
        try {
            if (vrchatApi.isLoggedIn.value === true && Date.now() - lastUpdateTime >= 30 * 1000) {
                await vrchatApi.getCurrentUser();
                lastUpdateTime = Date.now();
                eventEmitter.emit('vrchat-api:current-user', vrchatApi.currentUser.value);
            }
        } catch (err) {
            console.error(err);
        }
        setTimeout(updateCurrentUser, 5000);
    })();
})();

module.exports = vrchatApi;
