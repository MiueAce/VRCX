<template lang="pug">
UIWindowTitleBar
#app-content
    UILogin(:credentials="credentials" @submit="submitLogin")
</template>

<script>
const { ref, reactive } = require('vue');

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
