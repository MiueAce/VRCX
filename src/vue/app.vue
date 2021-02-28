<template lang="pug">
UIWindowTitleBar
#app-content
    UILogin
</template>

<script>
const { ref } = require('vue');

import UIWindowTitleBar from './ui-window-title-bar.vue';
import UILogin from './ui-login.vue';

export default {
    components: {
        UIWindowTitleBar,
        UILogin,
    },
    setup() {
        const currentUser = ref(null);

        return {
            currentUser,
        };
    },
};
</script>
