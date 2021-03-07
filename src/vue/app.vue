<template lang="pug">
UIWindowTitleBar()
#app-content
    UILogin(v-show="vrchatClient.isLoggedIn.value === false")
    div(v-show="vrchatClient.isLoggedIn.value === true")
        div yo
</template>

<script>
const { ref, onMounted, onUnmounted } = require('vue');
const { ElNotification } = require('element-plus');
const { addEventListener } = require('../js/common/event-bus.js');
const vrchatClient = require('../js/renderer/vrchat-client.js');
const vrchatLogRepository = require('../js/renderer/vrchat-log-repository.js');

import UIWindowTitleBar from './ui-window-title-bar.vue';
import UILogin from './ui-login.vue';

export default {
    components: {
        UIWindowTitleBar,
        UILogin,
    },
    setup() {
        onMounted(function () {
            vrchatLogRepository.reset();
        });

        onUnmounted(function () {
            vrchatClient.dispose();
        });

        addEventListener('vrchat-api:error', function ({ status, message }) {
            ElNotification({
                type: 'error',
                message: `code ${status}, ${message}`,
            });
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
            resetVRChatLog() {
                vrchatLogRepository.reset();
            },
        };
    },
};
</script>
