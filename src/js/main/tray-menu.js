const { app, Menu, Tray } = require('electron');
const { APP_NAME, APP_ICON } = require('./constants');
const { activateMainWindow } = require('./main-window');

/** @type {?Tray} */
var tray_ = null;

function createTrayMenu() {
    if (tray_ !== null) {
        return;
    }

    var menu = Menu.buildFromTemplate([
        {
            label: 'Open',
            click() {
                activateMainWindow();
            },
        },
        {
            type: 'separator',
        },
        {
            label: 'Quit VRCX',
            click() {
                app.isForceQuit = true;
                app.quit();

                setTimeout(function () {
                    process.exit();
                }, 5000);
            },
        },
    ]);

    tray_ = new Tray(APP_ICON);
    tray_.setToolTip(APP_NAME);
    tray_.setContextMenu(menu);
    tray_.on('double-click', function () {
        activateMainWindow();
    });
}

function destroyTrayMenu() {
    if (tray_ !== null) {
        tray_.destroy();
        tray_ = null;
    }
}

module.exports = {
    createTrayMenu,
    destroyTrayMenu,
};
