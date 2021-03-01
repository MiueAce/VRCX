const path = require('path');
const { app, nativeImage } = require('electron');

const APP_ICON_PATH = path.join(app.getAppPath(), 'assets/icon.ico');

module.exports = {
    APP_ICON: nativeImage.createFromPath(APP_ICON_PATH),
};
