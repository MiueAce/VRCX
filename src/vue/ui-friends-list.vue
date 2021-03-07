<template lang="pug">
div
    div(v-for="userId in []" :key="userId")
        span {{ userId }}
</template>

<script>
const { computed } = require('vue');
const vrchatClient = require('../js/renderer/vrchat-client.js');

export default {
    setup() {
        return {
            vrchatClient,
        };
    },
};
</script>
