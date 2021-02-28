<template lang="pug">
#app-title-bar
    #app-window-button-box
        i.far.fa-window-minimize(@click="minimize")
        i.far.fa-window-maximize(@click="maximize")
        i.far.fa-window-close(@click="close")
    #app-lang-button-box
        el-radio-group(size="mini" v-model="$i18n.locale")
            el-radio-button(v-for="locale in $i18n.availableLocales" :key="locale" :label="locale") {{ $t(`locale.${locale}`) }}
</template>

<script>
const { ipcRenderer } = window.electron;

export default {
    setup() {
        return {
            close() {
                ipcRenderer.send('vrcx', 'close-main-window');
            },
            minimize() {
                ipcRenderer.send('vrcx', 'minimize-main-window');
            },
            maximize() {
                ipcRenderer.send('vrcx', 'maximize-main-window');
            },
        };
    },
};
</script>
