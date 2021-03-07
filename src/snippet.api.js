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

// avatar

async function loadAvatar(avatarId) {
    return await callApi({
        url: `avatars/${avatarId}`,
        method: 'get',
        params: {
            apiKey: apiKey_,
        },
    });
}

async function makeAllAvatarsPrivate(userId) {
    return await callApi({
        url: 'avatars/all',
        method: 'put',
        params: {
            apiKey: apiKey_,
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

async function makeAllAvatarsHidden(userId) {
    return await callApi({
        url: 'avatars/all',
        method: 'delete',
        params: {
            apiKey: apiKey_,

            userId,
        },
    });
}

async function makeAvatarPrivate(avatarId) {
    return await callApi({
        url: `avatars/${avatarId}`,
        method: 'put',
        params: {
            apiKey: apiKey_,
        },
        data: {
            releaseStatus: 'private',
        },
    });
}

async function makeAvatarPublic(avatarId) {
    return await callApi({
        url: `avatars/${avatarId}`,
        method: 'put',
        params: {
            apiKey: apiKey_,
        },
        data: {
            releaseStatus: 'public',
        },
    });
}

async function makeAvatarHidden(avatarId) {
    return await callApi({
        url: `avatars/${avatarId}`,
        method: 'delete',
        params: {
            apiKey: apiKey_,
        },
    });
}

async function switchToAvatar(userId, avatarId) {
    return await callApi({
        url: `users/${userId}/avatar`,
        method: 'put',
        params: {
            apiKey: apiKey_,
        },
        data: {
            avatarId,
        },
    });
}

// bio

async function updateBio(userId, bio) {
    return await callApi({
        url: `users/${userId}`,
        method: 'put',
        params: {
            apiKey: apiKey_,
        },
        data: {
            bio,
        },
    });
}

async function updateBioLinks(userId, bioLinks) {
    return await callApi({
        url: `users/${userId}`,
        method: 'put',
        params: {
            apiKey: apiKey_,
        },
        data: {
            bioLinks,
        },
    });
}

// user

async function loadPermissions() {
    return await callApi({
        url: 'auth/permissions',
        method: 'get',
        params: {
            apiKey: apiKey_,
        },
    });
}

async function loadCondensedPermissions() {
    return await callApi({
        url: 'auth/permissions',
        method: 'get',
        params: {
            apiKey: apiKey_,

            condensed: true,
        },
    });
}

async function checkDisplayName(username, displayName, excludeUserId) {
    return await callApi({
        url: 'auth/exists',
        method: 'get',
        params: {
            apiKey: apiKey_,

            username,
            displayName,
            excludeUserId,
        },
    });
}

async function changeName(userId, displayName, currentPassword) {
    return await callApi({
        url: `users/${userId}`,
        method: 'put',
        params: {
            apiKey: apiKey_,

            displayName,
            currentPassword,
        },
    });
}

async function checkEmail(email, excludeUserId) {
    return await callApi({
        url: 'auth/exists',
        method: 'get',
        params: {
            apiKey: apiKey_,

            email,
            excludeUserId,
        },
    });
}

async function changeEmail(userId, email, currentPassword) {
    return await callApi({
        url: `users/${userId}`,
        method: 'put',
        params: {
            apiKey: apiKey_,

            email,
            currentPassword,
        },
    });
}

async function changePassword(userId, password, currentPassword) {
    return await callApi({
        url: `users/${userId}`,
        method: 'put',
        params: {
            apiKey: apiKey_,

            password,
            currentPassword,
        },
    });
}



async function markAccountForDeletion(userId) {
    return await callApi({
        url: `users/${userId}/delete`,
        method: 'put',
        params: {
            apiKey: apiKey_,
        },
    });
}

async function getCannySsoToken() {
    return await callApi({
        url: 'sso/canny',
        method: 'get',
        params: {
            apiKey: apiKey_,
        },
    });
}

async function getFuralitySsoToken() {
    return await callApi({
        url: 'sso/furality',
        method: 'get',
        params: {
            apiKey: apiKey_,
        },
    });
}

async function putUser(userId, data) {
    return await callApi({
        url: `users/${userId}`,
        method: 'put',
        data,
        params: {
            apiKey: apiKey_,
        },
    });
}

async function postIcon(file) {
    var data = new FormData();
    data.append('file', file);
    return await callApi({
        url: `users/${userId}`,
        method: 'post',
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        params: {
            apiKey: apiKey_,
        },
        data,
    });
}

// user

async function getUser(userId) {
    return await callApi({
        url: `users/${userId}`,
        method: 'get',
        params: {
            apiKey: apiKey_,
        },
    });
}

async function getFriends(online, n, offset) {
    return await callApi({
        url: `users/${userId}`,
        method: 'get',
        params: {
            apiKey: apiKey_,

            offline: !online,
            n,
            offset,
        },
    });
}

// user

async function addLanguageTag(userId, tags) {
    return await callApi({
        url: `users/${userId}/addTags`,
        method: 'post',
        params: {
            apiKey: apiKey_,
        },
        data: {
            tags,
        },
    });
}

async function deleteLanguageTag(userId, tags) {
    return await callApi({
        url: `users/${userId}/removeTags`,
        method: 'post',
        params: {
            apiKey: apiKey_,
        },
        data: {
            tags,
        },
    });
}

// world

async function loadLocation(worldId) {
    return await callApi({
        url: `worlds/${worldId}`,
        method: 'get',
        params: {
            apiKey: apiKey_,
        },
    });
}

// user

// notification

async function hideNotification(notificationId) {
    return await callApi({
        url: `auth/user/notifications/${notificationId}/hide`,
        method: 'put',
        params: {
            apiKey: apiKey_,
        },
    });
}

async function seeNotification(notificationId) {
    return await callApi({
        url: `auth/user/notifications/${notificationId}/see`,
        method: 'put',
        params: {
            apiKey: apiKey_,
        },
    });
}

async function acceptFriend(notificationId) {
    return await callApi({
        url: `auth/user/notifications/${notificationId}/accept`,
        method: 'put',
        params: {
            apiKey: apiKey_,
        },
    });
}

async function clearNotifications() {
    return await callApi({
        url: 'auth/user/notifications/clear',
        method: 'put',
        params: {
            apiKey: apiKey_,
        },
    });
}

async function getFriendRequests() {
    return await callApi({
        url: 'auth/user/notifications',
        method: 'get',
        params: {
            apiKey: apiKey_,

            sent: false,
            type: 'friendRequest',
            n: 100,
        },
    });
}

async function getRecentNotifications() {
    return await callApi({
        url: 'auth/user/notifications',
        method: 'get',
        params: {
            apiKey: apiKey_,

            sent: false,
            n: 100,
            after: 'five_minutes_ago',
        },
    });
}

// moderation

async function loadPlayerModerations() {
    return await callApi({
        url: 'auth/user/playermoderations',
        method: 'get',
        params: {
            apiKey: apiKey_,
        },
    });
}

async function blockUser(moderated) {
    return await callApi({
        url: 'auth/user/playermoderations',
        method: 'post',
        data: {
            apiKey: apiKey_,

            moderated,
            type: 'block',
        },
    });
}

async function unblockUser(moderated) {
    return await callApi({
        url: 'auth/user/unplayermoderate',
        method: 'put',
        data: {
            apiKey: apiKey_,

            moderated,
            type: 'block',
        },
    });
}

async function muteUser(moderated) {
    return await callApi({
        url: 'auth/user/playermoderations',
        method: 'post',
        data: {
            apiKey: apiKey_,

            moderated,
            type: 'mute',
        },
    });
}

async function unmuteUser(moderated) {
    return await callApi({
        url: 'auth/user/unplayermoderate',
        method: 'put',
        data: {
            apiKey: apiKey_,

            moderated,
            type: 'mute',
        },
    });
}

async function clearAllModerations() {
    return await callApi({
        url: 'auth/user/playermoderations',
        method: 'delete',
        params: {
            apiKey: apiKey_,
        },
    });
}

// login

async function sendLink(email) {
    return await callApi({
        url: 'auth/password',
        method: 'put',
        params: {
            apiKey: apiKey_,
        },
        data: {
            email,
        },
    });
}

async function setNewPassword(emailToken, id, password) {
    return await callApi({
        url: 'auth/password',
        method: 'put',
        params: {
            apiKey: apiKey_,
        },
        data: {
            emailToken,
            id,
            password,
        },
    });
}

// search

async function searchUsers(search, n) {
    return await callApi({
        url: 'users',
        method: 'get',
        params: {
            apiKey: apiKey_,

            sort: 'relevance',
            fuzzy: true,
            search,
            n,
        },
    });
}

async function loadMoreUsers(search, n, offset) {
    return await callApi({
        url: 'users',
        method: 'get',
        params: {
            apiKey: apiKey_,

            sort: 'relevance',
            fuzzy: true,
            search,
            n,
            offset,
        },
    });
}

async function searchWorlds(search, n) {
    return await callApi({
        url: 'worlds',
        method: 'get',
        params: {
            apiKey: apiKey_,

            sort: 'relevance',
            fuzzy: true,
            search,
            n,
        },
    });
}

async function loadMoreWorlds(search, n, offset) {
    return await callApi({
        url: 'worlds',
        method: 'get',
        params: {
            apiKey: apiKey_,

            sort: 'relevance',
            fuzzy: true,
            search,
            n,
            offset,
        },
    });
}

// otp

async function removeTwoFactorAuth() {
    return await callApi({
        url: 'auth/twofactorauth',
        method: 'delete',
        params: {
            apiKey: apiKey_,
        },
    });
}

async function getTwoFactorAuthPendingSecret() {
    return await callApi({
        url: 'auth/twofactorauth/totp/pending',
        method: 'post',
        params: {
            apiKey: apiKey_,
        },
    });
}

async function verifyTwoFactorAuthPendingSecret(code) {
    return await callApi({
        url: 'auth/twofactorauth/totp/pending/verify',
        method: 'post',
        params: {
            apiKey: apiKey_,
        },
        data: {
            code,
        },
    });
}

async function cancelVerifyTwoFactorAuthPendingSecret() {
    return await callApi({
        url: 'auth/twofactorauth/totp/pendingh',
        method: 'delete',
        params: {
            apiKey: apiKey_,
        },
    });
}

async function getTwoFactorAuthOneTimePasswords() {
    return await callApi({
        url: 'auth/user/twofactorauth/otp',
        method: 'get',
        params: {
            apiKey: apiKey_,
        },
    });
}

// user

async function loadUser(userId) {
    return await callApi({
        url: `users/${userId}`,
        method: 'get',
        params: {
            apiKey: apiKey_,
        },
    });
}

async function loadSubscriptions(userId) {
    return await callApi({
        url: `users/${userId}/subscription`,
        method: 'get',
        params: {
            apiKey: apiKey_,
        },
    });
}

async function loadWorldInfo(worldId) {
    return await callApi({
        url: `worlds/${worldId}`,
        method: 'get',
        params: {
            apiKey: apiKey_,
        },
    });
}

async function addFriend(userId) {
    return await callApi({
        url: `user/${userId}/friendRequest`,
        method: 'post',
        params: {
            apiKey: apiKey_,
        },
    });
}

async function cancelFriendRequest(userId) {
    return await callApi({
        url: `user/${userId}/friendRequest`,
        method: 'delete',
        params: {
            apiKey: apiKey_,
        },
    });
}

async function removeFriend(userId) {
    return await callApi({
        url: `auth/user/friends/${userId}`,
        method: 'delete',
        params: {
            apiKey: apiKey_,
        },
    });
}

async function loadFriendStatus(userId) {
    return await callApi({
        url: `user/${userId}/friendStatus`,
        method: 'delete',
        params: {
            apiKey: apiKey_,
        },
    });
}

// {type, expires, reason, isPermanent}
async function loadModerations(userId) {
    return await callApi({
        url: `user/${userId}/moderations`,
        method: 'get',
        params: {
            apiKey: apiKey_,
        },
    });
}
async function resetAvatar(userId) {
    return await callApi({
        url: `users/${userId}/avatar`,
        method: 'put',
        params: {
            apiKey: apiKey_,
        },
        data: {
            avatarId: 'avtr_c38a1615-5bf5-42b4-84eb-a8b6c37cbd11',
        },
    });
}

async function sendMessage(userId, message) {
    return await callApi({
        url: `user/${userId}/notification`,
        method: 'put',
        params: {
            apiKey: apiKey_,
        },
        data: {
            type: 'message',
            message,
        },
    });
}

async function getCurrentAvatar(userId) {
    return await callApi({
        url: `users/${userId}/avatar`,
        method: 'get',
        params: {
            apiKey: apiKey_,
        },
    });
}

async function getCurrentAvatar(userId) {
    return await callApi({
        url: `users/${userId}/avatar`,
        method: 'get',
        params: {
            apiKey: apiKey_,
        },
    });
}

async function deleteTags(userId, tags) {
    return await callApi({
        url: `users/${userId}/removeTags`,
        method: 'post',
        params: {
            apiKey: apiKey_,
        },
        data: {
            tags,
        },
    });
}

async function addTags(userId, tags) {
    return await callApi({
        url: `users/${userId}/addTags`,
        method: 'post',
        params: {
            apiKey: apiKey_,
        },
        data: {
            tags,
        },
    });
}

async function getIcons(n, offset, userId) {
    return await callApi({
        url: 'files',
        method: 'get',
        params: {
            apiKey: apiKey_,

            tag: 'icon',
            n,
            offset,
            userId,
        },
    });
}

async function deleteIcon(fileId) {
    return await callApi({
        url: `file/${fileId}`,
        method: 'delete',
        params: {
            apiKey: apiKey_,
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

async function loadWorld(worldId) {
    return await callApi({
        url: `worlds/${worldId}`,
        method: 'get',
        params: {
            apiKey: apiKey_,
        },
    });
}

async function loadFile(fileId) {
    return await callApi({
        url: `file/${fileId}`,
        method: 'get',
        params: {
            apiKey: apiKey_,
        },
    });
}

async function loadReports(worldId) {
    return await callApi({
        url: `worlds/${worldId}/0/feedback`,
        method: 'get',
        params: {
            apiKey: apiKey_,
        },
    });
}

async function makeAllWorldsPrivate(userId) {
    return await callApi({
        url: 'worlds/all',
        method: 'put',
        params: {
            apiKey: apiKey_,
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

async function makeAllWorldsHidden(userId) {
    return await callApi({
        url: 'worlds/all',
        method: 'delete',
        params: {
            apiKey: apiKey_,

            userId,
        },
    });
}

async function updateWorld(worldId, name, releaseStatus, description, capacity, tags, previewYoutubeId) {
    return await callApi({
        url: `worlds/${worldId}`,
        method: 'put',
        params: {
            apiKey: apiKey_,
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

async function canPublish(worldId) {
    return await callApi({
        url: `worlds/${worldId}/publish`,
        method: 'get',
        params: {
            apiKey: apiKey_,
        },
    });
}

async function publish(worldId) {
    return await callApi({
        url: `worlds/${worldId}/publish`,
        method: 'put',
        params: {
            apiKey: apiKey_,
        },
    });
}

async function unpublish(worldId) {
    return await callApi({
        url: `worlds/${worldId}/publish`,
        method: 'delete',
        params: {
            apiKey: apiKey_,
        },
    });
}

async function deleteAllFeedback(worldId) {
    return await callApi({
        url: `feedback/${worldId}/world`,
        method: 'delete',
        params: {
            apiKey: apiKey_,
        },
    });
}

async function addWorldTag(worldId, tags) {
    return await callApi({
        url: `worlds/${worldId}/addTags`,
        method: 'delete',
        params: {
            apiKey: apiKey_,
        },
        data: {
            tags,
        },
    });
}

async function removeWorldTag(worldId) {
    return await callApi({
        url: `worlds/${worldId}/deleteTags`,
        method: 'delete',
        params: {
            apiKey: apiKey_,
        },
        data: {
            tags,
        },
    });
}

//

async function sendInvite(worldId, instanceId) {
    return await callApi({
        url: `instances/${worldId}:${instanceId}/invite`,
        method: 'post',
        params: {
            apiKey: apiKey_,
        },
    });
}

/////////////

