const { Tray, Menu } = require('electron');
const { APP_ICON } = require('./constants');
const { dispatchEvent } = require('../common/event-bus.js');

/** @type {?Tray} */
var tray_ = null;

function createTrayMenu() {
    if (tray_ !== null) {
        return;
    }

    var tray = new Tray(APP_ICON);
    tray_ = tray;

    tray.setToolTip('VRCX');

    tray.on('double-click', function () {
        dispatchEvent('tray-menu:double-click');
    });

    tray.setContextMenu(
        Menu.buildFromTemplate([
            {
                label: 'Open',
                click() {
                    dispatchEvent('tray-menu:open');
                },
            },
            {
                type: 'separator',
            },
            {
                label: 'Quit VRCX',
                click() {
                    dispatchEvent('tray-menu:quit');
                },
            },
        ])
    );
}

function destroyTrayMenu() {
    if (tray_ === null) {
        return;
    }

    var tray = tray_;
    tray_ = null;

    try {
        tray.destroy();
    } catch (err) {
        console.error(err);
    }
}

module.exports = {
    createTrayMenu,
    destroyTrayMenu,
};
