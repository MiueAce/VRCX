const axios = require('axios');
const { dispatchEvent } = require('../common/event-bus.js');

/** @type {?VRChatApi} */
var vrchatApi = null;

// user.location
// https://assets.vrchat.com/www/images/default_offline_image.png (empty or offline)
// https://assets.vrchat.com/www/images/default_between_image.png (inbetween)
// https://assets.vrchat.com/www/images/default_private_image.png (private)

// getUserLevel() => t.has('admin_moderator')
// ? 'moderator'
// : t.has('system_trust_veteran')
// ? 'trusted'
// : t.has('system_trust_trusted')
// ? 'known'
// : t.has('system_trust_known')
// ? 'user'
// : t.has('system_trust_basic')
// ? 'new'
// : t.has('system_probable_troll')
// ? 'visitor'
// : t.has('system_troll')
// ? 'troll'
// : 'visitor';

var subsetOfLanguages = {
    eng: 'English',
    kor: '한국어',
    rus: 'Русский',
    spa: 'Español',
    por: 'Português',
    zho: '中文',
    deu: 'Deutsch',
    jpn: '日本語',
    fra: 'Français',
    swe: 'Svenska',
    nld: 'Nederlands',
    pol: 'Polski',
    dan: 'Dansk',
    nor: 'Norsk',
    ita: 'Italiano',
    tha: 'ภาษาไทย',
    fin: 'Suomi',
    hun: 'Magyar',
    ces: 'Čeština',
    tur: 'Türkçe',
    ara: 'العربية',
    ron: 'Română',
    vie: 'Tiếng Việt',
    ase: 'American Sign Language',
    bfi: 'British Sign Language',
    dse: 'Dutch Sign Language',
    fsl: 'French Sign Language',
    kvk: 'Korean Sign Language',
};

var tagMappings = [
    {
        tag: 'admin_moderator',
        icon: 'life-ring',
        description: 'Moderator',
    },
    {
        tag: 'admin_scripting_access',
        icon: 'handshake',
        description: 'Scripting Access',
    },
    {
        tag: 'admin_avatar_access',
        icon: 'lock',
        description: 'Forced Avatar Access',
    },
    {
        tag: 'admin_world_access',
        icon: 'lock',
        description: 'Forced World Access',
    },
    {
        tag: 'admin_lock_tags',
        icon: 'lock',
        description: 'Locked Tags',
    },
    {
        tag: 'admin_lock_level',
        icon: 'lock',
        description: 'Locked Level',
    },
    {
        tag: 'admin_can_grant_licenses',
        icon: 'ticket-alt',
        description: 'Can Grant Licenses',
    },
    {
        tag: 'system_world_access',
        icon: 'wrench',
        description: 'SDK World Access',
    },
    {
        tag: 'system_avatar_access',
        icon: 'wrench',
        description: 'SDK Avatar Access',
    },
    {
        tag: 'system_feedback_access',
        icon: 'bullhorn',
        description: 'Feedback Access',
    },
    {
        tag: 'system_trust_basic',
        icon: 'chess-pawn',
        description: 'Novice',
    },
    {
        tag: 'system_trust_known',
        icon: 'chess-rook',
        description: 'Known',
    },
    {
        tag: 'system_trust_intermediate',
        icon: 'chess-rook',
        description: 'Intermediate Trust',
    },
    {
        tag: 'system_trust_trusted',
        icon: 'chess-knight',
        description: 'Trusted',
    },
    {
        tag: 'system_trust_advanced',
        icon: 'chess-knight',
        description: 'Advanced Trust',
    },
    {
        tag: 'system_trust_veteran',
        icon: 'chess-king',
        description: 'Veteran User',
    },
    {
        tag: 'system_trust_legend',
        icon: 'chess-king',
        description: 'Legendary User',
    },
    {
        tag: 'system_probable_troll',
        icon: 'trash-alt',
        description: 'Probable Troll',
    },
    {
        tag: 'system_troll',
        icon: 'toilet-paper',
        description: 'Problem',
    },
    {
        tag: 'admin_approved',
        icon: 'thumbs-up',
        description: 'Approved',
    },
    {
        tag: 'admin_featured',
        icon: 'camera-retro',
        description: 'Featured',
    },
    {
        tag: 'admin_community_spotlight',
        icon: 'camera-retro',
        description: 'Community Spotlight',
    },
    {
        tag: 'admin_avatar_world',
        icon: 'user-astronaut',
        description: 'Avatar World',
    },
    {
        tag: 'admin_hidden',
        icon: 'question',
        description: "Won't Appear in Search",
    },
    {
        tag: 'admin_hide_active',
        icon: 'question',
        description: "Won't Appear in Active",
    },
    {
        tag: 'admin_hide_new',
        icon: 'question',
        description: "Won't Appear in New",
    },
    {
        tag: 'admin_hide_popular',
        icon: 'question',
        description: "Won't Appear in Popular",
    },
    {
        tag: 'system_labs',
        icon: 'flask',
        description: 'System Labs',
    },
    {
        tag: 'admin_approved',
        icon: 'gavel',
        description: 'Admin Approved',
    },
    {
        tag: 'system_approved',
        icon: 'check',
        description: 'Approved',
    },
    {
        tag: 'system_updated_recently',
        icon: 'calendar-alt',
        description: 'Updated Recently',
    },
    {
        tag: 'system_created_recently',
        icon: 'calendar',
        description: 'Created Recently',
    },
    {
        tag: 'admin_halloween_2018',
        icon: 'ghost',
        description: 'Halloween 2018',
    },
    {
        tag: 'admin_halloween_2019',
        icon: 'ghost',
        description: 'Halloween 2019',
    },
    {
        tag: 'admin_christmas_2018',
        icon: 'tree',
        description: 'Christmas 2018',
    },
    {
        tag: 'admin_christmas_2019',
        icon: 'tree',
        description: 'Christmas 2019',
    },
    {
        tag: 'admin_eternally_cursed',
        icon: 'ghost',
        description: 'Eternally Cursed',
    },
];

