<template lang="pug">
#app-login-box
    #app-login
        el-form(label-position="top" label-width="100px")
            el-form-item(:label="$t('login.username')")
                el-input(v-model="username")
            el-form-item(:label="$t('login.password')")
                el-input(v-model="password")
            el-form-item
                el-button(type="primary") {{ $t('login.submit')}}
        div username="{{ username }}", password="{{ password }}"
</template>

<script>
const { ref } = require('vue');

export default {
    setup() {
        const username = ref('');
        const password = ref('');

        return {
            username,
            password,
        };
    },
};
</script>
