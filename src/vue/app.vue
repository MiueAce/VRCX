<template lang="pug">
UIWindowTitleBar(:vrchatClient="vrchatClient")
#app-content
    UILogin(:vrchatClient="vrchatClient" v-show="vrchatClient.isLoggedIn.value === false")
    div(v-show="vrchatClient.isLoggedIn.value === true")
        div logged in yo
</template>

<script>
const { ref, onMounted } = require('vue');
const { eventBus } = require('../js/renderer/event-bus.js');
const VRChatClient = require('../js/renderer/vrchat-client.js');
const vrchatLogRepository = require('../js/renderer/vrchat-log-repository.js');

import UIWindowTitleBar from './ui-window-title-bar.vue';
import UILogin from './ui-login.vue';

export default {
    components: {
        UIWindowTitleBar,
        UILogin,
    },
    setup() {
        var vrchatClient = new VRChatClient();

        onMounted(function () {
            setTimeout(function () {
                vrchatLogRepository.reset();
            }, 1);
        });

        eventBus.on('vrchat-log:launch', function () {
            console.log('launch');
        });
        eventBus.on('vrchat-log:disconnect', function () {
            console.log('disconnect');
        });
        eventBus.on('vrchat-log:destination', function (data) {
            console.log('destination', data);
        });
        eventBus.on('vrchat-log:joining-room', function (data) {
            console.log('joining-room', data);
        });
        eventBus.on('vrchat-log:left-room', function (data) {
            console.log('left-room', data);
        });
        eventBus.on('vrchat-log:player-joined', function (data) {
            console.log('player-joined', data);
        });
        eventBus.on('vrchat-log:player-left', function (data) {
            console.log('player-left', data);
        });

        return {
            vrchatClient,
        };
    },
};
</script>
