const axios = require('axios');

class VRChatApi {
    constructor() {
        this.apiKey = '';
        this.axios = axios.create({
            baseURL: 'https://api.vrchat.cloud/api/1/',
            validateStatus: null,
        });
    }

    async call(options, withApiKey = true) {
        if (withApiKey === true) {
            var { apiKey } = this;
            if (typeof apiKey === 'string') {
                options.params = {
                    apiKey,
                    organization: 'vrchat',
                    ...options.params,
                };
            }
        }

        var { status, data } = await this.axios(options);
        console.log('VRChatApi@call', { options, status, data });

        // {"error":{"message":"\"Missing Credentials\"","status_code":401}}

        return data;
    }

    async getConfig() {
        var json = await this.call(
            {
                url: 'config',
            },
            false
        );
        return json;
    }

    /**
     * @param {string} username
     * @param {string} password
     */
    async login(username, password) {
        return await this.call({
            url: 'auth/user',
            auth: {
                username,
                password,
            },
        });
    }

    async logout() {
        return await this.call({
            method: 'put',
            url: 'logout',
        });
    }

    /**
     * @param {string} type 'otp'|'totp'
     * @param {object} data { code: string }
     */
    async verifyTwoFactorAuth(type, data) {
        return await this.call({
            method: 'post',
            url: `auth/twofactorauth/${type}/verify`,
            data,
        });
    }

    async getCurrentUser() {
        return await this.call({
            url: 'auth/user',
        });
    }
}

module.exports = VRChatApi;
