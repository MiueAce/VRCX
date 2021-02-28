<template lang="pug">
#app-login-box
    #app-login
        el-form(label-position="top" label-width="100px")
            el-form-item(:label="$t('login.username')")
                el-input(v-model="credentials.username")
            el-form-item(:label="$t('login.password')")
                el-input(v-model="credentials.password")
            el-form-item
                el-button(type="primary" @click="$emit('submit', 'vrchat')")
                    | {{ $t('login.submit')}}
        div
            | username="{{ credentials.username }}", password="{{ credentials.password }}"
</template>

<script>
const { ref } = require('vue');

export default {
    props: ['credentials'],
    emits: ['submit'],
};
</script>
