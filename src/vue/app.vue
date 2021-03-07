<template lang="pug">
UIWindowTitleBar()
#app-content
    UILogin(v-show="vrchatClient.refIsLoggedIn.value === false")
    div(v-show="vrchatClient.refIsLoggedIn.value === true")
        div displayName={{ vrchatClient.refCurrentUser.value?.displayName }}
        div state={{ vrchatClient.refCurrentUser.value?.state }}
        div status={{ vrchatClient.refCurrentUser.value?.status }}
        div statusDescription={{ vrchatClient.refCurrentUser.value?.statusDescription }}
        UIFriendsList
</template>

<script>
const { ref, onMounted, onUnmounted } = require('vue');
const { ElNotification } = require('element-plus');
const { addEventListener } = require('../js/common/event-bus.js');
const vrchatClient = require('../js/renderer/vrchat-client.js');
const vrchatLog = require('../js/renderer/vrchat-log.js');

import UIWindowTitleBar from './ui-window-title-bar.vue';
import UILogin from './ui-login.vue';
import UIFriendsList from './ui-friends-list.vue';

addEventListener('vrchat-api:error', function ({ status, message }) {
    ElNotification({
        type: 'error',
        message: `code ${status}, ${message}`,
    });
});

export default {
    components: {
        UIWindowTitleBar,
        UILogin,
        UIFriendsList,
    },
    setup() {
        onMounted(function () {
            vrchatLog.resetLogWatcher();
        });

        onUnmounted(function () {
            vrchatClient.dispose();
        });

        // addEventListener('vrchat-log:launch', function () {
        //     console.log('launch');
        // });
        // addEventListener('vrchat-log:disconnect', function () {
        //     console.log('disconnect');
        // });
        // addEventListener('vrchat-log:destination', function (data) {
        //     console.log('destination', data);
        // });
        // addEventListener('vrchat-log:joining-room', function (data) {
        //     console.log('joining-room', data);
        // });
        // addEventListener('vrchat-log:left-room', function (data) {
        //     console.log('left-room', data);
        // });
        // addEventListener('vrchat-log:player-joined', function (data) {
        //     console.log('player-joined', data);
        // });
        // addEventListener('vrchat-log:player-left', function (data) {
        //     console.log('player-left', data);
        // });

        return {
            vrchatClient,
        };
    },
};
</script>
