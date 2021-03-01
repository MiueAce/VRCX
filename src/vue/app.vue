<template lang="pug">
UIWindowTitleBar
#app-content
    UILogin(v-show="isLoggedIn === false")
    template(v-show="isLoggedIn === true")
        div logged in yo
</template>

<script>
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
        setTimeout(function () {
            vrchatLogRepository.reset();
        }, 1);

        vrchatApi.on('current-user', console.log);

        return {
            isLoggedIn: vrchatApi.isLoggedIn,
        };
    },
};
</script>
