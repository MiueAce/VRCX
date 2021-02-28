<template lang="pug">
#app-title-bar
    #app-window-button-box
        i.far.fa-window-minimize(@click="minimizeWindow")
        i.far.fa-window-maximize(@click="maximizeWindow")
        i.far.fa-window-close(@click="closeWindow")
    #app-lang-button-box
        el-radio-group(size="mini" v-model="$i18n.locale")
            el-radio-button(v-for="locale in $i18n.availableLocales" :key="locale" :label="locale") {{ $t(`locale.${locale}`) }}
</template>

<script>
const { ipcRenderer } = window.electron;

export default {
    setup() {
        return {
            closeWindow() {
                ipcRenderer.send('vrcx', 'close-main-window');
            },
            minimizeWindow() {
                ipcRenderer.send('vrcx', 'minimize-main-window');
            },
            maximizeWindow() {
                ipcRenderer.send('vrcx', 'maximize-main-window');
            },
        };
    },
};
</script>
