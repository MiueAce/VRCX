<template lang="pug">
#app-title-bar
    #app-window-button-box
        i.far.fa-window-minimize(@click="minimize")
        i.far.fa-window-maximize(@click="maximize")
        i.far.fa-window-close(@click="close")
    #app-lang-button-box
        el-radio-group(size="mini" v-model="$i18n.locale")
            el-radio-button(v-for="locale in $i18n.availableLocales" :key="locale" :label="locale")
                | {{ $t(`locale.${locale}`) }}
    #app-debug(style="-webkit-app-region: no-drag;position:absolute;right:150px;top:0;color:#888;")
        el-button(type="primary" size="mini" native-type="button" @click="onLogout" v-show="vrchatClient.isLoggedIn.value === true")
            | {{ $t('login.logout')}}
        | logCount={{ vrchatLogRepository.logCount.value }}
</template>

<script>
const { ipcRenderer } = window;
const vrchatLogRepository = require('../js/renderer/vrchat-log-repository.js');

export default {
    props: ['vrchatClient'],
    setup(props) {
        var { vrchatClient } = props;

        return {
            vrchatLogRepository,
            close() {
                ipcRenderer.send('main-window:close');
            },
            minimize() {
                ipcRenderer.send('main-window:minimize');
            },
            maximize() {
                ipcRenderer.send('main-window:maximize');
            },
            async onLogout() {
                try {
                    await vrchatClient.logout();
                } catch (err) {
                    console.error(err);
                }
            },
        };
    },
};
</script>
