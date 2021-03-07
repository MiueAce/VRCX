const path = require('path');
const { app, nativeImage } = require('electron');

var APP_ICON = nativeImage.createFromPath(path.join(app.getAppPath(), 'assets/icon.ico'));

module.exports = {
    APP_ICON,
};
