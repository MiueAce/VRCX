<template lang="pug">
#app-login-box
    #app-login(v-loading="isLoading")
        el-form(label-position="top" label-width="100px")
            el-form-item(:label="$t('login.username')")
                el-input(v-model="username")
            el-form-item(:label="$t('login.password')")
                el-input(v-model="password")
            el-form-item
                el-button(type="primary" native-type="submit" @click="onSubmitLogin")
                    | {{ $t('login.login')}}
        div
            | username="{{ username }}", password="{{ password }}"
</template>

<script>
const { ref, onMounted, onUnmounted } = require('vue');
const { ElMessageBox } = require('element-plus');
const vrchatClient = require('../js/renderer/vrchat-client.js');

export default {
    setup() {
        var isLoading = ref(false);
        var username = ref('');
        var password = ref('');

        async function onSubmitLogin() {
            if (isLoading.value === true) {
                return;
            }

            isLoading.value = true;

            try {
                await vrchatClient.getConfig();
                var json = null;
                if (username.value.length > 0 && password.value.length > 0) {
                    json = await vrchatClient.login(username.value, password.value);
                } else {
                    json = await vrchatClient.loadCurrentUser();
                }
                if ('requiresTwoFactorAuth' in json) {
                    var { value } = await ElMessageBox({
                        message: 'input 2fa code',
                        confirmButtonText: 'OK',
                        cancelButtonText: 'Cancel',
                        showInput: true,
                        inputPattern: /\d{6}/,
                        inputErrorMessage: 'Invalid Code',
                    });
                    json = await vrchatClient.verifyTotpCode(value);
                    if ('verified' in json) {
                        await vrchatClient.loadCurrentUser();
                    } else {
                        await vrchatClient.logout();
                    }
                }
            } catch (err) {
                console.error(err);
            }

            isLoading.value = false;
        }

        onMounted(function () {
            onSubmitLogin();
        });

        return {
            isLoading,
            username,
            password,
            onSubmitLogin,
        };
    },
};
</script>
