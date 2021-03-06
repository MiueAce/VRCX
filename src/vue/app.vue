<template lang="pug">
UIWindowTitleBar
#app-content
    UILogin(v-show="isLoggedIn === false")
    div(v-show="isLoggedIn === true")
        div logged in yo
</template>

<script>
const { onMounted } = require('vue');
const eventEmitter = require('../js/renderer/event-emitter.js');
const vrchatApi = require('../js/renderer/vrchat-api.js');
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
            setTimeout(function () {
                vrchatLogRepository.reset();
            }, 1);
        });

        eventEmitter.on('vrchat-api:current-user', console.log);

        eventEmitter.on('vrchat-log:launch', function () {
            console.log('launch');
        });
        eventEmitter.on('vrchat-log:disconnect', function () {
            console.log('disconnect');
        });
        eventEmitter.on('vrchat-log:destination', function (data) {
            console.log('destination', data);
        });
        eventEmitter.on('vrchat-log:joining-room', function (data) {
            console.log('joining-room', data);
        });
        eventEmitter.on('vrchat-log:left-room', function (data) {
            console.log('left-room', data);
        });
        eventEmitter.on('vrchat-log:player-joined', function (data) {
            console.log('player-joined', data);
        });
        eventEmitter.on('vrchat-log:player-left', function (data) {
            console.log('player-left', data);
        });

        return {
            isLoggedIn: vrchatApi.isLoggedIn,
        };
    },
};
</script>
