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
const { ref, onMounted } = require('vue');

export default {
    props: ['vrchatClient'],
    setup(props) {
        const { vrchatClient } = props;
        const isLoading = ref(false);
        const username = ref('');
        const password = ref('');

        onMounted(async function () {
            if (isLoading.value === true) {
                return;
            }

            // TODO: check login
            isLoading.value = true;

            try {
                await vrchatClient.getConfig();
                var json = await vrchatClient.getCurrentUser();
                if ('requiresTwoFactorAuth' in json) {
                }
            } catch (err) {
                console.error(err);
            }

            isLoading.value = false;
        });

        return {
            isLoading,
            username,
            password,
            async onSubmitLogin() {
                if (isLoading.value === true) {
                    return;
                }

                isLoading.value = true;

                try {
                    await vrchatClient.getConfig();
                    var json = await vrchatClient.login(username.value, password.value);
                    if ('requiresTwoFactorAuth' in json) {
                    }
                } catch (err) {
                    console.error(err);
                }

                isLoading.value = false;
            },
        };
    },
};
</script>
