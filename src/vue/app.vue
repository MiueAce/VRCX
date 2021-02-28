<template lang="pug">
UIWindowTitleBar
#app-content
    UILogin(:credentials="credentials" @submit="submitLogin")
</template>

<script>
const { ref, reactive, onMounted } = require('vue');
const vrchatLogRepository = require('../js/renderer/vrchat-log-repository.js');

import UIWindowTitleBar from './ui-window-title-bar.vue';
import UILogin from './ui-login.vue';

export default {
    components: {
        UIWindowTitleBar,
        UILogin,
    },
    setup() {
        const credentials = reactive({
            username: '',
            password: '',
        });

        const currentUser = ref(null);

        onMounted(function () {
            vrchatLogRepository.start();
        });

        return {
            credentials,
            currentUser,
            submitLogin(provider) {
                console.log('submitLogin', provider);
            },
        };
    },
};
</script>
