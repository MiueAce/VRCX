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
    #app-debug(style="position:absolute;left:0;top:30px;color:#888") logCount={{ logCount }}
</template>

<script>
const { ipcRenderer } = window;
const { logCount } = require('../js/renderer/vrchat-log-repository.js');

export default {
    setup() {
        return {
            logCount,
            close() {
                ipcRenderer.send('main-window', 'close');
            },
            minimize() {
                ipcRenderer.send('main-window', 'minimize');
            },
            maximize() {
                ipcRenderer.send('main-window', 'maximize');
            },
        };
    },
};
</script>
