const path = require('path');
const { app, nativeImage } = require('electron');

var APP_NAME = 'VRCX';
var APP_PATH = app.getAppPath();
var APP_PRELOAD_JS = path.join(APP_PATH, 'assets/preload.js');
var APP_ICON_PATH = path.join(APP_PATH, 'assets/icon.ico');
var APP_ICON = nativeImage.createFromPath(APP_ICON_PATH);

module.exports = {
    APP_NAME,
    APP_PATH,
    APP_PRELOAD_JS,
    APP_ICON,
};