class VRChatApi {
    constructor() {
        this.apiKey = '';
        this.axios = axios.create({
            baseURL: 'https://api.vrchat.cloud/api/1/',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
            },
            onUploadProgress: function (progressEvent) {
                console.log('onUploadProgress', progressEvent);
            },
            validateStatus: null,
        });
    }

    async call(options) {
        var { status, data } = await this.axios(options);
        console.log('VRChatApi@call', { options, status, data });

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

    async getConfig() {
        var json = await this.call({
            url: 'config',
            method: 'get',
        });
        return json;
    }

    // avatar

    async loadAvatar(avatarId) {
        return await this.call({
            url: `avatars/${avatarId}`,
            method: 'get',
            params: {
                apiKey: this.apiKey,
            },
        });
    }

    async makeAllAvatarsPrivate(userId) {
        return await this.call({
            url: 'avatars/all',
            method: 'put',
            params: {
                apiKey: this.apiKey,
            },
            data: {
                userId,
                query: {
                    releaseStatus: 'public',
                },
                changes: {
                    releaseStatus: 'private',
                },
            },
        });
    }

    async makeAllAvatarsHidden(userId) {
        return await this.call({
            url: 'avatars/all',
            method: 'delete',
            params: {
                apiKey: this.apiKey,

                userId,
            },
        });
    }

    async makeAvatarPrivate(avatarId) {
        return await this.call({
            url: `avatars/${avatarId}`,
            method: 'put',
            params: {
                apiKey: this.apiKey,
            },
            data: {
                releaseStatus: 'private',
            },
        });
    }

    async makeAvatarPublic(avatarId) {
        return await this.call({
            url: `avatars/${avatarId}`,
            method: 'put',
            params: {
                apiKey: this.apiKey,
            },
            data: {
                releaseStatus: 'public',
            },
        });
    }

    async makeAvatarHidden(avatarId) {
        return await this.call({
            url: `avatars/${avatarId}`,
            method: 'delete',
            params: {
                apiKey: this.apiKey,
            },
        });
    }

    async switchToAvatar(userId, avatarId) {
        return await this.call({
            url: `users/${userId}/avatar`,
            method: 'put',
            params: {
                apiKey: this.apiKey,
            },
            data: {
                avatarId,
            },
        });
    }

    // bio

    async updateBio(userId, bio) {
        return await this.call({
            url: `users/${userId}`,
            method: 'put',
            params: {
                apiKey: this.apiKey,
            },
            data: {
                bio,
            },
        });
    }

    async updateBioLinks(userId, bioLinks) {
        return await this.call({
            url: `users/${userId}`,
            method: 'put',
            params: {
                apiKey: this.apiKey,
            },
            data: {
                bioLinks,
            },
        });
    }

    // user

    async loadCurrentUser() {
        return await this.call({
            url: 'auth/user',
            method: 'get',
            params: {
                apiKey: this.apiKey,
            },
        });
    }

    async loadPermissions() {
        return await this.call({
            url: 'auth/permissions',
            method: 'get',
            params: {
                apiKey: this.apiKey,
            },
        });
    }

    async loadCondensedPermissions() {
        return await this.call({
            url: 'auth/permissions',
            method: 'get',
            params: {
                apiKey: this.apiKey,

                condensed: true,
            },
        });
    }

    async checkDisplayName(username, displayName, excludeUserId) {
        return await this.call({
            url: 'auth/exists',
            method: 'get',
            params: {
                apiKey: this.apiKey,

                username,
                displayName,
                excludeUserId,
            },
        });
    }

    async changeName(userId, displayName, currentPassword) {
        return await this.call({
            url: `users/${userId}`,
            method: 'put',
            params: {
                apiKey: this.apiKey,

                displayName,
                currentPassword,
            },
        });
    }

    async checkEmail(email, excludeUserId) {
        return await this.call({
            url: 'auth/exists',
            method: 'get',
            params: {
                apiKey: this.apiKey,

                email,
                excludeUserId,
            },
        });
    }

    async changeEmail(userId, email, currentPassword) {
        return await this.call({
            url: `users/${userId}`,
            method: 'put',
            params: {
                apiKey: this.apiKey,

                email,
                currentPassword,
            },
        });
    }

    async changePassword(userId, password, currentPassword) {
        return await this.call({
            url: `users/${userId}`,
            method: 'put',
            params: {
                apiKey: this.apiKey,

                password,
                currentPassword,
            },
        });
    }

    async logout() {
        return await this.call({
            url: 'logout',
            method: 'put',
            params: {
                apiKey: this.apiKey,
            },
        });
    }

    async markAccountForDeletion(userId) {
        return await this.call({
            url: `users/${userId}/delete`,
            method: 'put',
            params: {
                apiKey: this.apiKey,
            },
        });
    }

    async getCannySsoToken() {
        return await this.call({
            url: 'sso/canny',
            method: 'get',
            params: {
                apiKey: this.apiKey,
            },
        });
    }

    async getFuralitySsoToken() {
        return await this.call({
            url: 'sso/furality',
            method: 'get',
            params: {
                apiKey: this.apiKey,
            },
        });
    }

    async putUser(userId, data) {
        return await this.call({
            url: `users/${userId}`,
            method: 'put',
            data,
            params: {
                apiKey: this.apiKey,
            },
        });
    }

    async postIcon(file) {
        var data = new FormData();
        data.append('file', file);
        return await this.call({
            url: `users/${userId}`,
            method: 'post',
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            params: {
                apiKey: this.apiKey,
            },
            data,
        });
    }

    // user

    async getUser(userId) {
        return await this.call({
            url: `users/${userId}`,
            method: 'get',
            params: {
                apiKey: this.apiKey,
            },
        });
    }

    async getFriends(online, n, offset) {
        return await this.call({
            url: `users/${userId}`,
            method: 'get',
            params: {
                apiKey: this.apiKey,

                offline: !online,
                n,
                offset,
            },
        });
    }

    // user

    async addLanguageTag(userId, tags) {
        return await this.call({
            url: `users/${userId}/addTags`,
            method: 'post',
            params: {
                apiKey: this.apiKey,
            },
            data: {
                tags,
            },
        });
    }

    async deleteLanguageTag(userId, tags) {
        return await this.call({
            url: `users/${userId}/removeTags`,
            method: 'post',
            params: {
                apiKey: this.apiKey,
            },
            data: {
                tags,
            },
        });
    }

    // world

    async loadLocation(worldId) {
        return await this.call({
            url: `worlds/${worldId}`,
            method: 'get',
            params: {
                apiKey: this.apiKey,
            },
        });
    }

    // user

    /**
     * @param {string} username
     * @param {string} password
     */
    async login(username, password) {
        return await this.call({
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

    async verifyTotpCode(code) {
        return await this.call({
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

    async verifyOtpCode(code) {
        return await this.call({
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

    // notification

    async hideNotification(notificationId) {
        return await this.call({
            url: `auth/user/notifications/${notificationId}/hide`,
            method: 'put',
            params: {
                apiKey: this.apiKey,
            },
        });
    }

    async seeNotification(notificationId) {
        return await this.call({
            url: `auth/user/notifications/${notificationId}/see`,
            method: 'put',
            params: {
                apiKey: this.apiKey,
            },
        });
    }

    async acceptFriend(notificationId) {
        return await this.call({
            url: `auth/user/notifications/${notificationId}/accept`,
            method: 'put',
            params: {
                apiKey: this.apiKey,
            },
        });
    }

    async clearNotifications() {
        return await this.call({
            url: 'auth/user/notifications/clear',
            method: 'put',
            params: {
                apiKey: this.apiKey,
            },
        });
    }

    async getFriendRequests() {
        return await this.call({
            url: 'auth/user/notifications',
            method: 'get',
            params: {
                apiKey: this.apiKey,

                sent: false,
                type: 'friendRequest',
                n: 100,
            },
        });
    }

    async getRecentNotifications() {
        return await this.call({
            url: 'auth/user/notifications',
            method: 'get',
            params: {
                apiKey: this.apiKey,

                sent: false,
                n: 100,
                after: 'five_minutes_ago',
            },
        });
    }

    // moderation

    async loadPlayerModerations() {
        return await this.call({
            url: 'auth/user/playermoderations',
            method: 'get',
            params: {
                apiKey: this.apiKey,
            },
        });
    }

    async blockUser(moderated) {
        return await this.call({
            url: 'auth/user/playermoderations',
            method: 'post',
            data: {
                apiKey: this.apiKey,

                moderated,
                type: 'block',
            },
        });
    }

    async unblockUser(moderated) {
        return await this.call({
            url: 'auth/user/unplayermoderate',
            method: 'put',
            data: {
                apiKey: this.apiKey,

                moderated,
                type: 'block',
            },
        });
    }

    async muteUser(moderated) {
        return await this.call({
            url: 'auth/user/playermoderations',
            method: 'post',
            data: {
                apiKey: this.apiKey,

                moderated,
                type: 'mute',
            },
        });
    }

    async unmuteUser(moderated) {
        return await this.call({
            url: 'auth/user/unplayermoderate',
            method: 'put',
            data: {
                apiKey: this.apiKey,

                moderated,
                type: 'mute',
            },
        });
    }

    async clearAllModerations() {
        return await this.call({
            url: 'auth/user/playermoderations',
            method: 'delete',
            params: {
                apiKey: this.apiKey,
            },
        });
    }

    // login

    async sendLink(email) {
        return await this.call({
            url: 'auth/password',
            method: 'put',
            params: {
                apiKey: this.apiKey,
            },
            data: {
                email,
            },
        });
    }

    async setNewPassword(emailToken, id, password) {
        return await this.call({
            url: 'auth/password',
            method: 'put',
            params: {
                apiKey: this.apiKey,
            },
            data: {
                emailToken,
                id,
                password,
            },
        });
    }

    // search

    async searchUsers(search, n) {
        return await this.call({
            url: 'users',
            method: 'get',
            params: {
                apiKey: this.apiKey,

                sort: 'relevance',
                fuzzy: true,
                search,
                n,
            },
        });
    }

    async loadMoreUsers(search, n, offset) {
        return await this.call({
            url: 'users',
            method: 'get',
            params: {
                apiKey: this.apiKey,

                sort: 'relevance',
                fuzzy: true,
                search,
                n,
                offset,
            },
        });
    }

    async searchWorlds(search, n) {
        return await this.call({
            url: 'worlds',
            method: 'get',
            params: {
                apiKey: this.apiKey,

                sort: 'relevance',
                fuzzy: true,
                search,
                n,
            },
        });
    }

    async loadMoreWorlds(search, n, offset) {
        return await this.call({
            url: 'worlds',
            method: 'get',
            params: {
                apiKey: this.apiKey,

                sort: 'relevance',
                fuzzy: true,
                search,
                n,
                offset,
            },
        });
    }

    // otp

    async removeTwoFactorAuth() {
        return await this.call({
            url: 'auth/twofactorauth',
            method: 'delete',
            params: {
                apiKey: this.apiKey,
            },
        });
    }

    async getTwoFactorAuthPendingSecret() {
        return await this.call({
            url: 'auth/twofactorauth/totp/pending',
            method: 'post',
            params: {
                apiKey: this.apiKey,
            },
        });
    }

    async verifyTwoFactorAuthPendingSecret(code) {
        return await this.call({
            url: 'auth/twofactorauth/totp/pending/verify',
            method: 'post',
            params: {
                apiKey: this.apiKey,
            },
            data: {
                code,
            },
        });
    }

    async cancelVerifyTwoFactorAuthPendingSecret() {
        return await this.call({
            url: 'auth/twofactorauth/totp/pendingh',
            method: 'delete',
            params: {
                apiKey: this.apiKey,
            },
        });
    }

    async getTwoFactorAuthOneTimePasswords() {
        return await this.call({
            url: 'auth/user/twofactorauth/otp',
            method: 'get',
            params: {
                apiKey: this.apiKey,
            },
        });
    }

    // user

    async loadUser(userId) {
        return await this.call({
            url: `users/${userId}`,
            method: 'get',
            params: {
                apiKey: this.apiKey,
            },
        });
    }

    async loadSubscriptions(userId) {
        return await this.call({
            url: `users/${userId}/subscription`,
            method: 'get',
            params: {
                apiKey: this.apiKey,
            },
        });
    }

    async loadWorldInfo(worldId) {
        return await this.call({
            url: `worlds/${worldId}`,
            method: 'get',
            params: {
                apiKey: this.apiKey,
            },
        });
    }

    async addFriend(userId) {
        return await this.call({
            url: `user/${userId}/friendRequest`,
            method: 'post',
            params: {
                apiKey: this.apiKey,
            },
        });
    }

    async cancelFriendRequest(userId) {
        return await this.call({
            url: `user/${userId}/friendRequest`,
            method: 'delete',
            params: {
                apiKey: this.apiKey,
            },
        });
    }

    async removeFriend(userId) {
        return await this.call({
            url: `auth/user/friends/${userId}`,
            method: 'delete',
            params: {
                apiKey: this.apiKey,
            },
        });
    }

    async loadFriendStatus(userId) {
        return await this.call({
            url: `user/${userId}/friendStatus`,
            method: 'delete',
            params: {
                apiKey: this.apiKey,
            },
        });
    }

    // {type, expires, reason, isPermanent}
    async loadModerations(userId) {
        return await this.call({
            url: `user/${userId}/moderations`,
            method: 'get',
            params: {
                apiKey: this.apiKey,
            },
        });
    }
    async resetAvatar(userId) {
        return await this.call({
            url: `users/${userId}/avatar`,
            method: 'put',
            params: {
                apiKey: this.apiKey,
            },
            data: {
                avatarId: 'avtr_c38a1615-5bf5-42b4-84eb-a8b6c37cbd11',
            },
        });
    }

    async sendMessage(userId, message) {
        return await this.call({
            url: `user/${userId}/notification`,
            method: 'put',
            params: {
                apiKey: this.apiKey,
            },
            data: {
                type: 'message',
                message,
            },
        });
    }

    async getCurrentAvatar(userId) {
        return await this.call({
            url: `users/${userId}/avatar`,
            method: 'get',
            params: {
                apiKey: this.apiKey,
            },
        });
    }

    async getCurrentAvatar(userId) {
        return await this.call({
            url: `users/${userId}/avatar`,
            method: 'get',
            params: {
                apiKey: this.apiKey,
            },
        });
    }

    async deleteTags(userId, tags) {
        return await this.call({
            url: `users/${userId}/removeTags`,
            method: 'post',
            params: {
                apiKey: this.apiKey,
            },
            data: {
                tags,
            },
        });
    }

    async addTags(userId, tags) {
        return await this.call({
            url: `users/${userId}/addTags`,
            method: 'post',
            params: {
                apiKey: this.apiKey,
            },
            data: {
                tags,
            },
        });
    }

    async getIcons(n, offset, userId) {
        return await this.call({
            url: 'files',
            method: 'get',
            params: {
                apiKey: this.apiKey,

                tag: 'icon',
                n,
                offset,
                userId,
            },
        });
    }

    async deleteIcon(fileId) {
        return await this.call({
            url: `file/${fileId}`,
            method: 'delete',
            params: {
                apiKey: this.apiKey,
            },
            data: {
                tag: 'icon',
                n,
                offset,
                userId,
            },
        });
    }

    // world

    async loadWorld(worldId) {
        return await this.call({
            url: `worlds/${worldId}`,
            method: 'get',
            params: {
                apiKey: this.apiKey,
            },
        });
    }

    async loadFile(fileId) {
        return await this.call({
            url: `file/${fileId}`,
            method: 'get',
            params: {
                apiKey: this.apiKey,
            },
        });
    }

    async loadReports(worldId) {
        return await this.call({
            url: `worlds/${worldId}/0/feedback`,
            method: 'get',
            params: {
                apiKey: this.apiKey,
            },
        });
    }

    async makeAllWorldsPrivate(userId) {
        return await this.call({
            url: 'worlds/all',
            method: 'put',
            params: {
                apiKey: this.apiKey,
            },
            data: {
                userId,
                query: {
                    releaseStatus: 'public',
                },
                changes: {
                    releaseStatus: 'private',
                },
            },
        });
    }

    async makeAllWorldsHidden(userId) {
        return await this.call({
            url: 'worlds/all',
            method: 'delete',
            params: {
                apiKey: this.apiKey,

                userId,
            },
        });
    }

    async updateWorld(worldId, name, releaseStatus, description, capacity, tags, previewYoutubeId) {
        return await this.call({
            url: `worlds/${worldId}`,
            method: 'put',
            params: {
                apiKey: this.apiKey,
            },
            data: {
                name,
                releaseStatus,
                description,
                capacity,
                tags,
                previewYoutubeId,
            },
        });
    }

    async canPublish(worldId) {
        return await this.call({
            url: `worlds/${worldId}/publish`,
            method: 'get',
            params: {
                apiKey: this.apiKey,
            },
        });
    }

    async publish(worldId) {
        return await this.call({
            url: `worlds/${worldId}/publish`,
            method: 'put',
            params: {
                apiKey: this.apiKey,
            },
        });
    }

    async unpublish(worldId) {
        return await this.call({
            url: `worlds/${worldId}/publish`,
            method: 'delete',
            params: {
                apiKey: this.apiKey,
            },
        });
    }

    async deleteAllFeedback(worldId) {
        return await this.call({
            url: `feedback/${worldId}/world`,
            method: 'delete',
            params: {
                apiKey: this.apiKey,
            },
        });
    }

    async addWorldTag(worldId, tags) {
        return await this.call({
            url: `worlds/${worldId}/addTags`,
            method: 'delete',
            params: {
                apiKey: this.apiKey,
            },
            data: {
                tags,
            },
        });
    }

    async removeWorldTag(worldId) {
        return await this.call({
            url: `worlds/${worldId}/deleteTags`,
            method: 'delete',
            params: {
                apiKey: this.apiKey,
            },
            data: {
                tags,
            },
        });
    }

    //

    async sendInvite(worldId, instanceId) {
        return await this.call({
            url: `instances/${worldId}:${instanceId}/invite`,
            method: 'post',
            params: {
                apiKey: this.apiKey,
            },
        });
    }

    /////////////

    async getAuth() {
        return await this.call({
            url: 'auth',
            params: {
                apiKey: this.apiKey,
            },
        });
    }
}

vrchatApi = new VRChatApi();
module.exports = vrchatApi;
