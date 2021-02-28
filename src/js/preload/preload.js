console.log('preload');

import { ipcRenderer } from 'electron';
window.ipcRenderer = ipcRenderer;

var fs = require('fs');

window.sex = function () {
    console.log('it works');
    console.log(fs.readdirSync('c:\\'));
};
