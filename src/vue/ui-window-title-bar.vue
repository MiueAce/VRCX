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
</template>

<script>
const { ipcRenderer } = window;

export default {
    setup() {
        return {
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
